import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

export const FONTS = {
  head: 'Naysi Head',
  body: 'Naysi Body',
  mono: 'Naysi Mono',
};

let loaded = false;
export function ensureFonts() {
  if (loaded) return;
  loaded = true;
  void loadFont({family: FONTS.head, url: staticFile('fonts/head.woff2'), weight: '700'});
  void loadFont({family: FONTS.head, url: staticFile('fonts/head-800.woff2'), weight: '800'});
  void loadFont({family: FONTS.body, url: staticFile('fonts/body.woff2'), weight: '600'});
  void loadFont({family: FONTS.body, url: staticFile('fonts/body-700.woff2'), weight: '700'});
  void loadFont({family: FONTS.mono, url: staticFile('fonts/mono.woff2'), weight: '500'});
}
