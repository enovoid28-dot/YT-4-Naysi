#!/usr/bin/env bash
# Episode 22 — "Dua puluh tiga menit."
# Six chunks of 90 fps, concatenated losslessly, then muxed with the FLAC mix.
set -euo pipefail
cd "$(dirname "$0")/.."
export VO_EP=ep22
FF=node_modules/@ffmpeg-installer/linux-x64/ffmpeg
mkdir -p out
FR=$(node -e "import('./src/timeline.mjs').then(m=>console.log(Math.round(m.buildTimeline().total*90)))")
echo "frames $FR"
CUT=$(( (FR + 5) / 6 ))
START=0
i=0
while [ $START -lt $FR ]; do
  END=$(( START + CUT )); [ $END -gt $FR ] && END=$FR
  node src/render.mjs --from $START --to $END --preset fast --crf 20 --maxrate 6000k --bufsize 12M --out "out/q22_$START.mp4"
  START=$END
  i=$((i+1))
done
: > out/concat22.txt
for f in $(ls out/q22_*.mp4 | sort -t_ -k2 -n); do printf "file '%s'\n" "$PWD/$f" >> out/concat22.txt; done
"$FF" -y -hide_banner -loglevel error -f concat -safe 0 -i out/concat22.txt -c copy out/video22_silent.mp4
OUT="out/Dua Puluh Tiga Menit - Naysi - 1440x2560 90fps.mp4"
"$FF" -y -hide_banner -loglevel error -i out/video22_silent.mp4 -i assets/audio/mix-ep22.flac \
  -af volume=-0.7dB \
  -map 0:v:0 -map 1:a:0 \
  -c:v libx264 -preset fast -crf 21 -maxrate 4200k -bufsize 8M -pix_fmt yuv420p \
  -profile:v high -level:v 5.2 -g 180 -bf 2 \
  -x264-params "aq-mode=3:aq-strength=1.05:deblock=1,1" \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:a aac -b:a 192k -ar 48000 -ac 2 -shortest -movflags +faststart "$OUT"
ls -l "$OUT"
echo DONE_EP22_RENDER
