# Kalau workspace ter-reset

Sandbox ini bisa didaur ulang di antara giliran: checkout lokal kembali ke
commit dasar dan semua folder yang di-.gitignore (`out/`, `assets/`, `public/`,
`docs/`) hilang. Kode aman karena selalu di-push; yang mahal adalah aset turunan.

## Pulihkan dalam satu perintah

```bash
bash scripts/restore.sh
```

Isinya: fetch + hard reset ke branch sesi, `npm install`, lalu cek apa yang ada.

## Yang dijamin bisa dibangun ulang dari git

| Bagian | Sumber | Perintah |
|---|---|---|
| skrip & scene | `src/` | — |
| take suara | `voice/s*.mp3` | (sudah di-commit) |
| timing kartu caption | `voice/align.json` | `node scripts/align-cards.mjs` |
| wav VO + mastering | hasil turunan | `node scripts/prep-vo-<ep>.mjs` |
| musik + SFX | hasil turunan | `node scripts/audio-<ep>.mjs` |
| video | hasil turunan | `bash scripts/render-<ep>.sh` |

Aturan kerjanya: **take suara (`voice/`) dan `align.json` selalu di-commit**.
Tanpa itu, TTS baru menghasilkan durasi berbeda dan seluruh timeline bergeser.

## Yang tidak ada di git (memang begitu)

- `docs/` — paket YouTube. Disimpan di Google Drive, bukan di repo.
- `out/` — master video. Diunggah ke Drive setiap episode selesai.
