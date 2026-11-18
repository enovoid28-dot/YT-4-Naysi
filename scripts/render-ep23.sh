#!/usr/bin/env bash
# Episode 23 — "Kenapa Bulan selalu menghadap kita?" (current cut: v3 visuals)
# Six chunks of 90 fps in two parallel lanes, concatenated losslessly, then
# muxed with the FLAC mix.
set -euo pipefail
cd "$(dirname "$0")/.."
export VO_EP=ep23
FF=node_modules/@ffmpeg-installer/linux-x64/ffmpeg
mkdir -p out
FR=$(node -e "import('./src/timeline.mjs').then(m=>console.log(Math.round(m.buildTimeline().total*90)))")
echo "frames $FR"
CUT=$(( (FR + 5) / 6 ))
rm -f out/q23w_*.mp4
lane() {
  local k=$1
  while [ $(( k * CUT )) -lt $FR ]; do
    local S=$(( k * CUT ))
    local E=$(( S + CUT )); [ $E -gt $FR ] && E=$FR
    node src/render.mjs --from $S --to $E --preset fast --crf 20 --maxrate 6000k --bufsize 12M --out "out/q23w_$S.mp4"
    k=$(( k + 2 ))
  done
}
lane 0 & A=$!
lane 1 & B=$!
wait $A
wait $B
: > out/concat23w.txt
for f in $(ls out/q23w_*.mp4 | sort -t_ -k2 -n); do printf "file '%s'\n" "$PWD/$f" >> out/concat23w.txt; done
"$FF" -y -hide_banner -loglevel error -f concat -safe 0 -i out/concat23w.txt -c copy out/video23w_silent.mp4
OUT="out/Kenapa Bulan Selalu Menghadap Kita - Naysi - 1440x2560 90fps v3.mp4"
"$FF" -y -hide_banner -loglevel error -i out/video23w_silent.mp4 -i assets/audio/mix-ep23.flac \
  -af volume=-0.7dB \
  -map 0:v:0 -map 1:a:0 \
  -c:v libx264 -preset fast -crf 21 -maxrate 4200k -bufsize 8M -pix_fmt yuv420p \
  -profile:v high -level:v 5.2 -g 180 -bf 2 \
  -x264-params "aq-mode=3:aq-strength=1.05:deblock=1,1" \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:a aac -b:a 192k -ar 48000 -ac 2 -shortest -movflags +faststart "$OUT"
ls -l "$OUT"
echo DONE_EP23_V3_RENDER
