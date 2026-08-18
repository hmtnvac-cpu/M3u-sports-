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
    streams: [
      "https://vips-livecdn.fptplay.net/live/media/vtv1/live247-hls-avc/vtv1-avc1_5600000=10000-mp4a_131600=20000.m3u8"
    ]
  },

  {
    id: "vtv2",
    type: "tv",
    group: "vtv",
    name: "VTV2",
    streams: [
      "https://vips-livecdn.fptplay.net/live/media/vtv2/live247-hls-avc/vtv2-avc1_5600000=10000-mp4a_131600=20000.m3u8"
    ]
  },

  {
    id: "vtv3",
    type: "tv",
    group: "vtv",
    name: "VTV3",
    streams: [
      "https://vips-livecdn.fptplay.net/live/media/vtv3/live247-hls-avc/vtv3-avc1_5600000=10000-mp4a_131600=20000.m3u8"
    ]
  },

  {
    id: "vtv4",
    type: "tv",
    group: "vtv",
    name: "VTV4",
    streams: [
      "https://vips-livecdn.fptplay.net/live/media/vtv4/live247-hls-avc/vtv4-avc1_5600000=10000-mp4a_131600=20000.m3u8"
    ]
  },

  {
    id: "vtv5",
    type: "tv",
    group: "vtv",
    name: "VTV5",
    streams: [
      "https://vips-livecdn.fptplay.net/live/media/vtv5/live247-hls-avc/vtv5-avc1_5600000=10000-mp4a_131600=20000.m3u8"
    ]
  },

  {
    id: "vtv6",
    type: "tv",
    group: "vtv",
    name: "VTV6",
    streams: [
      "https://vips-livecdn.fptplay.net/live/media/vtv6/live247-hls-avc/vtv6-avc1_5600000=10000-mp4a_131600=20000.m3u8"
    ]
  },

  {
    id: "vtv7",
    type: "tv",
    group: "vtv",
    name: "VTV7",
    streams: [
      "https://vips-livecdn.fptplay.net/live/media/vtv7/live247-hls-avc/vtv7-avc1_5600000=10000-mp4a_131600=20000.m3u8"
    ]
  },

  {
    id: "vtv8",
    type: "tv",
    group: "vtv",
    name: "VTV8",
    streams: [
      "https://vips-livecdn.fptplay.net/live/media/vtv8/live-hls-avc/vtv8-avc1_4000000=10000-mp4a_131600=20000.m3u8"
    ]
  },

  {
    id: "vtv9",
    type: "tv",
    group: "vtv",
    name: "VTV9",
    streams: [
      "https://vips-livecdn.fptplay.net/live/media/vtv9/live247-hls-avc/vtv9-avc1_5600000=10000-mp4a_131600=20000.m3u8"
    ]
  },

  {
    id: "vtv10",
    type: "tv",
    group: "vtv",
    name: "VTV10",
    streams: [
      "https://vips-livecdn.fptplay.net/live/media/vtv10/live247-hls-avc/vtv10-avc1_5600000=10000-mp4a_131600=20000.m3u8"
    ]
  },

  // ==================================================
  // 📺 SPORTS 1080P / 60FPS
  // ==================================================

  {
    id: "now-sports-1080",
    type: "tv",
    group: "sports1080",
    name: "NOW Sports 1080 60FPS",
    streams: [
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1948655&extension=ts&play_token=tbb2RAOWTW",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1948655&extension=ts&play_token=wKjCMLCsCQ"
    ]
  },

  {
    id: "sportsnet-one-ca-1080",
    type: "tv",
    group: "sports1080",
    name: "Sportsnet One CA 1080 60FPS",
    streams: [
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1948644&extension=ts&play_token=67dYXdFMD5"
    ]
  },

  {
    id: "nbc-sports-1080",
    type: "tv",
    group: "sports1080",
    name: "NBC Sports 1080 60FPS",
    streams: [
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1124350&extension=ts&play_token=Nye7KFsDtT"
    ]
  },

  {
    id: "cbs-sports-1080",
    type: "tv",
    group: "sports1080",
    name: "CBS Sports 1080 60FPS",
    streams: [
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=45601&extension=ts&play_token=FzL6BKqvEe"
    ]
  },

  // ==================================================
  // 🏆 SPORTS UHD / 4K
  // ==================================================

  {
    id: "bein-sports-uhd",
    type: "tv",
    group: "sports4k",
    name: "beIN Sports UHD",
    streams: [
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1948627&extension=ts&play_token=YÝtO3ymSXM",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1948627&extension=ts&play_token=Vlmr36mT65",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1948627&extension=ts&play_token=ZylqK6Jlon"
    ]
  },

  {
    id: "digi-sport-uhd",
    type: "tv",
    group: "sports4k",
    name: "Digi Sport UHD",
    streams: [
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1632122&extension=ts&play_token=Bc1RBTdvcu",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1632122&extension=ts&play_token=SFUMHAeisS",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1632122&extension=ts&play_token=SpK901Rc9Y"
    ]
  },

  {
    id: "eleven-sports-1-uhd",
    type: "tv",
    group: "sports4k",
    name: "Eleven Sports 1 UHD",
    streams: [
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1470618&extension=ts&play_token=m0Llrs5Iev",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1470618&extension=ts&play_token=e0V5DEpkoI",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1948660&extension=ts&play_token=PkLWuD6skY",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1470618&extension=ts&play_token=z0mDj0DrdW"
    ]
  },

  {
    id: "sky-sports-1-uhd",
    type: "tv",
    group: "sports4k",
    name: "Sky Sports 1 UHD",
    streams: [
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1608068&extension=ts&play_token=vdđJ3JIwT7",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1608068&extension=ts&play_token=ChIhpB8guR",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1608068&extension=ts&play_token=bNqN7HTIKX"
    ]
  },

  {
    id: "sky-sports-2-uhd",
    type: "tv",
    group: "sports4k",
    name: "Sky Sports 2 UHD",
    streams: [
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1608069&extension=ts&play_token=eẻvbqSf7nG",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1608069&extension=ts&play_token=boMozScv7z",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1608069&extension=ts&play_token=Jn8XYQ8soh"
    ]
  },

  {
    id: "sky-sports-bundesliga-uhd",
    type: "tv",
    group: "sports4k",
    name: "Sky Sports Bundesliga UHD",
    streams: [
      "http://mag.tivi-one-iptv.net:80/play/live.php?mac=00:1A:79:0E:0F:8E&stream=893917&extension=ts&play_token=5QPOI5t6D3"
    ]
  },

  {
    id: "sky-sports-darts-uhd",
    type: "tv",
    group: "sports4k",
    name: "Sky Sports Darts UHD",
    streams: [
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1471382&extension=ts&play_token=RCUbXjP9kV",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1471382&extension=ts&play_token=Xjz7IglxZB",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1471382&extension=ts&play_token=FqtO3KWqUT"
    ]
  },

  {
    id: "sky-sports-f1-uhd",
    type: "tv",
    group: "sports4k",
    name: "Sky Sports F1 UHD",
    streams: [
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1761500&extension=ts&play_token=R0RwoZl4We",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1608069&extension=ts&play_token=boMozScv7z",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1761500&extension=ts&play_token=3TLQcXqTKG"
    ]
  },

  {
    id: "sky-sports-main-event",
    type: "tv",
    group: "sports4k",
    name: "Sky Sports Main Event",
    streams: [
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1608071&extension=ts&play_token=ffh6vBOXXG",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1608071&extension=ts&play_token=BZa17svpdY",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1608071&extension=ts&play_token=YPIwjxNGfQ"
    ]
  },

  {
    id: "sky-sports-uhd",
    type: "tv",
    group: "sports4k",
    name: "Sky Sports UHD",
    streams: [
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1471387&extension=ts&play_token=acG0ANBzsw",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1471387&extension=ts&play_token=54v3D6UwQT",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1753227&extension=ts&play_token=3Ea6Hxt5oq"
    ]
  },

  {
    id: "tnt-sports-uhd",
    type: "tv",
    group: "sports4k",
    name: "TNT Sports UHD",
    streams: [
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1479591&extension=ts&play_token=G26iịCdrYZ",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1479591&extension=ts&play_token=vzYU4fDUAQ",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1479591&extension=ts&play_token=9JzXAViV1F"
    ]
  },

  {
    id: "tnt-sports-ultimate-uhd",
    type: "tv",
    group: "sports4k",
    name: "TNT Sports Ultimate UHD",
    streams: [
      "http://iiiiiiiillllaaaaaiiiiiiiillllaaaaa.cdnip.online:8080/HouseMax/V3f8Ydk6Iu/131353?play_token=YnInsrDaU1",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1595637&extension=ts&play_token=YdoiZErSQZ",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1595637&extension=ts&play_token=pmWvIQQHhL"
    ]
  },

  {
    id: "v-sport-plus-uhd",
    type: "tv",
    group: "sports4k",
    name: "V Sport+ UHD",
    streams: [
      "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1632123&extension=ts&play_token=kmWkMZUxoN",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1632123&extension=ts&play_token=Aeer3FFu7o",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1749221&extension=ts&play_token=jg5ZtLtCQN",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1632123&extension=ts&play_token=E6ziX5leBT"
    ]
  },

  {
    id: "tf1-hdr-uhd",
    type: "tv",
    group: "sports4k",
    name: "TF1 HDR UHD",
    streams: [
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:10:01:3e&stream=1640379&extension=ts&play_token=YWsJoaBWoi",
      "http://line.moja-teve9.me:80/play/live.php?mac=00:1A:79:e8:95:b7&stream=1640379&extension=ts&play_token=6gj5Htj59g"
    ]
  }
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
    return (
      groupOrder[a.group] -
      groupOrder[b.group]
    );
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

  version: "4.2.0",

  name: "Live TV",

  description:
    "VTV, Sports 1080P 60FPS và Sports UHD / 4K",

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
      name: "📺 Sports 1080P • 60FPS",
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
      "Sports • 1080P • 60FPS • " +
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

    const p1080Count =
      channels.filter(
        c =>
          c.group === "sports1080"
      ).length;

    const p4kCount =
      channels.filter(
        c => c.group === "sports4k"
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
            Tổng số kênh:
            <strong>
              ${channels.length}
            </strong>
          </p>

          <p>
            Tổng số luồng:
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
  }
);
