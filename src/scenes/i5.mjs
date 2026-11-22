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
    equatorBeam(ctx, 260, 700, 940, 700, t, { p: P(t, 0.4, 1.0), grow: P(t, 1.2, 1.8) });
    const pr5 = proj(300, 1560, 16, 95, -2);
    for (const isl of ID_ISLANDS) drawCoast(ctx, isl, pr5, { stroke: rgba(KT.amber, 0.9), fill: 'rgba(242,180,65,0.10)', lw: 2.4, glow: 12, p: P(t, 0.8, 1.4) });
    drawDots(ctx, ID_DOTS, pr5, { p: P(t, 1.6, 1.2), r0: 0.7 });
    cityMark(ctx, pr5, 109.3, 0.0, 'PONTIANAK 0°', t, { p: P(t, 2.2, 0.9) });
    distanceArc(ctx, pr5, [109.3, 0.0], [140.7, -2.5], t, { p: P(t, 2.6, 1.2), tag: 'SEPARUH BENTANG' });
    heading(ctx, 'TEPAT DI', 'KHATULISTIWA', 110, 430, { kicker: '0° LINTANG', p: P(t, 0.4, 1.0), size: 120 });
    chip(ctx, '×1,00 · APA ADANYA', 720, 610, { p: P(t, 1.8, 0.9), color: KT.amber });
    ctx.restore();
    holoScan(ctx, t);
    vignette(ctx);
    gridFlash(ctx, t, 0, 0.22);
  },
};
