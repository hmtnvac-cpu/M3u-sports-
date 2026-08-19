const { addonBuilder, getRouter } = require("stremio-addon-sdk");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 7000;

// ==================================================
// HELPER
// ==================================================

function channel(id, group, name, logo, streams) {
  const uniqueStreams = [
    ...new Set(
      streams
        .map(x => x.trim())
        .filter(Boolean)
    )
  ];

  return {
    id,
    type: "tv",
    group,
    name,
    logo,
    streams: uniqueStreams
  };
}

const wikiLogo = file =>
  "https://commons.wikimedia.org/wiki/Special:Redirect/file/" +
  encodeURIComponent(file) +
  "?width=500";

// ==================================================
// DANH SÁCH KÊNH
// ==================================================

const channels = [

  // ==================================================
  // 🇻🇳 VTV
  // ==================================================

  channel(
    "vtv1",
    "vtv",
    "VTV1",
    wikiLogo("VTV1 logo 2013 final.svg"),
    [
      "https://vips-livecdn.fptplay.net/live/media/vtv1/live247-hls-avc/vtv1-avc1_5600000=10000-mp4a_131600=20000.m3u8"
    ]
  ),

  channel(
    "vtv2",
    "vtv",
    "VTV2",
    wikiLogo("VTV2 logo 2013 final.svg"),
    [
      "https://vips-livecdn.fptplay.net/live/media/vtv2/live247-hls-avc/vtv2-avc1_5600000=10000-mp4a_131600=20000.m3u8"
    ]
  ),

  channel(
    "vtv3",
    "vtv",
    "VTV3",
    wikiLogo("VTV3 logo 2013 final.svg"),
    [
      "https://vips-livecdn.fptplay.net/live/media/vtv3/live247-hls-avc/vtv3-avc1_5600000=10000-mp4a_131600=20000.m3u8"
    ]
  ),

  channel(
    "vtv4",
    "vtv",
    "VTV4",
    wikiLogo("VTV4 logo 2013 final.svg"),
    [
      "https://vips-livecdn.fptplay.net/live/media/vtv4/live247-hls-avc/vtv4-avc1_5600000=10000-mp4a_131600=20000.m3u8"
    ]
  ),

  channel(
    "vtv5",
    "vtv",
    "VTV5",
    wikiLogo("VTV5 logo 2013 final.svg"),
    [
      "https://vips-livecdn.fptplay.net/live/media/vtv5/live247-hls-avc/vtv5-avc1_5600000=10000-mp4a_131600=20000.m3u8"
    ]
  ),

  channel(
    "vtv6",
    "vtv",
    "VTV6",
    wikiLogo("VTV6 logo 2013 final.svg"),
    [
      "https://vips-livecdn.fptplay.net/live/media/vtv6/live247-hls-avc/vtv6-avc1_5600000=10000-mp4a_131600=20000.m3u8"
    ]
  ),

  channel(
    "vtv7",
    "vtv",
    "VTV7",
    wikiLogo("VTV7 logo 2016 final.svg"),
    [
      "https://vips-livecdn.fptplay.net/live/media/vtv7/live247-hls-avc/vtv7-avc1_5600000=10000-mp4a_131600=20000.m3u8"
    ]
  ),

  channel(
    "vtv8",
    "vtv",
    "VTV8",
    wikiLogo("VTV8 logo 2016 final.svg"),
    [
      "https://vips-livecdn.fptplay.net/live/media/vtv8/live-hls-avc/vtv8-avc1_4000000=10000-mp4a_131600=20000.m3u8"
    ]
  ),

  channel(
    "vtv9",
    "vtv",
    "VTV9",
    wikiLogo("VTV9 logo 2013 final.svg"),
    [
      "https://vips-livecdn.fptplay.net/live/media/vtv9/live247-hls-avc/vtv9-avc1_5600000=10000-mp4a_131600=20000.m3u8"
    ]
  ),

  channel(
    "vtv10",
    "vtv",
    "VTV10",
    "https://dummyimage.com/500x500/ffffff/111111.png&text=VTV10",
    [
      "https://vips-livecdn.fptplay.net/live/media/vtv10/live247-hls-avc/vtv10-avc1_5600000=10000-mp4a_131600=20000.m3u8"
    ]
  ),

  // ==================================================
  // 📺 SPORTS 1080P / 60 FPS
  // ==================================================

  channel(
    "cbs-sports-1080",
    "sports1080",
    "CBS Sports 1080p 60 FPS",
    wikiLogo("CBS Sports logo.svg"),
    [
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=45601&extension=ts&play_token=FzL6BKqvEe",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:7d:69:87&stream=1931140&extension=ts&play_token=78QsJViQ2M",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7E:19:50&stream=1931140&extension=ts&play_token=drj6UiUd3H",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1931140&extension=ts&play_token=dMBw5KtrCr"
    ]
  ),

  channel(
    "nbc-sports-1080",
    "sports1080",
    "NBC Sports 1080p 60 FPS",
    wikiLogo("NBC Sports 2023.svg"),
    [
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1124350&extension=ts&play_token=Nye7KFsDtT",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:7d:69:87&stream=1124350&extension=ts&play_token=eNXy4IgwMX",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7E:19:50&stream=1124350&extension=ts&play_token=7VZFU5RGrb",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7E:19:50&stream=234677&extension=ts&play_token=tvycd3S4G4",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1124350&extension=ts&play_token=rQKi6Aw8Jy"
    ]
  ),

  channel(
    "now-sports-1080",
    "sports1080",
    "NOW Sports 1080p 60 FPS",
    "https://dummyimage.com/500x500/ffffff/111111.png&text=NOW+Sports",
    [
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1948655&extension=ts&play_token=tbb2RAOWTW",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1948655&extension=ts&play_token=wKjCMLCsCQ",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1948655&extension=ts&play_token=4dOHhrrZQ5",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7E:19:50&stream=1948655&extension=ts&play_token=kDi24LfUfG",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1948655&extension=ts&play_token=0MqG6oZhXz"
    ]
  ),

  channel(
    "sky-sports-main-event-fhd",
    "sports1080",
    "Sky Sports Main Event FHD",
    wikiLogo("Sky Sports logo 2020.svg"),
    [
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1905853&extension=ts&play_token=VcLSkUIKoV",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:7d:69:87&stream=1905853&extension=ts&play_token=HJKEBcMdYW",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7E:19:50&stream=1905853&extension=ts&play_token=tFtdcozl0Z",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1905853&extension=ts&play_token=0PellAUHuM"
    ]
  ),

  channel(
    "sky-sports-premier-league-fhd",
    "sports1080",
    "Sky Sports Premier League FHD",
    wikiLogo("Sky Sports logo 2020.svg"),
    [
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1905844&extension=ts&play_token=HE8bJPpkM0",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1905844&extension=ts&play_token=AIylOstlvH",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:7d:69:87&stream=1905844&extension=ts&play_token=VauO51P7Uz",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7E:19:50&stream=1905844&extension=ts&play_token=Rp6htQTP1z"
    ]
  ),

  channel(
    "sportsnet-one-ca-1080",
    "sports1080",
    "Sportsnet One CA 1080p 60 FPS",
    wikiLogo("Sportsnet 2011 logo.svg"),
    [
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1948644&extension=ts&play_token=67dYXdFMD5",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7E:19:50&stream=1948650&extension=ts&play_token=IeulQneT0e",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1948650&extension=ts&play_token=kOpzJPZpl8"
    ]
  ),

  channel(
    "usa-network-1080",
    "sports1080",
    "USA Network 1080p 60 FPS",
    wikiLogo("USA Network logo.svg"),
    [
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1930887&extension=ts&play_token=17642b7BAL",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=45466&extension=ts&play_token=BhBlcThs4o",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:7d:69:87&stream=1930887&extension=ts&play_token=wXIyU8E7YD",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7E:19:50&stream=1930887&extension=ts&play_token=J2KdNN5TYM",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1930887&extension=ts&play_token=tdDzhWuRot"
    ]
  ),

  channel(
    "universo-1080",
    "sports1080",
    "Universo 1080p 60 FPS",
    wikiLogo("Universo 2017 logo.svg"),
    [
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1930892&extension=ts&play_token=Qu3YNaQE54",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:7d:69:87&stream=1930892&extension=ts&play_token=EaKf87ZAR8",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7E:19:50&stream=1930892&extension=ts&play_token=Dshjs6wiNd",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1930892&extension=ts&play_token=aâHZvPHZLY"
    ]
  ),

  // ==================================================
  // 🏆 SPORTS UHD / 4K
  // ==================================================

  channel(
    "bein-sports-uhd",
    "sports4k",
    "beIN Sports UHD",
    wikiLogo("BeIN Sports logo (2017).png"),
    [
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1948627&extension=ts&play_token=YÝtO3ymSXM",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1948627&extension=ts&play_token=Vlmr36mT65",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1948627&extension=ts&play_token=ZylqK6Jlon",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1948627&extension=ts&play_token=5fIeli4ylw"
    ]
  ),

  channel(
    "digi-sport-uhd",
    "sports4k",
    "Digi Sport UHD",
    wikiLogo("Digi Sport logo.svg"),
    [
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1632122&extension=ts&play_token=Bc1RBTdvcu",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1632122&extension=ts&play_token=SFUMHAeisS",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1632122&extension=ts&play_token=SpK901Rc9Y",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1632122&extension=ts&play_token=1Fi4sgyPhW"
    ]
  ),

  channel(
    "eleven-sports-1-uhd",
    "sports4k",
    "Eleven Sports 1 UHD",
    wikiLogo("Eleven Sports logo.svg"),
    [
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1470618&extension=ts&play_token=m0Llrs5Iev",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1470618&extension=ts&play_token=e0V5DEpkoI",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1948660&extension=ts&play_token=PkLWuD6skY",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1470618&extension=ts&play_token=z0mDj0DrdW",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1948660&extension=ts&play_token=EIr5yxfGPr"
    ]
  ),

  channel(
    "sky-sports-1-uhd",
    "sports4k",
    "Sky Sports 1 UHD",
    wikiLogo("Sky Sports logo 2020.svg"),
    [
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1608068&extension=ts&play_token=vdđJ3JIwT7",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1608068&extension=ts&play_token=ChIhpB8guR",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1608068&extension=ts&play_token=bNqN7HTIKX",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1608068&extension=ts&play_token=djxHx6Uy9j"
    ]
  ),

  channel(
    "sky-sports-2-uhd",
    "sports4k",
    "Sky Sports 2 UHD",
    wikiLogo("Sky Sports logo 2020.svg"),
    [
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1608069&extension=ts&play_token=eẻvbqSf7nG",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1608069&extension=ts&play_token=boMozScv7z",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1608069&extension=ts&play_token=Jn8XYQ8soh",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1608069&extension=ts&play_token=T7pDKwjV1Z"
    ]
  ),

  channel(
    "sky-sports-bundesliga-uhd",
    "sports4k",
    "Sky Sports Bundesliga UHD",
    wikiLogo("Sky Sport Bundesliga Logo 2020.svg"),
    [
      "http://mag.tivi-one-iptv.net:80/play/live.php?mac=00:1A:79:0E:0F:8E&stream=893917&extension=ts&play_token=5QPOI5t6D3"
    ]
  ),

  channel(
    "sky-sports-darts-uhd",
    "sports4k",
    "Sky Sports Darts UHD",
    wikiLogo("Sky Sports logo 2020.svg"),
    [
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1471382&extension=ts&play_token=RCUbXjP9kV",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1471382&extension=ts&play_token=Xjz7IglxZB",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1471382&extension=ts&play_token=FqtO3KWqUT",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1471382&extension=ts&play_token=4wKKTKtM8L"
    ]
  ),

  channel(
    "sky-sports-f1-uhd",
    "sports4k",
    "Sky Sports F1 UHD",
    wikiLogo("Sky Sports F1 logo.svg"),
    [
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1761500&extension=ts&play_token=R0RwoZl4We",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1608069&extension=ts&play_token=boMozScv7z",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1761500&extension=ts&play_token=3TLQcXqTKG",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1761500&extension=ts&play_token=OWv81jhV3e"
    ]
  ),

  channel(
    "sky-sports-main-event",
    "sports4k",
    "Sky Sports Main Event",
    wikiLogo("Sky Sports logo 2020.svg"),
    [
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1608071&extension=ts&play_token=ffh6vBOXXG",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1608071&extension=ts&play_token=BZa17svpdY",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1608071&extension=ts&play_token=YPIwjxNGfQ",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1641636&extension=ts&play_token=Oxc5PyW4yK"
    ]
  ),

  channel(
    "sky-sports-uhd",
    "sports4k",
    "Sky Sports UHD",
    wikiLogo("Sky Sports logo 2020.svg"),
    [
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1471387&extension=ts&play_token=acG0ANBzsw",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1471387&extension=ts&play_token=54v3D6UwQT",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1753227&extension=ts&play_token=3Ea6Hxt5oq",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1471387&extension=ts&play_token=Bx3mlhSM6x"
    ]
  ),

  channel(
    "tf1-hdr-uhd",
    "sports4k",
    "TF1 HDR UHD",
    wikiLogo("TF1 logo 2013.svg"),
    [
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1640379&extension=ts&play_token=YWsJoaBWoi",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1640379&extension=ts&play_token=6gj5Htj59g",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1640379&extension=ts&play_token=qXUKertYkr"
    ]
  ),

  channel(
    "tnt-sports-uhd",
    "sports4k",
    "TNT Sports UHD",
    wikiLogo("TNT Sports logo.svg"),
    [
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1479591&extension=ts&play_token=G26iịCdrYZ",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1479591&extension=ts&play_token=vzYU4fDUAQ",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1479591&extension=ts&play_token=9JzXAViV1F",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1479591&extension=ts&play_token=mSsCW5SfPM"
    ]
  ),

  channel(
    "tnt-sports-ultimate-uhd",
    "sports4k",
    "TNT Sports Ultimate UHD",
    wikiLogo("TNT Sports logo.svg"),
    [
      "http://iiiiiiiillllaaaaaiiiiiiiillllaaaaa.cdnip.online:8080/HouseMax/V3f8Ydk6Iu/131353?play_token=YnInsrDaU1",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1595637&extension=ts&play_token=YdoiZErSQZ",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1595637&extension=ts&play_token=pmWvIQQHhL"
    ]
  ),

  channel(
    "v-sport-plus-uhd",
    "sports4k",
    "V Sport+ UHD",
    "https://dummyimage.com/500x500/ffffff/111111.png&text=V+Sport%2B",
    [
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1632123&extension=ts&play_token=kmWkMZUxoN",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1632123&extension=ts&play_token=Aeer3FFu7o",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1749221&extension=ts&play_token=jg5ZtLtCQN",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1632123&extension=ts&play_token=E6ziX5leBT",
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:7F:A7:54&stream=1632123&extension=ts&play_token=6GO8Kiqjfm"
    ]
  )
];

