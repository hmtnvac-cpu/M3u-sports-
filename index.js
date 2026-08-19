const { addonBuilder, getRouter } = require("stremio-addon-sdk");
const express = require("express");
const sharp = require("sharp");

const app = express();
const PORT = process.env.PORT || 7000;

const PUBLIC_BASE =
  process.env.PUBLIC_BASE_URL ||
  "https://m3u-sports-tv.onrender.com";

// ==================================================
// HELPERS
// ==================================================

const uniq = arr =>
  [...new Set(arr.map(x => String(x).trim()).filter(Boolean))];

const commons = file =>
  "https://commons.wikimedia.org/wiki/Special:Redirect/file/" +
  encodeURIComponent(file);

const espn = id =>
  `https://a.espncdn.com/i/teamlogos/soccer/500/${id}.png`;

function makeChannel(id, group, name, logo, streams) {
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
// LOGO SOURCE
// Chỉ Render truy cập các URL này.
// Stremio/Nuvio chỉ nhận PNG từ chính Render.
// ==================================================

const LOGO = {
  // VTV
  vtv1: commons("VTV1 logo 2013 final.svg"),
  vtv2: commons("VTV2 logo 2013 final.svg"),
  vtv3: commons("VTV3 logo 2013 final.svg"),
  vtv4: commons("VTV4 logo 2013 final.svg"),
  vtv5: commons("VTV5 logo 2013 final.svg"),
  vtv6: commons("VTV6 logo 2026 final.svg"),
  vtv7: commons("VTV7 logo 2016 final.svg"),
  vtv8: commons("VTV8 logo 2016 final.svg"),
  vtv9: commons("VTV9 logo 2013 final.svg"),
  vtv10: commons("VTV10 logo 2026.png"),

  // 1080P
  cbs: commons("CBS Sports logo.svg"),
  nbc: commons("NBC Sports 2023 (with NBC wordmark).svg"),

  now:
    "https://www.tvchannellists.com/wiki/images/2/2f/NowsportsprimeHK.png",

  skyMain:
    commons("Sky Sports Main Event - Logo 2025.svg"),

  sky:
    commons("Sky Sports Football - Logo 2025.svg"),

  sportsnet:
    "https://www.logo.wine/a/logo/Sportsnet_One/Sportsnet_One-Logo.wine.svg",

  usa:
    commons("USA Network logo (2016).svg"),

  universo:
    commons("Universo 2015.svg"),

  // UHD / 4K
  bein:
    commons("BeIN Sports logo (vertical version).svg"),

  digi:
    commons("DIGI Sport 1.svg"),

  eleven:
    commons("ELEVEN SPORTS Logo.svg"),

  skyDarts:
    commons("Sky Sports Darts - Logo 2025.svg"),

  skyF1:
    commons("Sky Sports F1 - Logo 2025.svg"),

  tnt:
    commons("TNT Sports (2023).svg"),

  tf1:
    commons("Logo TF1+.svg"),

  vsport:
    "https://res.cloudinary.com/dnaoyj/image/upload/dpr_2,f_auto,q_auto,w_600/v1/Assets/KLT/DNA%20TV/Kanavapaketit/ohjelmakirjastot/V%20kanavat/v_sport_suomi__240X240"
};

// ==================================================
// LOGO CLB
// ESPN đã là PNG trực tiếp
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
// CHANNELS
// ==================================================

const channels = [

  // ==================================================
  // 🇻🇳 VTV
  // ==================================================

  makeChannel(
    "vtv1",
    "vtv",
    "VTV1",
    LOGO.vtv1,
    [
      "https://vips-livecdn.fptplay.net/live/media/vtv1/live247-hls-avc/vtv1-avc1_5600000=10000-mp4a_131600=20000.m3u8"
    ]
  ),

  makeChannel(
    "vtv2",
    "vtv",
    "VTV2",
    LOGO.vtv2,
    [
      "https://vips-livecdn.fptplay.net/live/media/vtv2/live247-hls-avc/vtv2-avc1_5600000=10000-mp4a_131600=20000.m3u8"
    ]
  ),

  makeChannel(
    "vtv3",
    "vtv",
    "VTV3",
    LOGO.vtv3,
    [
      "https://vips-livecdn.fptplay.net/live/media/vtv3/live247-hls-avc/vtv3-avc1_5600000=10000-mp4a_131600=20000.m3u8"
    ]
  ),

  makeChannel(
    "vtv4",
    "vtv",
    "VTV4",
    LOGO.vtv4,
    [
      "https://vips-livecdn.fptplay.net/live/media/vtv4/live247-hls-avc/vtv4-avc1_5600000=10000-mp4a_131600=20000.m3u8"
    ]
  ),

  makeChannel(
    "vtv5",
    "vtv",
    "VTV5",
    LOGO.vtv5,
    [
      "https://vips-livecdn.fptplay.net/live/media/vtv5/live247-hls-avc/vtv5-avc1_5600000=10000-mp4a_131600=20000.m3u8"
    ]
  ),

  makeChannel(
    "vtv6",
    "vtv",
    "VTV6",
    LOGO.vtv6,
    [
      "https://vips-livecdn.fptplay.net/live/media/vtv6/live247-hls-avc/vtv6-avc1_5600000=10000-mp4a_131600=20000.m3u8"
    ]
  ),

  makeChannel(
    "vtv7",
    "vtv",
    "VTV7",
    LOGO.vtv7,
    [
      "https://vips-livecdn.fptplay.net/live/media/vtv7/live247-hls-avc/vtv7-avc1_5600000=10000-mp4a_131600=20000.m3u8"
    ]
  ),

  makeChannel(
    "vtv8",
    "vtv",
    "VTV8",
    LOGO.vtv8,
    [
      "https://vips-livecdn.fptplay.net/live/media/vtv8/live-hls-avc/vtv8-avc1_4000000=10000-mp4a_131600=20000.m3u8"
    ]
  ),

  makeChannel(
    "vtv9",
    "vtv",
    "VTV9",
    LOGO.vtv9,
    [
      "https://vips-livecdn.fptplay.net/live/media/vtv9/live247-hls-avc/vtv9-avc1_5600000=10000-mp4a_131600=20000.m3u8"
    ]
  ),

  makeChannel(
    "vtv10",
    "vtv",
    "VTV10",
    LOGO.vtv10,
    [
      "https://vips-livecdn.fptplay.net/live/media/vtv10/live247-hls-avc/vtv10-avc1_5600000=10000-mp4a_131600=20000.m3u8"
    ]
  ),

  // ==================================================
  // 📺 SPORTS 1080P
  // ==================================================

  makeChannel(
    "cbs-sports-1080",
    "sports1080",
    "CBS Sports 1080p 60 FPS",
    LOGO.cbs,
    [
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=45601&extension=ts&play_token=FzL6BKqvEe",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:7d:69:87&stream=1931140&extension=ts&play_token=78QsJViQ2M",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7E:19:50&stream=1931140&extension=ts&play_token=drj6UiUd3H",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1931140&extension=ts&play_token=dMBw5KtrCr"
    ]
  ),

  makeChannel(
    "nbc-sports-1080",
    "sports1080",
    "NBC Sports 1080p 60 FPS",
    LOGO.nbc,
    [
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1124350&extension=ts&play_token=Nye7KFsDtT",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:7d:69:87&stream=1124350&extension=ts&play_token=eNXy4IgwMX",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7E:19:50&stream=1124350&extension=ts&play_token=7VZFU5RGrb",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7E:19:50&stream=234677&extension=ts&play_token=tvycd3S4G4",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1124350&extension=ts&play_token=rQKi6Aw8Jy"
    ]
  ),

  makeChannel(
    "now-sports-1080",
    "sports1080",
    "NOW Sports 1080p 60 FPS",
    LOGO.now,
    [
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1948655&extension=ts&play_token=tbb2RAOWTW",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1948655&extension=ts&play_token=wKjCMLCsCQ",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1948655&extension=ts&play_token=4dOHhrrZQ5",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7E:19:50&stream=1948655&extension=ts&play_token=kDi24LfUfG",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1948655&extension=ts&play_token=0MqG6oZhXz"
    ]
  ),

  makeChannel(
    "sky-main-event-fhd",
    "sports1080",
    "Sky Sports Main Event FHD",
    LOGO.skyMain,
    [
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1905853&extension=ts&play_token=VcLSkUIKoV",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:7d:69:87&stream=1905853&extension=ts&play_token=HJKEBcMdYW",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7E:19:50&stream=1905853&extension=ts&play_token=tFtdcozl0Z",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1905853&extension=ts&play_token=0PellAUHuM"
    ]
  ),

  makeChannel(
    "sky-premier-league-fhd",
    "sports1080",
    "Sky Sports Premier League FHD",
    LOGO.sky,
    [
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1905844&extension=ts&play_token=HE8bJPpkM0",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1905844&extension=ts&play_token=AIylOstlvH",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:7d:69:87&stream=1905844&extension=ts&play_token=VauO51P7Uz",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7E:19:50&stream=1905844&extension=ts&play_token=Rp6htQTP1z"
    ]
  ),

  makeChannel(
    "sportsnet-one",
    "sports1080",
    "Sportsnet One CA 1080p 60 FPS",
    LOGO.sportsnet,
    [
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1948644&extension=ts&play_token=67dYXdFMD5",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7E:19:50&stream=1948650&extension=ts&play_token=IeulQneT0e",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1948650&extension=ts&play_token=kOpzJPZpl8"
    ]
  ),

  makeChannel(
    "usa-network",
    "sports1080",
    "USA Network 1080p 60 FPS",
    LOGO.usa,
    [
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1930887&extension=ts&play_token=17642b7BAL",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=45466&extension=ts&play_token=BhBlcThs4o",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:7d:69:87&stream=1930887&extension=ts&play_token=wXIyU8E7YD",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7E:19:50&stream=1930887&extension=ts&play_token=J2KdNN5TYM",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1930887&extension=ts&play_token=tdDzhWuRot"
    ]
  ),

  makeChannel(
    "universo",
    "sports1080",
    "Universo 1080p 60 FPS",
    LOGO.universo,
    [
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1930892&extension=ts&play_token=Qu3YNaQE54",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:7d:69:87&stream=1930892&extension=ts&play_token=EaKf87ZAR8",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7E:19:50&stream=1930892&extension=ts&play_token=Dshjs6wiNd"
    ]
  ),

  // ==================================================
  // 🏆 SPORTS UHD / 4K
  // ==================================================

  makeChannel(
    "bein-sports-uhd",
    "sports4k",
    "beIN Sports UHD",
    LOGO.bein,
    [
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1948627&extension=ts&play_token=Vlmr36mT65",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1948627&extension=ts&play_token=ZylqK6Jlon",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1948627&extension=ts&play_token=5fIeli4ylw"
    ]
  ),

  makeChannel(
    "digi-sport-uhd",
    "sports4k",
    "Digi Sport UHD",
    LOGO.digi,
    [
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1632122&extension=ts&play_token=SFUMHAeisS",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1632122&extension=ts&play_token=SpK901Rc9Y",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1632122&extension=ts&play_token=1Fi4sgyPhW"
    ]
  ),

  makeChannel(
    "eleven-sports-1-uhd",
    "sports4k",
    "Eleven Sports 1 UHD",
    LOGO.eleven,
    [
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1470618&extension=ts&play_token=e0V5DEpkoI",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1948660&extension=ts&play_token=PkLWuD6skY",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1470618&extension=ts&play_token=z0mDj0DrdW",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1948660&extension=ts&play_token=EIr5yxfGPr"
    ]
  ),

  makeChannel(
    "sky-sports-1-uhd",
    "sports4k",
    "Sky Sports 1 UHD",
    LOGO.sky,
    [
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1608068&extension=ts&play_token=ChIhpB8guR",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1608068&extension=ts&play_token=bNqN7HTIKX",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1608068&extension=ts&play_token=djxHx6Uy9j"
    ]
  ),

  makeChannel(
    "sky-sports-2-uhd",
    "sports4k",
    "Sky Sports 2 UHD",
    LOGO.sky,
    [
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1608069&extension=ts&play_token=boMozScv7z",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1608069&extension=ts&play_token=Jn8XYQ8soh",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1608069&extension=ts&play_token=T7pDKwjV1Z"
    ]
  ),

  makeChannel(
    "sky-sports-bundesliga-uhd",
    "sports4k",
    "Sky Sports Bundesliga UHD",
    LOGO.sky,
    [
      "http://mag.tivi-one-iptv.net:80/play/live.php?mac=00:1A:79:0E:0F:8E&stream=893917&extension=ts&play_token=5QPOI5t6D3"
    ]
  ),

  makeChannel(
    "sky-sports-darts-uhd",
    "sports4k",
    "Sky Sports Darts UHD",
    LOGO.skyDarts,
    [
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1471382&extension=ts&play_token=Xjz7IglxZB",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1471382&extension=ts&play_token=FqtO3KWqUT",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1471382&extension=ts&play_token=4wKKTKtM8L"
    ]
  ),

  makeChannel(
    "sky-sports-f1-uhd",
    "sports4k",
    "Sky Sports F1 UHD",
    LOGO.skyF1,
    [
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1761500&extension=ts&play_token=3TLQcXqTKG",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1761500&extension=ts&play_token=OWv81jhV3e"
    ]
  ),

  makeChannel(
    "sky-sports-main-event",
    "sports4k",
    "Sky Sports Main Event",
    LOGO.skyMain,
    [
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1608071&extension=ts&play_token=BZa17svpdY",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1608071&extension=ts&play_token=YPIwjxNGfQ",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1641636&extension=ts&play_token=Oxc5PyW4yK"
    ]
  ),

  makeChannel(
    "sky-sports-uhd",
    "sports4k",
    "Sky Sports UHD",
    LOGO.sky,
    [
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1471387&extension=ts&play_token=54v3D6UwQT",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1753227&extension=ts&play_token=3Ea6Hxt5oq",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1471387&extension=ts&play_token=Bx3mlhSM6x"
    ]
  ),

  makeChannel(
    "tf1-hdr-uhd",
    "sports4k",
    "TF1 HDR UHD",
    LOGO.tf1,
    [
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1640379&extension=ts&play_token=YWsJoaBWoi",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1640379&extension=ts&play_token=6gj5Htj59g",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1640379&extension=ts&play_token=qXUKertYkr"
    ]
  ),

  makeChannel(
    "tnt-sports-uhd",
    "sports4k",
    "TNT Sports UHD",
    LOGO.tnt,
    [
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1479591&extension=ts&play_token=vzYU4fDUAQ",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1479591&extension=ts&play_token=9JzXAViV1F",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1479591&extension=ts&play_token=mSsCW5SfPM"
    ]
  ),

  makeChannel(
    "tnt-sports-ultimate-uhd",
    "sports4k",
    "TNT Sports Ultimate UHD",
    LOGO.tnt,
    [
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1595637&extension=ts&play_token=YdoiZErSQZ"
    ]
  ),

  makeChannel(
    "v-sport-plus-uhd",
    "sports4k",
    "V Sport+ UHD",
    LOGO.vsport,
    [
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1632123&extension=ts&play_token=Aeer3FFu7o",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1749221&extension=ts&play_token=jg5ZtLtCQN",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1632123&extension=ts&play_token=E6ziX5leBT",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1632123&extension=ts&play_token=6GO8Kiqjfm"
    ]
  )
];

const channelMap =
  Object.fromEntries(channels.map(c => [c.id, c]));

// ==================================================
// LIVE MATCHES
// ==================================================

const matches = [
  {
    id: "arsenal-coventry",
    time: "02:00",
    home: "Arsenal",
    away: "Coventry City",
    homeLogo: TEAM.arsenal,
    awayLogo: TEAM.coventry,

    channels1080: [
      "sky-main-event-fhd",
      "sky-premier-league-fhd",
      "usa-network"
    ],

    channels4k: [
      "sky-sports-main-event",
      "sky-sports-uhd"
    ]
  },

  {
    id: "hull-manchester-united",
    time: "18:30",
    home: "Hull City",
    away: "Manchester United",
    homeLogo: TEAM.hull,
    awayLogo: TEAM.manchesterUnited,

    channels1080: [
      "usa-network"
    ],

    channels4k: [
      "tnt-sports-uhd",
      "tnt-sports-ultimate-uhd"
    ]
  },

  {
    id: "everton-crystal-palace",
    time: "21:00",
    home: "Everton",
    away: "Crystal Palace",
    homeLogo: TEAM.everton,
    awayLogo: TEAM.crystalPalace,

    channels1080: [
      "usa-network"
    ],

    channels4k: []
  },

  {
    id: "ipswich-sunderland",
    time: "21:00",
    home: "Ipswich Town",
    away: "Sunderland",
    homeLogo: TEAM.ipswich,
    awayLogo: TEAM.sunderland,

    channels1080: [
      "sky-premier-league-fhd"
    ],

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

    channels1080: [
      "sky-main-event-fhd",
      "sky-premier-league-fhd"
    ],

    channels4k: [
      "sky-sports-main-event",
      "sky-sports-uhd"
    ]
  }
];

// ==================================================
// IMAGE FETCH + CACHE
// ==================================================

const sourceImageCache = new Map();
const posterCache = new Map();

async function fetchBuffer(url) {
  if (sourceImageCache.has(url)) {
    return sourceImageCache.get(url);
  }

  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; LiveTVAddon/9.0)"
    }
  });

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status}: ${url}`
    );
  }

  const buffer =
    Buffer.from(await response.arrayBuffer());

  sourceImageCache.set(url
