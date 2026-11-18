// Episode 22 — "Dua puluh tiga menit."
//
// Thesis: the cost of a phone check is not the second you spend on it. It is the
// twenty-three minutes your attention needs to come back to the depth it was at,
// and the two other tasks you touch on the way. The film is built like an
// instrument board: everything is a measurement, because the argument is that
// this is measurable, not moral.
//
// Sources (Nov 2026):
//   Mark, Gudith & Klocke (2008), "The Cost of Interrupted Work", CHI '08,
//     UC Irvine — mean 23 min 15 s to resume an interrupted task; about two
//     intervening tasks before the original is resumed.
//   Mark (2023) — sustained attention on a single screen averages ~47 s before
//     switching; the "8-second attention span" figure is not a research finding.
//   Mark et al. — interruptions in office work arrive roughly every 3 minutes.
//   Leroy (2009), "Why is it so hard to do my work?" — attention residue from
//     unfinished tasks carries into the next one.
//   We Are Social / Global Digital Reports 2026 — Indonesia averages 3 h 07 m
//     per day on social media (16th in the world; global average 2 h 39 m);
//     37 h 20 m online per week overall.
//
// Copy rules: one card = one clause, numbers spelled the way the voice says
// them, and no card repeats the word of the visual it sits under.

export const SERIES = 'NAYSI · FOKUS';
export const BRAND = 'NAYSI';

export const SCENES = [
  {
    id: 's1', key: 'u1', label: 'SATU CEK', index: '01', theme: 'light',
    vo: 'Kamu cek HP. Satu detik. Lalu otakmu butuh dua puluh tiga menit untuk kembali ke tempat ia berhenti.',
    cap: [
      'Kamu cek HP. *Satu* *detik*.',
      'Lalu otakmu butuh *dua* *puluh* *tiga* *menit*',
      'untuk kembali ke tempat ia berhenti.',
    ],
    pad: 1.5,
  },
  {
    id: 's2', key: 'u2', label: 'PENGUKURAN', index: '02', theme: 'light',
    vo: 'Angka itu bukan kiasan. Dua puluh tiga menit lima belas detik, rata-rata dari penelitian di kantor nyata: berapa lama orang kembali ke tugas setelah dipotong.',
    cap: [
      'Angka itu bukan kiasan.',
      '*Dua* *puluh* *tiga* *menit* lima belas detik.',
      'Rata-rata dari penelitian di kantor nyata.',
      'Berapa lama orang kembali ke tugas setelah dipotong.',
    ],
    pad: 1.5,
  },
  {
    id: 's3', key: 'u3', label: 'EMPAT PULUH TUJUH', index: '03', theme: 'light',
    vo: 'Dan potongannya datang terus. Rata-rata orang bertahan empat puluh tujuh detik di satu layar sebelum pindah. Di kantor, pemotongan datang setiap tiga menit.',
    cap: [
      'Dan potongannya datang terus.',
      'Rata-rata orang bertahan *empat* *puluh* *tujuh* *detik* di satu layar.',
      'Di kantor, potongannya datang tiap tiga menit.',
    ],
    pad: 1.5,
  },
  {
    id: 's4', key: 'u4', label: 'RESIDU', index: '04', theme: 'light',
    vo: 'Yang hilang bukan cuma waktunya. Sebagian perhatianmu tertinggal di tugas sebelumnya. Psikolog menyebutnya residu perhatian.',
    cap: [
      'Yang hilang bukan cuma waktunya.',
      'Sebagian perhatianmu tertinggal di tugas sebelumnya.',
      'Namanya *residu* *perhatian*.',
    ],
    pad: 1.5,
  },
  {
    id: 's5', key: 'u5', label: 'TIGA', index: '05', theme: 'light',
    vo: 'Dan sebelum kembali, orang biasanya menyelipkan dua tugas lain. Jadi bukan satu kali berhenti. Tiga.',
    cap: [
      'Sebelum kembali, kamu menyelipkan dua tugas lain.',
      'Jadi bukan satu kali berhenti.',
      '*Tiga*.',
    ],
    pad: 1.5,
  },
  {
    id: 's6', key: 'u6', label: 'TAGIHAN', index: '06', theme: 'light',
    vo: 'Enam kali cek sehari, dua jam lebih hilang cuma untuk kembali ke tempat yang sama. Bukan kerja. Cuma pulang.',
    cap: [
      'Enam kali cek sehari.',
      '*Dua* *jam* lebih, cuma untuk kembali ke tempat yang sama.',
      'Bukan kerja. Cuma pulang.',
    ],
    pad: 1.5,
  },
  {
    id: 's7', key: 'u7', label: 'INDONESIA', index: '07', theme: 'light',
    vo: 'Di Indonesia, rata-rata orang menghabiskan tiga jam tujuh menit sehari di media sosial. Peringkat enam belas dunia. Dan itu belum chat, kerja, dan video.',
    cap: [
      'Indonesia: *tiga* *jam* *tujuh* *menit* sehari di media sosial.',
      'Peringkat *enam* *belas* dunia.',
      'Dan itu belum chat, kerja, dan video.',
    ],
    pad: 1.5,
  },
  {
    id: 's8', key: 'u8', label: 'MITOS', index: '08', theme: 'light',
    vo: 'Rentang perhatian delapan detik itu mitos. Yang nyata: kita bertahan empat puluh tujuh detik sebelum pindah. Dan solusinya bukan detoks.',
    cap: [
      'Rentang perhatian *delapan* *detik* itu mitos.',
      'Yang nyata: *empat* *puluh* *tujuh* *detik* sebelum pindah.',
      'Solusinya bukan detoks.',
    ],
    pad: 1.5,
  },
  {
    id: 's9', key: 'u9', label: 'SATU HAL', index: '09', theme: 'light',
    vo: 'Satu hal saja: jauhkan HP dari jangkauan tangan saat kamu butuh fokus. Bukan senyap. Bukan terbalik. Di ruangan lain. Lalu tulis di komentar: berapa kali kamu buka HP hari ini?',
    cap: [
      'Jauhkan HP dari jangkauan tangan.',
      'Bukan senyap. Bukan terbalik.',
      'Di ruangan lain.',
      'Tulis di komentar: berapa kali kamu buka HP hari ini?',
    ],
    pad: 1.5,
  },
];
