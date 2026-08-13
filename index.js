const { addonBuilder, getRouter } = require("stremio-addon-sdk");
const express = require("express");
const axios = require("axios");

// ================================
// CẤU HÌNH
// ================================

const PLAYLIST_URL =
  "https://iptv-org.github.io/iptv/index.category.m3u";

const PORT = process.env.PORT || 7000;

// Cache playlist
let channels = [];
let lastLoad = 0;

// Làm mới playlist sau 30 phút
const CACHE_TIME = 30 * 60 * 1000;


// ================================
// ĐỌC THÔNG TIN EXTINF
// ================================

function parseAttributes(line) {
  const attrs = {};

  const regex = /([\w-]+)="([^"]*)"/g;

  let match;

  while ((match = regex.exec(line)) !== null) {
    attrs[match[1]] = match[2];
  }

  return attrs;
}


// ================================
// TẢI VÀ ĐỌC PLAYLIST M3U
// ================================

async function loadPlaylist() {

  const now = Date.now();

  // Nếu cache vẫn còn hiệu lực
  if (
    channels.length > 0 &&
    now - lastLoad < CACHE_TIME
  ) {
    return;
  }

  console.log("Downloading IPTV-org playlist...");

  const response = await axios.get(
    PLAYLIST_URL,
    {
      timeout: 60000,
      responseType: "text",
      headers: {
        "User-Agent": "Stremio-IPTV-Addon/1.0"
      }
    }
  );

  const lines = response.data.split(/\r?\n/);

  const result = [];

  for (let i = 0; i < lines.length; i++) {

    const line = lines[i].trim();

    if (!line.startsWith("#EXTINF:")) {
      continue;
    }

    const attrs = parseAttributes(line);

    // Tên kênh
    const commaIndex = line.lastIndexOf(",");

    const name =
      commaIndex !== -1
        ? line.substring(commaIndex + 1).trim()
        : "Unknown Channel";

    // Tìm URL stream ngay sau EXTINF
    let streamUrl = "";

    for (let j = i + 1; j < lines.length; j++) {

      const nextLine = lines[j].trim();

      if (!nextLine) {
        continue;
      }

      if (nextLine.startsWith("#EXTINF:")) {
        break;
      }

      if (!nextLine.startsWith("#")) {
        streamUrl = nextLine;
        break;
      }
    }

    if (!streamUrl) {
      continue;
    }

    const category =
      attrs["group-title"] || "Other";

    const logo =
      attrs["tvg-logo"] || "";

    const tvgId =
      attrs["tvg-id"] || "";

    result.push({
      id: "iptv_" + result.length,
      name: name,
      logo: logo,
      tvgId: tvgId,
      category: category,
      url: streamUrl
    });
  }

  channels = result;

  lastLoad = Date.now();

  console.log(
    "Playlist loaded:",
    channels.length,
    "channels"
  );
}


// ================================
// MANIFEST STREMIO
// ================================

const manifest = {

  id: "com.m3usport.iptv",

  version: "1.0.0",

  name: "M3U IPTV",

  description:
    "Live TV channels from IPTV-org",

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

      id: "iptv-live",

      name: "M3U IPTV Live",

      extra: [
        {
          name: "search",
          isRequired: false
        },
        {
          name: "skip",
          isRequired: false
        }
      ]
    }
  ]
};


// ================================
// TẠO ADDON
// ================================

const builder = new addonBuilder(manifest);


// ================================
// CATALOG
// ================================

builder.defineCatalogHandler(
  async (args) => {

    try {

      await loadPlaylist();

      let list = channels;

      // Tìm kiếm
      if (
        args.extra &&
        args.extra.search
      ) {

        const search =
          args.extra.search
            .toLowerCase()
            .trim();

        list = list.filter(
          (channel) =>
            channel.name
              .toLowerCase()
              .includes(search)
        );
      }

      // Phân trang
      const skip =
        Number(args.extra?.skip || 0);

      const page =
        list.slice(skip, skip + 100);

      return {

        metas: page.map(
          (channel) => ({

            id: channel.id,

            type: "tv",

            name: channel.name,

            poster:
              channel.logo ||
              "https://dummyimage.com/500x500/222222/ffffff.png&text=LIVE+TV",

            posterShape: "square",

            description:
              "Live TV • " +
              channel.category,

            genres: [
              channel.category
            ]
          })
        )
      };

    } catch (error) {

      console.error(
        "Catalog error:",
        error.message
      );

      return {
        metas: []
      };
    }
  }
);


// ================================
// META
// ================================

builder.defineMetaHandler(
  async (args) => {

    try {

      await loadPlaylist();

      const channel =
        channels.find(
          (item) =>
            item.id === args.id
        );

      if (!channel) {

        return {
          meta: null
        };
      }

      return {

        meta: {

          id: channel.id,

          type: "tv",

          name: channel.name,

          poster:
            channel.logo ||
            "https://dummyimage.com/500x500/222222/ffffff.png&text=LIVE+TV",

          posterShape: "square",

          description:
            "Live channel • " +
            channel.category,

          genres: [
            channel.category
          ]
        }
      };

    } catch (error) {

      console.error(
        "Meta error:",
        error.message
      );

      return {
        meta: null
      };
    }
  }
);


// ================================
// STREAM
// ================================

builder.defineStreamHandler(
  async (args) => {

    try {

      await loadPlaylist();

      const channel =
        channels.find(
          (item) =>
            item.id === args.id
        );

      if (!channel) {

        return {
          streams: []
        };
      }

      return {

        streams: [
          {
            name: "M3U IPTV",

            title:
              channel.name +
              " • " +
              channel.category,

            url: channel.url
          }
        ]
      };

    } catch (error) {

      console.error(
        "Stream error:",
        error.message
      );

      return {
        streams: []
      };
    }
  }
);


// ================================
// EXPRESS SERVER
// ================================

const app = express();

app.use(
  getRouter(
    builder.getInterface()
  )
);


// ================================
// TRANG KIỂM TRA
// ================================

app.get(
  "/",
  async (req, res) => {

    try {

      await loadPlaylist();

      const manifestUrl =
        `${req.protocol}://${req.get("host")}/manifest.json`;

      res.send(`
        <!DOCTYPE html>

        <html>

        <head>

          <meta
            name="viewport"
            content="width=device-width, initial-scale=1"
          >

          <title>
            M3U IPTV Addon
          </title>

        </head>

        <body
          style="
            font-family:Arial,sans-serif;
            background:#111;
            color:white;
            padding:30px;
          "
        >

          <h1>
            📺 M3U IPTV Addon
          </h1>

          <p>
            Addon đang hoạt động.
          </p>

          <p>
            Số kênh đã đọc:
            <strong>
              ${channels.length}
            </strong>
          </p>

          <p>
            Manifest URL:
          </p>

          <p
            style="
              word-break:break-all;
              background:#222;
              padding:15px;
              border-radius:8px;
            "
          >
            ${manifestUrl}
          </p>

        </body>

        </html>
      `);

    } catch (error) {

      res
        .status(500)
        .send(
          "Không tải được playlist: " +
          error.message
        );
    }
  }
);


// ================================
// KHỞI ĐỘNG SERVER
// ================================

app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      `M3U IPTV addon running on port ${PORT}`
    );
  }
);
