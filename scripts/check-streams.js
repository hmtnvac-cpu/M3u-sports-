const fs = require("fs");
const { execFile } = require("child_process");
const ffprobePath = require("ffprobe-static").path;
const ffmpegPath = require("ffmpeg-static");
const { channels } = require("../channels");

const CONCURRENCY = Number(process.env.STREAM_CONCURRENCY || 3);
const MAG_UA = "Mozilla/5.0 (QtEmbedded; U; Linux; C) MAG200 stbapp";
const ALT_UA = "VLC/3.0.21 LibVLC/3.0.21";

function hostOf(url) {
  try { return new URL(url).host; } catch { return "invalid-url"; }
}
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
function fps(v) {
  if (!v || v === "0/0") return null;
  if (String(v).includes("/")) {
    const [a,b] = String(v).split("/").map(Number);
    return b ? Math.round((a / b) * 100) / 100 : null;
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function quality(w,h) {
  if (!w || !h) return null;
  if (h >= 2160 || w >= 3840) return "4K/UHD";
  if (h >= 1080 || w >= 1920) return "FHD";
  if (h >= 720 || w >= 1280) return "HD";
  return "SD";
}
function speed(ms) {
  if (ms == null) return null;
  if (ms < 2000) return "FAST";
  if (ms <= 5000) return "NORMAL";
  return "SLOW";
}
function emptyVideo() {
  return { detected:false, quality:null, width:null, height:null, fps:null, codec:null, bitrate:null };
}

function runProbe(url,{deep=false,ua=MAG_UA}={}) {
  return new Promise(resolve => {
    const started = Date.now();
    const args = ["-v","error","-user_agent",ua,"-rw_timeout",deep?"18000000":"7000000"];
    if (deep) {
      args.push("-analyzeduration","15000000","-probesize","16000000");
      if (/[?&]extension=ts(?:&|$)/i.test(url) || /\.ts(?:\?|$)/i.test(url)) args.push("-f","mpegts");
    }
    args.push("-select_streams","v:0","-show_entries","stream=width,height,codec_name,r_frame_rate,avg_frame_rate,bit_rate","-of","json",url);
    execFile(ffprobePath,args,{timeout:deep?22000:10000,maxBuffer:2*1024*1024},(error,stdout)=>{
      const ms=Date.now()-started;
      if(error) return resolve({verified:false,startupMs:ms,video:emptyVideo()});
      try{
        const s=JSON.parse(stdout||"{}")?.streams?.[0];
        if(!s) throw new Error("No video stream");
        const width=Number(s.width)||null,height=Number(s.height)||null,detected=Boolean(width&&height);
        resolve({verified:detected,startupMs:ms,video:{detected,quality:quality(width,height),width,height,fps:fps(s.avg_frame_rate||s.r_frame_rate),codec:s.codec_name?String(s.codec_name).toUpperCase():null,bitrate:Number(s.bit_rate)||null}});
      }catch{ resolve({verified:false,startupMs:ms,video:emptyVideo()}); }
    });
  });
}

function decodeFrames(url,{ua=MAG_UA}={}) {
  return new Promise(resolve=>{
    const started=Date.now();
    const args=["-v","error","-user_agent",ua,"-rw_timeout","15000000","-i",url,"-map","0:v:0","-t","3","-frames:v","24","-f","null","-"];
    execFile(ffmpegPath,args,{timeout:20000,maxBuffer:2*1024*1024},(error,stdout,stderr)=>{
      const ms=Date.now()-started;
      resolve({decoded:!error,startupMs:ms,detail:error?String(stderr||error.message||"").slice(0,240):null});
    });
  });
}

async function firstByte(url,ua=MAG_UA) {
  const started=Date.now();
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),10000);
  try{
    const r=await fetch(url,{method:"GET",redirect:"follow",signal:controller.signal,headers:{"User-Agent":ua,Accept:"*/*"}});
    if(!(r.status>=200&&r.status<400)||!r.body) return {ok:false,httpStatus:r.status,ms:Date.now()-started};
    const reader=r.body.getReader();
    const {value}=await reader.read();
    try{await reader.cancel();}catch{}
    return {ok:Boolean(value&&value.byteLength),httpStatus:r.status,ms:Date.now()-started};
  }catch{return {ok:false,httpStatus:null,ms:Date.now()-started};}
  finally{clearTimeout(timer);}
}

