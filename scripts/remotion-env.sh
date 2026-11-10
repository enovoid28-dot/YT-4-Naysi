#!/usr/bin/env bash
# Make Remotion renderable in this sandbox.
#
# Remotion normally downloads its Chrome Headless Shell from remotion.media,
# and this sandbox's network allowlist blocks that host (ECONNRESET). So we
# bring our own Chromium from the npm registry instead, plus the AL2023 shared
# libraries it needs (libnspr4/libnss3 are not present on this image).
#
#   source scripts/remotion-env.sh
#   npx remotion render <entry> <id> out/x.mp4 --browser-executable="$REMOTION_CHROME"
#
# Everything lands in /tmp, which the sandbox wipes between turns: re-run this.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -d node_modules/@sparticuz/chromium ]; then
  npm i --no-save --no-audit --no-fund @sparticuz/chromium
fi
if [ ! -d node_modules/remotion ]; then
  npm i --no-save --no-audit --no-fund remotion@4 @remotion/cli@4 react@18 react-dom@18
fi

mkdir -p /tmp/remotion-libs
if [ ! -x /tmp/chromium ]; then
  node -e "
const fs=require('fs'), zlib=require('zlib'), path='node_modules/@sparticuz/chromium/bin/';
fs.writeFileSync('/tmp/chromium', zlib.brotliDecompressSync(fs.readFileSync(path+'chromium.br')));
fs.chmodSync('/tmp/chromium', 0o755);
fs.writeFileSync('/tmp/al2023.tar', zlib.brotliDecompressSync(fs.readFileSync(path+'al2023.tar.br')));
"
  tar -xf /tmp/al2023.tar -C /tmp/remotion-libs
fi

export REMOTION_CHROME=/tmp/chromium
export LD_LIBRARY_PATH=/tmp/remotion-libs/lib
echo "REMOTION_CHROME=$REMOTION_CHROME"
echo "LD_LIBRARY_PATH=$LD_LIBRARY_PATH"
"$REMOTION_CHROME" --version
