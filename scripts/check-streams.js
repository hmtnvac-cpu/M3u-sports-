const fs = require("fs");
const { execFile } = require("child_process");
const ffprobePath = require("ffprobe-static").path;
const { channels } = require("../channels");

const CONCURRENCY = Number(process.env.STREAM_CONCURRENCY || 4);

function hostOf(url) {
  try { return new URL(url).host; } catch { return "invalid-url"; }
}

function fps(v) {
  if (!v || v === "0/0") return null;
  if (String(v).includes("/")) {
    const [a,b] = String(v).split("/").map(Number);
    return b ? Math.round((a / b) * 100) / 100 : null;
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function quality(w,h) {
  if (!w || !h) return null;
  if (h >= 2160 || w >= 3840) return "4K/UHD";
  if (h >= 1080 || w >= 1920) return "FHD";
  if (h >= 720 || w >= 1280) return "HD";
  return "SD";
}

function speed(ms) {
  if (ms == null) return null;
  if (ms < 2000) return "FAST";
  if (ms <= 5000) return "NORMAL";
  return "SLOW";
}

function emptyVideo() {
  return { detected:false, quality:null, width:null, height:null, fps:null, codec:null, bitrate:null };
}

function probeWithFfprobe(url, fallback=false) {
  return new Promise(resolve => {
    const started = Date.now();
    const args = [
      "-v","error",
      "-user_agent","Mozilla/5.0 (QtEmbedded; U; Linux; C) MAG200 stbapp",
      "-rw_timeout", fallback ? "12000000" : "6000000"
    ];

    if (fallback) {
      args.push("-analyzeduration","10000000","-probesize","12000000");
      if (/[?&]extension=ts(?:&|$)/i.test(url)) args.push("-f","mpegts");
    }

    args.push(
      "-select_streams","v:0",
      "-show_entries","stream=width,height,codec_name,r_frame_rate,avg_frame_rate,bit_rate",
      "-of","json",
      url
    );

    execFile(ffprobePath, args, { timeout: fallback ? 16000 : 8000, maxBuffer: 2 * 1024 * 1024 }, (error, stdout) => {
      const ms = Date.now() - started;
      if (error) return resolve({ verified:false, startupMs:ms, video:emptyVideo() });
      try {
        const s = JSON.parse(stdout || "{}")?.streams?.[0];
        if (!s) throw new Error("No video stream");
        const width = Number(s.width) || null;
        const height = Number(s.height) || null;
        const detected = Boolean(width && height);
        resolve({
          verified: detected,
          startupMs: ms,
          video: {
            detected,
            quality: quality(width,height),
            width,
            height,
            fps: fps(s.avg_frame_rate || s.r_frame_rate),
            codec: s.codec_name ? String(s.codec_name).toUpperCase() : null,
            bitrate: Number(s.bit_rate) || null
          }
        });
      } catch {
        resolve({ verified:false, startupMs:ms, video:emptyVideo() });
      }
    });
  });
}

async function firstByte(url) {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 9000);
  try {
    const r = await fetch(url, {
      method:"GET",
      redirect:"follow",
      signal:controller.signal,
      headers:{ "User-Agent":"Mozilla/5.0 (QtEmbedded; U; Linux; C) MAG200 stbapp", Accept:"*/*" }
    });
    if (!(r.status >= 200 && r.status < 400) || !r.body) {
      return { ok:false, httpStatus:r.status, ms:Date.now()-started };
    }
    const reader = r.body.getReader();
    const { value } = await reader.read();
    try { await reader.cancel(); } catch {}
    return { ok:Boolean(value && value.byteLength), httpStatus:r.status, ms:Date.now()-started };
  } catch {
    return { ok:false, httpStatus:null, ms:Date.now()-started };
  } finally {
    clearTimeout(timer);
  }
}

async function inspectStream(url) {
  const p1 = await probeWithFfprobe(url, false);
  if (p1.verified) {
    return { state:"VERIFIED", startupMs:p1.startupMs, startupSeconds:Math.round(p1.startupMs/10)/100, speed:speed(p1.startupMs), video:p1.video };
  }

  const p2 = await probeWithFfprobe(url, true);
  if (p2.verified) {
    return { state:"VERIFIED", startupMs:p2.startupMs, startupSeconds:Math.round(p2.startupMs/10)/100, speed:speed(p2.startupMs), video:p2.video };
  }

  const fb = await firstByte(url);
  if (fb.ok) {
    return { state:"ALIVE_UNVERIFIED", startupMs:fb.ms, startupSeconds:Math.round(fb.ms/10)/100, speed:speed(fb.ms), httpStatus:fb.httpStatus, video:emptyVideo() };
  }

  return { state:"UNKNOWN", startupMs:null, startupSeconds:null, speed:null, httpStatus:fb.httpStatus, video:emptyVideo() };
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  async function worker() {
    for (;;) {
      const n = i++;
      if (n >= items.length) return;
      out[n] = await fn(items[n], n);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length || 1) }, worker));
  return out;
}