async function inspectStream(url){
  const attempts=[];

  const p1=await runProbe(url,{deep:false,ua:MAG_UA});
  attempts.push({stage:"ffprobe-fast-mag",ok:p1.verified,ms:p1.startupMs});
  if(p1.verified) return {state:"VERIFIED_PLAYABLE",method:"ffprobe-fast-mag",startupMs:p1.startupMs,startupSeconds:Math.round(p1.startupMs/10)/100,speed:speed(p1.startupMs),video:p1.video,attempts};

  const p2=await runProbe(url,{deep:true,ua:MAG_UA});
  attempts.push({stage:"ffprobe-deep-mag",ok:p2.verified,ms:p2.startupMs});
  if(p2.verified) return {state:"VERIFIED_PLAYABLE",method:"ffprobe-deep-mag",startupMs:p2.startupMs,startupSeconds:Math.round(p2.startupMs/10)/100,speed:speed(p2.startupMs),video:p2.video,attempts};

  const d1=await decodeFrames(url,{ua:MAG_UA});
  attempts.push({stage:"ffmpeg-decode-mag",ok:d1.decoded,ms:d1.startupMs});
  if(d1.decoded) return {state:"VERIFIED_PLAYABLE",method:"ffmpeg-decode-mag",startupMs:d1.startupMs,startupSeconds:Math.round(d1.startupMs/10)/100,speed:speed(d1.startupMs),video:emptyVideo(),attempts};

  await sleep(1200);
  const p3=await runProbe(url,{deep:true,ua:ALT_UA});
  attempts.push({stage:"ffprobe-deep-vlc",ok:p3.verified,ms:p3.startupMs});
  if(p3.verified) return {state:"VERIFIED_PLAYABLE",method:"ffprobe-deep-vlc",startupMs:p3.startupMs,startupSeconds:Math.round(p3.startupMs/10)/100,speed:speed(p3.startupMs),video:p3.video,attempts};

  const d2=await decodeFrames(url,{ua:ALT_UA});
  attempts.push({stage:"ffmpeg-decode-vlc",ok:d2.decoded,ms:d2.startupMs});
  if(d2.decoded) return {state:"VERIFIED_PLAYABLE",method:"ffmpeg-decode-vlc",startupMs:d2.startupMs,startupSeconds:Math.round(d2.startupMs/10)/100,speed:speed(d2.startupMs),video:emptyVideo(),attempts};

  const fb1=await firstByte(url,MAG_UA);
  attempts.push({stage:"first-byte-mag",ok:fb1.ok,ms:fb1.ms,httpStatus:fb1.httpStatus});
  if(fb1.ok) return {state:"RESPONDS",method:"first-byte-mag",startupMs:fb1.ms,startupSeconds:Math.round(fb1.ms/10)/100,speed:speed(fb1.ms),httpStatus:fb1.httpStatus,video:emptyVideo(),attempts};

  await sleep(800);
  const fb2=await firstByte(url,ALT_UA);
  attempts.push({stage:"first-byte-vlc",ok:fb2.ok,ms:fb2.ms,httpStatus:fb2.httpStatus});
  if(fb2.ok) return {state:"RESPONDS",method:"first-byte-vlc",startupMs:fb2.ms,startupSeconds:Math.round(fb2.ms/10)/100,speed:speed(fb2.ms),httpStatus:fb2.httpStatus,video:emptyVideo(),attempts};

  const definite=[fb1.httpStatus,fb2.httpStatus].filter(Boolean);
  const deadConfirmed=definite.length===2&&definite.every(s=>s===404||s===410);
  return {state:deadConfirmed?"DEAD_CONFIRMED":"UNKNOWN",method:null,startupMs:null,startupSeconds:null,speed:null,httpStatus:fb2.httpStatus??fb1.httpStatus??null,video:emptyVideo(),attempts};
}

async function mapLimit(items,limit,fn){
  const out=new Array(items.length);let i=0;
  async function worker(){for(;;){const n=i++;if(n>=items.length)return;out[n]=await fn(items[n],n);}}
  await Promise.all(Array.from({length:Math.min(limit,items.length||1)},worker));
  return out;
}

