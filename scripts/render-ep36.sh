#!/usr/bin/env bash
# Episode 36 — "Kamera di ponselmu lahir dari kamar gelap tahun 1011."
# Twelve chunks of 90 fps pulled from a shared queue by two lanes (the sandbox
# has two cores), concatenated losslessly, then muxed with the FLAC mix as AAC
# 256k. VBV 3900k/7800k keeps the 2K 90 fps master under the Drive cap while
# leaving the grain and the beams their detail.
set -euo pipefail
cd "$(dirname "$0")/.."
export VO_EP=ep36
FF=node_modules/@ffmpeg-installer/linux-x64/ffmpeg
mkdir -p out
FR=$(node -e "import('./src/timeline.mjs').then(m=>console.log(Math.round(m.buildTimeline().total*90)))")
N=12
CUT=$(( (FR + N - 1) / N ))
echo "frames $FR, $N chunks of $CUT"
rm -f out/q36_*.mp4
chunk() {
  local S=$1
  local E=$(( S + CUT )); [ $E -gt $FR ] && E=$FR
  node src/render.mjs --from $S --to $E --preset fast --crf 20 --maxrate 3900k --bufsize 7800k --out "out/q36_$S.mp4" </dev/null
  echo "chunk $S-$E done"
}
export -f chunk
export FR CUT
seq 0 $CUT $(( FR - 1 )) | xargs -P 2 -I{} bash -c 'chunk {}'
: > out/concat36.txt
for f in $(ls out/q36_*.mp4 | sort -t_ -k2 -n); do printf "file '%s'\n" "$PWD/$f" >> out/concat36.txt; done
"$FF" -y -hide_banner -loglevel error -f concat -safe 0 -i out/concat36.txt -c copy out/video36_silent.mp4
OUT="out/Kamera dari Kamar Gelap - Naysi - 1440x2560 90fps.mp4"
"$FF" -y -hide_banner -loglevel error -i out/video36_silent.mp4 -i assets/audio/mix-ep36.flac \
  -map 0:v:0 -map 1:a:0 -c:v copy \
  -c:a aac -aac_coder twoloop -b:a 256k -ar 48000 -ac 2 \
  -af "volume=0.05dB,alimiter=limit=0.83:level=false" -shortest -movflags +faststart "$OUT"
ls -l "$OUT"
echo DONE_EP36_RENDER
