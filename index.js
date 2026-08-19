const { addonBuilder, getRouter } = require("stremio-addon-sdk");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 7000;

// ==================================================
// HELPER
// ==================================================

function uniq(arr) {
  return [...new Set(arr.map(x => String(x).trim()).filter(Boolean))];
}

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

// Poster dự phòng nếu logo ngoài bị lỗi.
function fallbackPoster(text) {
  return (
    "https://placehold.co/600x600/111111/FFFFFF/png?text=" +
    encodeURIComponent(text)
  );
}

// Poster riêng cho trận LIVE.
function matchPoster(home, away, time) {
  return (
    "https://placehold.co/800x450/111111/FFFFFF/png?text=" +
    encodeURIComponent(
      `${time}\n${home}\nVS\n${away}`
    )
  );
}

// ==================================================
// LOGO KÊNH
// ==================================================
//
// Dùng logo riêng cho từng kênh.
// Nếu một logo bên ngoài chết, metadata vẫn có fallback.
//

const LOGOS = {

  // VTV
  vtv1:
    "https://commons.wikimedia.org/wiki/Special:Redirect/file/VTV1_logo_2013_final.svg",

  vtv2:
    "https://commons.wikimedia.org/wiki/Special:Redirect/file/VTV2_logo_2013_final.svg",

  vtv3:
    "https://commons.wikimedia.org/wiki/Special:Redirect/file/VTV3_logo_2013_final.svg",

  vtv4:
    "https://commons.wikimedia.org/wiki/Special:Redirect/file/VTV4_logo_2013_final.svg",

  vtv5:
    "https://commons.wikimedia.org/wiki/Special:Redirect/file/VTV5_logo_2013_final.svg",

  vtv6:
    fallbackPoster("VTV6"),

  vtv7:
    "https://commons.wikimedia.org/wiki/Special:Redirect/file/VTV7_logo_2016_final.svg",

  vtv8:
    "https://commons.wikimedia.org/wiki/Special:Redirect/file/VTV8_logo_2016_final.svg",

  vtv9:
    "https://commons.wikimedia.org/wiki/Special:Redirect/file/VTV9_logo_2013_final.svg",

  vtv10:
    fallbackPoster("VTV10"),

  // 1080 / FHD
  "cbs-sports-1080":
    "https://commons.wikimedia.org/wiki/Special:Redirect/file/CBS_Sports_logo.svg",

  "nbc-sports-1080":
    "https://commons.wikimedia.org/wiki/Special:Redirect/file/NBC_Sports_2023.svg",

  "now-sports-1080":
    fallbackPoster("NOW Sports"),

  "sky-sports-main-event-fhd":
    fallbackPoster("Sky Sports\nMain Event"),

  "sky-sports-premier-league-fhd":
    fallbackPoster("Sky Sports\nPremier League"),

  "sportsnet-one-ca-1080":
    "https://commons.wikimedia.org/wiki/Special:Redirect/file/Sportsnet_One_logo.svg",

  "usa-network-1080":
    "https://commons.wikimedia.org/wiki/Special:Redirect/file/USA_Network_logo_(2016).svg",

  "universo-1080":
    fallbackPoster("Universo"),

  // UHD / 4K
  "bein-sports-uhd":
    fallbackPoster("beIN Sports\nUHD"),

  "digi-sport-uhd":
    fallbackPoster("Digi Sport\nUHD"),

  "eleven-sports-1-uhd":
    fallbackPoster("Eleven Sports 1\nUHD"),

  "sky-sports-1-uhd":
    fallbackPoster("Sky Sports 1\nUHD"),

  "sky-sports-2-uhd":
    fallbackPoster("Sky Sports 2\nUHD"),

  "sky-sports-bundesliga-uhd":
    fallbackPoster("Sky Sports\nBundesliga UHD"),

  "sky-sports-darts-uhd":
    fallbackPoster("Sky Sports\nDarts UHD"),

  "sky-sports-f1-uhd":
    fallbackPoster("Sky Sports F1\nUHD"),

  "sky-sports-main-event":
    fallbackPoster("Sky Sports\nMain Event"),

  "sky-sports-uhd":
    fallbackPoster("Sky Sports\nUHD"),

  "tf1-hdr-uhd":
    fallbackPoster("TF1 HDR\nUHD"),

  "tnt-sports-uhd":
    fallbackPoster("TNT Sports\nUHD"),

  "tnt-sports-ultimate-uhd":
    fallbackPoster("TNT Sports\nUltimate UHD"),

  "v-sport-plus-uhd":
    fallbackPoster("V Sport+\nUHD")
};

// ==================================================
// DANH SÁCH KÊNH GỐC
// ==================================================

