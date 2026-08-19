const { addonBuilder, getRouter } = require("stremio-addon-sdk");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 7000;

const PUBLIC_BASE =
  process.env.PUBLIC_BASE_URL ||
  "https://m3u-sports-tv.onrender.com";

const VERSION = "1.0.1";

// ==================================================
// HELPERS
// ==================================================

const uniq = arr =>
  [...new Set(
    arr
      .map(x => String(x).trim())
      .filter(Boolean)
  )];

const espnTeam = id =>
  `https://a.espncdn.com/i/teamlogos/soccer/500/${id}.png`;

function normalizedPng(url) {
  return (
    "https://images.weserv.nl/?url=" +
    encodeURIComponent(url) +
    "&w=600" +
    "&h=600" +
    "&fit=contain" +
    "&bg=11151c" +
    "&output=png" +
    "&q=92" +
    "&v=101"
  );
}

function makeChannel(
  id,
  group,
  name,
  logo,
  streams
) {
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

// ==================================================
// LOGO VTV TỰ HOST TRÊN RENDER
//
// Không dùng link ảnh bên ngoài.
// Tất cả cùng một mẫu.
// Chỉ thay số 1 → 10.
// ==================================================

function vtvLogoUrl(number) {
  return (
    `${PUBLIC_BASE}/logo/vtv${number}.svg?v=101`
  );
}

app.get(
  "/logo/vtv:num.svg",
  (req, res) => {

    const num =
      String(req.params.num);

    const allowed =
      [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10"
      ];

    if (!allowed.includes(num)) {
      return res
        .status(404)
        .send("Not found");
    }

    // Số 10 dài hơn nên font nhỏ hơn một chút.
    const numberSize =
      num === "10"
        ? 145
        : 180;

    const numberX =
      num === "10"
        ? 430
        : 455;

    const svg = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="600"
  height="600"
  viewBox="0 0 600 600"
>

  <!-- NỀN TRẮNG GIỐNG MẪU -->
  <rect
    width="600"
    height="600"
    fill="#ffffff"
  />

  <!-- V ĐỎ -->
  <text
    x="95"
    y="365"
    font-family="Arial Black,Arial,sans-serif"
    font-size="220"
    font-weight="900"
    font-style="italic"
    fill="#e6202a"
    transform="skewX(-8)"
  >
    V
  </text>

  <!-- T XANH LÁ -->
  <text
    x="230"
    y="365"
    font-family="Arial Black,Arial,sans-serif"
    font-size="220"
    font-weight="900"
    font-style="italic"
    fill="#168647"
    transform="skewX(-8)"
  >
    T
  </text>

  <!-- V XANH DƯƠNG -->
  <text
    x="325"
    y="365"
    font-family="Arial Black,Arial,sans-serif"
    font-size="220"
    font-weight="900"
    font-style="italic"
    fill="#1670b8"
    transform="skewX(-8)"
  >
    V
  </text>

  <!-- SỐ KÊNH -->
  <text
    x="${numberX}"
    y="350"
    font-family="Arial Black,Arial,sans-serif"
    font-size="${numberSize}"
    font-weight="900"
    font-style="italic"
    fill="#186ead"
  >
    ${num}
  </text>

</svg>
`;

    res.set(
      "Content-Type",
      "image/svg+xml"
    );

    res.set(
      "Cache-Control",
      "public,max-age=604800"
    );

    res.send(svg);
  }
);

// ==================================================
// LOGOS
//
// VTV tự host.
// Tất cả logo khác giữ nguyên bản đang hoạt động.
// ==================================================

const LOGOS = {

  // ==================================================
  // VTV
  // ==================================================

  vtv1:
    vtvLogoUrl(1),

  vtv2:
    vtvLogoUrl(2),

  vtv3:
    vtvLogoUrl(3),

  vtv4:
    vtvLogoUrl(4),

  vtv5:
    vtvLogoUrl(5),

  vtv6:
    vtvLogoUrl(6),

  vtv7:
    vtvLogoUrl(7),

  vtv8:
    vtvLogoUrl(8),

  vtv9:
    vtvLogoUrl(9),

  vtv10:
    vtvLogoUrl(10),

  // ==================================================
  // SPORTS 1080
  // ==================================================

  cbs:
    "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/united-states/cbs-sports-network-us.png",

  nbc:
    "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/united-states/nbc-sports-us.png",

  now:
    "https://www.tvlogo.org/hong-kong/now-sports-prime-hk.png",

  skyMain:
    "https://www.tvlogo.org/united-kingdom/sky-sports-main-event-uk.png",

  skyPL:
    "https://www.tvlogo.org/united-kingdom/sky-sports-premier-league-uk.png",

  sportsnet:
    "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/canada/sportsnet-sn1-ca.png",

  usa:
    "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/united-states/usa-us.png",

  universo:
    "https://img.nbc.com/files/images/2019/4/26/Universo-logos-templateUniverso-Logo-Coloralt2-450x250.v2.png",

  // ==================================================
  // SPORTS UHD / 4K
  // ==================================================

  bein:
    "https://www.tvlogo.org/france/bein-sports-fr.png",

  digi:
    "https://www.tvlogo.org/romania/digi-sport-1-ro.png",

  eleven:
    "https://tvlogo.org/belgium/eleven-sports-1-fr-be.png",

  sky:
    "https://www.tvlogo.org/united-kingdom/sky-sports-icon-uk.png",

  skyDarts:
    "https://www.tvlogo.org/united-kingdom/sky-sports-darts-uk.png",

  skyF1:
    "https://www.tvlogo.org/united-kingdom/sky-sports-f1-uk.png",

  tf1:
    "https://www.tvlogo.org/france/tf1-fr.png",

  tnt:
    "https://www.tvlogo.org/united-kingdom/tnt-sports.png",

  tntUltimate:
    "https://static.wikia.nocookie.net/logopedia/images/a/a8/TNT_Sports_Ultimate_%282023%29_II.svg/revision/latest/scale-to-width-down/250?cb=20230719041550",

  vsport:
    "https://res.cloudinary.com/dnaoyj/image/upload/dpr_2,f_auto,q_auto,w_600/v1/Assets/KLT/DNA%20TV/Kanavapaketit/ohjelmakirjastot/V%20kanavat/v_sport_suomi__240X240"
};

// ==================================================
// LOGO CLB
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
// DANH SÁCH KÊNH
// ==================================================

const channels = [

  // ==================================================
  // VTV
  // ==================================================

  makeChannel(
    "vtv1",
    "vtv",
    "VTV1",
    LOGOS.vtv1,
    [
      "https://vips-livecdn.fptplay.net/live/media/vtv1/live247-hls-avc/vtv1-avc1_5600000=10000-mp4a_131600=20000.m3u8"
    ]
  ),

  makeChannel(
    "vtv2",
    "vtv",
    "VTV2",
    LOGOS.vtv2,
    [
      "https://vips-livecdn.fptplay.net/live/media/vtv2/live247-hls-avc/vtv2-avc1_5600000=10000-mp4a_131600=20000.m3u8"
    ]
  ),

  makeChannel(
    "vtv3",
    "vtv",
    "VTV3",
    LOGOS.vtv3,
    [
      "https://vips-livecdn.fptplay.net/live/media/vtv3/live247-hls-avc/vtv3-avc1_5600000=10000-mp4a_131600=20000.m3u8"
    ]
  ),

  makeChannel(
    "vtv4",
    "vtv",
    "VTV4",
    LOGOS.vtv4,
    [
      "https://vips-livecdn.fptplay.net/live/media/vtv4/live247-hls-avc/vtv4-avc1_5600000=10000-mp4a_131600=20000.m3u8"
    ]
  ),

  makeChannel(
    "vtv5",
    "vtv",
    "VTV5",
    LOGOS.vtv5,
    [
      "https://vips-livecdn.fptplay.net/live/media/vtv5/live247-hls-avc/vtv5-avc1_5600000=10000-mp4a_131600=20000.m3u8"
    ]
  ),

  makeChannel(
    "vtv6",
    "vtv",
    "VTV6",
    LOGOS.vtv6,
    [
      "https://vips-livecdn.fptplay.net/live/media/vtv6/live247-hls-avc/vtv6-avc1_5600000=10000-mp4a_131600=20000.m3u8"
    ]
  ),

  makeChannel(
    "vtv7",
    "vtv",
    "VTV7",
    LOGOS.vtv7,
    [
      "https://vips-livecdn.fptplay.net/live/media/vtv7/live247-hls-avc/vtv7-avc1_5600000=10000-mp4a_131600=20000.m3u8"
    ]
  ),

  makeChannel(
    "vtv8",
    "vtv",
    "VTV8",
    LOGOS.vtv8,
    [
      "https://vips-livecdn.fptplay.net/live/media/vtv8/live-hls-avc/vtv8-avc1_4000000=10000-mp4a_131600=20000.m3u8"
    ]
  ),

  makeChannel(
    "vtv9",
    "vtv",
    "VTV9",
    LOGOS.vtv9,
    [
      "https://vips-livecdn.fptplay.net/live/media/vtv9/live247-hls-avc/vtv9-avc1_5600000=10000-mp4a_131600=20000.m3u8"
    ]
  ),

  makeChannel(
    "vtv10",
    "vtv",
    "VTV10",
    LOGOS.vtv10,
    [
      "https://vips-livecdn.fptplay.net/live/media/vtv10/live247-hls-avc/vtv10-avc1_5600000=10000-mp4a_131600=20000.m3u8"
    ]
  ),

  // ==================================================
  // SPORTS 1080P / 60 FPS
  // ==================================================

  makeChannel(
    "cbs-sports-1080",
    "sports1080",
    "CBS Sports 1080p 60 FPS",
    LOGOS.cbs,
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
    LOGOS.nbc,
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
    LOGOS.now,
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
    LOGOS.skyMain,
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
    LOGOS.skyPL,
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
    LOGOS.sportsnet,
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
    LOGOS.usa,
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
    LOGOS.universo,
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
    LOGOS.bein,
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
    LOGOS.digi,
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
    LOGOS.eleven,
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
    LOGOS.sky,
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
    LOGOS.sky,
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
    LOGOS.sky,
    [
      "http://mag.tivi-one-iptv.net:80/play/live.php?mac=00:1A:79:0E:0F:8E&stream=893917&extension=ts&play_token=5QPOI5t6D3"
    ]
  ),

  makeChannel(
    "sky-sports-darts-uhd",
    "sports4k",
    "Sky Sports Darts UHD",
    LOGOS.skyDarts,
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
    LOGOS.skyF1,
    [
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1761500&extension=ts&play_token=3TLQcXqTKG",

      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1761500&extension=ts&play_token=OWv81jhV3e"
    ]
  ),

  makeChannel(
    "sky-sports-main-event",
    "sports4k",
    "Sky Sports Main Event",
    LOGOS.skyMain,
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
    LOGOS.sky,
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
    LOGOS.tf1,
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
    LOGOS.tnt,
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
    LOGOS.tntUltimate,
    [
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1595637&extension=ts&play_token=YdoiZErSQZ"
    ]
  ),

  makeChannel(
    "v-sport-plus-uhd",
    "sports4k",
    "V Sport+ UHD",
    LOGOS.vsport,
    [
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1632123&extension=ts&play_token=Aeer3FFu7o",

      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1749221&extension=ts&play_token=jg5ZtLtCQN",

      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1632123&extension=ts&play_token=E6ziX5leBT",

      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1632123&extension=ts&play_token=6GO8Kiqjfm"
    ]
  )
];

// ==================================================
// CHANNEL MAP
// ==================================================

const channelMap =
  Object.fromEntries(
    channels.map(
      c => [
        c.id,
        c
      ]
    )
  );

// ==================================================
// LIVE MATCHES
// ==================================================

const matches = [

  {
    id:
      "arsenal-coventry-20260822",

    time:
      "02:00",

    date:
      "22/08/2026",

    home:
      "Arsenal",

    away:
      "Coventry City",

    homeLogo:
      TEAM.arsenal,

    awayLogo:
      TEAM.coventry,

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
    id:
      "hull-man-united-20260822",

    time:
      "18:30",

    date:
      "22/08/2026",

    home:
      "Hull City",

    away:
      "Manchester United",

    homeLogo:
      TEAM.hull,

    awayLogo:
      TEAM.manUnited,

    channels1080: [
      "usa-network-1080"
    ],

    channels4k: [
      "tnt-sports-uhd",
      "tnt-sports-ultimate-uhd"
    ]
  },

  {
    id:
      "everton-palace-20260822",

    time:
      "21:00",

    date:
      "22/08/2026",

    home:
      "Everton",

    away:
      "Crystal Palace",

    homeLogo:
      TEAM.everton,

    awayLogo:
      TEAM.crystalPalace,

    channels1080: [
      "usa-network-1080"
    ],

    channels4k: []
  },

  {
    id:
      "ipswich-sunderland-20260822",

    time:
      "21:00",

    date:
      "22/08/2026",

    home:
      "Ipswich Town",

    away:
      "Sunderland",

    homeLogo:
      TEAM.ipswich,

    awayLogo:
      TEAM.sunderland,

    channels1080: [
      "sky-sports-premier-league-fhd"
    ],

    channels4k: []
  },

  {
    id:
      "forest-leeds-20260822",

    time:
      "21:00",

    date:
      "22/08/2026",

    home:
      "Nottingham Forest",

    away:
      "Leeds United",

    homeLogo:
      TEAM.forest,

    awayLogo:
      TEAM.leeds,

    channels1080: [],

    channels4k: []
  },

  {
    id:
      "brentford-spurs-20260822",

    time:
      "23:30",

    date:
      "22/08/2026",

    home:
      "Brentford",

    away:
      "Tottenham Hotspur",

    homeLogo:
      TEAM.brentford,

    awayLogo:
      TEAM.tottenham,

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
// CACHE LOGO CLB
// ==================================================

const imageCache =
  new Map();

async function toDataUri(url) {

  if (
    imageCache.has(url)
  ) {
    return imageCache.get(
      url
    );
  }

  const response =
    await fetch(
      url,
      {
        redirect:
          "follow",

        headers: {
          "User-Agent":
            "Mozilla/5.0 LiveTV/1.0.1"
        }
      }
    );

  if (
    !response.ok
  ) {
    throw new Error(
      `HTTP ${response.status}`
    );
  }

  const type =
    response.headers.get(
      "content-type"
    ) ||
    "image/png";

  const buffer =
    Buffer.from(
      await response.arrayBuffer()
    );

  const data =
    `data:${type};base64,${buffer.toString("base64")}`;

  imageCache.set(
    url,
    data
  );

  return data;
}

// ==================================================
// POSTER LIVE
// ==================================================

app.get(
  "/poster/live/:id.svg",
  async (
    req,
    res
  ) => {

    const match =
      matches.find(
        m =>
          m.id ===
          req.params.id
      );

    if (
      !match
    ) {
      return res
        .status(404)
        .send(
          "Not found"
        );
    }

    try {

      const [
        home,
        away
      ] =
        await Promise.all(
          [
            toDataUri(
              match.homeLogo
            ),

            toDataUri(
              match.awayLogo
            )
          ]
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
    rx="38"
    fill="#11151c"
  />

  <rect
    x="25"
    y="25"
    width="550"
    height="550"
    rx="32"
    fill="#171c24"
  />

  <image
    href="${home}"
    x="70"
    y="155"
    width="185"
    height="185"
    preserveAspectRatio="xMidYMid meet"
  />

  <image
    href="${away}"
    x="345"
    y="155"
    width="185"
    height="185"
    preserveAspectRatio="xMidYMid meet"
  />

  <circle
    cx="300"
    cy="248"
    r="44"
    fill="#0c1017"
    stroke="#636c79"
    stroke-width="3"
  />

  <text
    x="300"
    y="260"
    text-anchor="middle"
    fill="#ffffff"
    font-family="Arial,Helvetica,sans-serif"
    font-size="32"
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
    font-size="46"
    font-weight="800"
  >
    ${escapeXml(match.time)}
  </text>

  <text
    x="300"
    y="490"
    text-anchor="middle"
    fill="#aab2bf"
    font-family="Arial,Helvetica,sans-serif"
    font-size="24"
  >
    ${escapeXml(match.date)}
  </text>

</svg>
`;

      res.set(
        "Content-Type",
        "image/svg+xml"
      );

      res.set(
        "Cache-Control",
        "public,max-age=21600"
      );

      res.send(
        svg
      );
    }

    catch (error) {

      console.error(
        "LIVE POSTER ERROR:",
        match.id,
        error.message
      );

      res
        .status(500)
        .send(
          "Poster error"
        );
    }
  }
);

