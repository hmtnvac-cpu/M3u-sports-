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
const CACHE_TIME = 30 * 60 * 1000;


// ================================
// PORTAL BASE URL
// ================================

function getPortalBase() {
  let url = PORTAL_URL || "";

  if (!url.endsWith("/")) {
    url += "/";
  }

  url = url.replace(/\/c\/?$/i, "/");

  return url;
}


// ================================
// STALKER API URL
// ================================

function apiUrl(params) {
  const base = getPortalBase();

  const query = new URLSearchParams({
    JsHttpRequest: "1-xml",
    ...params
  });

  return `${base}portal.php?${query.toString()}`;
}


// ================================
// DEFAULT HEADERS
// ================================

function headers(withToken = true) {
  const h = {
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
    h.Authorization = `Bearer ${token}`;
  }

  return h;
}


// ================================
// HANDSHAKE
// ================================

async function handshake() {
  console.log("Connecting to Stalker portal...");

  const url = apiUrl({
    type: "stb",
    action: "handshake",
    token: "",
    prehash: "0"
  });

  const response = await axios.get(url, {
    headers: headers(false),
    timeout: 30000
  });

  const data =
    response.data?.js ||
    response.data;

  const newToken =
    data?.token ||
    data?.js?.token;

  if (!newToken) {
    throw new Error(
      "Portal handshake failed: no token returned"
    );
  }

  token = newToken;

  console.log("Handshake successful");
}


// ================================
// PROFILE
// ================================

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
    device_id: "",
    device_id2: "",
    signature: "",
    auth_second_step: "1",
    hw_version: "1.7-BD-00",
    not_valid_token: "0"
  });

  try {
    await axios.get(url, {
      headers: headers(),
      timeout: 30000
    });

    console.log("Profile loaded");
  } catch (error) {
    console.log(
      "Profile request warning:",
      error.message
    );
  }
}


// ================================
// GET GENRES
// ================================

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
      : data?.data ||
        [];

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


// ================================
// GET ALL CHANNELS
// ================================

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
      : data?.data ||
        [];

  channels = list.map((item, index) => {
    const genreId =
      String(
        item.tv_genre_id ??
        item.genre_id ??
        item.category_id ??
        ""
      );

    const genre =
      genres.find(
        g => g.id === genreId
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
        "",

      raw:
        item
    };
  });

  console.log(
    "Channels loaded:",
    channels.length
  );
}


// ================================
// REFRESH PORTAL DATA
// ================================

async function loadPortal() {
  const now = Date.now();

  if (
    channels.length &&
    now - lastLoad < CACHE_TIME
  ) {
    return;
  }

  await handshake();
  await getProfile();
  await getGenres();
  await getChannels();

  lastLoad = Date.now();
}


// ================================
// NORMALIZE TEXT
// ================================

function normalizedText(channel) {
  return (
    `${channel.name} ${channel.genreName}`
  )
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    );
}


// ================================
// SPORTS FILTER
// ================================

const SPORTS_WORDS = [
  "sport",
  "sports",
  "football",
  "soccer",
  "futbol",
  "bein",
  "espn",
  "eurosport",
  "sky sports",
  "tnt sports",
  "dazn",
  "nba",
  "nfl",
  "nhl",
  "mlb",
  "ufc",
  "mma",
  "boxing",
  "boxeo",
  "wrestling",
  "tennis",
  "golf",
  "cricket",
  "rugby",
  "racing",
  "motorsport",
  "formula",
  "f1",
  "motogp",
  "basketball",
  "basket",
  "baseball",
  "hockey",
  "volleyball",
  "handball",
  "premier league",
  "champions league"
];

function isSports(channel) {
  const text =
    normalizedText(channel);

  return SPORTS_WORDS.some(
    word =>
      text.includes(word)
  );
}


// ================================
// MOVIE FILTER
// ================================

const MOVIE_WORDS = [
  "movie",
  "movies",
  "film",
  "films",
  "cinema",
  "cine",
  "ciné",
  "kino",
  "hbo",
  "cinemax",
  "showtime",
  "star movies",
  "movies hd",
  "movie channel",
  "film channel",
  "cinema hd"
];

function isMovies(channel) {
  const text =
    normalizedText(channel);

  return MOVIE_WORDS.some(
    word =>
      text.includes(word)
  );
}


