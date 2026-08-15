const { addonBuilder, getRouter } = require("stremio-addon-sdk");
const express = require("express");

const PORT = process.env.PORT || 7000;

// =====================================================
// DANH SÁCH KÊNH
// =====================================================

const channels = [

  // ===================================================
  // INTERNATIONAL / SPORTS
  // ===================================================

  {
    id: "bein-sports-uhd",
    name: "beIN Sports UHD",
    group: "international",
    url: "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1948627&extension=ts&play_token=YÝtO3ymSXM"
  },

  {
    id: "canal-ldc-uhd",
    name: "Canal+ LDC UHD",
    group: "international",
    url: "http://iiiiiiiillllaaaaaiiiiiiiillllaaaaa.cdnip.online:8080/HouseMax/V3f8Ydk6Iu/105102?play_token=kpxOTsDTky"
  },

  {
    id: "canal-uhd",
    name: "Canal+ UHD",
    group: "international",
    url: "http://iiiiiiiillllaaaaaiiiiiiiillllaaaaa.cdnip.online:8080/HouseMax/V3f8Ydk6Iu/105100?play_token=bTvRbHUDJ5"
  },

  {
    id: "digi-sport-uhd",
    name: "Digi Sport UHD",
    group: "international",
    url: "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1632122&extension=ts&play_token=Bc1RBTdvcu"
  },

  {
    id: "eleven-sports-1-uhd",
    name: "Eleven Sports 1 UHD",
    group: "international",
    url: "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1470618&extension=ts&play_token=m0Llrs5Iev"
  },

  {
    id: "now-sports-4k-1",
    name: "NOW Sports 4K 1",
    group: "international",
    url: "http://iiiiiiiillllaaaaaiiiiiiiillllaaaaa.cdnip.online:8080/HouseMax/V3f8Ydk6Iu/112208?play_token=UgtrFqkDV9"
  },

  {
    id: "now-sports-4k-2",
    name: "NOW Sports 4K 2",
    group: "international",
    url: "http://iiiiiiiillllaaaaaiiiiiiiillllaaaaa.cdnip.online:8080/HouseMax/V3f8Ydk6Iu/116706?play_token=DfQqJWbopO"
  },

  {
    id: "now-sports-4k-3",
    name: "NOW Sports 4K 3",
    group: "international",
    url: "http://iiiiiiiillllaaaaaiiiiiiiillllaaaaa.cdnip.online:8080/HouseMax/V3f8Ydk6Iu/116707?play_token=rAJRw3Axyw"
  },

  {
    id: "rtl-uhd",
    name: "RTL UHD",
    group: "international",
    url: "http://iiiiiiiillllaaaaaiiiiiiiillllaaaaa.cdnip.online:8080/HouseMax/V3f8Ydk6Iu/130363?play_token=4ZC5Z1Ct9s"
  },

  {
    id: "sky-sports-1-uhd",
    name: "Sky Sports 1 UHD",
    group: "international",
    url: "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1608068&extension=ts&play_token=vdđJ3JIwT7"
  },

  {
    id: "sky-sports-2-uhd",
    name: "Sky Sports 2 UHD",
    group: "international",
    url: "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1608069&extension=ts&play_token=eẻvbqSf7nG"
  },

  {
    id: "sky-sports-bundesliga-uhd",
    name: "Sky Sports Bundesliga UHD",
    group: "international",
    url: "http://mag.tivi-one-iptv.net:80/play/live.php?mac=00:1A:79:0E:0F:8E&stream=893917&extension=ts&play_token=5QPOI5t6D3"
  },

  {
    id: "sky-sports-darts-uhd",
    name: "Sky Sports Darts UHD",
    group: "international",
    url: "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1471382&extension=ts&play_token=RCUbXjP9kV"
  },

  {
    id: "sky-sports-f1-uhd",
    name: "Sky Sports F1 UHD",
    group: "international",
    url: "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1761500&extension=ts&play_token=R0RwoZl4We"
  },

  {
    id: "sky-sports-main-event",
    name: "Sky Sports Main Event",
    group: "international",
    url: "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1608071&extension=ts&play_token=ffh6vBOXXG"
  },

  {
    id: "sky-sports-uhd",
    name: "Sky Sports UHD",
    group: "international",
    url: "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1471387&extension=ts&play_token=acG0ANBzsw"
  },

  {
    id: "tf1-hdr-uhd",
    name: "TF1 HDR UHD",
    group: "international",
    url: "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1640379&extension=ts&play_token=nh5uKOD1OI"
  },

  {
    id: "tnt-sports-uhd",
    name: "TNT Sports UHD",
    group: "international",
    url: "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1479591&extension=ts&play_token=G26iịCdrYZ"
  },

  {
    id: "tnt-sports-uhd-unlimited",
    name: "TNT Sports UHD Unlimited",
    group: "international",
    url: "http://iiiiiiiillllaaaaaiiiiiiiillllaaaaa.cdnip.online:8080/HouseMax/V3f8Ydk6Iu/131353?play_token=YnInsrDaU1"
  },

  {
    id: "v-sport-plus-uhd",
    name: "V Sport+ UHD",
    group: "international",
    url: "http://chaotic-streams.cc:80/play/live.php?mac=00:1A:79:B6:46:AC&stream=1632123&extension=ts&play_token=kmWkMZUxoN"
  },


  // ===================================================
  // VTV
  // ===================================================

  {
    id: "vtv1",
    name: "VTV1",
    group: "vtv",
    url: "https://ec05-pop5-hht.tv360.vn/bpk-token/l4ylkfvlegqbnv7raqfv4mfvczptbniw/bpk-tv/154/output/154-audio_208000_eng_iv_3=206000-video_iv_3=1067600.m3u8"
  },

  {
    id: "vtv2",
    name: "VTV2",
    group: "vtv",
    url: "https://pop12-ec1-ateme.tv360.vn:443/tok_eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOiIxNzg2ODA1NzcwIiwic2lwIjoiIiwicGF0aCI6Ii9saXZlL2Vkcy8xOTIvSExTX0NsZWFuX01ITl8ycy8iLCJzZXNzaW9uX2Nkbl9pZCI6ImVlYTIyMTgyMjEyN2NmMTkiLCJzZXNzaW9uX2lkIjoiIiwiY2xpZW50X2lkIjoiIiwiZGV2aWNlX2lkIjoiIiwibWF4X3Nlc3Npb25zIjowLCJzZXNzaW9uX2R1cmF0aW9uIjowLCJ1cmwiOiJodHRwczovLzE3Mi4yNC4xNjguMTY0Iiwic2Vzc2lvbl90aW1lb3V0IjowLCJhdWQiOiIzNCIsInNvdXJjZXMiOlsyMDcsNDYzLDQ2Niw0NjgsNDY5XX0=.OVu07vEDAr066znJ9hqATXo8C5dAV1YUTVV-IfYaDpUrPuJJrmRnK-EzLswvmDTa_t0lRq-VjTZ_p_LPQvbYMA==/live/eds/192/HLS_Clean_MHN_2s/192-avc1_3299968=10002-mp4a_196800_eng=20000.m3u8"
  },

  {
    id: "vtv3",
    name: "VTV3",
    group: "vtv",
    url: "https://es1-p2-netcdn.tv360.vn/netcdn-live/1552/output/3500000-index.m3u8?wmkid=0&uid=122957098&timestamp=1786802121&token=341c1c774c7cefè55e71bê8567876997"
  },

  {
    id: "vtv4",
    name: "VTV4",
    group: "vtv",
    url: "https://ec01-pop5-hht.tv360.vn/bpk-token/a3rbirtl6aaun2obuznqpyquiydoefcg/bpk-tv/193/output/193-audio_208000_eng_iv_2=206000-video_iv_2=3417600.m3u8"
  },

  {
    id: "vtv5-hd",
    name: "VTV5 HD",
    group: "vtv",
    url: "https://ec01-pop5-hht.tv360.vn/bpk-token/hlnnawrnzdcvup5omjdtxwwqli5nvuc2/bpk-tv/194/output/194-audio_198800_eng_iv_4=196800-video_iv_4=1884800.m3u8"
  },

  {
    id: "vtv5-tay-nguyen",
    name: "VTV5 Tây Nguyên",
    group: "vtv",
    url: "https://ec03-pop5-hht.tv360.vn/bpk-token/ln4qeosdnmltvmhtwatvu6ichjnxsar2/bpk-tv/308/output/308-audio_208000_eng_iv_1=206000-video_iv_1=3417600.m3u8"
  },

  {
    id: "vtv6",
    name: "VTV6",
    group: "vtv",
    url: "https://pop12-ec3-ateme.tv360.vn:443/tok_eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOiIxNzg2ODA2MDE4Iiwic2lwIjoiIiwicGF0aCI6Ii9saXZlL2Vkcy80NzkvSExTX0NsZWFuX01ITl8ycy8iLCJzZXNzaW9uX2Nkbl9pZCI6IjkxODg4ZWU5NDNjZGEwMTciLCJzZXNzaW9uX2lkIjoiIiwiY2xpZW50X2lkIjoiIiwiZGV2aWNlX2lkIjoiIiwibWF4X3Nlc3Npb25zIjowLCJzZXNzaW9uX2R1cmF0aW9uIjowLCJ1cmwiOiJodHRwczovLzE3Mi4yNC4xNjguMTY0Iiwic2Vzc2lvbl90aW1lb3V0IjowLCJhdWQiOiIzOCIsInNvdXJjZXMiOlsyMDcsNDYzLDQ2Niw0NjgsNDY5XX0=.Xba8Mv6e8-B2StrwRCH3w8Co0ZrB0o-tk9pfJv-j55a3buNU2tOyOhfE0QvSuxdRxnQHtFg0YCuyyTo_iBt9cA==/live/eds/479/HLS_Clean_MHN_2s/479-avc1_1800000=10001-mp4a_206000_eng=20000.m3u8"
  },

  {
    id: "vtv7",
    name: "VTV7",
    group: "vtv",
    url: "https://ec04-pop5-hht.tv360.vn/bpk-token/3ua5sauucpgafo5xnmp5yaozaloqdwic/bpk-tv/195/output/195-audio_198800_eng_iv_4=196800-video_iv_4=4482000.m3u8"
  },

  {
    id: "vtv8",
    name: "VTV8",
    group: "vtv",
    url: "https://ec01-pop5-hht.tv360.vn/bpk-token/fkva64bhxanha5cnxvwsxkqpoavkud3q/bpk-tv/196/output/196-audio_208000_eng_iv_2=206000-video_iv_2=3417600.m3u8"
  },

  {
    id: "vtv9",
    name: "VTV9",
    group: "vtv",
    url: "https://pop12-ec2-ateme.tv360.vn:443/tok_eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOiIxNzg2ODA2MjAwIiwic2lwIjoiIiwicGF0aCI6Ii9saXZlL2Vkcy8xOTcvSExTX0NsZWFuX01ITl8ycy8iLCJzZXNzaW9uX2Nkbl9pZCI6IjZkNjk5ZTNiNWFkYjc1OGQiLCJzZXNzaW9uX2lkIjoiIiwiY2xpZW50X2lkIjoiIiwiZGV2aWNlX2lkIjoiIiwibWF4X3Nlc3Npb25zIjowLCJzZXNzaW9uX2R1cmF0aW9uIjowLCJ1cmwiOiJodHRwczovLzE3Mi4yNC4xNjguMTY0Iiwic2Vzc2lvbl90aW1lb3V0IjowLCJhdWQiOiIzNyIsInNvdXJjZXMiOlsyMDcsNDYzLDQ2Niw0NjgsNDY5XX0=.IToyfTi0Zi-xFTgRo-TvufZYYmso1EDzDBUyTjNaA7o40JlWB4D4gGj4s__egp7NZJHF8taXikmjm5iecn7LHw==/live/eds/197/HLS_Clean_MHN_2s/197-avc1_3299968=10002-mp4a_206000_eng=20000.m3u8"
  },

  {
    id: "vtv10",
    name: "VTV10",
    group: "vtv",
    url: "https://pop12-ec2-ateme.tv360.vn:443/tok_eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOiIxNzg2ODA2MjM1Iiwic2lwIjoiIiwicGF0aCI6Ii9saXZlL2Vkcy8xNTYvSExTX0NsZWFuX01ITl8ycy8iLCJzZXNzaW9uX2Nkbl9pZCI6IjQ3OGQ4YmIzMTgzMmUyMjMiLCJzZXNzaW9uX2lkIjoiIiwiY2xpZW50X2lkIjoiIiwiZGV2aWNlX2lkIjoiIiwibWF4X3Nlc3Npb25zIjowLCJzZXNzaW9uX2R1cmF0aW9uIjowLCJ1cmwiOiJodHRwczovLzE3Mi4yNC4xNjguMTY0Iiwic2Vzc2lvbl90aW1lb3V0IjowLCJhdWQiOiIzNyIsInNvdXJjZXMiOlsyMDcsNDYzLDQ2Niw0NjgsNDY5XX0=.hZg1QtnVwTodxvuceAn0tOsiCcoaxGi7I-CV4cKyTIgER6K-7nm2zvN9k3k5UaXEvhez2LfJBdBl-Wp8e4G90Q==/live/eds/156/HLS_Clean_MHN_2s/156-avc1_3299968=10002-mp4a_196800_eng=20000.m3u8"
  }

];


