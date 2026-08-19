const { addonBuilder, getRouter } = require("stremio-addon-sdk");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 7000;

const PUBLIC_BASE =
  process.env.PUBLIC_BASE_URL ||
  "https://m3u-sports-tv.onrender.com";

const VERSION = "1.0.0";

// ==================================================
// HELPERS
// ==================================================

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

// ==================================================
// QUAN TRỌNG:
// TẤT CẢ LOGO KÊNH ĐỀU ĐƯỢC CHUẨN HÓA
//
// - Khung 600x600
// - Logo thực tế chỉ nằm trong 360x360
// - Không crop
// - Không stretch
// - Luôn căn giữa
// ==================================================

function normalizedLogo(url) {

  return (
    "https://images.weserv.nl/?" +
    "url=" +
    encodeURIComponent(url) +

    // vùng logo thật chỉ 360x360
    "&w=360" +
    "&h=360" +

    // tuyệt đối không crop
    "&fit=contain" +

    // căn chính giữa
    "&a=center" +

    // nền cùng màu giao diện
    "&cbg=151922" +

    // đầu ra PNG
    "&output=png" +

    // cache
    "&maxage=7d" +

    // cache breaker
    "&v=100"
  );
}

// ==================================================
// LOGO SOURCES
// ==================================================

const LOGO = {

  // VTV
  vtv1:
    "https://i.imgur.com/GBD9jKo.png",

  vtv2:
    "https://i.imgur.com/BVwi3K3.png",

  vtv3:
    "https://i.imgur.com/7rLCvgS.png",

  vtv4:
    "https://i.imgur.com/9zVTtsA.png",

  vtv5:
    "https://i.imgur.com/7qPKNFU.png",

  vtv6:
    "https://i.imgur.com/GtnRg0D.png",

  vtv7:
    "https://i.imgur.com/AgamSNe.png",

  vtv8:
    "https://i.imgur.com/lpcltL9.png",

  vtv9:
    "https://i.imgur.com/Ex1VkGQ.png",

  vtv10:
    "https://upload.wikimedia.org/wikipedia/commons/7/70/VTV10_logo_2026.png",

  // USA / CANADA
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

  // SPORTS
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

  tnt:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/TNT_Sports_2024_vector_logo.svg/512px-TNT_Sports_2024_vector_logo.svg.png",

  tntUltimate:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/TNT_Sports_2024_vector_logo.svg/512px-TNT_Sports_2024_vector_logo.svg.png",

  vsport:
    "https://res.cloudinary.com/dnaoyj/image/upload/dpr_2,f_auto,q_auto,w_600/v1/Assets/KLT/DNA%20TV/Kanavapaketit/ohjelmakirjastot/V%20kanavat/v_sport_suomi__240X240"
};

// ==================================================
// TEAM LOGOS
// ==================================================

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

// ==================================================
// CHANNELS
// ==================================================

