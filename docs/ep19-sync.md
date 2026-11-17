# Ep19 — catatan sinkron

Sumber kebenaran: `assets/audio/align.json`, diukur dari take mp3 (bukan wav).

- Kartu = kalimat. 40 kartu, 31 batas. Setiap batas duduk 20 ms dari tengah jeda
  asli di take (jeda 0,13–0,87 s), jadi kartu tidak pernah berganti di tengah kalimat.
- Angka di layar dikunci ke kata yang mengucapkannya (`cueWord` di
  `src/scenes/_sinyal.mjs`), bukan ke awal kartu: 98% menyala saat "sembilan",
  −33% saat "sepertiga", STOP saat "tombol", 24 JAM saat "dua".
- VO tetap mp3. `src/audio.mjs` men-decode take di memori; tidak ada file .wav.
  Mix akhir ditulis sebagai flac.
- Caption 104 px (min 82 px), scrim 0,80 dari y 1520, blok atas 1798.
