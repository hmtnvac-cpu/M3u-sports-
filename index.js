const { addonBuilder, getRouter } = require("stremio-addon-sdk");
const express = require("express");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 7000;

// ==========================================
// LOAD sports.m3u
// ==========================================

function loadChannels() {
  const filePath = path.join(__dirname, "sports.m3u");

  if (!fs.existsSync(filePath)) {
    console.error("ERROR: sports.m3u not found");
    return [];
  }

  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);

  const result = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line.startsWith("#EXTINF:")) {
      continue;
    }

    // Channel name
    const commaIndex = line.lastIndexOf(",");

    const name =
      commaIndex >= 0
        ? line.substring(commaIndex + 1).trim()
        : `Channel ${result.length + 1}`;

    // Logo
    const logoMatch = line.match(/tvg-logo="([^"]+)"/i);

    const logo =
      logoMatch
        ? logoMatch[1]
        : "";

    // Group
    const groupMatch =
      line.match(/group-title="([^"]+)"/i);

    const group =
      groupMatch
        ? groupMatch[1]
        : "Sports";

    // Find stream URL after EXTINF
    let streamUrl = "";

    for (let j = i + 1; j < lines.length; j++) {
      const next = lines[j].trim();

      if (!next) {
        continue;
      }

      if (next.startsWith("#EXTINF:")) {
        break;
      }

      if (!next.startsWith("#")) {
        streamUrl = next;
        break;
      }
    }

    if (!streamUrl) {
      continue;
    }

    result.push({
      id: String(result.length + 1),
      name,
      url: streamUrl,
      logo,
      group
    });
  }

  console.log(`Loaded ${result.length} channels from sports.m3u`);

  return result;
}

let channels = loadChannels();

// ==========================================
// STREMIO MANIFEST
// ==========================================

const manifest = {
  id: "com.hmtnvac.iptvsports",

  version: "3.0.0",

  name: "My Sports IPTV",

  description: "My Sports IPTV M3U",

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
      id: "sports",
      name: "🏆 Sports",

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

// ==========================================
// CATALOG
// ==========================================

builder.defineCatalogHandler(
  async args => {

    console.log(
      "Catalog request:",
      args.id
    );

    // Reload M3U on each catalog request
    channels = loadChannels();

    let list = channels;

    const search =
      args.extra?.search
        ?.toLowerCase()
        .trim();

    if (search) {
      list =
        list.filter(channel =>
          channel.name
            .toLowerCase()
            .includes(search)
        );
    }

    console.log(
      `Returning ${list.length} channels`
    );

    return {
      metas:
        list.map(channel => ({
          id:
            `iptv_${channel.id}`,

          type:
            "tv",

          name:
            channel.name,

          poster:
            channel.logo ||
            "https://dummyimage.com/500x500/111111/ffffff.png&text=LIVE",

          posterShape:
            "square",

          description:
            channel.group
        }))
    };
  }
);

// ==========================================
// META
// ==========================================

builder.defineMetaHandler(
  async args => {

    channels = loadChannels();

    const channelId =
      args.id.replace(
        "iptv_",
        ""
      );

    const channel =
      channels.find(
        item =>
          item.id === channelId
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
          channel.logo ||
          "https://dummyimage.com/500x500/111111/ffffff.png&text=LIVE",

        posterShape:
          "square",

        description:
          channel.group
      }
    };
  }
);

// ==========================================
// STREAM
// ==========================================

builder.defineStreamHandler(
  async args => {

    channels = loadChannels();

    const channelId =
      args.id.replace(
        "iptv_",
        ""
      );

    const channel =
      channels.find(
        item =>
          item.id === channelId
      );

    if (!channel) {
      console.log(
        "Channel not found:",
        args.id
      );

      return {
        streams: []
      };
    }

    console.log(
      "Playing:",
      channel.name
    );

    return {
      streams: [
        {
          name:
            "My Sports IPTV",

          title:
            channel.name,

          url:
            channel.url
        }
      ]
    };
  }
);

// ==========================================
// EXPRESS
// ==========================================

const app = express();

app.use(
  getRouter(
    builder.getInterface()
  )
);

// ==========================================
// STATUS PAGE
// ==========================================

app.get(
  "/",
  (req, res) => {

    channels = loadChannels();

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
          My Sports IPTV
        </title>

      </head>

      <body
        style="
          background:#111;
          color:#fff;
          font-family:Arial;
          padding:30px;
        "
      >

        <h1>
          🏆 My Sports IPTV
        </h1>

        <h2>
          Addon Online ✅
        </h2>

        <p>
          Channels:
          <b>${channels.length}</b>
        </p>

        <p>
          Manifest:
        </p>

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

// ==========================================
// START SERVER
// ==========================================

app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      `My Sports IPTV running on port ${PORT}`
    );

    console.log(
      `Channels loaded: ${channels.length}`
    );
  }
);
