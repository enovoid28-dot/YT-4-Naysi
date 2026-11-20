#!/usr/bin/env bash
# Episode 34 — "Madu 3.000 Tahun di Makam Firaun Masih Layak Dimakan"
# Eighteen chunks of 90 fps pulled from a shared queue by two lanes,
# concatenated losslessly, then muxed with the FLAC mix as AAC 256k (twoloop
# coder keeps the sibilants at ~-1.8 dBTP). VBV 4200k/8400k: ~2.4x the bitrate
# of the rejected Ep30/31 encodes while staying under the 100 MB Drive cap
# for the 179 s runtime.
set -euo pipefail
cd "$(dirname "$0")/.."
export VO_EP=ep33
FF=node_modules/@ffmpeg-installer/linux-x64/ffmpeg
mkdir -p out
FR=$(node -e "import('./src/timeline.mjs').then(m=>console.log(Math.round(m.buildTimeline().total*90)))")
N=18
CUT=$(( (FR + N - 1) / N ))
echo "frames $FR, $N chunks of $CUT"
rm -f out/q34_*.mp4
chunk() {
  local S=$1
  local E=$(( S + CUT )); [ $E -gt $FR ] && E=$FR
  node src/render.mjs --from $S --to $E --preset fast --crf 20 --maxrate 3900k --bufsize 7800k --out "out/q34_$S.mp4" </dev/null
  echo "chunk $S-$E done"
}
export -f chunk
export FR CUT
seq 0 $CUT $(( FR - 1 )) | xargs -P 2 -I{} bash -c 'chunk {}'
: > out/concat34.txt
for f in $(ls out/q34_*.mp4 | sort -t_ -k2 -n); do printf "file '%s'\n" "$PWD/$f" >> out/concat34.txt; done
"$FF" -y -hide_banner -loglevel error -f concat -safe 0 -i out/concat34.txt -c copy out/video34_silent.mp4
OUT="out/Titik Nemo - Manusia Terdekatnya di Luar Angkasa - Naysi - 1440x2560 90fps.mp4"
"$FF" -y -hide_banner -loglevel error -i out/video34_silent.mp4 -i assets/audio/mix-ep34.flac \
  -map 0:v:0 -map 1:a:0 -c:v copy \
  -c:a aac -aac_coder twoloop -b:a 256k -ar 48000 -ac 2 \
  -af "volume=0.75dB,alimiter=limit=0.83:level=false" -shortest -movflags +faststart "$OUT"
ls -l "$OUT"
echo DONE_EP33_RENDER