// =====================================================
// MANIFEST
// =====================================================

const manifest = {
  id: "com.hmtnvac.livetv",
  version: "4.0.0",
  name: "My Live TV",

  description:
    "International Sports UHD and VTV Live TV",

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
      id: "international",
      name: "🌍 International / Sports",
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
    }
  ]
};


const builder =
  new addonBuilder(manifest);


// =====================================================
// CATALOG
// =====================================================

builder.defineCatalogHandler(
  async args => {

    let list =
      channels.filter(
        channel =>
          channel.group === args.id
      );

    if (args.extra?.search) {

      const search =
        args.extra.search
          .toLowerCase()
          .trim();

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
        list.map(channel => ({
          id:
            `livetv_${channel.id}`,

          type:
            "tv",

          name:
            channel.name,

          poster:
            "https://dummyimage.com/500x500/111111/ffffff.png&text=LIVE",

          posterShape:
            "square",

          description:
            channel.group === "vtv"
              ? "VTV Live"
              : "International Live TV"
        }))
    };
  }
);


// =====================================================
// META
// =====================================================

builder.defineMetaHandler(
  async args => {

    const id =
      args.id.replace(
        "livetv_",
        ""
      );

    const channel =
      channels.find(
        channel =>
          channel.id === id
      );

    if (!channel) {
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
          channel.name,

        poster:
          "https://dummyimage.com/500x500/111111/ffffff.png&text=LIVE",

        posterShape:
          "square",

        description:
          channel.group === "vtv"
            ? "VTV Live"
            : "International Live TV"
      }
    };
  }
);


