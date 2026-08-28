const TNT_BASE = "http://line.tvdsz.cc:80/play/live.php?mac=00:1B:79:45:42:1E&stream=";
const TNT_LOGO = "http://picon.tivi-ott.net:25461/picon/UK/TNT SPORTS/TNT SPORTS.png";

const tntChannels = [
  { id: "tnt-ultimate-4k-new", type: "tv", group: "tnt", name: "TNT SPORTS ULTIMATE 4K", logo: TNT_LOGO, streams: [`${TNT_BASE}1174213&extension=ts`] },
  { id: "tnt-1-raw-50fps", type: "tv", group: "tnt", name: "TNT SPORTS 1 RAW 50FPS", logo: TNT_LOGO, streams: [`${TNT_BASE}1174218&extension=ts`] },
  { id: "tnt-2-raw-50fps", type: "tv", group: "tnt", name: "TNT SPORTS 2 RAW 50FPS", logo: TNT_LOGO, streams: [`${TNT_BASE}1174219&extension=ts`] },
  { id: "tnt-3-raw-50fps", type: "tv", group: "tnt", name: "TNT SPORTS 3 RAW 50FPS", logo: TNT_LOGO, streams: [`${TNT_BASE}1174220&extension=ts`] },
  { id: "tnt-4-raw-50fps", type: "tv", group: "tnt", name: "TNT SPORTS 4 RAW 50FPS", logo: TNT_LOGO, streams: [`${TNT_BASE}1174221&extension=ts`] },
  { id: "tnt-1-raw", type: "tv", group: "tnt", name: "TNT SPORTS 1 RAW", logo: TNT_LOGO, streams: [`${TNT_BASE}1174214&extension=ts`] },
  { id: "tnt-2-raw", type: "tv", group: "tnt", name: "TNT SPORTS 2 RAW", logo: TNT_LOGO, streams: [`${TNT_BASE}1174215&extension=ts`] },
  { id: "tnt-4-raw", type: "tv", group: "tnt", name: "TNT SPORTS 4 RAW", logo: TNT_LOGO, streams: [`${TNT_BASE}1174217&extension=ts`] }
];

module.exports = { tntChannels };