const channels = [

  // ==================================================
  // 🇻🇳 VTV
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
  // 📺 SPORTS 1080P / FHD
  // ==================================================

  makeChannel(
    "cbs-sports-1080",
    "sports1080",
    "CBS Sports 1080p 60 FPS",
    LOGOS["cbs-sports-1080"],
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
    LOGOS["nbc-sports-1080"],
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
    LOGOS["now-sports-1080"],
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
    LOGOS["sky-sports-main-event-fhd"],
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
    LOGOS["sky-sports-premier-league-fhd"],
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
    LOGOS["sportsnet-one-ca-1080"],
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
    LOGOS["usa-network-1080"],
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
    LOGOS["universo-1080"],
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
    LOGOS["bein-sports-uhd"],
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
    LOGOS["digi-sport-uhd"],
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
    LOGOS["eleven-sports-1-uhd"],
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
    LOGOS["sky-sports-1-uhd"],
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
    LOGOS["sky-sports-2-uhd"],
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
    LOGOS["sky-sports-bundesliga-uhd"],
    [
      "http://mag.tivi-one-iptv.net:80/play/live.php?mac=00:1A:79:0E:0F:8E&stream=893917&extension=ts&play_token=5QPOI5t6D3"
    ]
  ),

  makeChannel(
    "sky-sports-darts-uhd",
    "sports4k",
    "Sky Sports Darts UHD",
    LOGOS["sky-sports-darts-uhd"],
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
    LOGOS["sky-sports-f1-uhd"],
    [
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1761500&extension=ts&play_token=3TLQcXqTKG",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1761500&extension=ts&play_token=OWv81jhV3e"
    ]
  ),

  makeChannel(
    "sky-sports-main-event",
    "sports4k",
    "Sky Sports Main Event",
    LOGOS["sky-sports-main-event"],
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
    LOGOS["sky-sports-uhd"],
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
    LOGOS["tf1-hdr-uhd"],
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
    LOGOS["tnt-sports-uhd"],
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
    LOGOS["tnt-sports-ultimate-uhd"],
    [
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1595637&extension=ts&play_token=YdoiZErSQZ"
    ]
  ),

  makeChannel(
    "v-sport-plus-uhd",
    "sports4k",
    "V Sport+ UHD",
    LOGOS["v-sport-plus-uhd"],
    [
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1632123&extension=ts&play_token=Aeer3FFu7o",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1749221&extension=ts&play_token=jg5ZtLtCQN",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1632123&extension=ts&play_token=E6ziX5leBT",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1632123&extension=ts&play_token=6GO8Kiqjfm"
    ]
  )
];

// ==================================================
// LOOKUP KÊNH
// ==================================================

const channelById = Object.fromEntries(
  channels.map(channel => [channel.id, channel])
);

// ==================================================
// 🔴 LIVE — 22/08/2026
// ==================================================
//
// channelIds1080 = các kênh FHD / Mỹ
// channelIds4k   = các nguồn UHD / 4K
//
// Không thay đổi kênh gốc.
//

const liveMatches = [

  {
    id: "live-arsenal-coventry-20260822",
    date: "22/08/2026",
    time: "02:00",
    home: "Arsenal",
    away: "Coventry City",

    channelIds1080: [
      "sky-sports-main-event-fhd",
      "sky-sports-premier-league-fhd",
      "usa-network-1080"
    ],

    channelIds4k: [
      "sky-sports-main-event",
      "sky-sports-uhd"
    ]
  },

  {
    id: "live-hull-man-utd-20260822",
    date: "22/08/2026",
    time: "18:30",
    home: "Hull City",
    away: "Manchester United",

    channelIds1080: [
      "usa-network-1080"
    ],

    channelIds4k: [
      "tnt-sports-uhd",
      "tnt-sports-ultimate-uhd"
    ]
  },

  {
    id: "live-everton-palace-20260822",
    date: "22/08/2026",
    time: "21:00",
    home: "Everton",
    away: "Crystal Palace",

    channelIds1080: [
      "usa-network-1080"
    ],

    channelIds4k: []
  },

  {
    id: "live-ipswich-sunderland-20260822",
    date: "22/08/2026",
    time: "21:00",
    home: "Ipswich Town",
    away: "Sunderland",

    // NBCSN được công bố tại Mỹ,
    // nhưng chưa gán NBC Sports generic để tránh nhận nhầm feed.
    channelIds1080: [],

    channelIds4k: []
  },

  {
    id: "live-forest-leeds-20260822",
    date: "22/08/2026",
    time: "21:00",
    home: "Nottingham Forest",
    away: "Leeds United",

    // NBCSN được công bố tại Mỹ,
    // chưa gán NBC Sports generic nếu chưa xác định cùng feed.
    channelIds1080: [],

    channelIds4k: []
  },

  {
    id: "live-brentford-spurs-20260822",
    date: "22/08/2026",
    time: "23:30",
    home: "Brentford",
    away: "Tottenham Hotspur",

    channelIds1080: [
      "sky-sports-main-event-fhd",
      "sky-sports-premier-league-fhd"
    ],

    channelIds4k: [
      "sky-sports-main-event",
      "sky-sports-uhd"
    ]
  }
];

