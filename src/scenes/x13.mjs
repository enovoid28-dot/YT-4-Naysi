import { VY, vacuum, stars, photon, record, recordCover, probe, probeGlide, trajectory, heliopause, signal, lockLamp, lightTime, wattGauge, instrumentRack, panel, heading, chip, counter, paleBlueDot, scanFrame, scaleRuler, greetingWall, musicRing, launchFlash, rocket, silenceBars, yearRail, decayChart, distanceStack, aimCone, starChart, binaryRow, plasmaHiss, statusBar, telemetryRibbon, goldenTrail, messageCard, spacePass, cutFlash, cue, cueEnd, P, eo, e3, io, sm, keys, frameOn, label, textW, drawOn, spline, sampleSpline, polyPath, bake, rng, clamp, lerp, TAU, F, hatch, snow, rgba, W, H, grain, back, odo, idn, pulse, rr } from './utama.mjs';

export default {
  draw(ctx, t, scene, env) {
    const cam = keys(t, [
      [0, 720, 1140, 1.08], [scene.dur * 0.5, 720, 1080, 1.03], [scene.dur, 720, 1020, 1.0],
    ]);
    ctx.save();
    frameOn(ctx, cam);
    vacuum(ctx, t);
    stars(ctx, cam, t, { a: 0.7 });
    greetingWall(ctx, 720, 1120, 560, t, { p: P(t, 0.6, 1.8), n: 26 });
    record(ctx, 720, 1120, 150, t, { spin: t * 0.6, p: eo(P(t, 0.4, 1.2)) });
    musicRing(ctx, 720, 1120, 190, t, { p: P(t, 1.6, 1.2) });
    chip(ctx, '90 MENIT MUSIK BUMI', 720, 1680, { p: P(t, 2.8, 0.9) });
    heading(ctx, 'LIMA PULUH LIMA', 'BAHASA', 120, 430, { sub: 'SAPAAN UNTUK SIAPA PUN', p: P(t, 0.4, 1.0), size: 108 });
    const FLARE = [720, 1120];
    ctx.restore();
    spacePass(ctx, t, { flare: FLARE });
  },
};