// ==================================================
// SORT
// ==================================================

const groupOrder = {
  vtv: 1,
  sports1080: 2,
  sports4k: 3
};

channels.sort(
  (
    a,
    b
  ) => {

    if (
      a.group !==
      b.group
    ) {
      return (
        groupOrder[a.group] -
        groupOrder[b.group]
      );
    }

    return a.name.localeCompare(
      b.name,
      "en",
      {
        sensitivity:
          "base",

        numeric:
          true
      }
    );
  }
);

matches.sort(
  (
    a,
    b
  ) =>
    a.time.localeCompare(
      b.time
    )
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
      type:
        "tv",

      id:
        "live1080",

      name:
        "🔴 LIVE • 1080P / FHD",

      extra: [
        {
          name:
            "search",

          isRequired:
            false
        }
      ]
    },

    {
      type:
        "tv",

      id:
        "live4k",

      name:
        "🏆 LIVE • UHD / 4K",

      extra: [
        {
          name:
            "search",

          isRequired:
            false
        }
      ]
    },

    {
      type:
        "tv",

      id:
        "vtv",

      name:
        "🇻🇳 VTV",

      extra: [
        {
          name:
            "search",

          isRequired:
            false
        }
      ]
    },

    {
      type:
        "tv",

      id:
        "sports1080",

      name:
        "📺 Sports 1080P • 60 FPS",

      extra: [
        {
          name:
            "search",

          isRequired:
            false
        }
      ]
    },

    {
      type:
        "tv",

      id:
        "sports4k",

      name:
        "🏆 Sports UHD / 4K",

      extra: [
        {
          name:
            "search",

          isRequired:
            false
        }
      ]
    }
  ]
};

