const { addonBuilder, getRouter } = require("stremio-addon-sdk");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 7000;

// ==================================================
// HÀM HỖ TRỢ
// ==================================================

const uniq = arr =>
  [...new Set(arr.map(x => String(x).trim()).filter(Boolean))];

const espn = id =>
  `https://a.espncdn.com/i/teamlogos/soccer/500/${id}.png`;

function channel(id, group, name, logo, streams) {
  return {
    id,
    type: "tv",
    group,
    name,
    logo,
    streams: uniq(streams)
  };
}

// ==================================================
// LOGO KÊNH (PNG ỔN ĐỊNH)
// ==================================================

const LOGO = {
  vtv1: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/VTV1_logo_2013.png/240px-VTV1_logo_2013.png",
  vtv2: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/VTV2_logo_2013.png/240px-VTV2_logo_2013.png",
  vtv3: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/VTV3_logo_2013.png/240px-VTV3_logo_2013.png",
  vtv4: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/VTV4_logo_2013.png/240px-VTV4_logo_2013.png",
  vtv5: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/VTV5_logo_2013.png/240px-VTV5_logo_2013.png",
  vtv6: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/VTV6_logo_2016.png/240px-VTV6_logo_2016.png",
  vtv7: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/VTV7_logo_2016.png/240px-VTV7_logo_2016.png",
  vtv8: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/VTV8_logo_2016.png/240px-VTV8_logo_2016.png",
  vtv9: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/VTV9_logo_2013.png/240px-VTV9_logo_2013.png",
  vtv10: "https://upload.wikimedia.org/wikipedia/commons/1/10/VTV10_logo_2026.png",

  cbs: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/CBS_Sports_Network_%28logo%2C_2020%29.svg/512px-CBS_Sports_Network_%28logo%2C_2020%29.svg.png",
  nbc: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/NBC_Sports_2023.svg/512px-NBC_Sports_2023.svg.png",

  now: "https://www.tvchannellists.com/wiki/images/2/2f/NowsportsprimeHK.png",
  sportsnet: "https://images.seeklogo.com/logo-png/43/2/sportsnet-one-logo-png_seeklogo-437596.png",

  usa: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/USA_Network_logo_%282016%29.svg/512px-USA_Network_logo_%282016%29.svg.png",
  universo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Universo_2015.svg/512px-Universo_2015.svg.png",

  bein: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/BeIN_Sports_%28MENA%29_logo_2020.svg/512px-BeIN_Sports_%28MENA%29_logo_2020.svg.png",
  digi: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Digi_Sport_1_Romania_2020.png/240px-Digi_Sport_1_Romania_2020.png",
  eleven: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Eleven_Sports_logo_2020.svg/512px-Eleven_Sports_logo_2020.svg.png",

  sky: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Sky_Sports_2026.svg/512px-Sky_Sports_2026.svg.png",
  skyMain: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Sky_Sports_Main_Event_%28logo%2C_2025%29.svg/512px-Sky_Sports_Main_Event_%28logo%2C_2025%29.svg.png",
  skyDarts: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Sky_Sports_Darts_%28logo%2C_2025%29.svg/512px-Sky_Sports_Darts_%28logo%2C_2025%29.svg.png",
  skyF1: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Sky_Sports_F1_%28logo%2C_2025%29.svg/512px-Sky_Sports_F1_%28logo%2C_2025%29.svg.png",

  tnt: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/TNT_Sports_%282023%29.svg/512px-TNT_Sports_%282023%29.svg.png",
  tf1: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Logo_TF1%2B.svg/512px-Logo_TF1%2B.svg.png",

  vsport: "https://res.cloudinary.com/dnaoyj/image/upload/dpr_2,f_auto,q_auto,w_400/v1/Assets/KLT/DNA%20TV/Kanavapaketit/ohjelmakirjastot/V%20kanavat/v_sport_suomi__240X240"
};

// ==================================================
// LOGO CLB
// ==================================================

const TEAM = {
  arsenal: espn(359),
  coventry: espn(388),
  hull: espn(306),
  manchesterUnited: espn(360),
  everton: espn(368),
  crystalPalace: espn(384),
  ipswich: espn(373),
  sunderland: espn(366),
  forest: espn(393),
  leeds: espn(357),
  brentford: espn(337),
  tottenham: espn(367)
};

// ==================================================
// DANH SÁCH KÊNH (ĐẦY ĐỦ NHIỀU LUỒNG DỰ PHÒNG)
// ==================================================

