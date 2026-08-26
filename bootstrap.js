const fs = require('fs');
const path = require('path');

const { channels } = require('./channels');

function stateRank(state) {
  if (state === 'VERIFIED_PLAYABLE') return 0;
  if (state === 'RESPONDS') return 1;
  if (state === 'UNKNOWN') return 2;
  if (state === 'DEAD_CONFIRMED') return 3;
  return 9;
}

function speedRank(speed) {
  if (speed === 'FAST') return 0;
  if (speed === 'NORMAL') return 1;
  if (speed === 'SLOW') return 2;
  return 3;
}

function reorderStreamsFromHealth() {
  const healthPath = path.join(__dirname, 'stream-health.json');
  if (!fs.existsSync(healthPath)) return;

  let health;
  try {
    health = JSON.parse(fs.readFileSync(healthPath, 'utf8'));
  } catch (error) {
    console.error('STREAM ORDER: cannot read stream-health.json:', error.message);
    return;
  }

  const healthById = new Map((health.channels || []).map(c => [c.id, c]));

  for (const channel of channels) {
    if (!Array.isArray(channel.streams) || channel.streams.length < 2) continue;
    const hc = healthById.get(channel.id);
    if (!hc || !Array.isArray(hc.sources)) continue;

    const sourceHealth = new Map(hc.sources.map(s => [Number(s.index), s]));

    channel.streams = channel.streams
      .map((url, i) => ({ url, originalIndex: i + 1, health: sourceHealth.get(i + 1) || null }))
      .sort((a, b) => {
        const ar = stateRank(a.health?.state);
        const br = stateRank(b.health?.state);
        if (ar !== br) return ar - br;

        const as = speedRank(a.health?.speed);
        const bs = speedRank(b.health?.speed);
        if (as !== bs) return as - bs;

        const ams = Number.isFinite(Number(a.health?.startupMs)) ? Number(a.health.startupMs) : Number.MAX_SAFE_INTEGER;
        const bms = Number.isFinite(Number(b.health?.startupMs)) ? Number(b.health.startupMs) : Number.MAX_SAFE_INTEGER;
        if (ams !== bms) return ams - bms;

        return a.originalIndex - b.originalIndex;
      })
      .map(x => x.url);
  }

  console.log(`STREAM ORDER: applied health ranking from ${health.checkedAt || 'unknown time'}`);
}

reorderStreamsFromHealth();
require('./index');
