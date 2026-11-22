// The renderer and soundtrack choose one episode with VO_EP. Episode 35 stays
// the default for the Remotion composition; production scripts set VO_EP=ep36.
const active = process.env.VO_EP === 'ep36'
  ? await import('./script-ep36.mjs')
  : await import('./script-ep35.mjs');

export const SCENES = active.SCENES;
export const BRAND = active.BRAND;
export const SERIES = active.SERIES;
export const STYLE = active.STYLE;
