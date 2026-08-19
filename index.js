// ==================================================
// LOGO KÊNH
// ==================================================

const WIKI = file =>
  "https://commons.wikimedia.org/wiki/Special:Redirect/file/" +
  encodeURIComponent(file) +
  "?width=500";

const LOGOS = {

  // VTV
  "vtv1": WIKI("VTV1 logo 2013 final.svg"),
  "vtv2": WIKI("VTV2 logo 2013 final.svg"),
  "vtv3": WIKI("VTV3 logo 2013 final.svg"),
  "vtv4": WIKI("VTV4 logo 2013 final.svg"),
  "vtv5": WIKI("VTV5 logo 2013 final.svg"),
  "vtv6": WIKI("VTV6 logo 2026 final.svg"),
  "vtv7": WIKI("VTV7 logo 2016 final.svg"),
  "vtv8": WIKI("VTV8 logo 2016 final.svg"),
  "vtv9": WIKI("VTV9 logo 2013 final.svg"),
  "vtv10": WIKI("Vietnam Television logo from 2013.svg"),

  // 1080p / 60 FPS
  "cbs-sports-1080":
    WIKI("CBS Sports (2021).svg"),

  "nbc-sports-1080":
    WIKI("NBC Sports logo (2020).svg"),

  "now-sports-1080":
    "https://tvlogo.org/hong-kong/now-sports-hk.png",

  "sportsnet-one-ca-1080":
    WIKI("Logo Sportsnet 2011.svg"),

  "usa-network-1080":
    WIKI("USA-Network-Logo.svg"),

  "universo-1080":
    WIKI("NBC Universo logo.svg"),

  // Sky Sports FHD
  "sky-sports-main-event-fhd":
    WIKI("Sky Sports 2026.svg"),

  "sky-sports-premier-league-fhd":
    WIKI("Sky Sports 2026.svg"),

  // UHD / 4K
  "bein-sports-uhd":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Logo_beIN_SPORTS_2017.png/500px-Logo_beIN_SPORTS_2017.png",

  "digi-sport-uhd":
    WIKI("DIGI Sport 1.svg"),

  "eleven-sports-1-uhd":
    WIKI("ELEVEN SPORTS Logo.svg"),

  "sky-sports-1-uhd":
    WIKI("Sky Sports 2026.svg"),

  "sky-sports-2-uhd":
    WIKI("Sky Sports 2026.svg"),

  "sky-sports-bundesliga-uhd":
    WIKI("Sky Sports 2026.svg"),

  "sky-sports-darts-uhd":
    WIKI("Sky Sports 2026.svg"),

  "sky-sports-f1-uhd":
    WIKI("Sky Sports 2026.svg"),

  "sky-sports-main-event":
    WIKI("Sky Sports 2026.svg"),

  "sky-sports-uhd":
    WIKI("Sky Sports 2026.svg"),

  "tf1-hdr-uhd":
    WIKI("TF1 logo 2013.svg"),

  "tnt-sports-uhd":
    WIKI("TNT Sports 2024 vector logo.svg"),

  "tnt-sports-ultimate-uhd":
    WIKI("TNT Sports 2024 vector logo.svg"),

  "v-sport-plus-uhd":
    WIKI("V Sport 1 Logo 01.png")
};
