#!/usr/bin/env bash
# Episode 26 — "Tanpa Einstein, GPS di HP-mu nyasar sepuluh kilometer sehari."
# Six chunks of 90 fps in two parallel lanes, concatenated losslessly, then
# muxed with the FLAC mix (AAC) without a second video encode.
set -euo pipefail
cd "$(dirname "$0")/.."
export VO_EP=ep26
FF=node_modules/@ffmpeg-installer/linux-x64/ffmpeg
mkdir -p out
FR=$(node -e "import('./src/timeline.mjs').then(m=>console.log(Math.round(m.buildTimeline().total*90)))")
echo "frames $FR"
CUT=$(( (FR + 5) / 6 ))
rm -f out/q26_*.mp4
lane() {
  local k=$1
  while [ $(( k * CUT )) -lt $FR ]; do
    local S=$(( k * CUT ))
    local E=$(( S + CUT )); [ $E -gt $FR ] && E=$FR
    node src/render.mjs --from $S --to $E --preset fast --crf 19 --maxrate 7000k --bufsize 14M --out "out/q26_$S.mp4"
    k=$(( k + 2 ))
  done
}
lane 0 & A=$!
lane 1 & B=$!
wait $A
wait $B
: > out/concat26.txt
for f in $(ls out/q26_*.mp4 | sort -t_ -k2 -n); do printf "file '%s'\n" "$PWD/$f" >> out/concat26.txt; done
"$FF" -y -hide_banner -loglevel error -f concat -safe 0 -i out/concat26.txt -c copy out/video26_silent.mp4
OUT="out/Tanpa Einstein, GPS di HP-mu Nyasar 10 KM Sehari - Naysi - 1440x2560 90fps.mp4"
"$FF" -y -hide_banner -loglevel error -i out/video26_silent.mp4 -i assets/audio/mix-ep26.flac \
  -af volume=-0.7dB \
  -map 0:v:0 -map 1:a:0 -c:v copy \
  -c:a aac -b:a 192k -ar 48000 -ac 2 -shortest -movflags +faststart "$OUT"
ls -l "$OUT"
echo DONE_EP26_RENDER