(async()=>{
  const tasks=[];
  channels.forEach(channel=>(channel.streams||[]).forEach((url,index)=>tasks.push({channelId:channel.id,channelName:channel.name,group:channel.group,sourceIndex:index+1,url})));
  const checked=await mapLimit(tasks,CONCURRENCY,async task=>({...task,host:hostOf(task.url),result:await inspectStream(task.url)}));

  const byChannel=new Map();
  for(const item of checked){
    if(!byChannel.has(item.channelId)) byChannel.set(item.channelId,{id:item.channelId,name:item.channelName,group:item.group,total:0,verifiedPlayable:0,responds:0,unknown:0,deadConfirmed:0,status:"UNKNOWN",sources:[]});
    const c=byChannel.get(item.channelId);c.total+=1;
    if(item.result.state==="VERIFIED_PLAYABLE") c.verifiedPlayable+=1;
    else if(item.result.state==="RESPONDS") c.responds+=1;
    else if(item.result.state==="DEAD_CONFIRMED") c.deadConfirmed+=1;
    else c.unknown+=1;
    c.sources.push({index:item.sourceIndex,host:item.host,state:item.result.state,method:item.result.method,startupMs:item.result.startupMs,startupSeconds:item.result.startupSeconds,speed:item.result.speed,httpStatus:item.result.httpStatus??null,video:item.result.video,attempts:item.result.attempts});
  }

  const results=Array.from(byChannel.values()).map(c=>{
    if(c.verifiedPlayable===c.total)c.status="VERIFIED_PLAYABLE";
    else if(c.verifiedPlayable>0)c.status="PARTIAL_VERIFIED";
    else if(c.responds>0)c.status="RESPONDS";
    else if(c.deadConfirmed===c.total)c.status="DEAD_CONFIRMED";
    else c.status="UNKNOWN";
    return c;
  });

  const summary={checkedAt:new Date().toISOString(),method:"3-stage ffprobe + ffmpeg decode + retry/fallback",concurrency:CONCURRENCY,meaning:{VERIFIED_PLAYABLE:"ffprobe detected video or ffmpeg decoded video frames",PARTIAL_VERIFIED:"at least one source is VERIFIED_PLAYABLE",RESPONDS:"server returned stream bytes but video decode was not confirmed",UNKNOWN:"GitHub runner could not verify; do not treat as dead",DEAD_CONFIRMED:"two final HTTP checks both returned explicit 404/410"},totals:{channels:results.length,streams:tasks.length,verifiedPlayableStreams:results.reduce((n,c)=>n+c.verifiedPlayable,0),respondsStreams:results.reduce((n,c)=>n+c.responds,0),unknownStreams:results.reduce((n,c)=>n+c.unknown,0),deadConfirmedStreams:results.reduce((n,c)=>n+c.deadConfirmed,0),verifiedPlayableChannels:results.filter(c=>c.status==="VERIFIED_PLAYABLE").length,partialVerifiedChannels:results.filter(c=>c.status==="PARTIAL_VERIFIED").length,respondsChannels:results.filter(c=>c.status==="RESPONDS").length,unknownChannels:results.filter(c=>c.status==="UNKNOWN").length,deadConfirmedChannels:results.filter(c=>c.status==="DEAD_CONFIRMED").length},channels:results};

  fs.writeFileSync("stream-health.json",JSON.stringify(summary,null,2)+"\n");
  const lines=["# Stream health (deep verification)","",`Checked: ${summary.checkedAt}`,`Streams VERIFIED_PLAYABLE: ${summary.totals.verifiedPlayableStreams}/${summary.totals.streams}`,`Streams RESPONDS: ${summary.totals.respondsStreams}`,`Streams UNKNOWN: ${summary.totals.unknownStreams}`,`Streams DEAD_CONFIRMED: ${summary.totals.deadConfirmedStreams}`,"","| Channel | Status | VERIFIED | RESPONDS | UNKNOWN | DEAD | Total |","|---|---:|---:|---:|---:|---:|---:|",...results.map(c=>`| ${c.name.replace(/\|/g,"\\|")} | ${c.status} | ${c.verifiedPlayable} | ${c.responds} | ${c.unknown} | ${c.deadConfirmed} | ${c.total} |`)];
  console.log(lines.join("\n"));
  if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,lines.join("\n")+"\n");
})();