// ==================================================
// LIVE HELPERS
// ==================================================

function liveName(match) {
  return `${match.time} • ${match.home} vs ${match.away}`;
}

function liveDescription(match, quality) {

  const ids =
    quality === "4k"
      ? match.channelIds4k
      : match.channelIds1080;

  const names =
    ids
      .map(id => channelById[id])
      .filter(Boolean)
      .map(c => c.name);

  if (!names.length) {
    return `${match.date} • ${match.time} • Chưa có kênh phù hợp trong list`;
  }

  return (
    `${match.date} • ${match.time} • ` +
    names.join(" • ")
  );
}

function livePoster(match) {
  return matchPoster(
    match.home,
    match.away,
    match.time
  );
}

function liveStreams(match, quality) {

  const ids =
    quality === "4k"
      ? match.channelIds4k
      : match.channelIds1080;

  const output = [];

  for (const channelId of ids) {

    const channel =
      channelById[channelId];

    if (!channel) {
      continue;
    }

    channel.streams.forEach(
      (url, index) => {

        output.push({

          name:
            channel.name,

          title:
            `${channel.name} • ${index + 1}`,

          url
        });
      }
    );
  }

  return output;
}

// ==================================================
// SẮP XẾP KÊNH GỐC A → Z
// ==================================================

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

// Live sắp xếp theo giờ.
liveMatches.sort(
  (a, b) =>
    a.time.localeCompare(b.time)
);

// ==================================================
// MANIFEST
// ==================================================

const manifest = {

  id:
    "com.hmtnvac.livetv",

  version:
    "6.0.0",

  name:
    "Live TV",

  description:
    "VTV • Sports 1080P • Sports UHD / 4K • Live Matches",

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
      name: "🔴 LIVE • 1080P / FHD",
      extra: [
        {
          name: "search",
          isRequired: false
        }
      ]
    },

    {
      type: "tv",
      id: "live4k",
      name: "🏆 LIVE • UHD / 4K",
      extra: [
        {
          name: "search",
          isRequired: false
        }
      ]
    },

    {
      type: "tv",
      id: "vtv",
      name: "🇻🇳 VTV",
      extra: [
        {
          name: "search",
          isRequired: false
        }
      ]
    },

    {
      type: "tv",
      id: "sports1080",
      name: "📺 Sports 1080P • 60 FPS",
      extra: [
        {
          name: "search",
          isRequired: false
        }
      ]
    },

    {
      type: "tv",
      id: "sports4k",
      name: "🏆 Sports UHD / 4K",
      extra: [
        {
          name: "search",
          isRequired: false
        }
      ]
    }
  ]
};

const builder =
  new addonBuilder(manifest);

// ==================================================
// POSTER KÊNH
// ==================================================

function posterFor(channel) {

  return (
    channel.logo ||
    fallbackPoster(channel.name)
  );
}

// ==================================================
// DESCRIPTION KÊNH
// ==================================================

function descriptionFor(channel) {

  if (channel.group === "vtv") {

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

    // -------------------------------
    // LIVE 1080
    // -------------------------------

    if (args.id === "live1080") {

      let list =
        liveMatches.filter(
          m =>
            m.channelIds1080.length > 0
        );

      if (search) {

        list =
          list.filter(
            m =>
              liveName(m)
                .toLowerCase()
                .includes(search)
          );
      }

      return {

        metas:
          list.map(
            match => ({

              id:
                `${match.id}-1080`,

              type:
                "tv",

              name:
                liveName(match),

              poster:
                livePoster(match),

              posterShape:
                "landscape",

              description:
                liveDescription(
                  match,
                  "1080"
                )
            })
          )
      };
    }

    // -------------------------------
    // LIVE 4K
    // -------------------------------

    if (args.id === "live4k") {

      let list =
        liveMatches.filter(
          m =>
            m.channelIds4k.length > 0
        );

      if (search) {

        list =
          list.filter(
            m =>
              liveName(m)
                .toLowerCase()
                .includes(search)
          );
      }

      return {

        metas:
          list.map(
            match => ({

              id:
                `${match.id}-4k`,

              type:
                "tv",

              name:
                liveName(match),

              poster:
                livePoster(match),

              posterShape:
                "landscape",

              description:
                liveDescription(
                  match,
                  "4k"
                )
            })
          )
      };
    }

    // -------------------------------
    // KÊNH GỐC
    // -------------------------------

    let list =
      channels.filter(
        channel =>
          channel.group === args.id
      );

    if (search) {

      list =
        list.filter(
          channel =>
            channel.name
              .toLowerCase()
              .includes(search)
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
              posterFor(channel),

            posterShape:
              "square",

            description:
              descriptionFor(channel)
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

    // LIVE
    const isLive1080 =
      args.id.endsWith("-1080");

    const isLive4k =
      args.id.endsWith("-4k");

    if (
      isLive1080 ||
      isLive4k
    ) {

      const suffix =
        isLive4k
          ? "-4k"
          : "-1080";

      const baseId =
        args.id.slice(
          0,
          -suffix.length
        );

      const match =
        liveMatches.find(
          m =>
            m.id === baseId
        );

      if (!match) {

        return {
          meta: null
        };
      }

      const quality =
        isLive4k
          ? "4k"
          : "1080";

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
            "landscape",

          description:
            liveDescription(
              match,
              quality
            )
        }
      };
    }

    // KÊNH GỐC

    const channel =
      channels.find(
        channel =>
          channel.id === args.id
      );

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
          posterFor(channel),

        posterShape:
          "square",

        description:
          descriptionFor(channel)
      }
    };
  }
);

