const { addonBuilder, getRouter } = require("stremio-addon-sdk");
const express = require("express");

const { channels } = require("./channels");
const matches = require("./live.json");

const app = express();
const PORT = process.env.PORT || 7000;

const PUBLIC_BASE =
  process.env.PUBLIC_BASE_URL ||
  "https://m3u-sports-tv.onrender.com";

const VERSION = "1.0.8";

// ==================================================
// HELPERS
// ==================================================

function normalizedPng(url) {
  return (
    "https://images.weserv.nl/?url=" +
    encodeURIComponent(url) +
    "&w=600&h=600&fit=contain&bg=11151c&output=png&q=92&v=108"
  );
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function isMacStream(url) {
  const value = String(url || "");
  return /[?&]mac=/i.test(value) || /\/play\/live\.php/i.test(value);
}

function getMacFromUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get("mac") || "UNKNOWN";
  } catch (_) {
    const m = String(url || "").match(/[?&]mac=([^&]+)/i);
    return m ? decodeURIComponent(m[1]) : "UNKNOWN";
  }
}

// ==================================================
// STREAM HEALTH CHECK
// ==================================================

const streamHealthCache = new Map();
const HEALTH_CACHE_MS = 5 * 60 * 1000;
const HEALTH_TIMEOUT_MS = 6000;

async function checkStream(url) {
  if (!isMacStream(url)) return true;

  const cached = streamHealthCache.get(url);

  if (
    cached &&
    Date.now() - cached.checkedAt < HEALTH_CACHE_MS
  ) {
    return cached.ok;
  }

  const controller = new AbortController();

  const timer = setTimeout(
    () => controller.abort(),
    HEALTH_TIMEOUT_MS
  );

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "VLC/3.0.21 LibVLC/3.0.21",
        "Accept": "*/*",
        "Range": "bytes=0-32767"
      }
    });

    if (
      response.status !== 200 &&
      response.status !== 206
    ) {
      clearTimeout(timer);

      try {
        await response.body?.cancel();
      } catch (_) {}

      streamHealthCache.set(url, {
        ok: false,
        checkedAt: Date.now(),
        status: response.status,
        reason: `HTTP_${response.status}`
      });

      console.log(
        `[MAC FAIL] ${getMacFromUrl(url)} HTTP ${response.status}`
      );

      return false;
    }

    let bytes = 0;
    let firstChunk = Buffer.alloc(0);

    if (response.body) {
      const reader = response.body.getReader();

      try {
        const result = await reader.read();

        if (result && result.value) {
          firstChunk = Buffer.from(result.value);
          bytes = firstChunk.length;
        }
      } finally {
        try {
          await reader.cancel();
        } catch (_) {}

        try {
          reader.releaseLock();
        } catch (_) {}
      }
    }

    clearTimeout(timer);

    const contentType = String(
      response.headers.get("content-type") || ""
    ).toLowerCase();

    const textStart = firstChunk
      .subarray(0, 200)
      .toString("utf8")
      .trim()
      .toLowerCase();

    const html =
      contentType.includes("text/html") ||
      textStart.startsWith("<!doctype html") ||
      textStart.startsWith("<html") ||
      textStart.includes("<body");

    const ok =
      bytes > 0 &&
      !html;

    streamHealthCache.set(url, {
      ok,
      checkedAt: Date.now(),
      status: response.status,
      bytes,
      reason: ok
        ? ""
        : html
          ? "HTML_RESPONSE"
          : "EMPTY_BODY"
    });

    console.log(
      `[MAC ${ok ? "OK" : "FAIL"}] ${getMacFromUrl(url)} ` +
      `${response.status} ${bytes} bytes`
    );

    return ok;

  } catch (error) {
    clearTimeout(timer);

    streamHealthCache.set(url, {
      ok: false,
      checkedAt: Date.now(),
      error:
        error.name === "AbortError"
          ? "TIMEOUT"
          : error.message
    });

    console.log(
      `[MAC FAIL] ${getMacFromUrl(url)} ` +
      `${
        error.name === "AbortError"
          ? "TIMEOUT"
          : error.message
      }`
    );

    return false;
  }
}

