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
    probeGlide(ctx, t, { x: 1080, y: 620, s: 0.8, ax: 26, ay: 14, p: 0.9 });
    messageCard(ctx, 180, 860, 1080, 560, [
      'LAMPUNYA AKAN PADAM.',
      'PIRINGAN EMAS ITU',
      'MELUNCUR SELAMANYA.',
      'PESAN APA YANG KAU TITIPKAN?',
    ], t, { p: P(t, 0.6, 1.6) });
    chip(ctx, 'TULIS KOMENTARMU', 720, 1680, { p: P(t, 3.0, 0.9) });
    heading(ctx, 'PESAN', 'ABADI', 120, 430, { sub: 'UNTUK YANG MENEMUKANNYA', p: P(t, 0.4, 1.0), size: 132 });
    const FLARE = [720, 1000];
    ctx.restore();
    spacePass(ctx, t, { flare: FLARE });
  },
};
