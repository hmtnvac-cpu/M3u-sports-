const { addonBuilder, getRouter } = require("stremio-addon-sdk");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 7000;

const PUBLIC_BASE =
  process.env.PUBLIC_BASE_URL ||
  "https://m3u-sports-tv.onrender.com";

// ======================================================
// VERSION
// ======================================================

const VERSION = "1.0.0";

// ======================================================
// HELPERS
// ======================================================

const uniq = arr =>
  [...new Set(arr.map(x => String(x).trim()).filter(Boolean))];

const espnTeam = id =>
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

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ======================================================
// LOGO
//
// Không còn Imgur cho VTV.
// Không dùng logo chữ fallback.
// ======================================================

const LOGO = {

  // ==========================
  // VTV
  // ==========================

  vtv1:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/VTV1_logo_2013_final.svg/512px-VTV1_logo_2013_final.svg.png",

  vtv2:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/VTV2_logo_2013_final.svg/512px-VTV2_logo_2013_final.svg.png",

  vtv3:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/VTV3_logo_2013_final.svg/512px-VTV3_logo_2013_final.svg.png",

  vtv4:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/VTV4_logo_2013_final.svg/512px-VTV4_logo_2013_final.svg.png",

  vtv5:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/VTV5_logo_2013_final.svg/512px-VTV5_logo_2013_final.svg.png",

  vtv6:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/VTV6_logo_2026_final.svg/512px-VTV6_logo_2026_final.svg.png",

  vtv7:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/VTV7_logo_2016_final.svg/512px-VTV7_logo_2016_final.svg.png",

  vtv8:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/VTV8_logo_2016_final.svg/512px-VTV8_logo_2016_final.svg.png",

  vtv9:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/VTV9_logo_2013_final.svg/512px-VTV9_logo_2013_final.svg.png",

  vtv10:
    "https://upload.wikimedia.org/wikipedia/commons/7/70/VTV10_logo_2026.png",

  // ==========================
  // USA / CANADA
  // ==========================

  cbs:
    "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/united-states/cbs-sports-network-us.png",

  nbc:
    "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/united-states/nbc-sports-us.png",

  sportsnet:
    "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/canada/sportsnet-sn1-ca.png",

  usa:
    "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/united-states/usa-us.png",

  universo:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Universo_2015.svg/512px-Universo_2015.svg.png",

  // ==========================
  // UK / EUROPE / ASIA
  // ==========================

  now:
    "https://www.tvlogo.org/hong-kong/now-sports-prime-hk.png",

  skyMain:
    "https://www.tvlogo.org/united-kingdom/sky-sports-main-event-uk.png",

  skyPremier:
    "https://www.tvlogo.org/united-kingdom/sky-sports-premier-league-uk.png",

  sky:
    "https://www.tvlogo.org/united-kingdom/sky-sports-icon-uk.png",

  skyDarts:
    "https://www.tvlogo.org/united-kingdom/sky-sports-darts-uk.png",

  skyF1:
    "https://www.tvlogo.org/united-kingdom/sky-sports-f1-uk.png",

  bein:
    "https://www.tvlogo.org/france/bein-sports-fr.png",

  digi:
    "https://www.tvlogo.org/romania/digi-sport-1-ro.png",

  eleven:
    "https://www.tvlogo.org/belgium/eleven-sports-1-fr-be.png",

  tf1:
    "https://www.tvlogo.org/france/tf1-fr.png",

  // TNT thường + Ultimate dùng logo TNT chuẩn
  tnt:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/TNT_Sports_2024_vector_logo.svg/512px-TNT_Sports_2024_vector_logo.svg.png",

  tntUltimate:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/TNT_Sports_2024_vector_logo.svg/512px-TNT_Sports_2024_vector_logo.svg.png",

  vsport:
    "https://res.cloudinary.com/dnaoyj/image/upload/dpr_2,f_auto,q_auto,w_600/v1/Assets/KLT/DNA%20TV/Kanavapaketit/ohjelmakirjastot/V%20kanavat/v_sport_suomi__240X240"
};

