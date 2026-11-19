#!/usr/bin/bash
# Episode 30 — "Jejak Bom Nuklir di Dalam Gigimu"
# Twenty-four chunks of 90 fps pulled from a shared queue by two lanes,
# concatenated losslessly, then muxed with the FLAC mix as AAC 256k (twoloop
# coder: the fast default overshoots the sibilants to -0.1 dBTP, twoloop keeps
# them at -1.4). The VBV cap (buffer = one second) is scaled for the ~179 s
# runtime so the whole file stays under the 100 MB upload limit.
set -euo pipefail
cd "$(dirname "$0")/.."
export VO_EP=ep30
FF=node_modules/@ffmpeg-installer/linux-x64/ffmpeg
mkdir -p out
FR=$(node -e "import('./src/timeline.mjs').then(m=>console.log(Math.round(m.buildTimeline().total*90)))")
N=24
CUT=$(( (FR + N - 1) / N ))
echo "frames $FR, $N chunks of $CUT"
rm -f out/q30_*.mp4
chunk() {
  local S=$1
  local E=$(( S + CUT )); [ $E -gt $FR ] && E=$FR
  node src/render.mjs --from $S --to $E --preset fast --crf 19 --maxrate 3950k --bufsize 3950k --out "out/q30_$S.mp4" </dev/null
  echo "chunk $S-$E done"
}
export -f chunk
export FR CUT
seq 0 $CUT $(( FR - 1 )) | xargs -P 2 -I{} bash -c 'chunk {}'
: > out/concat30.txt
for f in $(ls out/q30_*.mp4 | sort -t_ -k2 -n); do printf "file '%s'\n" "$PWD/$f" >> out/concat30.txt; done
"$FF" -y -hide_banner -loglevel error -f concat -safe 0 -i out/concat30.txt -c copy out/video30_silent.mp4
OUT="out/Jejak Bom Nuklir di Dalam Gigimu - Naysi - 1440x2560 90fps.mp4"
"$FF" -y -hide_banner -loglevel error -i out/video30_silent.mp4 -i assets/audio/mix-ep30.flac \
  -map 0:v:0 -map 1:a:0 -c:v copy \
  -c:a aac -aac_coder twoloop -b:a 256k -ar 48000 -ac 2 -shortest -movflags +faststart "$OUT"
ls -l "$OUT"
echo DONE_EP30_RENDER
