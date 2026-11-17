#!/usr/bin/env bash
# Episode 20 — "Langit malam seharusnya terang."
# Six chunks of 90 fps, concatenated losslessly, then muxed with the FLAC mix.
set -euo pipefail
cd "$(dirname "$0")/.."
FF=node_modules/@ffmpeg-installer/linux-x64/ffmpeg
mkdir -p out
FR=$(node -e "import('./src/timeline.mjs').then(m=>console.log(Math.round(m.buildTimeline().total*90)))")
echo "frames $FR"
CUT=$(( (FR + 5) / 6 ))
START=0
i=0
while [ $START -lt $FR ]; do
  END=$(( START + CUT )); [ $END -gt $FR ] && END=$FR
  node src/render.mjs --from $START --to $END --preset fast --crf 21 --maxrate 4900k --bufsize 10M --out "out/q20_$START.mp4"
  START=$END
  i=$((i+1))
done
: > out/concat20.txt
for f in $(ls out/q20_*.mp4 | sort -t_ -k2 -n); do printf "file '%s'\n" "$PWD/$f" >> out/concat20.txt; done
"$FF" -y -hide_banner -loglevel error -f concat -safe 0 -i out/concat20.txt -c copy out/video20_silent.mp4
OUT="out/Langit Malam Seharusnya Terang - Naysi - 1440x2560 90fps.mp4"
"$FF" -y -hide_banner -loglevel error -i out/video20_silent.mp4 -i assets/audio/mix-ep20.flac \
  -af volume=-0.2dB \
  -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -shortest -movflags +faststart "$OUT"
ls -l "$OUT"
echo DONE_EP20_RENDER
