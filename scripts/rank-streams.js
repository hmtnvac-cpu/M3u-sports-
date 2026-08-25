const fs = require('fs');

const file = 'stream-health.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const stateRank = {
  VERIFIED_PLAYABLE: 0,
  RESPONDS: 1,
  UNKNOWN: 2,
  DEAD_CONFIRMED: 3
};

function speedRank(speed) {
  if (speed === 'FAST') return 0;
  if (speed === 'NORMAL') return 1;
  if (speed === 'SLOW') return 2;
  return 3;
}

for (const channel of data.channels || []) {
  channel.sources = [...(channel.sources || [])].sort((a, b) => {
    const sr = (stateRank[a.state] ?? 9) - (stateRank[b.state] ?? 9);
    if (sr) return sr;
    const sp = speedRank(a.speed) - speedRank(b.speed);
    if (sp) return sp;
    return (a.startupMs ?? Number.MAX_SAFE_INTEGER) - (b.startupMs ?? Number.MAX_SAFE_INTEGER);
  });

  const best = channel.sources.find(s => s.state === 'VERIFIED_PLAYABLE') ||
               channel.sources.find(s => s.state === 'RESPONDS') ||
               channel.sources.find(s => s.state === 'UNKNOWN') ||
               channel.sources[0] || null;

  channel.bestSource = best ? {
    index: best.index,
    host: best.host,
    state: best.state,
    speed: best.speed || null,
    startupMs: best.startupMs ?? null,
    startupSeconds: best.startupSeconds ?? null,
    method: best.method || null
  } : null;
}

data.ranking = {
  rule: 'Prefer VERIFIED_PLAYABLE, then RESPONDS, then UNKNOWN; within the same state prefer FAST, then NORMAL, then SLOW, then lowest startup time',
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
  console.log(`${c.name}: source #${b.index} | ${b.state} | ${b.speed || 'N/A'} | ${b.startupMs ?? 'N/A'} ms | ${b.host}`);
}