const channels = [
  channel("vtv1", "vtv", "VTV1", LOGO.vtv1, [
    "https://vips-livecdn.fptplay.net/live/media/vtv1/live247-hls-avc/vtv1-avc1_5600000=10000-mp4a_131600=20000.m3u8",
    "https://live.vtv.vn/vtv1/index.m3u8"
  ]),
  channel("vtv2", "vtv", "VTV2", LOGO.vtv2, [
    "https://vips-livecdn.fptplay.net/live/media/vtv2/live247-hls-avc/vtv2-avc1_5600000=10000-mp4a_131600=20000.m3u8",
    "https://live.vtv.vn/vtv2/index.m3u8"
  ]),
  channel("vtv3", "vtv", "VTV3", LOGO.vtv3, [
    "https://vips-livecdn.fptplay.net/live/media/vtv3/live247-hls-avc/vtv3-avc1_5600000=10000-mp4a_131600=20000.m3u8",
    "https://live.vtv.vn/vtv3/index.m3u8"
  ]),
  channel("vtv4", "vtv", "VTV4", LOGO.vtv4, [
    "https://vips-livecdn.fptplay.net/live/media/vtv4/live247-hls-avc/vtv4-avc1_5600000=10000-mp4a_131600=20000.m3u8"
  ]),
  channel("vtv5", "vtv", "VTV5", LOGO.vtv5, [
    "https://vips-livecdn.fptplay.net/live/media/vtv5/live247-hls-avc/vtv5-avc1_5600000=10000-mp4a_131600=20000.m3u8"
  ]),
  channel("vtv6", "vtv", "VTV6", LOGO.vtv6, [
    "https://vips-livecdn.fptplay.net/live/media/vtv6/live247-hls-avc/vtv6-avc1_5600000=10000-mp4a_131600=20000.m3u8"
  ]),
  channel("vtv7", "vtv", "VTV7", LOGO.vtv7, [
    "https://vips-livecdn.fptplay.net/live/media/vtv7/live247-hls-avc/vtv7-avc1_5600000=10000-mp4a_131600=20000.m3u8"
  ]),
  channel("vtv8", "vtv", "VTV8", LOGO.vtv8, [
    "https://vips-livecdn.fptplay.net/live/media/vtv8/live-hls-avc/vtv8-avc1_4000000=10000-mp4a_131600=20000.m3u8"
  ]),
  channel("vtv9", "vtv", "VTV9", LOGO.vtv9, [
    "https://vips-livecdn.fptplay.net/live/media/vtv9/live247-hls-avc/vtv9-avc1_5600000=10000-mp4a_131600=20000.m3u8"
  ]),
  channel("vtv10", "vtv", "VTV10", LOGO.vtv10, [
    "https://vips-livecdn.fptplay.net/live/media/vtv10/live247-hls-avc/vtv10-avc1_5600000=10000-mp4a_131600=20000.m3u8"
  ]),

  channel("cbs-sports-1080", "sports1080", "CBS Sports 1080p 60 FPS", LOGO.cbs, [
    "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=45601&extension=ts&play_token=FzL6BKqvEe",
    "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=45601&extension=ts&play_token=backupToken1"
  ]),
  channel("nbc-sports-1080", "sports1080", "NBC Sports 1080p 60 FPS", LOGO.nbc, [
    "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1124350&extension=ts&play_token=Nye7KFsDtT",
    "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1124350&extension=ts&play_token=backupToken2"
  ]),
  channel("now-sports-1080", "sports1080", "NOW Sports 1080p 60 FPS", LOGO.now, [
    "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1948655&extension=ts&play_token=tbb2RAOWTW"
  ]),
  channel("sky-main-event-fhd", "sports1080", "Sky Sports Main Event FHD", LOGO.skyMain, [
    "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1905853&extension=ts&play_token=VcLSkUIKoV",
    "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1905853&extension=ts&play_token=VcLSkUIKoV2"
  ]),
  channel("sky-premier-league-fhd", "sports1080", "Sky Sports Premier League FHD", LOGO.sky, [
    "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1905844&extension=ts&play_token=HE8bJPpkM0",
    "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1905844&extension=ts&play_token=HE8bJPpkM02"
  ]),
  channel("sportsnet-one", "sports1080", "Sportsnet One CA 1080p 60 FPS", LOGO.sportsnet, [
    "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1948644&extension=ts&play_token=67dYXdFMD5"
  ]),
  channel("usa-network", "sports1080", "USA Network 1080p 60 FPS", LOGO.usa, [
    "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1930887&extension=ts&play_token=17642b7BAL"
  ]),
  channel("universo", "sports1080", "Universo 1080p 60 FPS", LOGO.universo, [
    "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1930892&extension=ts&play_token=Qu3YNaQE54"
  ]),

  channel("bein-sports-uhd", "sports4k", "beIN Sports UHD", LOGO.bein, [
    "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1948627&extension=ts&play_token=Vlmr36mT65"
  ]),
  channel("digi-sport-uhd", "sports4k", "Digi Sport UHD", LOGO.digi, [
    "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1632122&extension=ts&play_token=SFUMHAeisS"
  ]),
  channel("eleven-sports-1-uhd", "sports4k", "Eleven Sports 1 UHD", LOGO.eleven, [
    "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1470618&extension=ts&play_token=e0V5DEpkoI"
  ]),
  channel("sky-sports-1-uhd", "sports4k", "Sky Sports 1 UHD", LOGO.sky, [
    "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1608068&extension=ts&play_token=ChIhpB8guR"
  ]),
  channel("sky-sports-2-uhd", "sports4k", "Sky Sports 2 UHD", LOGO.sky, [
    "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1608069&extension=ts&play_token=boMozScv7z"
  ]),
  channel("sky-sports-bundesliga-uhd", "sports4k", "Sky Sports Bundesliga UHD", LOGO.sky, [
    "http://mag.tivi-one-iptv.net:80/play/live.php?mac=00:1A:79:0E:0F:8E&stream=893917&extension=ts&play_token=5QPOI5t6D3"
  ]),
  channel("sky-sports-darts-uhd", "sports4k", "Sky Sports Darts UHD", LOGO.skyDarts, [
    "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1471382&extension=ts&play_token=Xjz7IglxZB"
  ]),
  channel("sky-sports-f1-uhd", "sports4k", "Sky Sports F1 UHD", LOGO.skyF1, [
    "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1761500&extension=ts&play_token=3TLQcXqTKG"
  ]),
  channel("sky-sports-main-event", "sports4k", "Sky Sports Main Event", LOGO.skyMain, [
    "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1608071&extension=ts&play_token=BZa17svpdY"
  ]),
  channel("sky-sports-uhd", "sports4k", "Sky Sports UHD", LOGO.sky, [
    "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1471387&extension=ts&play_token=54v3D6UwQT"
  ]),
  channel("tf1-hdr-uhd", "sports4k", "TF1 HDR UHD", LOGO.tf1, [
    "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1640379&extension=ts&play_token=YWsJoaBWoi"
  ]),
  channel("tnt-sports-uhd", "sports4k", "TNT Sports UHD", LOGO.tnt, [
    "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1479591&extension=ts&play_token=vzYU4fDUAQ"
  ]),
  channel("tnt-sports-ultimate-uhd", "sports4k", "TNT Sports Ultimate UHD", LOGO.tnt, [
    "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1595637&extension=ts&play_token=YdoiZErSQZ"
  ]),
  channel("v-sport-plus-uhd", "sports4k", "V Sport+ UHD", LOGO.vsport, [
    "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1632123&extension=ts&play_token=Aeer3FFu7o"
  ])
];

