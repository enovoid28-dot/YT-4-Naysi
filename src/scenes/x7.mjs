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
    goldenTrail(ctx, (tt) => [720 + Math.cos(tt * 0.7) * 300, 1150 + Math.sin(tt * 0.7) * 130], t, { a: 0.9 });
    probe(ctx, 720 + Math.cos(t * 0.7) * 300, 1150 + Math.sin(t * 0.7) * 130, 1.05, { rot: t * 0.7 + 1.2 });
    counter(ctx, 17, 720, 900, P(t, 0.6, 1.4), { font: '800 210px Poppins, sans-serif', suffix: ' KM/S' });
    chip(ctx, '61.200 KM/JAM', 460, 1660, { p: P(t, 2.0, 0.8) });
    chip(ctx, '+1,5 JUTA KM/HARI', 980, 1660, { p: P(t, 2.6, 0.8) });
    heading(ctx, 'TUJUH BELAS', 'KM/DETIK', 120, 430, { sub: '68 KALI LIPAT PESAWAT', p: P(t, 0.4, 1.0), size: 118 });
    const FLARE = [720, 860];
    ctx.restore();
    spacePass(ctx, t, { flare: FLARE });
  },
};
