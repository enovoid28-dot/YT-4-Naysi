import { txt } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE } from '../engine/anim.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import { HUD, deepSky, earthBall, roll, mono, chip, ringBurst, hudFrame, wordT } from './_bulan.mjs';
import { KRAK, PL, gview, gRing, gPin, barogram } from './_krakatau.mjs';

// 04 — 3,5 KALI
// One continuous simulation: the pressure front leaves Krakatau, converges on
// the far side of the planet, comes back — three and a half laps. A station
// in London counts every pass, and in card 1 its barogram is laid out under
// the globe, drawing the seven spikes in step with the front.
const P = (t, at, d) => clamp((t - at) / d);
const eo = (p) => EASE.outCubic(clamp(p));
const io = (p) => EASE.inOutQuad(clamp(p));
const sm = (p) => EASE.smooth(clamp(p));
const D_LONDON = 104.35;
const PASSES = [D_LONDON, 360 - D_LONDON, 360 + D_LONDON, 720 - D_LONDON, 720 + D_LONDON, 1080 - D_LONDON, 1080 + D_LONDON];

function drawScene(ctx, t, scene, g = {}) {
  const cam = shotCam(t, 0.7);
  deepSky(ctx, t, cam, { seed: 44, band: 0.6, bandY: 700 });
  const tTiga = wordT(scene, 0, 4);
  const t1 = wordT(scene, 1, 0, -0.1);
  const tTujuh = wordT(scene, 1, 5);

  // pass A (card 0): three and a half laps, landing on "kali"
  // pass B (card 1): the same laps replayed in step with the barogram pen
  const tA0 = 0.5;
  const tA1 = wordT(scene, 0, 6) + 0.3;
  const tB0 = t1 + 0.12;
  const SPANB = 2.95;
  const passB = t >= tB0 - 0.02;
  const thAt = (tt) => (tt >= tB0 - 0.02 ? 1260 * clamp((tt - tB0) / SPANB) : 1260 * clamp((tt - tA0) / (tA1 - tA0)));
  const th = thAt(t);
  const m = th % 360;
  const rho = m <= 180 ? m : 360 - m;
  const out = m <= 180;
  const n = PASSES.filter((x) => th >= x).length;
  const pB = io(P(t, t1 - 0.25, 0.9));
  const gv = gview(720, lerp(1010, 800, pB), lerp(450, 340, pB), 27.4 + Math.sin(t * 0.3) * 1.5, 10);

  let pl = null;
  let pk = null;
  plane(ctx, cam, 0.6, () => {
    earthBall(ctx, gv.cx, gv.cy, gv.r, { lon: gv.lon, tilt: gv.tilt, sun: { x: -0.3, y: 0.35, z: 0.89 }, lights: 0.3 });
    if (th > 0.5 && th < 1259.5) {
      const dir = out ? 1 : -1;
      gRing(ctx, gv, KRAK, rho, { lw: 5, a: 1 });
      gRing(ctx, gv, KRAK, rho - dir * 4, { lw: 3, a: 0.36, glow: 0 });
      gRing(ctx, gv, KRAK, rho - dir * 8, { lw: 2, a: 0.16, glow: 0 });
    }
    pk = gPin(ctx, gv, KRAK[0], KRAK[1], { color: '#FF5A4A', r: 10 });
    pl = gPin(ctx, gv, PL.london[0], PL.london[1], { color: HUD.amber, r: 10 });
  });
  if (pl) {
    const last = n > 0 ? PASSES[n - 1] : -999;
    ringBurst(ctx, pl.x, pl.y, (th - last) / 70, { r: 90, color: '255,214,150' });
    chip(ctx, `LONDON · ${n}`, pl.x - 30, pl.y - 52, eo(P(t, 0.4, 0.5)), { align: 'right', color: HUD.amber, size: 24 });
  }
  if (pk) chip(ctx, 'KRAKATAU', pk.x - 20, pk.y + 56, eo(P(t, 0.2, 0.5)), { align: 'right', color: '#FF8A6A', size: 22 });
  // the far side: where every lap converges
  mono(ctx, 'ANTIPODA', gv.cx - gv.r - 24, gv.cy + 8, { size: 20, color: HUD.ice, align: 'right', a: eo(P(t, 0.6, 0.5)) * (1 - pB), track: 4 });
  mono(ctx, 'KOLOMBIA', gv.cx - gv.r - 24, gv.cy + 36, { size: 17, color: HUD.sub, align: 'right', a: eo(P(t, 0.6, 0.5)) * (1 - pB), track: 3 });
  // a lap counter ring around the globe
  const laps = th / 360;
  ctx.save();
  ctx.globalAlpha *= eo(P(t, 0.3, 0.6));
  ctx.strokeStyle = 'rgba(214,230,248,0.12)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(gv.cx, gv.cy, gv.r + 36, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = HUD.amber;
  ctx.shadowColor = 'rgba(255,176,58,0.8)';
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.arc(gv.cx, gv.cy, gv.r + 36, -Math.PI / 2, -Math.PI / 2 + (laps % 1) * Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // hero, card 0: 3,5 laps
  const a0 = eo(P(t, 0.3, 0.4)) * (1 - eo(P(t, t1 - 0.2, 0.3)));
  if (a0 > 0.01) {
    const val = (tt) => Math.round((thAt(tt) / 360) * 10) / 10;
    void tTiga;
    const w = roll(ctx, val(t), 104, 440, { size: 210, font: F.display, color: HUD.bone, decimals: 1, a: a0, track: -6, prev: val(t - 1 / 90) });
    txt(ctx, '×', 104 + w + 14, 432, { size: 120, font: F.display, color: HUD.amber, alpha: a0 });
    txt(ctx, 'KELILING BUMI · ± 36 JAM SEKALI PUTAR', 110, 492, { size: 25, font: F.mono6, color: HUD.amber, track: 5, alpha: a0 });
  }
  // hero, card 1: seven records
  const a1 = eo(P(t, t1, 0.4));
  if (a1 > 0.01) {
    const shown = Math.max(1, n);
    const w = roll(ctx, shown, 104, 440, { size: 210, font: F.display, color: HUD.bone, a: a1, track: -6 });
    txt(ctx, '×', 104 + w + 14, 432, { size: 120, font: F.display, color: HUD.amber, alpha: a1 });
    txt(ctx, 'TERCATAT BAROMETER · 5 HARI', 110, 492, { size: 25, font: F.mono6, color: HUD.amber, track: 6, alpha: a1 });
    ringBurst(ctx, 200, 360, P(t, tB0 + (PASSES[6] / 1260) * SPANB, 0.8), { r: 160 });
  }
  // the barogram, in step with the front
  if (pB > 0.01) {
    const hours = passB ? (th / 360) * 36 : 0;
    barogram(ctx, 92, lerp(1760, 1196, pB), 1256, 330, clamp(hours / 120), t, { a: pB, d: D_LONDON });
  }
  void tTujuh;
  void passB;
  hudFrame(ctx, t, g.t ?? t, { cam });
}

export default { draw: drawScene };