// ======================================================
// TEAM LOGOS
// ======================================================

const TEAM = {
  arsenal: espnTeam(359),
  coventry: espnTeam(388),

  hull: espnTeam(306),
  manUnited: espnTeam(360),

  everton: espnTeam(368),
  crystalPalace: espnTeam(384),

  ipswich: espnTeam(373),
  sunderland: espnTeam(366),

  forest: espnTeam(393),
  leeds: espnTeam(357),

  brentford: espnTeam(337),
  tottenham: espnTeam(367)
};

// ======================================================
// CHANNELS
// ======================================================

const channels = [

  // ==================================================
  // VTV
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
  // SPORTS 1080
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
    "sky-sports-main-event-fhd",
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
    "sky-sports-premier-league-fhd",
    "sports1080",
    "Sky Sports Premier League FHD",
    LOGO.skyPremier,
    [
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1905844&extension=ts&play_token=HE8bJPpkM0",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1905844&extension=ts&play_token=AIylOstlvH",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:7d:69:87&stream=1905844&extension=ts&play_token=VauO51P7Uz",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7E:19:50&stream=1905844&extension=ts&play_token=Rp6htQTP1z"
    ]
  ),

  makeChannel(
    "sportsnet-one-ca-1080",
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
    "usa-network-1080",
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
    "universo-1080",
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
  // SPORTS UHD / 4K
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
    LOGO.tntUltimate,
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

// ======================================================
// LIVE MATCHES
// ======================================================

const matches = [

  {
    id: "arsenal-coventry-20260822",
    time: "02:00",
    date: "22/08/2026",
    home: "Arsenal",
    away: "Coventry City",
    homeLogo: TEAM.arsenal,
    awayLogo: TEAM.coventry,

    channels1080: [
      "sky-sports-main-event-fhd",
      "sky-sports-premier-league-fhd",
      "usa-network-1080"
    ],

    channels4k: [
      "sky-sports-main-event",
      "sky-sports-uhd"
    ]
  },

  {
    id: "hull-man-united-20260822",
    time: "18:30",
    date: "22/08/2026",
    home: "Hull City",
    away: "Manchester United",
    homeLogo: TEAM.hull,
    awayLogo: TEAM.manUnited,

    channels1080: [
      "usa-network-1080"
    ],

    channels4k: [
      "tnt-sports-uhd",
      "tnt-sports-ultimate-uhd"
    ]
  },

  {
    id: "everton-palace-20260822",
    time: "21:00",
    date: "22/08/2026",
    home: "Everton",
    away: "Crystal Palace",
    homeLogo: TEAM.everton,
    awayLogo: TEAM.crystalPalace,

    channels1080: [
      "usa-network-1080"
    ],

    channels4k: []
  },

  {
    id: "ipswich-sunderland-20260822",
    time: "21:00",
    date: "22/08/2026",
    home: "Ipswich Town",
    away: "Sunderland",
    homeLogo: TEAM.ipswich,
    awayLogo: TEAM.sunderland,

    channels1080: [
      "sky-sports-premier-league-fhd"
    ],

    channels4k: []
  },

  {
    id: "forest-leeds-20260822",
    time: "21:00",
    date: "22/08/2026",
    home: "Nottingham Forest",
    away: "Leeds United",
    homeLogo: TEAM.forest,
    awayLogo: TEAM.leeds,

    channels1080: [],
    channels4k: []
  },

  {
    id: "brentford-spurs-20260822",
    time: "23:30",
    date: "22/08/2026",
    home: "Brentford",
    away: "Tottenham Hotspur",
    homeLogo: TEAM.brentford,
    awayLogo: TEAM.tottenham,

    channels1080: [
      "sky-sports-main-event-fhd",
      "sky-sports-premier-league-fhd"
    ],

    channels4k: [
      "sky-sports-main-event",
      "sky-sports-uhd"
    ]
  }
];

// ======================================================
// LIVE POSTER IMAGE CACHE
// ======================================================

const imageCache = new Map();

async function imageDataUri(url) {

  if (imageCache.has(url)) {
    return imageCache.get(url);
  }

  const response =
    await fetch(url, {
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 LiveTV/1.0"
      }
    });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const contentType =
    response.headers.get("content-type") ||
    "image/png";

  const buffer =
    Buffer.from(
      await response.arrayBuffer()
    );

  const data =
    `data:${contentType};base64,${buffer.toString("base64")}`;

  imageCache.set(url, data);

  return data;
}