// =====================================================
// STREAM
// =====================================================

builder.defineStreamHandler(
  async args => {

    const id =
      args.id.replace(
        "livetv_",
        ""
      );

    const channel =
      channels.find(
        channel =>
          channel.id === id
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
            "Live TV",

          title:
            channel.name,

          url:
            channel.url
        }
      ]
    };
  }
);


// =====================================================
// EXPRESS
// =====================================================

const app = express();

app.use(
  getRouter(
    builder.getInterface()
  )
);


// =====================================================
// STATUS PAGE
// =====================================================

app.get(
  "/",
  (req, res) => {

    const international =
      channels.filter(
        channel =>
          channel.group === "international"
      );

    const vtv =
      channels.filter(
        channel =>
          channel.group === "vtv"
      );

    const manifestUrl =
      `${req.protocol}://${req.get("host")}/manifest.json`;

    res.send(`
      <!DOCTYPE html>

      <html>

      <head>

        <meta
          name="viewport"
          content="width=device-width,initial-scale=1"
        >

        <title>
          My Live TV
        </title>

      </head>

      <body
        style="
          background:#111;
          color:white;
          font-family:Arial;
          padding:30px;
        "
      >

        <h1>
          📺 My Live TV
        </h1>

        <h2>
          Addon Online ✅
        </h2>

        <p>
          🌍 International / Sports:
          <b>${international.length}</b>
        </p>

        <p>
          🇻🇳 VTV:
          <b>${vtv.length}</b>
        </p>

        <p>
          Total:
          <b>${channels.length}</b>
        </p>

        <h3>
          Stremio Manifest
        </h3>

        <p
          style="
            word-break:break-all;
          "
        >
          ${manifestUrl}
        </p>

      </body>

      </html>
    `);
  }
);


// =====================================================
// START
// =====================================================

app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      `My Live TV running on port ${PORT}`
    );

    console.log(
      `Total channels: ${channels.length}`
    );
  }
);