// ==================================================
// THỨ TỰ NHÓM + A → Z
// ==================================================

const groupOrder = {
  vtv: 1,
  sports1080: 2,
  sports4k: 3
};

channels.sort((a, b) => {

  if (a.group !== b.group) {
    return groupOrder[a.group] - groupOrder[b.group];
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

// ==================================================
// MANIFEST
// ==================================================

const manifest = {

  id: "com.hmtnvac.livetv",

  version: "5.1.0",

  name: "Live TV",

  description:
    "VTV, Sports 1080p 60 FPS và Sports UHD / 4K",

  resources: [
    "catalog",
    "meta",
    "stream"
  ],

  types: ["tv"],

  catalogs: [

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
      name: "📺 Sports 1080p • 60 FPS",
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
// POSTER
// ==================================================

function posterFor(channel) {

  if (channel.logo) {
    return channel.logo;
  }

  return (
    "https://dummyimage.com/" +
    "500x500/111111/ffffff.png" +
    `&text=${encodeURIComponent(channel.name)}`
  );
}

// ==================================================
// DESCRIPTION
// ==================================================

function descriptionFor(channel) {

  if (channel.group === "vtv") {
    return "VTV • Truyền hình Việt Nam";
  }

  if (channel.group === "sports1080") {
    return (
      `Sports • 1080p • 60 FPS • ` +
      `${channel.streams.length} luồng`
    );
  }

  return (
    `Sports • UHD / 4K • ` +
    `${channel.streams.length} luồng`
  );
}

// ==================================================
// CATALOG
// ==================================================

builder.defineCatalogHandler(
  async args => {

    let list =
      channels.filter(
        channel =>
          channel.group === args.id
      );

    const search =
      args.extra &&
      args.extra.search
        ? args.extra.search
            .toLowerCase()
            .trim()
        : "";

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
// ROUTER
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
        c => c.group === "vtv"
      ).length;

    const p1080Count =
      channels.filter(
        c => c.group === "sports1080"
      ).length;

    const p4kCount =
      channels.filter(
        c => c.group === "sports4k"
      ).length;

    const sourceCount =
      channels.reduce(
        (total, channel) =>
          total + channel.streams.length,
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
          <title>Live TV</title>
        </head>

        <body
          style="
            background:#111;
            color:white;
            font-family:Arial;
            padding:30px;
          "
        >

          <h1>📺 Live TV</h1>

          <p>Addon đang hoạt động.</p>

          <p>
            🇻🇳 VTV:
            <strong>${vtvCount}</strong>
          </p>

          <p>
            📺 Sports 1080p:
            <strong>${p1080Count}</strong>
          </p>

          <p>
            🏆 Sports UHD / 4K:
            <strong>${p4kCount}</strong>
          </p>

          <p>
            Tổng số kênh:
            <strong>${channels.length}</strong>
          </p>

          <p>
            Tổng số luồng:
            <strong>${sourceCount}</strong>
          </p>

          <hr>

          <p>Manifest:</p>

          <p style="word-break:break-all">
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
  }
);
