# Remotion di sandbox ini — hasil uji

**Jawaban singkat: bisa, tapi harus dengan Chromium sendiri.**

## Kenapa dulu gagal

- `remotion browser ensure` mengunduh Chrome dari `remotion.media`, dan host itu
  tidak ada di allowlist jaringan sandbox → `ECONNRESET`.
- Chromium yang kita bawa sendiri butuh `libnspr4.so` / `libnss3.so`, yang tidak
  terpasang di image Debian 12 ini, dan kita bukan root.

## Yang berhasil (diuji 2026-11-10)

```bash
source scripts/remotion-env.sh
npx remotion render rtest/index.ts Demo out/test.mp4 \
  --browser-executable="$REMOTION_CHROME" --concurrency=2
```

Langkahnya: paket npm `@sparticuz/chromium` membawa `chromium.br` (209 MB
terkompresi) dan `al2023.tar.br` (berisi libnspr4, libnss3, libsoftokn3, dst).
Kita dekompres, taruh di `/tmp`, lalu arahkan `LD_LIBRARY_PATH` ke
`/tmp/remotion-libs/lib`.

Hasil uji: komposisi 1440×2560, 30 fps, 60 frame → render + encode H.264 sukses.

## Angka yang penting

| | Remotion | Pipeline sekarang (canvas di Node) |
|---|---|---|
| CPU di sandbox | 2 core, `--concurrency` maksimum 2 | 1 proses |
| Adegan sederhana | ~0,17 s/frame | — |
| Adegan berat (ep8) | belum diuji | ~0,083 s/frame (12 fps) |
| Unduhan/ persiapan | ±245 paket + 209 MB browser, hilang tiap reset | nol |

Artinya: di mesin 2 core ini Remotion **tidak lebih cepat**; keunggulannya
(concurrency antar-tab) baru terasa di mesin 8–16 core.

## Yang perlu dipahami

Remotion adalah lapisan *penulis* (React + timeline), bukan lapisan gambar.
Gambarnya tetap berasal dari kode kita — `ctx`, path, gradien, teks. Memindahkan
8 scene ke Remotion tidak otomatis membuat hasilnya lebih bagus; yang membuat
lebih bagus adalah kerja seni di dalam scene (cahaya, komposisi, gerak, figur).

## Kalau tetap mau dipakai

Yang layak dikerjakan lebih dulu: **Remotion Studio sebagai preview hidup**.
Studio berjalan di Node dan dibuka di browser pengguna lewat port preview,
jadi tidak butuh Chromium di sandbox. Itu memberi umpan balik visual real-time
tanpa merombak pipeline render yang sudah stabil.
