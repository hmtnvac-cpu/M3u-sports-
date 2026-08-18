const { addonBuilder, getRouter } = require("stremio-addon-sdk");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 7000;

// ==================================================
// DANH SÁCH KÊNH
// ==================================================

const channels = [

  // ==================================================
  // 🇻🇳 VTV
  // ==================================================

  {
    id: "vtv1",
    type: "tv",
    group: "vtv",
    name: "VTV1",
    description: "VTV • Truyền hình Việt Nam",
    url: "https://vips-livecdn.fptplay.net/live/media/vtv1/live247-hls-avc/vtv1-avc1_5600000=10000-mp4a_131600=20000.m3u8"
  },

  {
    id: "vtv2",
    type: "tv",
    group: "vtv",
    name: "VTV2",
    description: "VTV • Truyền hình Việt Nam",
    url: "https://vips-livecdn.fptplay.net/live/media/vtv2/live247-hls-avc/vtv2-avc1_5600000=10000-mp4a_131600=20000.m3u8"
  },

  {
    id: "vtv3",
    type: "tv",
    group: "vtv",
    name: "VTV3",
    description: "VTV • Truyền hình Việt Nam",
    url: "https://vips-livecdn.fptplay.net/live/media/vtv3/live247-hls-avc/vtv3-avc1_5600000=10000-mp4a_131600=20000.m3u8"
  },

  {
    id: "vtv4",
    type: "tv",
    group: "vtv",
    name: "VTV4",
    description: "VTV • Truyền hình Việt Nam",
    url: "https://vips-livecdn.fptplay.net/live/media/vtv4/live247-hls-avc/vtv4-avc1_5600000=10000-mp4a_131600=20000.m3u8"
  },

  {
    id: "vtv5",
    type: "tv",
    group: "vtv",
    name: "VTV5",
    description: "VTV • Truyền hình Việt Nam",
    url: "https://vips-livecdn.fptplay.net/live/media/vtv5/live247-hls-avc/vtv5-avc1_5600000=10000-mp4a_131600=20000.m3u8"
  },

  {
    id: "vtv6",
    type: "tv",
    group: "vtv",
    name: "VTV6",
    description: "VTV • Truyền hình Việt Nam",
    url: "https://vips-livecdn.fptplay.net/live/media/vtv6/live247-hls-avc/vtv6-avc1_5600000=10000-mp4a_131600=20000.m3u8"
  },

  {
    id: "vtv7",
    type: "tv",
    group: "vtv",
    name: "VTV7",
    description: "VTV • Truyền hình Việt Nam",
    url: "https://vips-livecdn.fptplay.net/live/media/vtv7/live247-hls-avc/vtv7-avc1_5600000=10000-mp4a_131600=20000.m3u8"
  },

  {
    id: "vtv8",
    type: "tv",
    group: "vtv",
    name: "VTV8",
    description: "VTV • Truyền hình Việt Nam",
    url: "https://vips-livecdn.fptplay.net/live/media/vtv8/live-hls-avc/vtv8-avc1_4000000=10000-mp4a_131600=20000.m3u8"
  },

  {
    id: "vtv9",
    type: "tv",
    group: "vtv",
    name: "VTV9",
    description: "VTV • Truyền hình Việt Nam",
    url: "https://vips-livecdn.fptplay.net/live/media/vtv9/live247-hls-avc/vtv9-avc1_5600000=10000-mp4a_131600=20000.m3u8"
  },

  {
    id: "vtv10",
    type: "tv",
    group: "vtv",
    name: "VTV10",
    description: "VTV • Truyền hình Việt Nam",
    url: "https://vips-livecdn.fptplay.net/live/media/vtv10/live247-hls-avc/vtv10-avc1_5600000=10000-mp4a_131600=20000.m3u8"
  },

  // ==================================================
  // 🏆 SPORTS UHD / 4K
  // ==================================================

  {
    id: "bein-sports-uhd",
    type: "tv",
    group: "sports4k",
    name: "beIN Sports UHD",
    description: "Sports • UHD / 4K",
    url: "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1948627&extension=ts&play_token=YÝtO3ymSXM"
  },

  {
    id: "digi-sport-uhd",
    type: "tv",
    group: "sports4k",
    name: "Digi Sport UHD",
    description: "Sports • UHD / 4K",
    url: "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1632122&extension=ts&play_token=Bc1RBTdvcu"
  },

  {
    id: "eleven-sports-1-uhd",
    type: "tv",
    group: "sports4k",
    name: "Eleven Sports 1 UHD",
    description: "Sports • UHD / 4K",
    url: "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1470618&extension=ts&play_token=m0Llrs5Iev"
  },

  {
    id: "sky-sports-1-uhd",
    type: "tv",
    group: "sports4k",
    name: "Sky Sports 1 UHD",
    description: "Sports • UHD / 4K",
    url: "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1608068&extension=ts&play_token=vdđJ3JIwT7"
  },

  {
    id: "sky-sports-2-uhd",
    type: "tv",
    group: "sports4k",
    name: "Sky Sports 2 UHD",
    description: "Sports • UHD / 4K",
    url: "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1608069&extension=ts&play_token=eẻvbqSf7nG"
  },

  {
    id: "sky-sports-bundesliga-uhd",
    type: "tv",
    group: "sports4k",
    name: "Sky Sports Bundesliga UHD",
    description: "Sports • UHD / 4K",
    url: "http://mag.tivi-one-iptv.net:80/play/live.php?mac=00:1A:79:0E:0F:8E&stream=893917&extension=ts&play_token=5QPOI5t6D3"
  },

  {
    id: "sky-sports-darts-uhd",
    type: "tv",
    group: "sports4k",
    name: "Sky Sports Darts UHD",
    description: "Sports • UHD / 4K",
    url: "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1471382&extension=ts&play_token=RCUbXjP9kV"
  },

  {
    id: "sky-sports-f1-uhd",
    type: "tv",
    group: "sports4k",
    name: "Sky Sports F1 UHD",
    description: "Sports • UHD / 4K",
    url: "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1761500&extension=ts&play_token=R0RwoZl4We"
  },

  {
    id: "sky-sports-main-event",
    type: "tv",
    group: "sports4k",
    name: "Sky Sports Main Event",
    description: "Sports • UHD / 4K",
    url: "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1608071&extension=ts&play_token=ffh6vBOXXG"
  },

  {
    id: "sky-sports-uhd",
    type: "tv",
    group: "sports4k",
    name: "Sky Sports UHD",
    description: "Sports • UHD / 4K",
    url: "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1471387&extension=ts&play_token=acG0ANBzsw"
  },

  {
    id: "tnt-sports-uhd",
    type: "tv",
    group: "sports4k",
    name: "TNT Sports UHD",
    description: "Sports • UHD / 4K",
    url: "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1479591&extension=ts&play_token=G26iịCdrYZ"
  },

  {
    id: "tnt-sports-uhd-unlimited",
    type: "tv",
    group: "sports4k",
    name: "TNT Sports UHD Unlimited",
    description: "Sports • UHD / 4K",
    url: "http://iiiiiiiillllaaaaaiiiiiiiillllaaaaa.cdnip.online:8080/HouseMax/V3f8Ydk6Iu/131353?play_token=YnInsrDaU1"
  },

  {
    id: "v-sport-plus-uhd",
    type: "tv",
    group: "sports4k",
    name: "V Sport+ UHD",
    description: "Sports • UHD / 4K",
    url: "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1632123&extension=ts&play_token=kmWkMZUxoN"
  }
];

