import { execFileSync } from 'node:child_process';
import { ffmpegPath } from '../src/engine/ffmpeg.mjs';
const SR = 16000;
function f0(file) {
  const raw = execFileSync(ffmpegPath(), ['-hide_banner','-loglevel','error','-i',file,'-ac','1','-ar',String(SR),'-f','f32le','-'], { maxBuffer: 1<<28 });
  const x = new Float32Array(raw.buffer, raw.byteOffset, Math.floor(raw.byteLength/4));
  const frame = 640, hop = 320, lo = Math.floor(SR/350), hi = Math.ceil(SR/70);
  const vals = [];
  let rmsAll = 0;
  for (let i = 0; i + frame + hi < x.length; i += hop) {
    let e = 0; for (let j = 0; j < frame; j++) e += x[i+j]*x[i+j];
    rmsAll = Math.max(rmsAll, Math.sqrt(e/frame));
  }
  for (let i = 0; i + frame + hi < x.length; i += hop) {
    let e = 0; for (let j = 0; j < frame; j++) e += x[i+j]*x[i+j];
    if (Math.sqrt(e/frame) < rmsAll*0.35) continue;
    let best = 0, bestLag = 0;
    for (let lag = lo; lag <= hi; lag++) {
      let s = 0, a = 0, b = 0;
      for (let j = 0; j < frame; j++) { const v = x[i+j], w = x[i+j+lag]; s += v*w; a += v*v; b += w*w; }
      const r = s / Math.sqrt(a*b + 1e-9);
      if (r > best) { best = r; bestLag = lag; }
    }
    if (best > 0.5 && bestLag) vals.push(SR/bestLag);
  }
  vals.sort((p,q)=>p-q);
  const med = vals[Math.floor(vals.length/2)];
  const p = (k) => vals[Math.floor(vals.length*k)];
  return { n: vals.length, p10: p(0.1).toFixed(0), median: med?.toFixed(0), p90: p(0.9).toFixed(0) };
}
for (const f of process.argv.slice(2)) console.log(f.padEnd(24), JSON.stringify(f0(f)));
