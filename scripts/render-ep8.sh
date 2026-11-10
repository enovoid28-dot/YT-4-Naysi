#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
FF=node_modules/@ffmpeg-installer/linux-x64/ffmpeg
mkdir -p out
node src/render.mjs --from 0 --to 3900 --preset fast --crf 19 --maxrate 9M --bufsize 18M --out out/q8_0.mp4
node src/render.mjs --from 3900 --to 7795 --preset fast --crf 19 --maxrate 9M --bufsize 18M --out out/q8_1.mp4
printf "file '%s'\n" "$PWD/out/q8_0.mp4" "$PWD/out/q8_1.mp4" > out/concat8.txt
"$FF" -y -hide_banner -loglevel error -f concat -safe 0 -i out/concat8.txt -c copy out/video8_silent.mp4
OUT="out/99 Ribu Kilometer Pantai, Garamnya Impor - Naysi - 1440x2560 90fps.mp4"
"$FF" -y -hide_banner -loglevel error -i out/video8_silent.mp4 -i assets/audio/mix-ep8.wav \
  -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -shortest -movflags +faststart "$OUT"
ls -l "$OUT"
echo DONE_EP8_RENDER
