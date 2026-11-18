#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
FF=node_modules/@ffmpeg-installer/linux-x64/ffmpeg
mkdir -p out
# 5 692 frames at 90 fps: two halves so a crash never costs the whole render
node src/render.mjs --from 0 --to 3200 --preset fast --crf 20 --maxrate 6M --bufsize 12M --out out/q12_0.mp4
node src/render.mjs --from 3200 --to 5692 --preset fast --crf 20 --maxrate 6M --bufsize 12M --out out/q12_1.mp4
printf "file '%s'\n" "$PWD/out/q12_0.mp4" "$PWD/out/q12_1.mp4" > out/concat12.txt
"$FF" -y -hide_banner -loglevel error -f concat -safe 0 -i out/concat12.txt -c copy out/video12_silent.mp4
OUT="out/Tiket Pesawat Tidak Dijual - Naysi - 1440x2560 90fps.mp4"
"$FF" -y -hide_banner -loglevel error -i out/video12_silent.mp4 -i assets/audio/mix-ep12.wav \
  -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -shortest -movflags +faststart "$OUT"
ls -l "$OUT"
echo DONE_EP12_RENDER
