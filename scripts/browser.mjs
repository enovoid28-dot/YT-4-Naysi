import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import {execFileSync} from 'node:child_process';

const root = process.cwd();
const dir = path.join(root, '.cache/browser');
const bin = path.join(dir, 'chromium');
fs.mkdirSync(path.join(dir, 'lib'), {recursive: true});
if (!fs.existsSync(bin)) {
  const pkg = path.join(root, 'node_modules/@sparticuz/chromium/bin');
  fs.writeFileSync(bin, zlib.brotliDecompressSync(fs.readFileSync(path.join(pkg, 'chromium.br'))));
  fs.chmodSync(bin, 0o755);
  const tar = path.join(dir, 'al2023.tar');
  fs.writeFileSync(tar, zlib.brotliDecompressSync(fs.readFileSync(path.join(pkg, 'al2023.tar.br'))));
  execFileSync('tar', ['-xf', tar, '-C', path.join(dir, 'lib')]);
  fs.rmSync(tar);
}
console.log(bin);
