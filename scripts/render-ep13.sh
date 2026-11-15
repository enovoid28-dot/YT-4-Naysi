#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
FF=node_modules/@ffmpeg-installer/linux-x64/ffmpeg
mkdir -p out
# 5 692 frames at 90 fps: two halves so a crash never costs the whole render
node src/render.mjs --from 0 --to 2680 --preset fast --crf 20 --maxrate 6M --bufsize 12M --out out/q13_0.mp4
node src/render.mjs --from 2680 --to 5360 --preset fast --crf 20 --maxrate 6M --bufsize 12M --out out/q13_1.mp4
printf "file '%s'\n" "$PWD/out/q13_0.mp4" "$PWD/out/q13_1.mp4" > out/concat13.txt
"$FF" -y -hide_banner -loglevel error -f concat -safe 0 -i out/concat13.txt -c copy out/video13_silent.mp4
OUT="out/Paylater Bukan Uangmu - Naysi - 1440x2560 90fps.mp4"
"$FF" -y -hide_banner -loglevel error -i out/video13_silent.mp4 -i assets/audio/mix-ep13.wav \
  -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -shortest -movflags +faststart "$OUT"
ls -l "$OUT"
echo DONE_EP13_RENDER
