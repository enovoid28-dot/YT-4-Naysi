import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {feature} from 'topojson-client';
import {EPISODE} from '../src/oklo/episode.mjs';
import {CUES} from '../src/oklo/cues.mjs';
import {ensureFonts} from '../src/engine/fonts.mjs';
import {ffmpegPath} from '../src/engine/ffmpeg.mjs';
const ff=ffmpegPath(),require=createRequire(import.meta.url);
fs.mkdirSync('out',{recursive:true});fs.mkdirSync('public/audio',{recursive:true});fs.mkdirSync('public/fonts',{recursive:true});
await ensureFonts();for(const font of ['PJS700','PJS800','IT800','MONO6','FR700'])fs.copyFileSync(`.fonts/${font}.ttf`,`public/fonts/${font}.ttf`);
const words=JSON.parse(fs.readFileSync('src/oklo/words.json'));
const measured=EPISODE.scenes.map(s=>{
 const raw=execFileSync(ff,['-v','error','-i',`voice/ep34/${s.id}.mp3`,'-ar','24000','-ac','1','-f','f32le','-'],{maxBuffer:8e6});
 const a=new Float32Array(raw.buffer,raw.byteOffset,raw.length/4),env=[];
 for(let i=0;i<a.length;i+=240){let sum=0;for(let j=i;j<Math.min(i+240,a.length);j++)sum+=a[j]**2;env.push(Math.sqrt(sum/240));}
 const first=env.findIndex(x=>x>.006)*.01,last=(env.findLastIndex(x=>x>.006)+1)*.01;
 return {...s,trimStart:Math.max(0,first-.09),trimEnd:Math.min(a.length/24000,last+.14)};
});
const rawLength=measured.reduce((n,s)=>n+s.trimEnd-s.trimStart+.1,0);
const rate=Math.max(1,rawLength/177.7);
let cursor=0;
const scenes=measured.map(s=>{
 const frames=Math.ceil(((s.trimEnd-s.trimStart)/rate+.1)*90),duration=frames/90;
 const tx=t=>Math.max(0,(t-s.trimStart)/rate);
 if(CUES[s.index].map(c=>c[1]).join(' ')!==s.text)throw Error(`transcript mismatch ${s.id}`);
 const cards=words[s.id].map((c,i)=>({text:c.text,from:tx(CUES[s.index][i][0])-.035,to:i+1<words[s.id].length?tx(CUES[s.index][i+1][0])-.035:duration-.08,words:c.words.map(w=>({...w,start:tx(w.start),end:tx(w.end)}))}));
 cards.forEach((c,i)=>{c.from=Math.max(0,c.from);for(let k=0;k<c.words.length;k++){let w=c.words[k];w.start=Math.max(c.from,Math.min(c.to-.015,w.start));w.end=Math.max(w.start+.01,Math.min(c.to,w.end));if(k&&w.start<c.words[k-1].end)w.start=c.words[k-1].end;w.end=Math.max(w.end,w.start+.01);}});
 execFileSync(ff,['-y','-v','error','-i',`voice/ep34/${s.id}.mp3`,'-af',`atrim=start=${s.trimStart}:end=${s.trimEnd},asetpts=PTS-STARTPTS,atempo=${rate},highpass=f=75,equalizer=f=210:width_type=q:w=1:g=-2,acompressor=threshold=-20dB:ratio=2:attack=8:release=120,loudnorm=I=-15:TP=-2.5:LRA=7,aresample=48000,apad,atrim=duration=${duration}`,'-ac','2',`out/oklo-${s.id}.flac`]);
 const result={...s,start:cursor/90,startFrame:cursor,frames,duration,cards};cursor+=frames;console.log(s.id,duration.toFixed(3),cards.length,'cards');return result;
});
const timeline={...EPISODE,rate,scenes,frames:cursor,duration:cursor/90};
if(timeline.duration<=120||timeline.duration>=180)throw Error('duration outside user range');
fs.writeFileSync('src/oklo/timeline.json',JSON.stringify(timeline,null,2)+'\n');
fs.writeFileSync('out/oklo-audio.txt',scenes.map(s=>`file '${process.cwd()}/out/oklo-${s.id}.flac'`).join('\n'));
execFileSync(ff,['-y','-v','error','-f','concat','-safe','0','-i','out/oklo-audio.txt','-af','asetpts=N/SR/TB','-c:a','flac','out/oklo-voice.flac']);
// Natural Earth country boundaries: data, not generated imagery.
const world=require('world-atlas/countries-110m.json');
const geo=feature(world,world.objects.countries);
fs.writeFileSync('src/oklo/map.json',JSON.stringify(geo.features.filter(f=>f.geometry.coordinates.flat(4).some(()=>true)).map(f=>({name:f.properties.name,id:f.id,geometry:f.geometry}))));
console.log('TOTAL',timeline.duration,'seconds',cursor,'frames; voice rate',rate.toFixed(4));
