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
    yearRail(ctx, 160, 1080, 1120, t, { p: P(t, 0.6, 2.2) });
    probeGlide(ctx, t, { x: 720, y: 780, s: 1.05, ax: 40, ay: 20 });
    chip(ctx, 'RENCANA AWAL: 5 TAHUN', 720, 1660, { p: P(t, 3.2, 0.9) });
    heading(ctx, 'MISI LIMA', 'TAHUN', 120, 430, { sub: 'JUPITER · SATURNUS · SELESAI?', p: P(t, 0.4, 1.0), size: 128 });
    const FLARE = [720, 780];
    ctx.restore();
    spacePass(ctx, t, { flare: FLARE });
  },
};
