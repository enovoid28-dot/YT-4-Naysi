import { VY, vacuum, stars, photon, record, recordCover, probe, probeGlide, trajectory, heliopause, signal, lockLamp, lightTime, wattGauge, instrumentRack, panel, heading, chip, counter, paleBlueDot, scanFrame, scaleRuler, greetingWall, musicRing, launchFlash, rocket, silenceBars, yearRail, decayChart, distanceStack, aimCone, starChart, binaryRow, plasmaHiss, statusBar, telemetryRibbon, goldenTrail, messageCard, spacePass, cutFlash, cue, cueEnd, P, eo, e3, io, sm, keys, frameOn, label, textW, drawOn, spline, sampleSpline, polyPath, bake, rng, clamp, lerp, TAU, F, hatch, snow, rgba, W, H, grain, back, odo, idn, pulse, rr } from './utama.mjs';

export default {
  draw(ctx, t, scene, env) {
    const cam = keys(t, [
      [0, 720, 1140, 1.08], [scene.dur * 0.5, 720, 1080, 1.03], [scene.dur, 720, 1020, 1.0],
    ]);
    ctx.save();
    frameOn(ctx, cam);
    vacuum(ctx, t);
    stars(ctx, cam, t);
    probeGlide(ctx, t, { x: 1040, y: 640, s: 0.9, ax: 30, ay: 16 });
    lightTime(ctx, 200, 1420, 1040, t, { p: P(t, 1.6, 1.4) });
    label(ctx, 'SATU HARI CAHAYA · SEKALI KIRIM', 720, 1540, { size: 26, color: VY.iceDim, align: 'center', track: 4, p: P(t, 2.2, 0.9) });
    lockLamp(ctx, 220, 1660, t, { p: P(t, 2.6, 0.8) });
    chip(ctx, '18 NOVEMBER 2026', 880, 1660, { p: P(t, 3.0, 0.9) });
    heading(ctx, 'SATU HARI', 'CAHAYA', 120, 430, { sub: 'VOYAGER 1 · MISI ANTARBINTANG', p: P(t, 0.4, 1.0), size: 128 });
    const FLARE = [720, 430];
    ctx.restore();
    spacePass(ctx, t, { flare: FLARE });
  },
};
