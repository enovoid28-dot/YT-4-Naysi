#!/usr/bin/env bash
# Episode 27 v2 — "Pedas Itu Bukan Rasa, Tapi Rasa Sakit"
# Sixteen chunks of 90 fps pulled from a shared queue by two lanes (heavy
# scenes no longer pile up on one lane), concatenated losslessly, then muxed
# with the FLAC mix as AAC 256k — no second video encode, no gain change.
set -euo pipefail
cd "$(dirname "$0")/.."
export VO_EP=ep27
FF=node_modules/@ffmpeg-installer/linux-x64/ffmpeg
mkdir -p out
FR=$(node -e "import('./src/timeline.mjs').then(m=>console.log(Math.round(m.buildTimeline().total*90)))")
N=16
CUT=$(( (FR + N - 1) / N ))
echo "frames $FR, $N chunks of $CUT"
rm -f out/q27_*.mp4
chunk() {
  local S=$1
  local E=$(( S + CUT )); [ $E -gt $FR ] && E=$FR
  node src/render.mjs --from $S --to $E --preset fast --crf 19 --maxrate 7000k --bufsize 14M --out "out/q27_$S.mp4" </dev/null
  echo "chunk $S-$E done"
}
export -f chunk
export FR CUT
seq 0 $CUT $(( FR - 1 )) | xargs -P 2 -I{} bash -c 'chunk {}'
: > out/concat27.txt
for f in $(ls out/q27_*.mp4 | sort -t_ -k2 -n); do printf "file '%s'\n" "$PWD/$f" >> out/concat27.txt; done
"$FF" -y -hide_banner -loglevel error -f concat -safe 0 -i out/concat27.txt -c copy out/video27_silent.mp4
OUT="out/Pedas Itu Bukan Rasa, Tapi Rasa Sakit - Naysi - 1440x2560 90fps v2.mp4"
"$FF" -y -hide_banner -loglevel error -i out/video27_silent.mp4 -i assets/audio/mix-ep27.flac \
  -map 0:v:0 -map 1:a:0 -c:v copy \
  -c:a aac -b:a 256k -ar 48000 -ac 2 -shortest -movflags +faststart "$OUT"
ls -l "$OUT"
echo DONE_EP27_RENDER
