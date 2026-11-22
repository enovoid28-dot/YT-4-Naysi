import { KT, roomBG, wallTags, globeWire, mercatorLattice, mapFrame, drawCoast, drawDots, proj, ID_ISLANDS, ID_DOTS, trueSizeMove, caliper, overlayCompare, areaDuel, equatorBeam, islandMatrix, coastRibbon, zoneDials, sunSweep, voteTally, projectionMorph, compassRose, lonProtractor, panel, heading, chip, counter, coordCursor, gridFlash, routePass, sheetTurn, holoScan, vignette, flareProj, commentCard, tissotRow, cityMark, spanStack, distanceArc, cue, cueEnd, P, eo, e3, io, sm, keys, frameOn, label, textW, drawOn, spline, sampleSpline, polyPath, bake, rng, clamp, lerp, TAU, F, hatch, snow, rgba, W, H, grain, back, odo, idn, pulse, rr } from './atlas.mjs';

export default {
  draw(ctx, t, scene, env) {
    const cam = keys(t, [
      [0, 720, 1150, 1.06], [scene.dur * 0.5, 720, 1090, 1.02], [scene.dur, 720, 1035, 1.0],
    ]);
    ctx.save();
    frameOn(ctx, cam);
    roomBG(ctx, t);
    wallTags(ctx, t, { p: 0.5 });
    const pr15 = proj(200, 900, 22, 95, -2);
    for (const isl of ID_ISLANDS) drawCoast(ctx, isl, pr15, { stroke: rgba(KT.amber, 0.8), fill: 'rgba(242,180,65,0.10)', lw: 2.6, glow: 14, p: P(t, 0.3, 1.6) });
    drawDots(ctx, ID_DOTS, pr15, { p: P(t, 1.0, 1.2), r0: 0.8 });
    flareProj(ctx, 720, 640, t, { p: P(t, 1.4, 0.9) });
    commentCard(ctx, 160, 1150, 1120, 560, ['Kamu tinggal di pulau mana?', 'Tulis di komentar.'], t, { p: P(t, 1.0, 1.6) });
    heading(ctx, 'PULAUMU', '', 110, 430, { kicker: 'TIDAK SEKECIL YANG KAMU KIRA', p: P(t, 0.4, 1.0), size: 140 });
    ctx.restore();
    holoScan(ctx, t);
    vignette(ctx);
    gridFlash(ctx, t, 0, 0.22);
  },
};
