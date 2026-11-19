#!/usr/bin/env bash
# Episode 29 — "Indonesia Lebih Lebar dari Amerika Serikat"
# Eighteen chunks of 90 fps pulled from a shared queue by two lanes,
# concatenated losslessly, then muxed with the FLAC mix as AAC 256k (twoloop
# coder: the fast default overshoots the sibilants to -0.1 dBTP, twoloop keeps
# them at -1.4). The VBV cap (buffer = one second) keeps the whole file under
# the 100 MB upload.
set -euo pipefail
cd "$(dirname "$0")/.."
export VO_EP=ep29
FF=node_modules/@ffmpeg-installer/linux-x64/ffmpeg
mkdir -p out
FR=$(node -e "import('./src/timeline.mjs').then(m=>console.log(Math.round(m.buildTimeline().total*90)))")
N=18
CUT=$(( (FR + N - 1) / N ))
echo "frames $FR, $N chunks of $CUT"
rm -f out/q29_*.mp4
chunk() {
  local S=$1
  local E=$(( S + CUT )); [ $E -gt $FR ] && E=$FR
  node src/render.mjs --from $S --to $E --preset fast --crf 19 --maxrate 6600k --bufsize 6600k --out "out/q29_$S.mp4" </dev/null
  echo "chunk $S-$E done"
}
export -f chunk
export FR CUT
seq 0 $CUT $(( FR - 1 )) | xargs -P 2 -I{} bash -c 'chunk {}'
: > out/concat29.txt
for f in $(ls out/q29_*.mp4 | sort -t_ -k2 -n); do printf "file '%s'\n" "$PWD/$f" >> out/concat29.txt; done
"$FF" -y -hide_banner -loglevel error -f concat -safe 0 -i out/concat29.txt -c copy out/video29_silent.mp4
OUT="out/Indonesia Lebih Lebar dari Amerika Serikat - Naysi - 1440x2560 90fps.mp4"
"$FF" -y -hide_banner -loglevel error -i out/video29_silent.mp4 -i assets/audio/mix-ep29.flac \
  -map 0:v:0 -map 1:a:0 -c:v copy \
  -c:a aac -aac_coder twoloop -b:a 256k -ar 48000 -ac 2 -shortest -movflags +faststart "$OUT"
ls -l "$OUT"
echo DONE_EP29_RENDER