// ================================
// 4K UHD FILTER
// ================================

const UHD_WORDS = [
  "4k",
  "uhd",
  "ultra hd",
  "ultrahd",
  "2160",
  "2160p"
];

function is4K(channel) {
  const text =
    normalizedText(channel);

  return UHD_WORDS.some(
    word =>
      text.includes(word)
  );
}


// ================================
// CATALOG FILTER
// ================================

function filterChannels(
  catalogId,
  search
) {
  let list = [];

  if (catalogId === "sports") {
    list =
      channels.filter(isSports);
  }

  if (catalogId === "movies") {
    list =
      channels.filter(isMovies);
  }

  if (catalogId === "uhd") {
    list =
      channels.filter(is4K);
  }

  if (search) {
    const q =
      search
        .toLowerCase()
        .trim();

    list =
      list.filter(channel =>
        normalizedText(channel)
          .includes(q)
      );
  }

  return list;
}


// ================================
// STREMIO MANIFEST
// ================================

const manifest = {
  id:
    "com.m3usport.stalker",

  version:
    "2.0.0",

  name:
    "Sports Movies 4K",

  description:
    "Sports, Movies and 4K/UHD channels",

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
        },
        {
          name: "skip",
          isRequired: false
        }
      ]
    },

    {
      type: "tv",
      id: "movies",
      name: "🎬 Movies",
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
    },

    {
      type: "tv",
      id: "uhd",
      name: "📺 4K / UHD",
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


const builder =
  new addonBuilder(manifest);


// ================================
// CATALOG HANDLER
// ================================

builder.defineCatalogHandler(
  async args => {

    try {
      await loadPortal();

      const list =
        filterChannels(
          args.id,
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
          page.map(channel => ({
            id:
              `stalker_${channel.id}`,

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
              "Live TV"
          }))
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
// META HANDLER
// ================================

builder.defineMetaHandler(
  async args => {

    try {
      await loadPortal();

      const id =
        args.id.replace(
          "stalker_",
          ""
        );

      const channel =
        channels.find(
          c => c.id === id
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
            "Live TV"
        }
      };

    } catch (error) {
      return {
        meta: null
      };
    }
  }
);


// ================================
// CREATE STREAM LINK
// ================================

async function createStreamLink(
  channel
) {
  if (!channel.cmd) {
    throw new Error(
      "Channel has no cmd"
    );
  }

  const url = apiUrl({
    type: "itv",
    action: "create_link",
    cmd: channel.cmd,
    series: "0",
    forced_storage: "undefined",
    disable_ad: "0",
    download: "0"
  });

  const response = await axios.get(
    url,
    {
      headers: headers(),
      timeout: 30000
    }
  );

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
      .replace(/^ffmpeg\s+/i, "")
      .replace(/^ffrt\s+/i, "")
      .trim();

  return cmd;
}


// ================================
// STREAM HANDLER
// ================================

builder.defineStreamHandler(
  async args => {

    try {
      await loadPortal();

      const id =
        args.id.replace(
          "stalker_",
          ""
        );

      const channel =
        channels.find(
          c => c.id === id
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


// ================================
// EXPRESS
// ================================

const app = express();

app.use(
  getRouter(
    builder.getInterface()
  )
);


// ================================
// STATUS PAGE
// ================================

app.get(
  "/",
  async (req, res) => {

    try {
      await loadPortal();

      const sports =
        channels.filter(
          isSports
        );

      const movies =
        channels.filter(
          isMovies
        );

      const uhd =
        channels.filter(
          is4K
        );

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
            Sports Movies 4K
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
            📺 Sports Movies 4K
          </h1>

          <p>
            Portal connected.
          </p>

          <p>
            Total channels:
            <b>${channels.length}</b>
          </p>

          <p>
            🏆 Sports:
            <b>${sports.length}</b>
          </p>

          <p>
            🎬 Movies:
            <b>${movies.length}</b>
          </p>

          <p>
            📺 4K / UHD:
            <b>${uhd.length}</b>
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

    } catch (error) {

      res
        .status(500)
        .send(
          "Portal error: " +
          error.message
        );
    }
  }
);


// ================================
// START SERVER
// ================================

app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      `Stalker addon running on port ${PORT}`
    );
  }
);
