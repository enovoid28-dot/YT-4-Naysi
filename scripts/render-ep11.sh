#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
FF=node_modules/@ffmpeg-installer/linux-x64/ffmpeg
mkdir -p out
# 15 296 frames: two halves so a crash never costs the whole render
node src/render.mjs --from 0 --to 7650 --preset fast --crf 19 --maxrate 9M --bufsize 18M --out out/q11_0.mp4
node src/render.mjs --from 7650 --to 15296 --preset fast --crf 19 --maxrate 9M --bufsize 18M --out out/q11_1.mp4
printf "file '%s'\n" "$PWD/out/q11_0.mp4" "$PWD/out/q11_1.mp4" > out/concat11.txt
"$FF" -y -hide_banner -loglevel error -f concat -safe 0 -i out/concat11.txt -c copy out/video11_silent.mp4
OUT="out/Sebelas Kilometer - Naysi - 1440x2560 90fps.mp4"
"$FF" -y -hide_banner -loglevel error -i out/video11_silent.mp4 -i assets/audio/mix-ep11.wav \
  -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -shortest -movflags +faststart "$OUT"
ls -l "$OUT"
echo DONE_EP11_RENDER
