import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {ffmpegPath} from '../src/engine/ffmpeg.mjs';
import {writeFlac} from '../src/audio.mjs';
const ff=ffmpegPath(),tl=JSON.parse(fs.readFileSync('src/oklo/timeline.json')),SR=48000,N=Math.ceil(tl.duration*SR);
const raw=execFileSync(ff,['-v','error','-i','out/oklo-voice.flac','-ar',String(SR),'-ac','2','-f','f32le','-'],{maxBuffer:100e6});
const voice=new Float32Array(raw.buffer,raw.byteOffset,raw.length/4),L=new Float32Array(N),R=new Float32Array(N),TAU=2*Math.PI;
let seed=34851;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const add=(at,dur,fn,gain=.02,pan=0)=>{let start=Math.round(at*SR),end=Math.min(N,start+Math.round(dur*SR));const gl=Math.sqrt((1-pan)/2)*gain,gr=Math.sqrt((1+pan)/2)*gain;for(let i=Math.max(0,start);i<end;i++){const v=fn((i-start)/SR);L[i]+=v*gl;R[i]+=v*gr;}};
const tone=(f,dur,attack=.03)=>t=>Math.sin(TAU*f*t)*(1-Math.exp(-t/attack))*Math.exp(-t*3/dur);
const chords=[[55,82.407,110,130.813],[65.406,98,130.813,164.814],[73.416,110,146.832,174.614],[49,73.416,98,123.471]];
const beat=60/76,bar=beat*4;
for(let b=0;b*bar<tl.duration;b++){
 const at=b*bar,ch=chords[Math.floor(b/2)%chords.length];
 for(let k=0;k<3;k++)add(at,bar*2,t=>Math.sin(TAU*ch[k]*t+Math.sin(t*.8)*.04)*Math.sin(Math.min(1,t/1.5)*Math.PI/2)*Math.max(0,1-t/(bar*2)),.012/(1+k*.7),(k-1)*.45);
 if(b>1)for(let j=0;j<4;j++){const f=ch[(j+b)%4]*4;add(at+j*beat,beat*2,t=>tone(f,1.2,.008)(t)+.12*tone(f*3, .35,.002)(t),.007,j%2?.45:-.45);}
 if(b%2===0)add(at,1,t=>Math.sin(TAU*(45-8*t)*t)*Math.exp(-t*8)*(1-Math.exp(-t*70)),.02);
}
function cue(s,word){const w=s.cards.flatMap(c=>c.words).find(w=>w.text.toLowerCase().replace(/[^a-z]/g,'')===word);return s.start+(w?.start??0);}
for(const s of tl.scenes){
 add(s.start,.22,t=>(rand()*2-1)*Math.exp(-t*34),.014,-.1);
 add(s.start+.03,1.2,t=>Math.sin(TAU*55*t)*Math.exp(-t*5),.02);
 for(const [word,f] of [['uranium',440],['neutron',660],['xenon',880],['air',523.25]]){if(s.text.toLowerCase().includes(word)){const at=cue(s,word);add(at,.65,t=>tone(f,.4,.002)(t),.012,.25);add(at+.18,.5,t=>tone(f,.4,.002)(t),.003,-.4);}}
}
// Quiet grain-like clicks accompany the reaction, not a constant loud Geiger alarm.
const reaction=tl.scenes[5];for(let i=0;i<38;i++)add(reaction.start+i*.43,.035,t=>(rand()*2-1)*Math.exp(-t*180),.008,(i%3-1)*.5);
const master=new Float32Array(N*2);let env=0;
for(let i=0;i<N;i++){const l=voice[i*2]||0,r=voice[i*2+1]||0,peak=Math.max(Math.abs(l),Math.abs(r));env+=(peak-env)*(peak>env?.015:.0003);const duck=1-Math.min(.72,env*8),fade=Math.min(1,i/SR/1.2,(N-i)/SR/1.5);master[i*2]=l+L[i]*duck*fade;master[i*2+1]=r+R[i]*duck*fade;}
writeFlac(master,N,'out/oklo-mix.flac');
execFileSync(ff,['-y','-v','error','-i','out/oklo-mix.flac','-af','loudnorm=I=-13.5:TP=-1.8:LRA=6,aresample=48000','-c:a','libmp3lame','-b:a','256k','public/audio/oklo.mp3']);
console.log('SCORE READY',tl.duration,'s; original stereo music, voice-ducked and cue-linked SFX');
