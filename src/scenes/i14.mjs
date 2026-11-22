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
    mercatorLattice(ctx, 90, 700, 560, 700, t, { p: 0.9, k: 1, chips: false });
    mercatorLattice(ctx, 790, 700, 560, 700, t, { p: 0.9, k: 0, chips: false });
    label(ctx, 'MERCATOR · BOHONG', 370, 660, { size: 24, color: KT.coral, align: 'center', track: 3, p: P(t, 1.0, 0.9) });
    label(ctx, 'LUAS ASLI · JUJUR', 1070, 660, { size: 24, color: KT.teal, align: 'center', track: 3, p: P(t, 1.4, 0.9) });
    heading(ctx, 'PETA', 'MENGATUR', 110, 430, { kicker: 'SIAPA RAKSASA · SIAPA KECIL', p: P(t, 0.4, 1.0), size: 130 });
    routePass(ctx, t, { p: P(t, 2.0, 2.0), y0: 1600 });
    ctx.restore();
    holoScan(ctx, t);
    vignette(ctx);
    gridFlash(ctx, t, 0, 0.22);
  },
};
