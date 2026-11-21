import { VY, vacuum, stars, photon, record, recordCover, probe, probeGlide, trajectory, heliopause, signal, lockLamp, lightTime, wattGauge, instrumentRack, panel, heading, chip, counter, paleBlueDot, scanFrame, scaleRuler, greetingWall, musicRing, launchFlash, rocket, silenceBars, yearRail, decayChart, distanceStack, aimCone, starChart, binaryRow, plasmaHiss, statusBar, telemetryRibbon, goldenTrail, messageCard, spacePass, cutFlash, cue, cueEnd, P, eo, e3, io, sm, keys, frameOn, label, textW, drawOn, spline, sampleSpline, polyPath, bake, rng, clamp, lerp, TAU, F, hatch, snow, rgba, W, H, grain, back, odo, idn, pulse, rr } from './utama.mjs';

export default {
  draw(ctx, t, scene, env) {
    const cam = keys(t, [
      [0, 720, 1140, 1.08], [scene.dur * 0.5, 720, 1080, 1.03], [scene.dur, 720, 1020, 1.0],
    ]);
    ctx.save();
    frameOn(ctx, cam);
    vacuum(ctx, t);
    stars(ctx, cam, t, { a: 0.6 });
    const back2 = t > scene.dur * 0.62;
    panel(ctx, 160, 800, 1120, 560, { p: P(t, 0.5, 1.0) });
    label(ctx, 'OKTOBER 2026 · JPL', 720, 880, { size: 26, color: back2 ? VY.teal : VY.rose, align: 'center', track: 5, p: P(t, 0.7, 0.8) });
    signal(ctx, 220, 940, 1000, 160, t, { lock: back2 });
    silenceBars(ctx, 220, 1160, 1000, 90, t, { p: back2 ? 0.25 : 1 });
    lockLamp(ctx, 260, 1290, t, { lock: back2, p: P(t, 1.0, 0.8), txt: back2 ? 'CARRIER KEMBALI' : 'NO CARRIER · 48 JAM' });
    chip(ctx, back2 ? 'IA MENJAWAB LAGI' : 'RUANG MENAHAN NAPAS', 860, 1660, { p: P(t, 2.2, 0.9), col: back2 ? VY.teal : VY.rose });
    heading(ctx, 'EMPAT PULUH', 'DELAPAN JAM', 120, 430, { sub: 'SINYAL HILANG DARI ANTARBINTANG', p: P(t, 0.4, 1.0), size: 112 });
    const FLARE = [720, 1000];
    ctx.restore();
    spacePass(ctx, t, { flare: FLARE });
  },
};
