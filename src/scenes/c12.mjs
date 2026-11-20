// s12 PERINGATAN DINI — the Indian Ocean basin lights up: buoys drop in,
// dashed links pulse to coast stations, a 2005 stamp settles.
import { GP, vign, motes, buoy, chip, cue, P, eo, keys, frameOn, label,
  clamp, TAU, W, H } from './_gempa.mjs';

const COAST = [
  // [x,y] stylised basin rim: Africa left, India top, Australia right
];

export default {
  draw(ctx, t, scene, env) {
    const tL = cue(scene, 'lahir');
    const cam = keys(t, [[0, 720, 1000, 1.04], [scene.dur, 700, 980, 1.12]]);
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#08202e'); g.addColorStop(1, '#0a2a3d');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.save();
    frameOn(ctx, cam);
    // rim landmasses
    ctx.fillStyle = 'rgba(233,226,206,0.16)';
    ctx.strokeStyle = 'rgba(243,239,228,0.45)';
    ctx.lineWidth = 3;
    const blobs = [
      [[-100, 300], [220, 380], [300, 700], [260, 1200], [120, 1700], [-100, 1800]],
      [[520, -100], [760, 260], [700, 520], [560, 300], [420, -100]],
      [[W + 100, 1200], [W - 260, 1300], [W - 160, 1700], [W + 100, 1900]],
      [[880, 700], [1020, 820], [980, 1080], [860, 980]],
    ];
    for (const b of blobs) {
      ctx.beginPath();
      b.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    label(ctx, 'SAMUDRA HINDIA', W / 2, 1180, { size: 34, color: 'rgba(111,211,224,0.6)', track: 10, align: 'center' });
    // buoys + links
    const nodes = [[430, 760], [760, 980], [560, 1320], [980, 1240]];
    const stations = [[250, 520], [690, 300], [W - 250, 1420], [940, 800]];
    nodes.forEach(([x, y], i) => {
      const a = P(t, tL + 0.5 + i * 0.7, 0.5);
      if (a <= 0.01) return;
      ctx.save();
      ctx.globalAlpha = a;
      buoy(ctx, x, y, 46, t + i);
      const [sx, sy] = stations[i];
      ctx.strokeStyle = 'rgba(111,211,224,0.7)';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 14]);
      ctx.lineDashOffset = -t * 60;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(sx, sy); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = GP.bone;
      ctx.beginPath(); ctx.arc(sx, sy, 9, 0, TAU); ctx.fill();
      ctx.restore();
    });
    ctx.restore();
    if (t > tL) chip(ctx, 'SISTEM PERINGATAN TSUNAMI · 2005', 120, 420, { a: P(t, tL, 0.7) });
    const tM = cue(scene, 'mesin');
    if (t > tM) label(ctx, 'BUMI MESIN YANG HIDUP — KITA MEMBACA GERAKNYA', W / 2, 2080,
      { size: 34, color: GP.amber, track: 5, align: 'center', a: P(t, tM, 0.8) });
    motes(ctx, t, 131, 22, '140,220,230');
    vign(ctx, 0.5);
  },
};
