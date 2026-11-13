const fs = require('fs');
function wavDur(f) {
  const b = fs.readFileSync(f);
  let off = 12;
  let fmt = null;
  while (off + 8 <= b.length) {
    const id = b.toString('ascii', off, off + 4);
    const size = b.readUInt32LE(off + 4);
    if (id === 'fmt ') {
      fmt = { sr: b.readUInt32LE(off + 12), ch: b.readUInt16LE(off + 10), bits: b.readUInt16LE(off + 22) };
    } else if (id === 'data') {
      return size / (fmt.sr * fmt.ch * (fmt.bits / 8));
    }
    off += 8 + size + (size % 2);
  }
}
const src = fs.readFileSync('src/script.mjs', 'utf8');
const ids = [...src.matchAll(/id: '(s\d)'/g)].map((m) => m[1]);
const pads = [...src.matchAll(/pad: ([\d.]+)/g)].map((m) => parseFloat(m[1]));
const labels = [...src.matchAll(/label: '([^']+)'/g)].map((m) => m[1]);
let cur = 0;
ids.forEach((id, i) => {
  const d = wavDur(`public/audio/vo/${id}.wav`) / 1.12;
  const off = i === 0 ? 0.95 : 0.22;
  const dur = off + d + pads[i];
  const mm = Math.floor(cur / 60);
  const ss = cur - mm * 60;
  console.log(id, (labels[i] || '').padEnd(7), '| VO', d.toFixed(2), '| start', cur.toFixed(2), '=>', mm + ':' + String(Math.floor(ss)).padStart(2, '0'), '| dur', dur.toFixed(2));
  cur += dur;
});
console.log('TOTAL', cur.toFixed(2));