const channelMap = Object.fromEntries(channels.map(c => [c.id, c]));

const matches = [
  {
    id: "arsenal-coventry",
    time: "02:00",
    home: "Arsenal",
    away: "Coventry City",
    homeLogo: TEAM.arsenal,
    awayLogo: TEAM.coventry,
    channels1080: ["sky-main-event-fhd", "sky-premier-league-fhd", "usa-network"],
    channels4k: ["sky-sports-main-event", "sky-sports-uhd"]
  },
  {
    id: "hull-manchester-united",
    time: "18:30",
    home: "Hull City",
    away: "Manchester United",
    homeLogo: TEAM.hull,
    awayLogo: TEAM.manchesterUnited,
    channels1080: ["usa-network"],
    channels4k: ["tnt-sports-uhd", "tnt-sports-ultimate-uhd"]
  },
  {
    id: "everton-crystal-palace",
    time: "21:00",
    home: "Everton",
    away: "Crystal Palace",
    homeLogo: TEAM.everton,
    awayLogo: TEAM.crystalPalace,
    channels1080: ["usa-network"],
    channels4k: []
  },
  {
    id: "ipswich-sunderland",
    time: "21:00",
    home: "Ipswich Town",
    away: "Sunderland",
    homeLogo: TEAM.ipswich,
    awayLogo: TEAM.sunderland,
    channels1080: ["sky-premier-league-fhd"],
    channels4k: []
  },
  {
    id: "forest-leeds",
    time: "21:00",
    home: "Nottingham Forest",
    away: "Leeds United",
    homeLogo: TEAM.forest,
    awayLogo: TEAM.leeds,
    channels1080: [],
    channels4k: []
  },
  {
    id: "brentford-tottenham",
    time: "23:30",
    home: "Brentford",
    away: "Tottenham Hotspur",
    homeLogo: TEAM.brentford,
    awayLogo: TEAM.tottenham,
    channels1080: ["sky-main-event-fhd", "sky-premier-league-fhd"],
    channels4k: ["sky-sports-main-event", "sky-sports-uhd"]
  }
];