// ======================================================
// LIVE POSTER
//
// Hai đội cân bằng.
// Không phóng logo.
// VS ở chính giữa.
// Giờ ở dưới.
// ======================================================

app.get(
  "/poster/live/:id.svg",
  async (req, res) => {

    const match =
      matches.find(
        m => m.id === req.params.id
      );

    if (!match) {
      return res
        .status(404)
        .send("Not found");
    }

    try {

      const [home, away] =
        await Promise.all([
          imageDataUri(match.homeLogo),
          imageDataUri(match.awayLogo)
        ]);

      const svg = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="600"
  height="600"
  viewBox="0 0 600 600"
>

  <rect
    width="600"
    height="600"
    rx="40"
    fill="#11151c"
  />

  <rect
    x="28"
    y="28"
    width="544"
    height="544"
    rx="32"
    fill="#171c24"
  />

  <image
    href="${home}"
    x="75"
    y="155"
    width="180"
    height="180"
    preserveAspectRatio="xMidYMid meet"
  />

  <image
    href="${away}"
    x="345"
    y="155"
    width="180"
    height="180"
    preserveAspectRatio="xMidYMid meet"
  />

  <circle
    cx="300"
    cy="245"
    r="43"
    fill="#0b0f15"
    stroke="#5d6673"
    stroke-width="3"
  />

  <text
    x="300"
    y="257"
    text-anchor="middle"
    fill="#ffffff"
    font-family="Arial,Helvetica,sans-serif"
    font-size="31"
    font-weight="800"
  >
    VS
  </text>

  <text
    x="300"
    y="430"
    text-anchor="middle"
    fill="#ffffff"
    font-family="Arial,Helvetica,sans-serif"
    font-size="48"
    font-weight="800"
  >
    ${escapeXml(match.time)}
  </text>

</svg>`;

      res.set(
        "Content-Type",
        "image/svg+xml"
      );

      res.set(
        "Cache-Control",
        "public,max-age=21600"
      );

      res.send(svg);

    } catch (error) {

      console.error(
        "LIVE POSTER:",
        match.id,
        error.message
      );

      res
        .status(500)
        .send("Poster error");
    }
  }
);

// ======================================================
// POSTER URL
//
// Kênh gốc dùng logo trực tiếp.
// Không proxy logo qua Render.
// ======================================================

function channelPoster(channel) {
  return channel.logo;
}

function livePoster(match) {

  const svg =
    `${PUBLIC_BASE}/poster/live/${match.id}.svg?v=100`;

  return (
    "https://images.weserv.nl/?" +
    "url=" +
    encodeURIComponent(svg) +
    "&w=600" +
    "&h=600" +
    "&fit=contain" +
    "&output=png" +
    "&q=92"
  );
}

// ======================================================
// SORT
// ======================================================

const groupOrder = {
  vtv: 1,
  sports1080: 2,
  sports4k: 3
};

channels.sort((a, b) => {

  if (a.group !== b.group) {
    return (
      groupOrder[a.group] -
      groupOrder[b.group]
    );
  }

  return a.name.localeCompare(
    b.name,
    "en",
    {
      sensitivity: "base",
      numeric: true
    }
  );
});

matches.sort(
  (a, b) =>
    a.time.localeCompare(b.time)
);

// ======================================================
// MANIFEST
// ======================================================

const manifest = {

  id:
    "com.hmtnvac.livetv",

  version:
    VERSION,

  name:
    "Live TV",

  description:
    "Live Football • Sports 1080P • Sports UHD / 4K • VTV",

  resources: [
    "catalog",
    "meta",
    "stream"
  ],

  types: [
    "tv"
  ],

  catalogs: [

    {
      type: "tv",
      id: "live1080",
      name: "🔴 LIVE • 1080P / FHD"
    },

    {
      type: "tv",
      id: "live4k",
      name: "🏆 LIVE • UHD / 4K"
    },

    {
      type: "tv",
      id: "sports1080",
      name: "📺 Sports 1080P • 60 FPS"
    },

    {
      type: "tv",
      id: "sports4k",
      name: "🏆 Sports UHD / 4K"
    },

    {
      type: "tv",
      id: "vtv",
      name: "🇻🇳 VTV"
    }
  ]
};

const builder =
  new addonBuilder(manifest);

// ======================================================
// LIVE HELPERS
// ======================================================

function liveName(match) {
  return (
    `${match.time} • ` +
    `${match.home} vs ${match.away}`
  );
}

function buildLiveStreams(
  match,
  quality
) {

  const ids =
    quality === "4k"
      ? match.channels4k
      : match.channels1080;

  const streams = [];

  ids.forEach(channelId => {

    const channel =
      channelMap[channelId];

    if (!channel) {
      return;
    }

    channel.streams.forEach(
      (url, index) => {

        streams.push({
          name:
            channel.name,

          title:
            `${channel.name} • Nguồn ${index + 1}`,

          url
        });
      }
    );
  });

  return streams;
}

// ======================================================
// CATALOG
// ======================================================

builder.defineCatalogHandler(
  async args => {

    // ------------------------------
    // LIVE 1080
    // ------------------------------

    if (args.id === "live1080") {

      const list =
        matches.filter(
          m =>
            m.channels1080.length > 0
        );

      return {
        metas:
          list.map(
            match => ({
              id:
                `live1080-${match.id}`,

              type:
                "tv",

              name:
                liveName(match),

              poster:
                livePoster(match),

              posterShape:
                "square",

              description:
                `${match.date} • 1080P / FHD`
            })
          )
      };
    }

    // ------------------------------
    // LIVE 4K
    // ------------------------------

    if (args.id === "live4k") {

      const list =
        matches.filter(
          m =>
            m.channels4k.length > 0
        );

      return {
        metas:
          list.map(
            match => ({
              id:
                `live4k-${match.id}`,

              type:
                "tv",

              name:
                liveName(match),

              poster:
                livePoster(match),

              posterShape:
                "square",

              description:
                `${match.date} • UHD / 4K`
            })
          )
      };
    }

    // ------------------------------
    // CHANNEL CATALOG
    // ------------------------------

    const list =
      channels.filter(
        channel =>
          channel.group === args.id
      );

    return {
      metas:
        list.map(
          channel => ({
            id:
              channel.id,

            type:
              "tv",

            name:
              channel.name,

            poster:
              channelPoster(channel),

            posterShape:
              "square",

            description:
              `${channel.name} • ${channel.streams.length} nguồn`
          })
        )
    };
  }
);

// ======================================================
// META
// ======================================================

builder.defineMetaHandler(
  async args => {

    // LIVE 1080
    if (
      args.id.startsWith(
        "live1080-"
      )
    ) {

      const id =
        args.id.replace(
          "live1080-",
          ""
        );

      const match =
        matches.find(
          m => m.id === id
        );

      if (!match) {
        return {
          meta: null
        };
      }

      return {
        meta: {
          id:
            args.id,

          type:
            "tv",

          name:
            liveName(match),

          poster:
            livePoster(match),

          posterShape:
            "square",

          description:
            `${match.date} • 1080P / FHD`
        }
      };
    }

    // LIVE 4K
    if (
      args.id.startsWith(
        "live4k-"
      )
    ) {

      const id =
        args.id.replace(
          "live4k-",
          ""
        );

      const match =
        matches.find(
          m => m.id === id
        );

      if (!match) {
        return {
          meta: null
        };
      }

      return {
        meta: {
          id:
            args.id,

          type:
            "tv",

          name:
            liveName(match),

          poster:
            livePoster(match),

          posterShape:
            "square",

          description:
            `${match.date} • UHD / 4K`
        }
      };
    }

    // CHANNEL
    const channel =
      channelMap[args.id];

    if (!channel) {
      return {
        meta: null
      };
    }

    return {
      meta: {
        id:
          channel.id,

        type:
          "tv",

        name:
          channel.name,

        poster:
          channelPoster(channel),

        posterShape:
          "square",

        description:
          `${channel.name} • ${channel.streams.length} nguồn`
      }
    };
  }
);

// ======================================================
// STREAM
// ======================================================

builder.defineStreamHandler(
  async args => {

    // LIVE 1080
    if (
      args.id.startsWith(
        "live1080-"
      )
    ) {

      const id =
        args.id.replace(
          "live1080-",
          ""
        );

      const match =
        matches.find(
          m => m.id === id
        );

      if (!match) {
        return {
          streams: []
        };
      }

      return {
        streams:
          buildLiveStreams(
            match,
            "1080"
          )
      };
    }

    // LIVE 4K
    if (
      args.id.startsWith(
        "live4k-"
      )
    ) {

      const id =
        args.id.replace(
          "live4k-",
          ""
        );

      const match =
        matches.find(
          m => m.id === id
        );

      if (!match) {
        return {
          streams: []
        };
      }

      return {
        streams:
          buildLiveStreams(
            match,
            "4k"
          )
      };
    }

    // CHANNEL
    const channel =
      channelMap[args.id];

    if (!channel) {
      return {
        streams: []
      };
    }

    return {
      streams:
        channel.streams.map(
          (url, index) => ({
            name:
              channel.name,

            title:
              `${channel.name} • Nguồn ${index + 1}`,

            url
          })
        )
    };
  }
);

// ======================================================
// HOME
// ======================================================

app.get(
  "/",
  (req, res) => {

    const manifestUrl =
      `${req.protocol}://${req.get("host")}/manifest.json`;

    const vtv =
      channels.filter(
        c => c.group === "vtv"
      ).length;

    const sports1080 =
      channels.filter(
        c => c.group === "sports1080"
      ).length;

    const sports4k =
      channels.filter(
        c => c.group === "sports4k"
      ).length;

    const live1080 =
      matches.filter(
        m =>
          m.channels1080.length > 0
      ).length;

    const live4k =
      matches.filter(
        m =>
          m.channels4k.length > 0
      ).length;

    res.send(`
<!doctype html>

<html>

<head>
<meta charset="UTF-8">
<meta
  name="viewport"
  content="width=device-width,initial-scale=1"
>
<title>Live TV</title>
</head>

<body
style="
background:#111;
color:#fff;
font-family:Arial;
padding:30px;
line-height:1.8;
"
>

<h1>📺 Live TV</h1>

<p>
Version:
<b>${VERSION}</b>
</p>

<p>
🔴 LIVE 1080P:
<b>${live1080}</b>
</p>

<p>
🏆 LIVE 4K:
<b>${live4k}</b>
</p>

<p>
🇻🇳 VTV:
<b>${vtv}</b>
</p>

<p>
📺 Sports 1080P:
<b>${sports1080}</b>
</p>

<p>
🏆 Sports UHD / 4K:
<b>${sports4k}</b>
</p>

<hr>

<p>
Manifest:
<br>
${manifestUrl}
</p>

</body>
</html>
`);
  }
);

// ======================================================
// ROUTER
// ======================================================

app.use(
  "/",
  getRouter(
    builder.getInterface()
  )
);

// ======================================================
// START
// ======================================================

app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      `Live TV ${VERSION} running on port ${PORT}`
    );

    console.log(
      `Channels: ${channels.length}`
    );

    console.log(
      `Live matches: ${matches.length}`
    );
  }
);