const channels = [

  // VTV

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

  // SPORTS 1080

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

  // SPORTS UHD / 4K

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
  Object.fromEntries(
    channels.map(c => [c.id, c])
  );

// ==================================================
// LIVE MATCHES
// ==================================================

const matches = [

  {
    id: "arsenal-coventry-20260822",
    time: "02:00",
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

// ==================================================
// LIVE POSTER
// ==================================================

function livePoster(match) {

  const home =
    normalizedLogo(
      match.homeLogo
    );

  const away =
    normalizedLogo(
      match.awayLogo
    );

  // Dùng một poster SVG của chính Render
  return (
    `${PUBLIC_BASE}` +
    `/poster/live/${match.id}.svg?v=100`
  );
}

app.get(
  "/poster/live/:id.svg",
  (req, res) => {

    const match =
      matches.find(
        m =>
          m.id === req.params.id
      );

    if (!match) {
      return res
        .status(404)
        .send("Not found");
    }

    const home =
      normalizedLogo(
        match.homeLogo
      );

    const away =
      normalizedLogo(
        match.awayLogo
      );

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
fill="#151922"
/>

<image
href="${home}"
x="55"
y="155"
width="200"
height="200"
preserveAspectRatio="xMidYMid meet"
/>

<image
href="${away}"
x="345"
y="155"
width="200"
height="200"
preserveAspectRatio="xMidYMid meet"
/>

<circle
cx="300"
cy="255"
r="42"
fill="#0c1016"
/>

<text
x="300"
y="267"
text-anchor="middle"
fill="white"
font-family="Arial"
font-size="30"
font-weight="700"
>
VS
</text>

<text
x="300"
y="440"
text-anchor="middle"
fill="white"
font-family="Arial"
font-size="46"
font-weight="700"
>
${match.time}
</text>

</svg>
`;

    res.set(
      "Content-Type",
      "image/svg+xml"
    );

    res.send(svg);
  }
);

// ==================================================
// SORT
// ==================================================

const order = {
  vtv: 1,
  sports1080: 2,
  sports4k: 3
};

channels.sort(
  (a, b) => {

    if (
      a.group !==
      b.group
    ) {
      return (
        order[a.group] -
        order[b.group]
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
  }
);

// ==================================================
// MANIFEST
// ==================================================

const manifest = {

  id:
    "com.hmtnvac.livetv",

  version:
    VERSION,

  name:
    "Live TV",

  description:
    "Live Football • Sports • VTV",

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
      id: "vtv",
      name: "🇻🇳 VTV"
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
    }
  ]
};

const builder =
  new addonBuilder(manifest);

// ==================================================
// CATALOG
// ==================================================

builder.defineCatalogHandler(
  async args => {

    if (
      args.id ===
      "live1080"
    ) {

      return {

        metas:
          matches
            .filter(
              m =>
                m.channels1080.length > 0
            )
            .map(
              m => ({
                id:
                  `live1080-${m.id}`,

                type:
                  "tv",

                name:
                  `${m.time} • ${m.home} vs ${m.away}`,

                poster:
                  livePoster(m),

                posterShape:
                  "square"
              })
            )
      };
    }

    if (
      args.id ===
      "live4k"
    ) {

      return {

        metas:
          matches
            .filter(
              m =>
                m.channels4k.length > 0
            )
            .map(
              m => ({
                id:
                  `live4k-${m.id}`,

                type:
                  "tv",

                name:
                  `${m.time} • ${m.home} vs ${m.away}`,

                poster:
                  livePoster(m),

                posterShape:
                  "square"
              })
            )
      };
    }

    const list =
      channels.filter(
        c =>
          c.group === args.id
      );

    return {

      metas:
        list.map(
          c => ({
            id:
              c.id,

            type:
              "tv",

            name:
              c.name,

            poster:
              normalizedLogo(
                c.logo
              ),

            posterShape:
              "square"
          })
        )
    };
  }
);

// ==================================================
// META
// ==================================================

builder.defineMetaHandler(
  async args => {

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

      const m =
        matches.find(
          x =>
            x.id === id
        );

      if (!m) {
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
            `${m.time} • ${m.home} vs ${m.away}`,

          poster:
            livePoster(m),

          posterShape:
            "square"
        }
      };
    }

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

      const m =
        matches.find(
          x =>
            x.id === id
        );

      if (!m) {
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
            `${m.time} • ${m.home} vs ${m.away}`,

          poster:
            livePoster(m),

          posterShape:
            "square"
        }
      };
    }

    const c =
      channelMap[
        args.id
      ];

    if (!c) {
      return {
        meta: null
      };
    }

    return {

      meta: {
        id:
          c.id,

        type:
          "tv",

        name:
          c.name,

        poster:
          normalizedLogo(
            c.logo
          ),

        posterShape:
          "square"
      }
    };
  }
);

// ==================================================
// STREAM
// ==================================================

function liveStreams(
  match,
  ids
) {

  const streams =
    [];

  ids.forEach(
    channelId => {

      const channel =
        channelMap[
          channelId
        ];

      if (!channel) {
        return;
      }

      channel.streams.forEach(
        (
          url,
          index
        ) => {

          streams.push({
            name:
              channel.name,

            title:
              `${channel.name} • Nguồn ${index + 1}`,

            url
          });
        }
      );
    }
  );

  return streams;
}

builder.defineStreamHandler(
  async args => {

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

      const m =
        matches.find(
          x =>
            x.id === id
        );

      return {
        streams:
          m
            ? liveStreams(
                m,
                m.channels1080
              )
            : []
      };
    }

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

      const m =
        matches.find(
          x =>
            x.id === id
        );

      return {
        streams:
          m
            ? liveStreams(
                m,
                m.channels4k
              )
            : []
      };
    }

    const c =
      channelMap[
        args.id
      ];

    if (!c) {
      return {
        streams: []
      };
    }

    return {

      streams:
        c.streams.map(
          (
            url,
            index
          ) => ({
            name:
              c.name,

            title:
              `${c.name} • Nguồn ${index + 1}`,

            url
          })
        )
    };
  }
);

// ==================================================
// HOME
// ==================================================

app.get(
  "/",
  (
    req,
    res
  ) => {

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
"
>

<h1>📺 Live TV</h1>

<p>
Version:
<b>${VERSION}</b>
</p>

<p>
Logo mode:
<b>Contain / không crop</b>
</p>

<p>
Manifest:
<br>
${req.protocol}://${req.get("host")}/manifest.json
</p>

</body>

</html>
`);
  }
);

// ==================================================
// ROUTER
// ==================================================

app.use(
  "/",
  getRouter(
    builder.getInterface()
  )
);

// ==================================================
// START
// ==================================================

app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      `Live TV ${VERSION} running on ${PORT}`
    );

    console.log(
      `Channels: ${channels.length}`
    );
  }
);