async function filterWorkingStreams(streams) {
  const results = await Promise.all(
    streams.map(async stream => {
      if (!isMacStream(stream.url)) {
        return stream;
      }

      return (await checkStream(stream.url))
        ? stream
        : null;
    })
  );

  return results.filter(Boolean);
}

// ==================================================
// VTV TROLL LOGO
// ==================================================

function vtvLogoUrl(number) {
  return `${PUBLIC_BASE}/logo/vtv${number}.svg?v=108`;
}

app.get("/logo/vtv:num.svg", (req, res) => {
  const number = Number(req.params.num);

  if (
    !Number.isInteger(number) ||
    number < 1 ||
    number > 10
  ) {
    return res.status(404).send("Not found");
  }

  const numberSize =
    number === 10
      ? 105
      : 145;

  const numberX =
    number === 10
      ? 465
      : 490;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">

  <rect
    width="600"
    height="600"
    rx="38"
    fill="#ffffff"
  />

  <g transform="translate(25 155) rotate(-3 275 145)">

    <path
      d="M25 30 L135 30 L190 200 L245 30 L345 30 L245 305 L155 305 Z"
      fill="#e71928"
      stroke="#111"
      stroke-width="7"
    />

    <path
      d="M210 30 L330 30 L375 195 L420 30 L515 30 L420 305 L330 305 Z"
      fill="#11984a"
      stroke="#111"
      stroke-width="7"
    />

    <path
      d="M375 30 L475 30 L505 160 L545 30 L590 30 L525 305 L445 305 Z"
      fill="#1253b7"
      stroke="#111"
      stroke-width="7"
    />

    <ellipse
      cx="173"
      cy="135"
      rx="17"
      ry="11"
      fill="white"
      stroke="#111"
      stroke-width="5"
    />

    <ellipse
      cx="218"
      cy="132"
      rx="17"
      ry="11"
      fill="white"
      stroke="#111"
      stroke-width="5"
    />

    <circle
      cx="178"
      cy="136"
      r="4"
      fill="#111"
    />

    <circle
      cx="213"
      cy="133"
      r="4"
      fill="#111"
    />

    <path
      d="M150 180 Q195 235 240 178 Q200 255 150 180"
      fill="white"
      stroke="#111"
      stroke-width="6"
    />

    <ellipse
      cx="344"
      cy="135"
      rx="17"
      ry="11"
      fill="white"
      stroke="#111"
      stroke-width="5"
    />

    <ellipse
      cx="389"
      cy="132"
      rx="17"
      ry="11"
      fill="white"
      stroke="#111"
      stroke-width="5"
    />

    <circle
      cx="349"
      cy="136"
      r="4"
      fill="#111"
    />

    <circle
      cx="384"
      cy="133"
      r="4"
      fill="#111"
    />

    <path
      d="M320 180 Q365 235 410 178 Q370 255 320 180"
      fill="white"
      stroke="#111"
      stroke-width="6"
    />

  </g>

  <text
    x="${numberX}"
    y="470"
    text-anchor="middle"
    fill="#e71928"
    stroke="#111111"
    stroke-width="5"
    paint-order="stroke"
    font-family="Arial Black,Arial,sans-serif"
    font-size="${numberSize}"
    font-weight="900"
    transform="rotate(-7 ${numberX} 470)"
  >
    ${number}
  </text>

  <circle
    cx="${numberX - 22}"
    cy="420"
    r="10"
    fill="white"
    stroke="#111"
    stroke-width="4"
  />

  <circle
    cx="${numberX + 22}"
    cy="416"
    r="10"
    fill="white"
    stroke="#111"
    stroke-width="4"
  />

  <circle
    cx="${numberX - 19}"
    cy="421"
    r="3"
    fill="#111"
  />

  <circle
    cx="${numberX + 19}"
    cy="417"
    r="3"
    fill="#111"
  />

</svg>
`;

  res.set(
    "Content-Type",
    "image/svg+xml; charset=utf-8"
  );

  res.set(
    "Cache-Control",
    "public,max-age=86400"
  );

  res.send(svg);
});

// ==================================================
// CHANNEL MAP
// ==================================================

const channelMap =
  Object.fromEntries(
    channels.map(
      channel => [
        channel.id,
        channel
      ]
    )
  );

// ==================================================
// LIVE POSTER
// ==================================================

const imageCache =
  new Map();

async function toDataUri(url) {
  if (imageCache.has(url)) {
    return imageCache.get(url);
  }

  const response =
    await fetch(
      url,
      {
        redirect: "follow",

        headers: {
          "User-Agent":
            "Mozilla/5.0 LiveTV/1.0.8"
        }
      }
    );

  if (!response.ok) {
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

    if (!match) {
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
        await Promise.all([
          toDataUri(
            match.homeLogo
          ),

          toDataUri(
            match.awayLogo
          )
        ]);

      const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">

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
        "image/svg+xml; charset=utf-8"
      );

      res.set(
        "Cache-Control",
        "public,max-age=21600"
      );

      res.send(svg);

    } catch (error) {

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
        (
          groupOrder[a.group] ||
          99
        ) -
        (
          groupOrder[b.group] ||
          99
        )
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
    String(
      a.time
    ).localeCompare(
      String(
        b.time
      )
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
// POSTER HELPERS
// ==================================================

function liveName(
  match
) {
  return (
    `${match.time} • ` +
    `${match.home} vs ${match.away}`
  );
}

function channelPoster(
  channel
) {

  if (
    channel.group ===
    "vtv"
  ) {

    const number =
      Number(
        String(
          channel.id
        ).replace(
          "vtv",
          ""
        )
      );

    return vtvLogoUrl(
      number
    );
  }

  return normalizedPng(
    channel.logo
  );
}

function livePoster(
  match
) {
  return normalizedPng(
    `${PUBLIC_BASE}/poster/live/${match.id}.svg?v=108`
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
      ? (
          match.channels4k ||
          []
        )
      : (
          match.channels1080 ||
          []
        );

  const streams = [];

  ids.forEach(
    id => {

      const channel =
        channelMap[
          id
        ];

      if (
        !channel ||
        !Array.isArray(
          channel.streams
        )
      ) {
        return;
      }

      channel.streams.forEach(
        (
          url,
          index
        ) => {

          const mac =
            getMacFromUrl(
              url
            );

          streams.push({
            name:
              channel.name,

            title:
              isMacStream(
                url
              )
                ? `${channel.name} • MAC ${mac} • ${index + 1}`
                : `${channel.name} • ${index + 1}`,

            url
          });
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
        ? String(
            args.extra.search
          )
            .toLowerCase()
            .trim()
        : "";

    if (
      args.id ===
      "live1080"
    ) {

      let list =
        matches.filter(
          m =>
            Array.isArray(
              m.channels1080
            ) &&
            m.channels1080.length >
              0
        );

      if (search) {
        list =
          list.filter(
            m =>
              liveName(
                m
              )
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
                liveName(
                  m
                ),

              poster:
                livePoster(
                  m
                ),

              posterShape:
                "square",

              description:
                `${m.date} • 1080P / FHD`
            })
          )
      };
    }

    if (
      args.id ===
      "live4k"
    ) {

      let list =
        matches.filter(
          m =>
            Array.isArray(
              m.channels4k
            ) &&
            m.channels4k.length >
              0
        );

      if (search) {
        list =
          list.filter(
            m =>
              liveName(
                m
              )
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
                liveName(
                  m
                ),

              poster:
                livePoster(
                  m
                ),

              posterShape:
                "square",

              description:
                `${m.date} • UHD / 4K`
            })
          )
      };
    }

    let list =
      channels.filter(
        c =>
          c.group ===
          args.id
      );

    if (search) {
      list =
        list.filter(
          c =>
            String(
              c.name
            )
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

      if (!match) {
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

    if (!channel) {
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

      if (!match) {
        return {
          streams:
            []
        };
      }

      const allStreams =
        liveStreams(
          match,
          is4k
            ? "4k"
            : "1080"
        );

      const workingStreams =
        await filterWorkingStreams(
          allStreams
        );

      console.log(
        `[LIVE] ${match.home} vs ${match.away}: ` +
        `${workingStreams.length}/${allStreams.length} working`
      );

      return {
        streams:
          workingStreams
      };
    }

    const channel =
      channelMap[
        args.id
      ];

    if (!channel) {
      return {
        streams:
          []
      };
    }

    const allStreams =
      (
        channel.streams ||
        []
      ).map(
        (
          url,
          index
        ) => {

          const mac =
            getMacFromUrl(
              url
            );

          return {
            name:
              channel.name,

            title:
              isMacStream(
                url
              )
                ? `${channel.name} • MAC ${mac} • ${index + 1}`
                : `${channel.name} • ${index + 1}`,

            url
          };
        }
      );

    const workingStreams =
      await filterWorkingStreams(
        allStreams
      );

    console.log(
      `[CHANNEL] ${channel.name}: ` +
      `${workingStreams.length}/${allStreams.length} working`
    );

    return {
      streams:
        workingStreams
    };
  }
);

// ==================================================
// HEALTH PAGE
// ==================================================

app.get(
  "/health",
  (
    req,
    res
  ) => {

    const rows = [];

    for (
      const [
        url,
        info
      ] of
      streamHealthCache.entries()
    ) {

      rows.push({
        mac:
          getMacFromUrl(
            url
          ),

        ok:
          info.ok,

        status:
          info.status ||
          "",

        error:
          info.error ||
          info.reason ||
          "",

        checkedAt:
          new Date(
            info.checkedAt
          ).toLocaleString(
            "vi-VN",
            {
              timeZone:
                "Asia/Ho_Chi_Minh"
            }
          )
      });
    }

    rows.sort(
      (
        a,
        b
      ) =>
        a.mac.localeCompare(
          b.mac
        )
    );

    const htmlRows =
      rows.length
        ? rows
            .map(
              row => `
<tr>
  <td>${escapeXml(row.mac)}</td>
  <td>${row.ok ? "✅ OK" : "❌ FAIL"}</td>
  <td>${escapeXml(row.status)}</td>
  <td>${escapeXml(row.error)}</td>
  <td>${escapeXml(row.checkedAt)}</td>
</tr>
`
            )
            .join("")
        : `
<tr>
  <td colspan="5">
    Chưa có dữ liệu. Hãy mở một kênh MAC trước.
  </td>
</tr>
`;

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
MAC Health
</title>

<style>

body {
  background:#11151c;
  color:#fff;
  font-family:Arial,sans-serif;
  padding:24px;
}

table {
  width:100%;
  border-collapse:collapse;
}

th,
td {
  border:1px solid #444;
  padding:10px;
  text-align:left;
}

th {
  background:#222a35;
}

</style>

</head>

<body>

<h1>
MAC Stream Health
</h1>

<p>
Cache: 5 phút
</p>

<table>

<thead>

<tr>
  <th>MAC</th>
  <th>Trạng thái</th>
  <th>HTTP</th>
  <th>Lỗi</th>
  <th>Kiểm tra lúc</th>
</tr>

</thead>

<tbody>

${htmlRows}

</tbody>

</table>

</body>

</html>
`);
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

    const healthUrl =
      `${req.protocol}://${req.get("host")}/health`;

    const live1080 =
      matches.filter(
        m =>
          Array.isArray(
            m.channels1080
          ) &&
          m.channels1080.length >
            0
      ).length;

    const live4k =
      matches.filter(
        m =>
          Array.isArray(
            m.channels4k
          ) &&
          m.channels4k.length >
            0
      ).length;

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

    const totalStreams =
      channels.reduce(
        (
          total,
          channel
        ) =>
          total +
          (
            channel.streams ||
            []
          ).length,
        0
      );

    const macStreams =
      channels.reduce(
        (
          total,
          channel
        ) =>
          total +
          (
            channel.streams ||
            []
          )
            .filter(
              isMacStream
            )
            .length,
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

<p>
Luồng MAC:
<b>${macStreams}</b>
</p>

<p>
MAC Health:
<br>
${healthUrl}
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

    console.log(
      "MAC health check enabled"
    );
  }
);
