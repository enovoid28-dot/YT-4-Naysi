#!/usr/bin/env bash
# Restore the session branch and dependencies after a sandbox reset.
set -euo pipefail
cd "$(dirname "$0")/.."
BRANCH="arena/13d641cc-yt-4-naysi"
git fetch origin
git reset --hard "origin/$BRANCH"
echo "head: $(git log --oneline -1)"
[ -d node_modules/@napi-rs/canvas ] || npm install --no-audit --no-fund
ls voice/*.mp3 2>/dev/null | wc -l | xargs echo "voice takes:"
[ -f voice/align.json ] && echo "align.json: ada" || echo "align.json: belum"