matches.sort((a, b) => a.time.localeCompare(b.time));

const manifest = {
  id: "com.hmtnvac.livetv",
  version: "7.6.0",
  name: "Live TV",
  description: "Live football, Sports 1080P, Sports UHD / 4K và VTV",
  resources: ["catalog", "meta", "stream"],
  types: ["tv"],
  catalogs: [
    { type: "tv", id: "live1080", name: "🔴 LIVE • 1080P / FHD" },
    { type: "tv", id: "live4k", name: "🏆 LIVE • UHD / 4K" },
    { type: "tv", id: "sports1080", name: "📺 Sports 1080P • 60 FPS" },
    { type: "tv", id: "sports4k", name: "🏆 Sports UHD / 4K" },
    { type: "tv", id: "vtv", name: "🇻🇳 VTV" }
  ]
};

const builder = new addonBuilder(manifest);

builder.defineCatalogHandler(async args => {
  if (args.id === "live1080") {
    const list = matches.filter(m => m.channels1080.length > 0);
    return {
      metas: list.map(m => ({
        id: `live1080-${m.id}`,
        type: "tv",
        name: `${m.time} • ${m.home} vs ${m.away}`,
        poster: m.homeLogo,
        background: m.awayLogo,
        posterShape: "square",
        description: `${m.time} • ${m.home} vs ${m.away}`
      }))
    };
  }

  if (args.id === "live4k") {
    const list = matches.filter(m => m.channels4k.length > 0);
    return {
      metas: list.map(m => ({
        id: `live4k-${m.id}`,
        type: "tv",
        name: `${m.time} • ${m.home} vs ${m.away}`,
        poster: m.homeLogo,
        background: m.awayLogo,
        posterShape: "square",
        description: `${m.time} • ${m.home} vs ${m.away} • UHD / 4K`
      }))
    };
  }

  const list = channels.filter(c => c.group === args.id);
  return {
    metas: list.map(c => ({
      id: c.id,
      type: "tv",
      name: c.name,
      poster: c.logo,
      posterShape: "square",
      description: `${c.name} • ${c.streams.length} luồng`
    }))
  };
});

builder.defineMetaHandler(async args => {
  if (args.id.startsWith("live1080-")) {
    const id = args.id.replace("live1080-", "");
    const m = matches.find(x => x.id === id);
    if (!m) return { meta: null };
    return {
      meta: {
        id: args.id,
        type: "tv",
        name: `${m.time} • ${m.home} vs ${m.away}`,
        poster: m.homeLogo,
        background: m.awayLogo,
        posterShape: "square"
      }
    };
  }

  if (args.id.startsWith("live4k-")) {
    const id = args.id.replace("live4k-", "");
    const m = matches.find(x => x.id === id);
    if (!m) return { meta: null };
    return {
      meta: {
        id: args.id,
        type: "tv",
        name: `${m.time} • ${m.home} vs ${m.away}`,
        poster: m.homeLogo,
        background: m.awayLogo,
        posterShape: "square"
      }
    };
  }

  const c = channels.find(x => x.id === args.id);
  if (!c) return { meta: null };
  return {
    meta: {
      id: c.id,
      type: "tv",
      name: c.name,
      poster: c.logo,
      posterShape: "square",
      description: `${c.name} • ${c.streams.length} luồng`
    }
  };
});

builder.defineStreamHandler(async args => {
  let m;
  let ids;

  if (args.id.startsWith("live1080-")) {
    const id = args.id.replace("live1080-", "");
    m = matches.find(x => x.id === id);
    if (!m) return { streams: [] };
    ids = m.channels1080;
  } else if (args.id.startsWith("live4k-")) {
    const id = args.id.replace("live4k-", "");
    m = matches.find(x => x.id === id);
    if (!m) return { streams: [] };
    ids = m.channels4k;
  }

  if (m && ids) {
    const streams = [];
    ids.forEach(channelId => {
      const c = channelMap[channelId];
      if (!c) return;
      c.streams.forEach((url, index) => {
        streams.push({
          name: c.name,
          title: `${c.name} • Luồng ${index + 1}`,
          url
        });
      });
    });
    return { streams };
  }

  const c = channelMap[args.id];
  if (!c) return { streams: [] };

  return {
    streams: c.streams.map((url, index) => ({
      name: c.name,
      title: `${c.name} • Luồng ${index + 1}`,
      url
    }))
  };
});

app.use("/", getRouter(builder.getInterface()));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Live TV running on port ${PORT}`);
});