const builder =
  new addonBuilder(
    manifest
  );

// ==================================================
// HELPERS LIVE
// ==================================================

function liveName(match) {
  return (
    `${match.time} • ` +
    `${match.home} vs ${match.away}`
  );
}

function channelPoster(
  channel
) {

  // VTV dùng thẳng logo do Render tự host.
  if (
    channel.group ===
    "vtv"
  ) {
    return channel.logo;
  }

  // Các kênh khác giữ cách cũ.
  return normalizedPng(
    channel.logo
  );
}

function livePoster(
  match
) {
  return normalizedPng(
    `${PUBLIC_BASE}/poster/live/${match.id}.svg?v=101`
  );
}

function descriptionFor(
  channel
) {

  if (
    channel.group ===
    "vtv"
  ) {
    return (
      "VTV • Truyền hình Việt Nam"
    );
  }

  if (
    channel.group ===
    "sports1080"
  ) {
    return (
      "Sports • 1080P / FHD • " +
      `${channel.streams.length} luồng`
    );
  }

  return (
    "Sports • UHD / 4K • " +
    `${channel.streams.length} luồng`
  );
}

function liveStreams(
  match,
  quality
) {

  const ids =
    quality ===
    "4k"

      ? match.channels4k

      : match.channels1080;

  const streams =
    [];

  ids.forEach(
    id => {

      const channel =
        channelMap[
          id
        ];

      if (
        !channel
      ) {
        return;
      }

      channel.streams.forEach(
        (
          url,
          index
        ) => {

          streams.push(
            {
              name:
                channel.name,

              title:
                `${channel.name} • ${index + 1}`,

              url
            }
          );
        }
      );
    }
  );

  return streams;
}

