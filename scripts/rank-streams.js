const fs = require('fs');

const file = 'stream-health.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const stateRank = {
  VERIFIED_PLAYABLE: 0,
  RESPONDS: 1,
  UNKNOWN: 2,
  DEAD_CONFIRMED: 3
};

const qualityRank = {
  '4K/UHD': 4,
  FHD: 3,
  HD: 2,
  SD: 1
};

function speedRank(speed) {
  if (speed === 'FAST') return 0;
  if (speed === 'NORMAL') return 1;
  if (speed === 'SLOW') return 2;
  return 3;
}

function qualityScore(source) {
  return qualityRank[source?.video?.quality] || 0;
}

function fpsScore(source) {
  const n = Number(source?.video?.fps);
  return Number.isFinite(n) ? n : 0;
}

function bitrateScore(source) {
  const n = Number(source?.video?.bitrate);
  return Number.isFinite(n) ? n : 0;
}

function targetQualityForChannel(channel) {
  const name = String(channel.name || '').toLowerCase();
  const group = String(channel.group || '').toLowerCase();
  if (group === 'sports4k' || /4k|uhd|ultra\s*hd/.test(name)) return '4K/UHD';
  if (group === 'sports1080' || /1080|fhd/.test(name)) return 'FHD';
  return null;
}

function meetsOrBeatsTarget(source, target) {
  if (!target) return true;
  const actual = qualityScore(source);
  const required = qualityRank[target] || 0;
  return actual >= required;
}

function compareSources(a, b, target) {
  const sr = (stateRank[a.state] ?? 9) - (stateRank[b.state] ?? 9);
  if (sr) return sr;

  const aMeets = meetsOrBeatsTarget(a, target) ? 1 : 0;
  const bMeets = meetsOrBeatsTarget(b, target) ? 1 : 0;
  if (aMeets !== bMeets) return bMeets - aMeets;

  const q = qualityScore(b) - qualityScore(a);
  if (q) return q;

  const f = fpsScore(b) - fpsScore(a);
  if (f) return f;

  const br = bitrateScore(b) - bitrateScore(a);
  if (br) return br;

  const sp = speedRank(a.speed) - speedRank(b.speed);
  if (sp) return sp;

  return (a.startupMs ?? Number.MAX_SAFE_INTEGER) - (b.startupMs ?? Number.MAX_SAFE_INTEGER);
}

for (const channel of data.channels || []) {
  const targetQuality = targetQualityForChannel(channel);
  channel.targetQuality = targetQuality;
  channel.sources = [...(channel.sources || [])].sort((a, b) => compareSources(a, b, targetQuality));

  const usable = channel.sources.filter(s => s.state !== 'DEAD_CONFIRMED');
  const best = usable.find(s => s.state === 'VERIFIED_PLAYABLE' && meetsOrBeatsTarget(s, targetQuality)) ||
               usable.find(s => s.state === 'VERIFIED_PLAYABLE') ||
               usable.find(s => s.state === 'RESPONDS') ||
               usable.find(s => s.state === 'UNKNOWN') ||
               channel.sources[0] || null;

  channel.bestSource = best ? {
    index: best.index,
    host: best.host,
    state: best.state,
    speed: best.speed || null,
    startupMs: best.startupMs ?? null,
    startupSeconds: best.startupSeconds ?? null,
    method: best.method || null,
    quality: best.video?.quality || null,
    width: best.video?.width || null,
    height: best.video?.height || null,
    fps: best.video?.fps || null,
    codec: best.video?.codec || null,
    bitrate: best.video?.bitrate || null,
    meetsTargetQuality: meetsOrBeatsTarget(best, targetQuality)
  } : null;
}

data.ranking = {
  rule: 'Prefer usable state first; then sources meeting or exceeding the channel target quality; then higher resolution, FPS and bitrate; then FAST/NORMAL/SLOW and lowest startup time.',
  replacementPolicy: 'Never replace a DEAD_CONFIRMED source with a lower-quality source when a same-or-better-quality usable source is available. For sports1080 prefer FHD or better; for sports4k prefer 4K/UHD. UNKNOWN is not considered dead.',
  speedThresholds: {
    FAST: '< 2000 ms',
    NORMAL: '2000-5000 ms',
    SLOW: '> 5000 ms'
  }
};

fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');

console.log('\n# Best source per channel\n');
for (const c of data.channels || []) {
  const b = c.bestSource;
  if (!b) continue;
  const quality = b.quality || 'unknown quality';
  const fps = b.fps ? `${b.fps}fps` : 'unknown fps';
  console.log(`${c.name}: source #${b.index} | ${b.state} | ${quality} | ${fps} | ${b.speed || 'N/A'} | ${b.startupMs ?? 'N/A'} ms | ${b.host}`);
}
