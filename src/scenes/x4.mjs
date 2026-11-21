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
    const lp = P(t, 0.3, 2.0);
    launchFlash(ctx, t, { p: clamp(1 - P(t, 4.5, 2.0)) });
    rocket(ctx, 720, 1500 - 900 * eo(lp), 1.15, t);
    chip(ctx, '5 SEPTEMBER 1977 · TITAN IIIE', 720, 1680, { p: P(t, 2.6, 0.9) });
    label(ctx, 'CAPE CANAVERAL · 12:56 UT', 720, 1600, { size: 26, color: VY.iceDim, align: 'center', track: 4, p: P(t, 3.2, 0.9) });
    heading(ctx, 'TITAN', 'TERBANG', 120, 430, { sub: 'AWAL PERPISAHAN PANJANG', p: P(t, 0.4, 1.0), size: 132 });
    const FLARE = [720, 700];
    ctx.restore();
    spacePass(ctx, t, { flare: FLARE });
  },
};
