const { addonBuilder, getRouter } = require("stremio-addon-sdk");
const express = require("express");
const { channels: baseChannels } = require("./channels");
const { tntChannels } = require("./tnt-channels");
const matches = require("./live.json");

const channels = [...baseChannels, ...tntChannels];
const app = express();
const PORT = process.env.PORT || 7000;
const PUBLIC_BASE = process.env.PUBLIC_BASE_URL || "https://m3u-sports-tv.onrender.com";
const VERSION = "1.0.12";

function normalizedPng(url) {
  if (!url) return null;
  return "https://images.weserv.nl/?url=" + encodeURIComponent(url) + "&w=600&h=600&fit=contain&bg=11151c&output=png&q=92&v=112";
}
function escapeXml(value) { return String(value).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&apos;"); }
function vtvLogoUrl(number) { return `${PUBLIC_BASE}/logo/vtv${number}.svg?v=112`; }

app.get("/logo/vtv:num.svg", (req,res) => {
  const number=Number(req.params.num);
  if(!Number.isInteger(number)||number<1||number>10) return res.status(404).send("Not found");
  const numberSize=number===10?105:145, numberX=number===10?465:490;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="600" height="600" rx="38" fill="#fff"/><g transform="translate(25 155) rotate(-3 275 145)"><path d="M25 30 L135 30 L190 200 L245 30 L345 30 L245 305 L155 305 Z" fill="#e71928" stroke="#111" stroke-width="7"/><path d="M210 30 L330 30 L375 195 L420 30 L515 30 L420 305 L330 305 Z" fill="#11984a" stroke="#111" stroke-width="7"/><path d="M375 30 L475 30 L505 160 L545 30 L590 30 L525 305 L445 305 Z" fill="#1253b7" stroke="#111" stroke-width="7"/></g><text x="${numberX}" y="470" text-anchor="middle" fill="#e71928" stroke="#111" stroke-width="5" paint-order="stroke" font-family="Arial Black,Arial,sans-serif" font-size="${numberSize}" font-weight="900">${number}</text></svg>`;
  res.set("Content-Type","image/svg+xml; charset=utf-8"); res.set("Cache-Control","public,max-age=86400"); res.send(svg);
});

const channelMap=Object.fromEntries(channels.map(c=>[c.id,c]));
const imageCache=new Map();
async function toDataUri(url){if(imageCache.has(url))return imageCache.get(url);const response=await fetch(url,{redirect:"follow",headers:{"User-Agent":"Mozilla/5.0 LiveTV/1.0.12"}});if(!response.ok)throw new Error(`HTTP ${response.status}`);const type=response.headers.get("content-type")||"image/png";const buffer=Buffer.from(await response.arrayBuffer());const data=`data:${type};base64,${buffer.toString("base64")}`;imageCache.set(url,data);return data;}

app.get("/poster/live/:id.svg",async(req,res)=>{const match=matches.find(m=>m.id===req.params.id);if(!match)return res.status(404).send("Not found");try{const[home,away]=await Promise.all([toDataUri(match.homeLogo),toDataUri(match.awayLogo)]);const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="600" height="600" rx="38" fill="#11151c"/><image href="${home}" x="70" y="155" width="185" height="185"/><image href="${away}" x="345" y="155" width="185" height="185"/><text x="300" y="260" text-anchor="middle" fill="#fff" font-size="32" font-family="Arial" font-weight="800">VS</text><text x="300" y="430" text-anchor="middle" fill="#fff" font-size="46" font-family="Arial" font-weight="800">${escapeXml(match.time)}</text><text x="300" y="490" text-anchor="middle" fill="#aab2bf" font-size="24" font-family="Arial">${escapeXml(match.date)}</text></svg>`;res.set("Content-Type","image/svg+xml; charset=utf-8");res.set("Cache-Control","public,max-age=21600");res.send(svg);}catch(error){console.error("LIVE POSTER ERROR:",match.id,error.message);res.status(500).send("Poster error");}});

const groupOrder={vtv:1,sports1080:2,sports4k:3,tnt:4,peacock:5};
channels.sort((a,b)=>{if(a.group!==b.group)return(groupOrder[a.group]||99)-(groupOrder[b.group]||99);if(a.group==="peacock"){const an=Number(String(a.id).replace("peacock-event-","")),bn=Number(String(b.id).replace("peacock-event-",""));return an-bn;}return String(a.name).localeCompare(String(b.name),"en",{sensitivity:"base",numeric:true});});
matches.sort((a,b)=>String(a.time).localeCompare(String(b.time)));

const live1080Available=matches.some(m=>Array.isArray(m.channels1080)&&m.channels1080.length>0);
const live4kAvailable=matches.some(m=>Array.isArray(m.channels4k)&&m.channels4k.length>0);
const live1080Catalog={type:"tv",id:"live1080",name:"🔴 LIVE • 1080P / FHD",extra:[{name:"search",isRequired:false}]};
const live4kCatalog={type:"tv",id:"live4k",name:"🏆 LIVE • UHD / 4K",extra:[{name:"search",isRequired:false}]};
const catalog=(id,name)=>({type:"tv",id,name,extra:[{name:"search",isRequired:false}]});

const manifest={id:"com.hmtnvac.livetv",version:VERSION,name:"Live TV",description:"Live Football • Sports 1080P • Sports UHD / 4K • TNT Sports • VTV • Peacock Event",resources:["catalog","meta","stream"],types:["tv"],catalogs:[...(live1080Available?[live1080Catalog]:[]),...(live4kAvailable?[live4kCatalog]:[]),catalog("vtv","🇻🇳 VTV"),catalog("sports1080","📺 Sports 1080P • 60 FPS"),catalog("sports4k","🏆 Sports UHD / 4K"),catalog("tnt","💥 TNT Sports"),catalog("peacock","🇺🇸 Peacock Event FHD • 60 FPS")]};
const builder=new addonBuilder(manifest);

