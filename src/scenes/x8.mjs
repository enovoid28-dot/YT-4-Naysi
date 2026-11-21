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
    wattGauge(ctx, 400, 1000, 210, 470 - 49 * 4 * eo(P(t, 1.0, 2.0)), t, { p: P(t, 0.6, 1.0) });
    panel(ctx, 660, 760, 660, 560, { p: P(t, 1.2, 1.0) });
    label(ctx, 'ANGGARAN DAYA', 990, 840, { size: 26, color: VY.gold, align: 'center', track: 5, p: P(t, 1.4, 0.8) });
    decayChart(ctx, 700, 900, 580, 340, t, { p: P(t, 1.6, 1.6) });
    chip(ctx, '-4 WATT SETIAP TAHUN', 720, 1660, { p: P(t, 3.0, 0.9), col: VY.rose });
    heading(ctx, 'LISTRIK', 'MELURUH', 120, 430, { sub: 'PLUTONIUM-238 · RTG', p: P(t, 0.4, 1.0), size: 128 });
    const FLARE = [400, 1000];
    ctx.restore();
    spacePass(ctx, t, { flare: FLARE });
  },
};
