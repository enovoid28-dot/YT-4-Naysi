import fs from 'node:fs';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createCanvas} from '@napi-rs/canvas';
import {ensureFonts} from '../engine/fonts.mjs';
import {ffmpegPath} from '../engine/ffmpeg.mjs';
import {draw,initAssets} from './draw.mjs';
const tl=JSON.parse(fs.readFileSync(new URL('./timeline.json',import.meta.url)));
const args=process.argv.slice(2),arg=(key,def)=>{const i=args.indexOf(`--${key}`);return i<0?def:args[i+1];};
await ensureFonts();initAssets(createCanvas);
const canvas=createCanvas(tl.width,tl.height),ctx=canvas.getContext('2d');
fs.mkdirSync('out',{recursive:true});
if(args.includes('--stills')){for(const t of [1,10,20,30,40,50,60,70].filter(t=>t<tl.duration)){draw(ctx,t,tl);fs.writeFileSync(`out/ep33-${t}.jpg`,canvas.toBuffer('image/jpeg',85));}process.exit(0);}
const from=+arg('from',0),to=Math.min(tl.frames,+arg('to',tl.frames));
const output=arg('out','out/ep33-silent.mp4');
const ff=spawn(ffmpegPath(),['-y','-hide_banner','-loglevel','error','-f','rawvideo','-pix_fmt','rgba','-s',`${tl.width}x${tl.height}`,'-r',`${tl.fps}`,'-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','20','-maxrate','7400k','-bufsize','14800k','-pix_fmt','yuv420p','-threads','2','-movflags','+faststart',output],{stdio:['pipe','inherit','inherit']});
const exit=once(ff,'close');
ff.stdin.on('error',err=>{console.error(err);process.exitCode=1;});
for(let frame=from;frame<to;frame++){
  draw(ctx,frame/tl.fps,tl);
  if(!ff.stdin.write(canvas.data()))await once(ff.stdin,'drain');
  if(frame%450===0)console.log(`${frame}/${to} ${(frame/tl.fps).toFixed(1)}s`);
}
ff.stdin.end();const [code]=await exit;if(code!==0)throw Error(`ffmpeg exit ${code}`);console.log('RENDER COMPLETE',output);
