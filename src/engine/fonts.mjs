import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { GlobalFonts } from '@napi-rs/canvas';
import wawoff2 from 'wawoff2';

const require = createRequire(import.meta.url);
const CACHE = path.join(process.cwd(), '.fonts');

const SPECS = [
  ['PJS800', '@fontsource/plus-jakarta-sans', 'plus-jakarta-sans-latin-800-normal.woff2'],
  ['PJS700', '@fontsource/plus-jakarta-sans', 'plus-jakarta-sans-latin-700-normal.woff2'],
  ['PJS500', '@fontsource/plus-jakarta-sans', 'plus-jakarta-sans-latin-500-normal.woff2'],
  ['IT800', '@fontsource/inter-tight', 'inter-tight-latin-800-normal.woff2'],
  ['IT600', '@fontsource/inter-tight', 'inter-tight-latin-600-normal.woff2'],
  ['IT400', '@fontsource/inter-tight', 'inter-tight-latin-400-normal.woff2'],
  ['BG800', '@fontsource/bricolage-grotesque', 'bricolage-grotesque-latin-800-normal.woff2'],
  ['BG700', '@fontsource/bricolage-grotesque', 'bricolage-grotesque-latin-700-normal.woff2'],
  ['MONO4', '@fontsource/ibm-plex-mono', 'ibm-plex-mono-latin-400-normal.woff2'],
  ['MONO6', '@fontsource/ibm-plex-mono', 'ibm-plex-mono-latin-600-normal.woff2'],
];

export const F = {
  head: 'PJS800',
  semi: 'PJS700',
  med: 'PJS500',
  num: 'IT800',
  num6: 'IT600',
  body: 'IT400',
  display: 'BG800',
  display7: 'BG700',
  mono: 'MONO4',
  mono6: 'MONO6',
};

export async function ensureFonts() {
  fs.mkdirSync(CACHE, { recursive: true });
  for (const [alias, pkg, file] of SPECS) {
    const out = path.join(CACHE, `${alias}.ttf`);
    if (!fs.existsSync(out)) {
      const pkgDir = path.dirname(require.resolve(`${pkg}/package.json`));
      const ttf = await wawoff2.decompress(fs.readFileSync(path.join(pkgDir, 'files', file)));
      fs.writeFileSync(out, Buffer.from(ttf));
    }
    GlobalFonts.registerFromPath(out, alias);
  }
}