// ==================================================
// CATALOG
// ==================================================

builder.defineCatalogHandler(
  async args => {

    const search =
      args.extra &&
      args.extra.search

        ? args.extra.search
            .toLowerCase()
            .trim()

        : "";

    // LIVE 1080
    if (
      args.id ===
      "live1080"
    ) {

      let list =
        matches.filter(
          m =>
            m.channels1080.length >
            0
        );

      if (
        search
      ) {
        list =
          list.filter(
            m =>
              liveName(m)
                .toLowerCase()
                .includes(
                  search
                )
          );
      }

      return {

        metas:
          list.map(
            m => ({
              id:
                `live-${m.id}-1080`,

              type:
                "tv",

              name:
                liveName(m),

              poster:
                livePoster(m),

              posterShape:
                "square",

              description:
                `${m.date} • 1080P / FHD`
            })
          )
      };
    }

    // LIVE 4K
    if (
      args.id ===
      "live4k"
    ) {

      let list =
        matches.filter(
          m =>
            m.channels4k.length >
            0
        );

      if (
        search
      ) {
        list =
          list.filter(
            m =>
              liveName(m)
                .toLowerCase()
                .includes(
                  search
                )
          );
      }

      return {

        metas:
          list.map(
            m => ({
              id:
                `live-${m.id}-4k`,

              type:
                "tv",

              name:
                liveName(m),

              poster:
                livePoster(m),

              posterShape:
                "square",

              description:
                `${m.date} • UHD / 4K`
            })
          )
      };
    }

    // KÊNH GỐC
    let list =
      channels.filter(
        c =>
          c.group ===
          args.id
      );

    if (
      search
    ) {
      list =
        list.filter(
          c =>
            c.name
              .toLowerCase()
              .includes(
                search
              )
        );
    }

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
              channelPoster(
                channel
              ),

            posterShape:
              "square",

            description:
              descriptionFor(
                channel
              )
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
        "live-"
      )
    ) {

      const is4k =
        args.id.endsWith(
          "-4k"
        );

      const suffix =
        is4k
          ? "-4k"
          : "-1080";

      const base =
        args.id.slice(
          5,
          -suffix.length
        );

      const match =
        matches.find(
          m =>
            m.id ===
            base
        );

      if (
        !match
      ) {
        return {
          meta:
            null
        };
      }

      return {

        meta: {
          id:
            args.id,

          type:
            "tv",

          name:
            liveName(
              match
            ),

          poster:
            livePoster(
              match
            ),

          posterShape:
            "square",

          description:
            `${match.date} • ${
              is4k
                ? "UHD / 4K"
                : "1080P / FHD"
            }`
        }
      };
    }

    const channel =
      channelMap[
        args.id
      ];

    if (
      !channel
    ) {
      return {
        meta:
          null
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
          channelPoster(
            channel
          ),

        posterShape:
          "square",

        description:
          descriptionFor(
            channel
          )
      }
    };
  }
);

