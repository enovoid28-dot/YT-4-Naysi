#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
FF=node_modules/@ffmpeg-installer/linux-x64/ffmpeg
mkdir -p out
# 13 522 frames at 90 fps, five chunks so a crash never costs the render
for spec in "0 2700" "2700 5400" "5400 8100" "8100 10800" "10800 13530"; do
  set -- $spec
  node src/render.mjs --from "$1" --to "$2" --preset fast --crf 20 --maxrate 6M --bufsize 12M --out "out/q14_$1.mp4"
done
printf "file '%s'\n" "$PWD/out/q14_0.mp4" "$PWD/out/q14_2700.mp4" "$PWD/out/q14_5400.mp4" "$PWD/out/q14_8100.mp4" "$PWD/out/q14_10800.mp4" > out/concat14.txt
"$FF" -y -hide_banner -loglevel error -f concat -safe 0 -i out/concat14.txt -c copy out/video14_silent.mp4
OUT="out/Emas Bukan Mesin Uang - Naysi - 1440x2560 90fps.mp4"
"$FF" -y -hide_banner -loglevel error -i out/video14_silent.mp4 -i assets/audio/mix-ep14.wav \
  -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -shortest -movflags +faststart "$OUT"
ls -l "$OUT"
echo DONE_EP14_RENDER
