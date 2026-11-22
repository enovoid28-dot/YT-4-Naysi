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
    caliper(ctx, 160, 820, 1120, 5120, t, { p: P(t, 0.6, 1.6), color: KT.amber, tagA: 'SABANG', tagB: 'MERAUKE', read: false });
    caliper(ctx, 160, 1080, 1120, 4544, t, { p: P(t, 1.6, 1.6), color: KT.ice, tagA: 'PASIFIK', tagB: 'ATLANTIK', read: false });
    counter(ctx, 5120, 430, 1330, P(t, 1.0, 1.6), { suffix: ' KM' });
    counter(ctx, 4544, 430, 1420, P(t, 2.0, 1.6), { color: KT.ice, suffix: ' KM' });
    spanStack(ctx, 240, 1500, 1000, t, { p: P(t, 2.6, 1.8) });
    heading(ctx, '5.100', 'vs 4.500', 110, 430, { kicker: 'KILOMETER · BUKAN PERASAAN', p: P(t, 0.4, 1.0), size: 140 });
    ctx.restore();
    holoScan(ctx, t);
    vignette(ctx);
    gridFlash(ctx, t, 0, 0.22);
  },
};