// ==================================================
// STREAM
// ==================================================

builder.defineStreamHandler(
  async args => {

    // -------------------------------
    // LIVE 1080
    // -------------------------------

    if (
      args.id.endsWith(
        "-1080"
      )
    ) {

      const baseId =
        args.id.slice(
          0,
          -5
        );

      const match =
        liveMatches.find(
          m =>
            m.id === baseId
        );

      if (!match) {

        return {
          streams: []
        };
      }

      return {

        streams:
          liveStreams(
            match,
            "1080"
          )
      };
    }

    // -------------------------------
    // LIVE 4K
    // -------------------------------

    if (
      args.id.endsWith(
        "-4k"
      )
    ) {

      const baseId =
        args.id.slice(
          0,
          -3
        );

      const match =
        liveMatches.find(
          m =>
            m.id === baseId
        );

      if (!match) {

        return {
          streams: []
        };
      }

      return {

        streams:
          liveStreams(
            match,
            "4k"
          )
      };
    }

    // -------------------------------
    // KÊNH GỐC
    // -------------------------------

    const channel =
      channels.find(
        channel =>
          channel.id === args.id
      );

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
              `${channel.name} • ${index + 1}`,

            url
          })
        )
    };
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
// TRANG CHỦ
// ==================================================

app.get(
  "/",
  (req, res) => {

    const manifestUrl =
      `${req.protocol}://${req.get("host")}/manifest.json`;

    const vtvCount =
      channels.filter(
        c =>
          c.group === "vtv"
      ).length;

    const p1080Count =
      channels.filter(
        c =>
          c.group ===
          "sports1080"
      ).length;

    const p4kCount =
      channels.filter(
        c =>
          c.group ===
          "sports4k"
      ).length;

    const live1080Count =
      liveMatches.filter(
        m =>
          m.channelIds1080.length > 0
      ).length;

    const live4kCount =
      liveMatches.filter(
        m =>
          m.channelIds4k.length > 0
      ).length;

    const sourceCount =
      channels.reduce(
        (total, channel) =>
          total +
          channel.streams.length,
        0
      );

    res.send(`
      <!doctype html>

      <html>

        <head>

          <meta charset="UTF-8">

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
            line-height:1.6;
          "
        >

          <h1>
            📺 Live TV
          </h1>

          <p>
            Addon đang hoạt động.
          </p>

          <p>
            🔴 LIVE 1080P:
            <strong>
              ${live1080Count}
            </strong>
          </p>

          <p>
            🏆 LIVE 4K:
            <strong>
              ${live4kCount}
            </strong>
          </p>

          <p>
            🇻🇳 VTV:
            <strong>
              ${vtvCount}
            </strong>
          </p>

          <p>
            📺 Sports 1080P:
            <strong>
              ${p1080Count}
            </strong>
          </p>

          <p>
            🏆 Sports UHD / 4K:
            <strong>
              ${p4kCount}
            </strong>
          </p>

          <p>
            Tổng số kênh gốc:
            <strong>
              ${channels.length}
            </strong>
          </p>

          <p>
            Tổng số luồng gốc:
            <strong>
              ${sourceCount}
            </strong>
          </p>

          <hr>

          <p>
            Manifest:
          </p>

          <p
            style="
              word-break:break-all
            "
          >
            ${manifestUrl}
          </p>

        </body>

      </html>
    `);
  }
);

// ==================================================
// START
// ==================================================

app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      `Live TV running on port ${PORT}`
    );

    console.log(
      `Channels: ${channels.length}`
    );

    console.log(
      `Live matches: ${liveMatches.length}`
    );
  }
);
