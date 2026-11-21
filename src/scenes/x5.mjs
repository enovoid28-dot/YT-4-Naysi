import { VY, vacuum, stars, photon, record, recordCover, probe, probeGlide, trajectory, heliopause, signal, lockLamp, lightTime, wattGauge, instrumentRack, panel, heading, chip, counter, paleBlueDot, scanFrame, scaleRuler, greetingWall, musicRing, launchFlash, rocket, silenceBars, yearRail, decayChart, distanceStack, aimCone, starChart, binaryRow, plasmaHiss, statusBar, telemetryRibbon, goldenTrail, messageCard, spacePass, cutFlash, cue, cueEnd, P, eo, e3, io, sm, keys, frameOn, label, textW, drawOn, spline, sampleSpline, polyPath, bake, rng, clamp, lerp, TAU, F, hatch, snow, rgba, W, H, grain, back, odo, idn, pulse, rr } from './utama.mjs';

export default {
  draw(ctx, t, scene, env) {
    const cam = keys(t, [
      [0, 720, 1140, 1.08], [scene.dur * 0.5, 720, 1080, 1.03], [scene.dur, 720, 1020, 1.0],
    ]);
    ctx.save();
    frameOn(ctx, cam);
    vacuum(ctx, t);
    stars(ctx, cam, t, { a: 0.5 });
    paleBlueDot(ctx, t, { p: P(t, 0.6, 1.4), x: 880, y: 1020 });
    scanFrame(ctx, 260, 640, 920, 820, t, { p: P(t, 1.2, 1.0) });
    chip(ctx, '6 MILIAR KM · 1990', 720, 1660, { p: P(t, 2.8, 0.9) });
    heading(ctx, 'TITIK BIRU', 'PUCAT', 120, 430, { sub: 'POTRET TERJAUH BUMI', p: P(t, 0.4, 1.0), size: 124 });
    const FLARE = [880, 1020];
    ctx.restore();
    spacePass(ctx, t, { flare: FLARE });
  },
};
