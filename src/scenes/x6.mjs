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
    heliopause(ctx, -320, 1100, t, { r0: 700, gap: 170 });
    const cp = eo(P(t, 0.8, 2.6));
    probeGlide(ctx, t, { x: 300 + 700 * cp, y: 1080 - 60 * cp, s: 1.0, ax: 18, ay: 10 });
    chip(ctx, '25 AGUSTUS 2012 · 122 AU', 720, 1660, { p: P(t, 3.0, 0.9), col: VY.plasma });
    heading(ctx, 'HELIOPAUSE', '2012', 120, 430, { sub: 'GERBANG RUANG ANTARBINTANG', p: P(t, 0.4, 1.0), size: 118 });
    const FLARE = [700, 1020];
    ctx.restore();
    spacePass(ctx, t, { flare: FLARE });
  },
};
