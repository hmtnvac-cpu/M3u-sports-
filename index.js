const { addonBuilder, getRouter } = require("stremio-addon-sdk");
const express = require("express");
const axios = require("axios");

const PORT = process.env.PORT || 7000;

const PORTAL_URL = process.env.PORTAL_URL;
const PORTAL_MAC = process.env.PORTAL_MAC;

if (!PORTAL_URL || !PORTAL_MAC) {
  console.error("Missing PORTAL_URL or PORTAL_MAC");
}

const MAC_ENCODED = encodeURIComponent(PORTAL_MAC || "");

let token = "";
let channels = [];
let genres = [];

let lastLoad = 0;
let loadingPromise = null;

const CACHE_TIME = 30 * 60 * 1000;


// ========================================
// PORTAL BASE
// ========================================

function getPortalBase() {
  let url = PORTAL_URL || "";

  if (!url.endsWith("/")) {
    url += "/";
  }

  // http://server/c/ -> http://server/
  url = url.replace(/\/c\/?$/i, "/");

  return url;
}


// ========================================
// API URL
// ========================================

function apiUrl(params) {
  const query = new URLSearchParams({
    JsHttpRequest: "1-xml",
    ...params
  });

  return `${getPortalBase()}portal.php?${query.toString()}`;
}


// ========================================
// HEADERS
// ========================================

function headers(withToken = true) {
  const result = {
    "User-Agent":
      "Mozilla/5.0 (QtEmbedded; U; Linux; C) AppleWebKit/533.3 Safari/533.3",

    "X-User-Agent":
      "Model: MAG254; Link: Ethernet",

    "Referer":
      `${getPortalBase()}c/`,

    "Cookie":
      `mac=${MAC_ENCODED}; stb_lang=en; timezone=GMT`
  };

  if (withToken && token) {
    result.Authorization = `Bearer ${token}`;
  }

  return result;
}


// ========================================
// HANDSHAKE
// ========================================

async function handshake() {
  // Nếu đã có token thì không handshake lại
  if (token) {
    return;
  }

  console.log("Connecting to Stalker portal...");

  const url = apiUrl({
    type: "stb",
    action: "handshake",
    token: "",
    prehash: "0"
  });

  const response = await axios.get(url, {
    headers: headers(false),
    timeout: 30000,
    validateStatus: status =>
      status >= 200 && status < 500
  });

  if (response.status === 429) {
    throw new Error(
      "Portal rate limited request (HTTP 429). Wait before retrying."
    );
  }

  if (response.status >= 400) {
    throw new Error(
      `Handshake HTTP error ${response.status}`
    );
  }

  const data =
    response.data?.js ||
    response.data;

  const newToken =
    data?.token ||
    data?.js?.token;

  if (!newToken) {
    console.log(
      "Handshake response:",
      JSON.stringify(response.data).slice(0, 500)
    );

    throw new Error(
      "Portal handshake failed: no token returned"
    );
  }

  token = newToken;

  console.log("Handshake successful");
}


// ========================================
// PROFILE
// ========================================

async function getProfile() {
  const url = apiUrl({
    type: "stb",
    action: "get_profile",
    hd: "1",

    ver:
      "ImageDescription: 0.2.18-r23-254; ImageDate: Wed Mar 18 11:54:49 EET 2015; PORTAL version: 5.6.1",

    num_banks: "2",
    sn: "",
    stb_type: "MAG254",
    client_type: "STB",
    image_version: "218",
    video_out: "hdmi",
    auth_second_step: "1",
    hw_version: "1.7-BD-00",
    not_valid_token: "0"
  });

  try {
    const response = await axios.get(url, {
      headers: headers(),
      timeout: 30000,
      validateStatus: status =>
        status >= 200 && status < 500
    });

    if (response.status === 429) {
      throw new Error("HTTP 429");
    }

    console.log("Profile loaded");
  } catch (error) {
    console.log(
      "Profile warning:",
      error.message
    );
  }
}


// ========================================
// GENRES
// ========================================

async function getGenres() {
  const url = apiUrl({
    type: "itv",
    action: "get_genres"
  });

  const response = await axios.get(url, {
    headers: headers(),
    timeout: 30000
  });

  const data =
    response.data?.js ||
    response.data;

  const list =
    Array.isArray(data)
      ? data
      : data?.data || [];

  genres = list.map(item => ({
    id: String(
      item.id ??
      item.genre_id ??
      ""
    ),

    title:
      item.title ||
      item.name ||
      ""
  }));

  console.log(
    "Genres loaded:",
    genres.length
  );
}


// ========================================
// ALL CHANNELS
// ========================================

async function getChannels() {
  const url = apiUrl({
    type: "itv",
    action: "get_all_channels"
  });

  const response = await axios.get(url, {
    headers: headers(),
    timeout: 60000
  });

  const data =
    response.data?.js ||
    response.data;

  const list =
    Array.isArray(data)
      ? data
      : data?.data || [];

  channels = list.map(
    (item, index) => {

      const genreId =
        String(
          item.tv_genre_id ??
          item.genre_id ??
          item.category_id ??
          ""
        );

      const genre =
        genres.find(
          g =>
            g.id === genreId
        );

      return {
        id:
          String(
            item.id ??
            item.ch_id ??
            index
          ),

        name:
          item.name ||
          item.title ||
          "Unknown",

        cmd:
          item.cmd ||
          item.url ||
          "",

        logo:
          item.logo ||
          item.screenshot_uri ||
          "",

        genreId,

        genreName:
          genre?.title ||
          "",

        number:
          item.number ||
          ""
      };
    }
  );

  console.log(
    "Channels loaded:",
    channels.length
  );
}


