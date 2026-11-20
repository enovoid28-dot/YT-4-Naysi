import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {createCanvas} from '@napi-rs/canvas';
import {ensureFonts} from '../engine/fonts.mjs';
import {captionLayout,draw,initAssets} from './draw.mjs';
const tl=JSON.parse(fs.readFileSync(new URL('./timeline.json',import.meta.url)));
await ensureFonts();initAssets(createCanvas,JSON.parse(fs.readFileSync(new URL('./map.json',import.meta.url))));
const canvas=createCanvas(tl.width,tl.height),ctx=canvas.getContext('2d');
test('1440×2560 native 90 FPS; strictly between two and three minutes',()=>{
 assert.equal(tl.width,1440);assert.equal(tl.height,2560);assert.equal(tl.fps,90);assert(tl.duration>120&&tl.duration<180);
 let frame=0;for(const s of tl.scenes){assert.equal(s.startFrame,frame);assert.equal(s.start,frame/90);frame+=s.frames;}assert.equal(frame,tl.frames);assert.equal(tl.duration,frame/90);
});
test('word captions reproduce the complete narration in monotonic local time',()=>{
 for(const s of tl.scenes){assert.equal(s.cards.map(c=>c.text).join(' '),s.text);let end=0;
  for(const c of s.cards){assert(c.from>=end-1e-6);assert(c.to>c.from);assert(c.to<=s.duration);end=c.to;
   assert.equal(c.words.map(w=>w.text).join(' '),c.text);let last=c.from;
   for(const w of c.words){assert(w.start>=last-1e-6,`${s.id} ${w.text} nonmonotonic`);assert(w.end>w.start);assert(w.end<=c.to+.001,`${s.id} ${w.text} out of card`);last=w.end;}
  }
 }
});
test('caption typography fits three centred lines, safely below the explanatory art',()=>{
 for(const s of tl.scenes)for(const c of s.cards){const l=captionLayout(ctx,c);assert(l.lines.length<=3);for(const line of l.lines)assert(line.width<=614);assert(1065-(l.lines.length-1)*l.size*1.13>945);}
});
test('all chapter and interior shot frames render deterministically',()=>{
 for(const s of tl.scenes)for(const card of s.cards){const t=s.start+card.from+.2;draw(ctx,t,tl);const a=createHash('sha256').update(canvas.data()).digest('hex');draw(ctx,t,tl);assert.equal(a,createHash('sha256').update(canvas.data()).digest('hex'));}
});
test('same selected VO preserved as MP3; no WAV assets',()=>{
 for(const s of tl.scenes)assert(fs.statSync(`voice/ep34/${s.id}.mp3`).size>1000);assert(!fs.readdirSync('voice/ep34').some(f=>f.endsWith('.wav')));
});