function liveName(match){return `${match.time} • ${match.home} vs ${match.away}`;}
function channelPoster(channel){if(channel.group==="vtv"){const number=Number(String(channel.id).replace("vtv",""));return vtvLogoUrl(number);}return normalizedPng(channel.logo);}
function livePoster(match){return normalizedPng(`${PUBLIC_BASE}/poster/live/${match.id}.svg?v=112`);}
function descriptionFor(channel){if(channel.group==="vtv")return"VTV • Truyền hình Việt Nam";if(channel.group==="peacock")return channel.name;if(channel.group==="tnt")return `TNT Sports • ${channel.streams.length} luồng`;if(channel.group==="sports1080")return `Sports • 1080P / FHD • ${channel.streams.length} luồng`;return `Sports • UHD / 4K • ${channel.streams.length} luồng`;}
function liveStreams(match,quality){const ids=quality==="4k"?(match.channels4k||[]):(match.channels1080||[]),streams=[];ids.forEach(id=>{const channel=channelMap[id];if(!channel||!Array.isArray(channel.streams))return;channel.streams.forEach((url,index)=>streams.push({name:channel.name,title:`${channel.name} • ${index+1}`,url}));});return streams;}

builder.defineCatalogHandler(async args=>{const search=args.extra&&args.extra.search?String(args.extra.search).toLowerCase().trim():"";if(args.id==="live1080"||args.id==="live4k"){const is4k=args.id==="live4k";let list=matches.filter(m=>Array.isArray(is4k?m.channels4k:m.channels1080)&&(is4k?m.channels4k:m.channels1080).length>0);if(search)list=list.filter(m=>liveName(m).toLowerCase().includes(search));return{metas:list.map(m=>({id:`live-${m.id}-${is4k?"4k":"1080"}`,type:"tv",name:liveName(m),poster:livePoster(m),posterShape:"square",description:`${m.date} • ${is4k?"UHD / 4K":"1080P / FHD"}`}))};}let list=channels.filter(c=>c.group===args.id);if(search)list=list.filter(c=>String(c.name).toLowerCase().includes(search));return{metas:list.map(channel=>({id:channel.id,type:"tv",name:channel.name,poster:channelPoster(channel),posterShape:"square",description:descriptionFor(channel)}))};});

builder.defineMetaHandler(async args=>{if(args.id.startsWith("live-")){const is4k=args.id.endsWith("-4k"),suffix=is4k?"-4k":"-1080",base=args.id.slice(5,-suffix.length),match=matches.find(m=>m.id===base);if(!match)return{meta:null};return{meta:{id:args.id,type:"tv",name:liveName(match),poster:livePoster(match),posterShape:"square",description:`${match.date} • ${is4k?"UHD / 4K":"1080P / FHD"}`}};}const channel=channelMap[args.id];if(!channel)return{meta:null};return{meta:{id:channel.id,type:"tv",name:channel.name,poster:channelPoster(channel),posterShape:"square",description:descriptionFor(channel)}};});

builder.defineStreamHandler(async args=>{if(args.id.startsWith("live-")){const is4k=args.id.endsWith("-4k"),suffix=is4k?"-4k":"-1080",base=args.id.slice(5,-suffix.length),match=matches.find(m=>m.id===base);if(!match)return{streams:[]};return{streams:liveStreams(match,is4k?"4k":"1080")};}const channel=channelMap[args.id];if(!channel)return{streams:[]};return{streams:(channel.streams||[]).map((url,index)=>({name:channel.name,title:`${channel.name} • ${index+1}`,url}))};});

app.get("/",(req,res)=>{const manifestUrl=`${req.protocol}://${req.get("host")}/manifest.json`;const count=g=>channels.filter(c=>c.group===g).length;const live1080=matches.filter(m=>Array.isArray(m.channels1080)&&m.channels1080.length>0).length,live4k=matches.filter(m=>Array.isArray(m.channels4k)&&m.channels4k.length>0).length,totalStreams=channels.reduce((t,c)=>t+(c.streams||[]).length,0);res.send(`<!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Live TV</title></head><body style="background:#111;color:white;font-family:Arial;padding:30px;line-height:1.7"><h1>📺 Live TV</h1><p>Version: <b>${VERSION}</b></p>${live1080?`<p>🔴 LIVE 1080P: <b>${live1080}</b></p>`:""}${live4k?`<p>🏆 LIVE 4K: <b>${live4k}</b></p>`:""}<p>🇻🇳 VTV: <b>${count("vtv")}</b></p><p>📺 Sports 1080P: <b>${count("sports1080")}</b></p><p>🏆 Sports UHD / 4K: <b>${count("sports4k")}</b></p><p>💥 TNT Sports: <b>${count("tnt")}</b></p><p>🇺🇸 Peacock Event: <b>${count("peacock")}</b></p><p>Tổng kênh: <b>${channels.length}</b></p><p>Tổng luồng: <b>${totalStreams}</b></p><hr><p>Manifest:<br>${manifestUrl}</p></body></html>`);});

app.use("/",getRouter(builder.getInterface()));
app.listen(PORT,"0.0.0.0",()=>{console.log(`Live TV ${VERSION} running on port ${PORT}`);console.log(`Channels: ${channels.length}`);console.log(`Live matches: ${matches.length}`);});
