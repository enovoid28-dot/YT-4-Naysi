# CPI — Naysi (2K · 90 fps)

Explainer vertikal 1440×2560 @ 90 fps, digambar sepenuhnya dari kode:
Skia canvas untuk visual, sintesis audio untuk skor & sound design, ffmpeg untuk encoding.

```bash
npm install
npm run vo        # rapikan voice over (tempo, EQ, loudness)
npm run audio     # skor + SFX + mix sample-accurate
npm run stills    # render beberapa frame PNG untuk cek visual
npm run build     # video final -> out/CPI-NAYSI-1440x2560-90fps.mp4
```

- `src/script.mjs` — naskah, caption, dan struktur 7 babak
- `src/timeline.mjs` — timing VO → scene & word-level caption
- `src/scenes/` — satu file per babak
- `src/engine/` — easing, tipografi kinetik, film grain, kamera
- `scripts/audio.mjs` — musik prosedural, SFX, ducking, mastering