// ========================================
// LOAD PORTAL
// ========================================

async function loadPortal() {
  const now = Date.now();

  if (
    channels.length > 0 &&
    now - lastLoad < CACHE_TIME
  ) {
    return;
  }

  // Ngăn nhiều request Stremio
  // chạy handshake cùng lúc
  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    try {
      await handshake();

      await getProfile();

      await getGenres();

      await getChannels();

      lastLoad = Date.now();
    } catch (error) {

      // token có thể hết hạn
      token = "";

      throw error;
    } finally {
      loadingPromise = null;
    }
  })();

  return loadingPromise;
}


// ========================================
// SEARCH
// ========================================

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    );
}


function searchChannels(search) {
  if (!search) {
    return channels;
  }

  const q =
    normalizeText(search);

  return channels.filter(
    channel => {

      const text =
        normalizeText(
          `${channel.name} ${channel.genreName}`
        );

      return text.includes(q);
    }
  );
}


// ========================================
// STREMIO MANIFEST
// ========================================

const manifest = {

  id:
    "com.myportal.allchannels",

  version:
    "4.0.0",

  name:
    "Portal IPTV",

  description:
    "All live channels from my IPTV portal",

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
        "all-channels",

      name:
        "📺 All Channels",

      extra: [
        {
          name:
            "search",

          isRequired:
            false
        },

        {
          name:
            "skip",

          isRequired:
            false
        }
      ]
    }
  ]
};


const builder =
  new addonBuilder(manifest);


// ========================================
// CATALOG
// ========================================

builder.defineCatalogHandler(
  async args => {

    try {

      await loadPortal();

      let list =
        searchChannels(
          args.extra?.search
        );

      const skip =
        Number(
          args.extra?.skip ||
          0
        );

      const page =
        list.slice(
          skip,
          skip + 100
        );

      return {

        metas:
          page.map(
            channel => ({

              id:
                `portal_${channel.id}`,

              type:
                "tv",

              name:
                channel.name,

              poster:
                channel.logo ||
                "https://dummyimage.com/500x500/222222/ffffff.png&text=LIVE",

              posterShape:
                "square",

              description:
                channel.genreName ||
                "Live TV",

              genres:
                channel.genreName
                  ? [
                      channel.genreName
                    ]
                  : []
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


// ========================================
// META
// ========================================

builder.defineMetaHandler(
  async args => {

    try {

      await loadPortal();

      const id =
        args.id.replace(
          "portal_",
          ""
        );

      const channel =
        channels.find(
          item =>
            item.id === id
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
            "https://dummyimage.com/500x500/222222/ffffff.png&text=LIVE",

          posterShape:
            "square",

          description:
            channel.genreName ||
            "Live TV",

          genres:
            channel.genreName
              ? [
                  channel.genreName
                ]
              : []
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


// ========================================
// CREATE PLAY LINK
// ========================================

async function createStreamLink(
  channel
) {

  if (!channel.cmd) {
    throw new Error(
      "Channel has no cmd"
    );
  }

  const url = apiUrl({
    type:
      "itv",

    action:
      "create_link",

    cmd:
      channel.cmd,

    series:
      "0",

    forced_storage:
      "undefined",

    disable_ad:
      "0",

    download:
      "0"
  });

  let response;

  try {

    response =
      await axios.get(
        url,
        {
          headers:
            headers(),

          timeout:
            30000
        }
      );

  } catch (error) {

    // thử tạo session mới một lần
    if (
      error.response?.status === 401 ||
      error.response?.status === 403
    ) {

      token = "";

      await handshake();

      response =
        await axios.get(
          url,
          {
            headers:
              headers(),

            timeout:
              30000
          }
        );

    } else {
      throw error;
    }
  }

  const data =
    response.data?.js ||
    response.data;

  let cmd =
    data?.cmd ||
    data?.url ||
    "";

  if (!cmd) {
    throw new Error(
      "Portal returned no stream URL"
    );
  }

  cmd =
    cmd
      .replace(
        /^ffmpeg\s+/i,
        ""
      )
      .replace(
        /^ffrt\s+/i,
        ""
      )
      .trim();

  return cmd;
}


// ========================================
// STREAM
// ========================================

builder.defineStreamHandler(
  async args => {

    try {

      await loadPortal();

      const id =
        args.id.replace(
          "portal_",
          ""
        );

      const channel =
        channels.find(
          item =>
            item.id === id
        );

      if (!channel) {
        return {
          streams: []
        };
      }

      const streamUrl =
        await createStreamLink(
          channel
        );

      return {

        streams: [
          {
            name:
              "Portal IPTV",

            title:
              channel.name,

            url:
              streamUrl
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


// ========================================
// EXPRESS
// ========================================

const app =
  express();

app.use(
  getRouter(
    builder.getInterface()
  )
);


// ========================================
// STATUS PAGE
// ========================================

app.get(
  "/",
  async (req, res) => {

    try {

      await loadPortal();

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
            Portal IPTV
          </title>

        </head>

        <body
          style="
            background:#111;
            color:#fff;
            font-family:Arial,sans-serif;
            padding:30px;
          "
        >

          <h1>
            📺 Portal IPTV
          </h1>

          <p>
            Portal connected.
          </p>

          <p>
            Total channels:
            <strong>
              ${channels.length}
            </strong>
          </p>

          <p>
            Categories:
            <strong>
              ${genres.length}
            </strong>
          </p>

          <p>
            Manifest URL:
          </p>

          <p
            style="
              word-break:break-all;
              background:#222;
              padding:12px;
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
          `Portal error: ${error.message}`
        );
    }
  }
);


// ========================================
// START
// ========================================

app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      `Portal IPTV addon running on port ${PORT}`
    );
  }
);