// ==================================================
// SẮP XẾP TỪNG NHÓM
// ==================================================

channels.sort((a, b) => {
  if (a.group !== b.group) {
    return a.group === "vtv" ? -1 : 1;
  }

  return a.name.localeCompare(
    b.name,
    "vi",
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
  version: "3.0.0",

  name: "Live TV",

  description:
    "VTV và Sports UHD / 4K",

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
  const text =
    encodeURIComponent(channel.name);

  return (
    "https://dummyimage.com/" +
    "500x500/111111/ffffff.png" +
    `&text=${text}`
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
        list.filter(channel =>
          channel.name
            .toLowerCase()
            .includes(search)
        );
    }

    return {
      metas:
        list.map(channel => ({
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
            channel.description
        }))
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
          channel.description
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
      streams: [
        {
          name:
            channel.group === "vtv"
              ? "🇻🇳 VTV"
              : "🏆 Sports UHD / 4K",

          title:
            channel.name,

          url:
            channel.url
        }
      ]
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
        c => c.group === "vtv"
      ).length;

    const sportsCount =
      channels.filter(
        c => c.group === "sports4k"
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
            color:white;
            font-family:Arial;
            padding:30px;
          "
        >

          <h1>📺 Live TV</h1>

          <p>
            Addon đang hoạt động.
          </p>

          <p>
            🇻🇳 VTV:
            <strong>
              ${vtvCount}
            </strong>
          </p>

          <p>
            🏆 Sports UHD / 4K:
            <strong>
              ${sportsCount}
            </strong>
          </p>

          <p>
            Tổng:
            <strong>
              ${channels.length}
            </strong>
          </p>

          <hr>

          <p>
            Manifest:
          </p>

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
      `Total channels: ${channels.length}`
    );
  }
);
