#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
FF=node_modules/@ffmpeg-installer/linux-x64/ffmpeg
mkdir -p out
node src/render.mjs --from 0 --to 4491 --preset fast --crf 19 --maxrate 9M --bufsize 18M --out out/p7_0.mp4
node src/render.mjs --from 4491 --to 8982 --preset fast --crf 19 --maxrate 9M --bufsize 18M --out out/p7_1.mp4
printf "file '%s'\n" "$PWD/out/p7_0.mp4" "$PWD/out/p7_1.mp4" > out/concat7.txt
"$FF" -y -hide_banner -loglevel error -f concat -safe 0 -i out/concat7.txt -c copy out/video7_silent.mp4
OUT="out/Jakarta Tidak Tenggelam, Tapi Ambles - Naysi - 1440x2560 90fps.mp4"
"$FF" -y -hide_banner -loglevel error -i out/video7_silent.mp4 -i assets/audio/mix-ep7.wav \
  -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -shortest -movflags +faststart "$OUT"
ls -l "$OUT"
echo DONE_EP7_RENDER
