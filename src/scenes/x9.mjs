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
    panel(ctx, 160, 780, 1120, 420, { p: P(t, 0.6, 1.0) });
    label(ctx, 'INSTRUMEN ILMIAH', 720, 860, { size: 26, color: VY.gold, align: 'center', track: 5, p: P(t, 0.8, 0.8) });
    instrumentRack(ctx, 220, 940, 1000, 11 - 9 * eo(P(t, 1.2, 2.0)), t, { p: P(t, 1.0, 1.0) });
    label(ctx, 'MAGNETOMETER + GELOMBANG PLASMA', 720, 1120, { size: 26, color: VY.teal, align: 'center', track: 3, p: P(t, 2.6, 0.9) });
    plasmaHiss(ctx, 720, 1420, 120, t, { p: P(t, 2.0, 1.2) });
    heading(ctx, 'SEBELAS', '→ DUA', 120, 430, { sub: 'YANG MASIH MENDENGAR', p: P(t, 0.4, 1.0), size: 132 });
    const FLARE = [720, 1420];
    ctx.restore();
    spacePass(ctx, t, { flare: FLARE });
  },
};
