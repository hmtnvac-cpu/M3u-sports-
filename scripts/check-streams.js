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
        "User-Agent": "LiveTV-Stream-Check/1.0",
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

    const ok = response.status >= 200 && response.status < 400 && bytes > 0;

    return {
      alive: ok,
      httpStatus: response.status,
      bytes,
      contentType: response.headers.get("content-type") || null,
      durationMs: Date.now() - started,
      error: ok ? null : `HTTP ${response.status} / no media bytes`
    };
  } catch (error) {
    return {
      alive: false,
      httpStatus: null,
      bytes: 0,
      contentType: null,
      durationMs: Date.now() - started,
      error: error && error.name === "AbortError" ? "timeout" : String(error && error.message ? error.message : error)
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
        dead: 0,
        status: "DEAD",
        sources: []
      });
    }

    const channel = byChannel.get(item.channelId);
    channel.total += 1;
    if (item.result.alive) channel.live += 1;
    else channel.dead += 1;

    channel.sources.push({
      index: item.sourceIndex,
      host: item.host,
      alive: item.result.alive,
      httpStatus: item.result.httpStatus,
      bytes: item.result.bytes,
      contentType: item.result.contentType,
      durationMs: item.result.durationMs,
      error: item.result.error
    });
  }

  const channelResults = Array.from(byChannel.values()).map(channel => {
    channel.status = channel.live === 0 ? "DEAD" : channel.live === channel.total ? "LIVE" : "PARTIAL";
    return channel;
  });

  const summary = {
    checkedAt: new Date().toISOString(),
    timeoutMs: TIMEOUT_MS,
    concurrency: CONCURRENCY,
    totals: {
      channels: channelResults.length,
      streams: tasks.length,
      liveStreams: channelResults.reduce((n, c) => n + c.live, 0),
      deadStreams: channelResults.reduce((n, c) => n + c.dead, 0),
      liveChannels: channelResults.filter(c => c.status === "LIVE").length,
      partialChannels: channelResults.filter(c => c.status === "PARTIAL").length,
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
    `Streams alive: ${summary.totals.liveStreams}/${summary.totals.streams}`,
    "",
    "| Channel | Status | Alive | Total |",
    "|---|---:|---:|---:|",
    ...channelResults.map(c => `| ${c.name.replace(/\|/g, "\\|")} | ${c.status} | ${c.live} | ${c.total} |`)
  ];

  console.log(lines.join("\n"));

  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join("\n") + "\n");
  }
})();
