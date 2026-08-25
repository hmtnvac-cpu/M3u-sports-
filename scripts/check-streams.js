const fs = require("fs");
const { channels } = require("../channels");

const TIMEOUT_MS = Number(process.env.STREAM_TIMEOUT_MS || 8000);
const CONCURRENCY = Number(process.env.STREAM_CONCURRENCY || 8);

function hostOf(url) {
  try {
    return new URL(url).host;
  } catch {
    return "invalid-url";
  }
}

function classifyHttp(status, bytes, contentType) {
  const type = String(contentType || "").toLowerCase();
  const looksLikeMedia =
    type.includes("video/") ||
    type.includes("audio/") ||
    type.includes("mpegurl") ||
    type.includes("mp2t") ||
    type.includes("octet-stream");

  if (status >= 200 && status < 400 && bytes > 0 && looksLikeMedia) {
    return "LIVE";
  }

  // GitHub runners can be rate-limited or blocked by IPTV/CDN hosts.
  // These responses must NOT be treated as proof that a stream is dead.
  if ([401, 403, 408, 425, 429, 500, 502, 503, 504].includes(status)) {
    return "UNKNOWN";
  }

  // Only explicit not-found/gone is considered definite DEAD.
  if ([404, 410].includes(status)) {
    return "DEAD";
  }

  return "UNKNOWN";
}

async function probe(url) {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "LiveTV-Stream-Check/1.1",
        Range: "bytes=0-1023",
        Accept: "*/*"
      }
    });

    let bytes = 0;
    if (response.body) {
      const reader = response.body.getReader();
      try {
        const { value } = await reader.read();
        bytes = value ? value.byteLength : 0;
      } finally {
        try { await reader.cancel(); } catch {}
      }
    }

    const contentType = response.headers.get("content-type") || null;
    const state = classifyHttp(response.status, bytes, contentType);

    return {
      state,
      httpStatus: response.status,
      bytes,
      contentType,
      durationMs: Date.now() - started,
      note:
        state === "LIVE"
          ? null
          : state === "DEAD"
            ? `HTTP ${response.status}`
            : `HTTP ${response.status} - inconclusive from GitHub runner`
    };
  } catch (error) {
    return {
      state: "UNKNOWN",
      httpStatus: null,
      bytes: 0,
      contentType: null,
      durationMs: Date.now() - started,
      note:
        error && error.name === "AbortError"
          ? "timeout - inconclusive"
          : `network error - inconclusive: ${String(error && error.message ? error.message : error)}`
    };
  } finally {
    clearTimeout(timer);
  }
}

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;

  async function runner() {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length || 1) }, runner));
  return results;
}

(async () => {
  const tasks = [];

  channels.forEach(channel => {
    (channel.streams || []).forEach((url, index) => {
      tasks.push({
        channelId: channel.id,
        channelName: channel.name,
        group: channel.group,
        sourceIndex: index + 1,
        url
      });
    });
  });

  const probed = await mapLimit(tasks, CONCURRENCY, async task => ({
    ...task,
    host: hostOf(task.url),
    result: await probe(task.url)
  }));

  const byChannel = new Map();

  for (const item of probed) {
    if (!byChannel.has(item.channelId)) {
      byChannel.set(item.channelId, {
        id: item.channelId,
        name: item.channelName,
        group: item.group,
        total: 0,
        live: 0,
        unknown: 0,
        dead: 0,
        status: "UNKNOWN",
        sources: []
      });
    }

    const channel = byChannel.get(item.channelId);
    channel.total += 1;
    if (item.result.state === "LIVE") channel.live += 1;
    else if (item.result.state === "DEAD") channel.dead += 1;
    else channel.unknown += 1;

    channel.sources.push({
      index: item.sourceIndex,
      host: item.host,
      state: item.result.state,
      httpStatus: item.result.httpStatus,
      bytes: item.result.bytes,
      contentType: item.result.contentType,
      durationMs: item.result.durationMs,
      note: item.result.note
    });
  }

  const channelResults = Array.from(byChannel.values()).map(channel => {
    if (channel.live === channel.total) channel.status = "LIVE";
    else if (channel.live > 0) channel.status = "PARTIAL";
    else if (channel.dead === channel.total) channel.status = "DEAD";
    else channel.status = "UNKNOWN";
    return channel;
  });

  const summary = {
    checkedAt: new Date().toISOString(),
    timeoutMs: TIMEOUT_MS,
    concurrency: CONCURRENCY,
    meaning: {
      LIVE: "GitHub runner received media bytes",
      PARTIAL: "At least one source confirmed LIVE; other sources may be UNKNOWN/DEAD",
      UNKNOWN: "Runner could not verify; do not treat as dead",
      DEAD: "All sources returned explicit 404/410"
    },
    totals: {
      channels: channelResults.length,
      streams: tasks.length,
      liveStreams: channelResults.reduce((n, c) => n + c.live, 0),
      unknownStreams: channelResults.reduce((n, c) => n + c.unknown, 0),
      deadStreams: channelResults.reduce((n, c) => n + c.dead, 0),
      liveChannels: channelResults.filter(c => c.status === "LIVE").length,
      partialChannels: channelResults.filter(c => c.status === "PARTIAL").length,
      unknownChannels: channelResults.filter(c => c.status === "UNKNOWN").length,
      deadChannels: channelResults.filter(c => c.status === "DEAD").length
    },
    channels: channelResults
  };

  fs.writeFileSync("stream-health.json", JSON.stringify(summary, null, 2) + "\n");

  const lines = [
    "# Stream health",
    "",
    `Checked: ${summary.checkedAt}`,
    `Channels: ${summary.totals.channels}`,
    `Streams confirmed LIVE: ${summary.totals.liveStreams}/${summary.totals.streams}`,
    `Streams UNKNOWN: ${summary.totals.unknownStreams}`,
    `Streams definite DEAD: ${summary.totals.deadStreams}`,
    "",
    "| Channel | Status | LIVE | UNKNOWN | DEAD | Total |",
    "|---|---:|---:|---:|---:|---:|",
    ...channelResults.map(c => `| ${c.name.replace(/\|/g, "\\|")} | ${c.status} | ${c.live} | ${c.unknown} | ${c.dead} | ${c.total} |`)
  ];

  console.log(lines.join("\n"));

  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join("\n") + "\n");
  }
})();
