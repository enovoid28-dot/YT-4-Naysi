#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
FF=node_modules/@ffmpeg-installer/linux-x64/ffmpeg
mkdir -p out
FR=$(node -e "import('./src/timeline.mjs').then(m=>console.log(Math.round(m.buildTimeline().total*90)))")
echo "frames $FR"
CUT=$(( (FR + 4) / 5 ))
START=0
i=0
while [ $START -lt $FR ]; do
  END=$(( START + CUT )); [ $END -gt $FR ] && END=$FR
  node src/render.mjs --from $START --to $END --preset fast --crf 20 --maxrate 6M --bufsize 12M --out "out/q15_$START.mp4"
  START=$END
  i=$((i+1))
done
: > out/concat15.txt
for f in $(ls out/q15_*.mp4 | sort -t_ -k2 -n); do printf "file '%s'\n" "$PWD/$f" >> out/concat15.txt; done
"$FF" -y -hide_banner -loglevel error -f concat -safe 0 -i out/concat15.txt -c copy out/video15_silent.mp4
OUT="out/Gratis Ongkir Bukan Gratis - Naysi - 1440x2560 90fps.mp4"
"$FF" -y -hide_banner -loglevel error -i out/video15_silent.mp4 -i assets/audio/mix-ep15.wav \
  -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -shortest -movflags +faststart "$OUT"
ls -l "$OUT"
echo DONE_EP15_RENDER
