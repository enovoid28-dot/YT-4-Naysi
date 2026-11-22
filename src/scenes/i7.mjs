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
    mapFrame(ctx, 100, 600, 1240, 1050, t, { title: 'EROPA · SKALA ASLI', p: P(t, 0.3, 1.0) });
    trueSizeMove(ctx, 120, 620, 1200, 1010, t, { p: 1, move: eo(P(t, 0.9, 2.6)) });
    heading(ctx, 'UKURAN', 'ASLI', 110, 430, { kicker: 'SABANG → IRLANDIA', p: P(t, 0.4, 1.0), size: 130 });
    coordCursor(ctx, 1150, 1560, t, { p: P(t, 2.6, 0.9) });
    routePass(ctx, t, { p: P(t, 3.2, 2.0), y0: 1700 });
    ctx.restore();
    holoScan(ctx, t);
    vignette(ctx);
    gridFlash(ctx, t, 0, 0.22);
  },
};