(async () => {
  const tasks = [];
  channels.forEach(channel => {
    (channel.streams || []).forEach((url,index) => tasks.push({
      channelId:channel.id,
      channelName:channel.name,
      group:channel.group,
      sourceIndex:index + 1,
      url
    }));
  });

  const checked = await mapLimit(tasks, CONCURRENCY, async task => ({
    ...task,
    host:hostOf(task.url),
    result:await inspectStream(task.url)
  }));

  const byChannel = new Map();
  for (const item of checked) {
    if (!byChannel.has(item.channelId)) {
      byChannel.set(item.channelId, {
        id:item.channelId,
        name:item.channelName,
        group:item.group,
        total:0,
        verified:0,
        aliveUnverified:0,
        unknown:0,
        status:"UNKNOWN",
        sources:[]
      });
    }
    const c = byChannel.get(item.channelId);
    c.total += 1;
    if (item.result.state === "VERIFIED") c.verified += 1;
    else if (item.result.state === "ALIVE_UNVERIFIED") c.aliveUnverified += 1;
    else c.unknown += 1;

    c.sources.push({
      index:item.sourceIndex,
      host:item.host,
      state:item.result.state,
      startupMs:item.result.startupMs,
      startupSeconds:item.result.startupSeconds,
      speed:item.result.speed,
      httpStatus:item.result.httpStatus ?? null,
      video:item.result.video
    });
  }

  const results = Array.from(byChannel.values()).map(c => {
    if (c.verified === c.total) c.status = "VERIFIED";
    else if (c.verified > 0) c.status = "PARTIAL_VERIFIED";
    else if (c.aliveUnverified > 0) c.status = "ALIVE_UNVERIFIED";
    else c.status = "UNKNOWN";
    return c;
  });

  const summary = {
    checkedAt:new Date().toISOString(),
    method:"stalker-checker-style ffprobe verification",
    concurrency:CONCURRENCY,
    meaning:{
      VERIFIED:"ffprobe detected a real video stream and extracted video metadata",
      PARTIAL_VERIFIED:"at least one source is VERIFIED",
      ALIVE_UNVERIFIED:"media bytes were received but ffprobe did not verify video metadata",
      UNKNOWN:"not verified from the GitHub runner; do not treat as dead"
    },
    totals:{
      channels:results.length,
      streams:tasks.length,
      verifiedStreams:results.reduce((n,c)=>n+c.verified,0),
      aliveUnverifiedStreams:results.reduce((n,c)=>n+c.aliveUnverified,0),
      unknownStreams:results.reduce((n,c)=>n+c.unknown,0),
      verifiedChannels:results.filter(c=>c.status==="VERIFIED").length,
      partialVerifiedChannels:results.filter(c=>c.status==="PARTIAL_VERIFIED").length,
      aliveUnverifiedChannels:results.filter(c=>c.status==="ALIVE_UNVERIFIED").length,
      unknownChannels:results.filter(c=>c.status==="UNKNOWN").length
    },
    channels:results
  };

  fs.writeFileSync("stream-health.json", JSON.stringify(summary,null,2)+"\n");

  const lines = [
    "# Stream health (ffprobe)",
    "",
    `Checked: ${summary.checkedAt}`,
    `Streams VERIFIED: ${summary.totals.verifiedStreams}/${summary.totals.streams}`,
    `Streams ALIVE_UNVERIFIED: ${summary.totals.aliveUnverifiedStreams}`,
    `Streams UNKNOWN: ${summary.totals.unknownStreams}`,
    "",
    "| Channel | Status | VERIFIED | ALIVE_UNVERIFIED | UNKNOWN | Total |",
    "|---|---:|---:|---:|---:|---:|",
    ...results.map(c=>`| ${c.name.replace(/\|/g,"\\|")} | ${c.status} | ${c.verified} | ${c.aliveUnverified} | ${c.unknown} | ${c.total} |`)
  ];

  console.log(lines.join("\n"));
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join("\n")+"\n");
})();
