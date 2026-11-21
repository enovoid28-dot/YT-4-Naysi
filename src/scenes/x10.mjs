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
    panel(ctx, 180, 760, 1080, 620, { p: P(t, 0.6, 1.0) });
    label(ctx, 'OPERASI HEMAT DAYA · SEP 2026', 720, 840, { size: 26, color: VY.gold, align: 'center', track: 4, p: P(t, 0.8, 0.8) });
    binaryRow(ctx, 260, 960, 920, t);
    [0, 1, 2].forEach((i) => {
      const bx = 300 + i * 320;
      const on = eo(P(t, 1.4 + i * 0.5, 0.7));
      ctx.save();
      ctx.globalAlpha = on;
      ctx.fillStyle = 'rgba(143,166,201,0.25)';
      rr(ctx, bx, 1040, 220, 90, 14); ctx.fill();
      ctx.strokeStyle = VY.rose; ctx.lineWidth = 2.4; ctx.stroke();
      ctx.strokeStyle = VY.teal; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(bx + 110, 1130); ctx.lineTo(bx + 110, 1200); ctx.stroke();
      ctx.fillStyle = 'rgba(124,242,156,0.3)';
      rr(ctx, bx + 20, 1200, 180, 80, 14); ctx.fill();
      ctx.strokeStyle = VY.teal; ctx.stroke();
      label(ctx, 'HEMAT WATT', bx + 110, 1252, { size: 22, color: VY.teal, align: 'center', track: 2, p: on });
      ctx.restore();
    });
    chip(ctx, 'JULI 2027: AMAN', 720, 1660, { p: P(t, 3.4, 0.9) });
    heading(ctx, 'OPERASI', 'HEMAT', 120, 430, { sub: 'TIGA PERANTI DIGANTI VERSI IRIT', p: P(t, 0.4, 1.0), size: 128 });
    const FLARE = [720, 900];
    ctx.restore();
    spacePass(ctx, t, { flare: FLARE });
  },
};