// ==================================================
// STREAM
// ==================================================

builder.defineStreamHandler(
  async args => {

    if (
      args.id.startsWith(
        "live-"
      )
    ) {

      const is4k =
        args.id.endsWith(
          "-4k"
        );

      const suffix =
        is4k
          ? "-4k"
          : "-1080";

      const base =
        args.id.slice(
          5,
          -suffix.length
        );

      const match =
        matches.find(
          m =>
            m.id ===
            base
        );

      if (
        !match
      ) {
        return {
          streams:
            []
        };
      }

      return {

        streams:
          liveStreams(
            match,
            is4k
              ? "4k"
              : "1080"
          )
      };
    }

    const channel =
      channelMap[
        args.id
      ];

    if (
      !channel
    ) {
      return {
        streams:
          []
      };
    }

    return {

      streams:
        channel.streams.map(
          (
            url,
            index
          ) => ({
            name:
              channel.name,

            title:
              `${channel.name} • ${index + 1}`,

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

    const manifestUrl =
      `${req.protocol}://${req.get("host")}/manifest.json`;

    const vtv =
      channels.filter(
        c =>
          c.group ===
          "vtv"
      ).length;

    const sports1080 =
      channels.filter(
        c =>
          c.group ===
          "sports1080"
      ).length;

    const sports4k =
      channels.filter(
        c =>
          c.group ===
          "sports4k"
      ).length;

    const live1080 =
      matches.filter(
        m =>
          m.channels1080.length >
          0
      ).length;

    const live4k =
      matches.filter(
        m =>
          m.channels4k.length >
          0
      ).length;

    const totalStreams =
      channels.reduce(
        (
          total,
          channel
        ) =>
          total +
          channel.streams.length,
        0
      );

    res.send(`
<!doctype html>

<html>

<head>

<meta
  charset="UTF-8"
>

<meta
  name="viewport"
  content="width=device-width,initial-scale=1"
>

<title>
Live TV
</title>

</head>

<body
style="
background:#111;
color:white;
font-family:Arial;
padding:30px;
line-height:1.7;
"
>

<h1>
📺 Live TV
</h1>

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

<p>
Tổng kênh:
<b>${channels.length}</b>
</p>

<p>
Tổng luồng:
<b>${totalStreams}</b>
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

// ==================================================
// STREMIO ROUTER
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
