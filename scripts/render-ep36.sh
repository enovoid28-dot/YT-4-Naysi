#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
export VO_EP=ep36
FF=$(node -e "import('./src/engine/ffmpeg.mjs').then(m=>console.log(m.ffmpegPath()))")
mkdir -p out
FR=$(node -e "import('./src/timeline.mjs').then(m=>console.log(Math.round(m.buildTimeline().total*90)))")
N=8
CUT=$(( (FR + N - 1) / N ))
echo "Episode 36: $FR frames at 1440x2560 / 90 fps; $N render chunks"
rm -f out/q36_*.mp4
chunk() {
  local S=$1
  local E=$(( S + CUT )); [ "$E" -gt "$FR" ] && E=$FR
  node src/render.mjs --from "$S" --to "$E" --preset fast --crf 19 --maxrate 5200k --bufsize 10400k --out "out/q36_$S.mp4" </dev/null
  echo "chunk $S-$E complete"
}
export -f chunk
export FR CUT
seq 0 "$CUT" "$((FR - 1))" | xargs -P 2 -I{} bash -c 'chunk {}'
: > out/concat36.txt
while IFS= read -r f; do printf "file '%s'\n" "$PWD/$f" >> out/concat36.txt; done < <(ls out/q36_*.mp4 | sort -t_ -k2 -n)
"$FF" -y -hide_banner -loglevel error -f concat -safe 0 -i out/concat36.txt -c copy out/video36_silent.mp4
OUT="out/Kenapa Kamu Tidak Bisa Menggelitik Diri Sendiri - Naysi - 1440x2560 90fps.mp4"
"$FF" -y -hide_banner -loglevel error -i out/video36_silent.mp4 -i assets/audio/mix-ep36.flac \
  -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -aac_coder twoloop -b:a 256k -ar 48000 -ac 2 \
  -af "loudnorm=I=-13:TP=-1.5:LRA=8" -shortest -movflags +faststart "$OUT"
ls -lh "$OUT"
echo DONE_EP36_RENDER
