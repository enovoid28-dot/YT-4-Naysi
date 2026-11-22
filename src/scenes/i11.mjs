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
    zoneDials(ctx, 720, 1020, t, { p: P(t, 0.4, 1.2), utcHour: 22 });
    sunSweep(ctx, 240, 1450, 960, 260, t, { p: P(t, 2.0, 1.4), prog: P(t, 2.0, 3.0) });
    heading(ctx, 'TIGA ZONA', 'WAKTU', 110, 430, { kicker: 'WIB · WITA · WIT', p: P(t, 0.4, 1.0), size: 130 });
    ctx.restore();
    holoScan(ctx, t);
    vignette(ctx);
    gridFlash(ctx, t, 0, 0.22);
  },
};
