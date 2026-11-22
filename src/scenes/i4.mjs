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
    areaDuel(ctx, 120, 640, 1200, 1000, t, { p: P(t, 0.4, 1.2), count: P(t, 1.6, 2.0) });
    heading(ctx, 'GREENLAND', 'vs AFRIKA', 110, 430, { kicker: 'DUA PULAU · SATU BOHONG', p: P(t, 0.4, 1.0), size: 110 });
    chip(ctx, '×14', 1230, 700, { p: P(t, 2.4, 0.9), color: KT.coral });
    sheetTurn(ctx, t, scene.dur - 0.4, 0.4);
    ctx.restore();
    holoScan(ctx, t);
    vignette(ctx);
    gridFlash(ctx, t, 0, 0.22);
  },
};
