import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {createCanvas} from '@napi-rs/canvas';
import {ensureFonts} from '../engine/fonts.mjs';
import {captionLayout,draw,initAssets} from './draw.mjs';
const tl=JSON.parse(fs.readFileSync(new URL('./timeline.json',import.meta.url)));
await ensureFonts();initAssets(createCanvas);
const canvas=createCanvas(tl.width,tl.height),ctx=canvas.getContext('2d');
test('2K portrait native 90 FPS; contiguous frame-exact timeline',()=>{
  assert.equal(tl.width,1440);assert.equal(tl.height,2560);assert.equal(tl.fps,90);
  let frame=0;for(const s of tl.scenes){assert.equal(s.startFrame,frame);assert.equal(s.start,frame/90);frame+=s.frames;}
  assert.equal(frame,tl.frames);assert.equal(tl.duration,frame/90);
});
test('captions reproduce every word of VO, with real measured cue times',()=>{
  for(const s of tl.scenes){assert.equal(s.cards.map(c=>c.text).join(' '),s.text);let end=0;
    for(const c of s.cards){assert(c.from>=end-1e-6);assert(c.to>c.from);assert(c.to<=s.duration);end=c.to;}
    assert(Math.abs(s.cards[0].from-s.onset)<.1);
  }
});
test('all captions fit three centred lines within the safe area',()=>{
  for(const s of tl.scenes)for(const card of s.cards){const layout=captionLayout(ctx,{...s,text:card.text});assert(layout.lines.length<=3,`${s.id}: ${card.text}`);for(const line of layout.lines)assert(line.width<=614);assert(1090-(layout.lines.length-1)*layout.size*1.17>940);}
});
test('all scene frames render deterministically',()=>{
  for(const s of tl.scenes){const at=s.start+Math.min(2,s.duration/2);draw(ctx,at,tl);const a=createHash('sha256').update(canvas.data()).digest('hex');draw(ctx,at,tl);const b=createHash('sha256').update(canvas.data()).digest('hex');assert.equal(a,b,s.id);}
});
test('VO originals use MP3, never WAV',()=>{
  for(const s of tl.scenes)assert(fs.statSync(`voice/ep33/${s.id}.mp3`).size>1000);
  assert(!fs.readdirSync('voice/ep33').some(f=>f.endsWith('.wav')));
});
