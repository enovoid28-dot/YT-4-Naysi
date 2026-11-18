// Episode 19 — "Lagu itu nyangkut di kepalamu. Kamu tidak bisa tekan stop."
//
// Thesis: an earworm is not a glitch and not a failure of willpower. It is the
// auditory system running a loop it was given, in a working-memory format that
// cannot be closed by trying harder. The way out is not suppression; it is
// finishing the phrase or taking the mouth away from it.
//
// Sources:
//   Beaman & Williams (2010, British Journal of Psychology) — survey + diary
//     study; mean episode ~27 minutes in the diary sample; most last under a day;
//     the fragment that loops is typically 15-30 seconds of music.
//   Liikkanen (2012) — Finnish survey of 12,519 internet users: 91.7% experience
//     INMI at least weekly, 33.2% daily; frequency rises with musical engagement.
//   Williamson et al. (2012) — 91.7% weekly across two populations; onset classes:
//     music exposure, memory triggers, affect, low-attention states.
//   Jakubowski et al. (2017) — 83 melodic features compared across 100 earworms
//     and 100 matched songs: faster tempo, simpler rhythm, common melodic contour.
//   Hyman et al. (2013, Applied Cognitive Psychology) — a song that keeps playing
//     right after it stops is more likely to return within 24 hours (Zeigarnik);
//     verbal tasks suppress it more than visuo-spatial ones.
//   Beaman, Powell & Rapley (2015, QJEP) — 98 volunteers, 3 minutes of suppression:
//     about 9 intrusions; chewing gum cut them by roughly a third; articulatory
//     motor planning competes with the inner voice.
//   Zatorre / Farrugia — auditory cortex activity during musical imagery, i.e.
//     the brain hears it without sound arriving. ~98% of people report earworms.
//
// Every card is one spoken sentence, so no card can change mid-sentence.

export const SERIES = 'NAYSI · PUTAR';
export const BRAND = 'NAYSI';

export const SCENES = [
  {
    id: 's1',
    key: 'r1',
    label: 'EMPAT BARIS',
    index: '01',
    theme: 'dark',
    vo: 'Lagu itu tidak keluar dari kepalamu. Sudah tiga hari, dan kamu masih memutar bagian yang sama. Bukan seluruh lagunya. Cuma empat baris. Otakmu tidak rusak. Ia sedang menutup satu lingkaran. Dan kamu tidak punya tombol stop.',
    cap: [
      'Lagu itu tidak keluar dari kepalamu.',
      'Sudah tiga hari, dan kamu masih memutar bagian yang sama.',
      'Bukan seluruh lagunya. Cuma *empat* *baris*.',
      'Otakmu tidak rusak. Ia sedang menutup satu lingkaran.',
      'Dan kamu tidak punya tombol *stop*.',
    ],
    pad: 1.45,
  },
  {
    id: 's2',
    key: 'r2',
    label: 'SEMUA ORANG',
    index: '02',
    theme: 'dark',
    vo: 'Kamu tidak sendirian. Hampir semua orang pernah mengalaminya: sembilan puluh delapan persen. Sembilan puluh satu koma tujuh persen mengalaminya minimal sekali seminggu. Sepertiganya, setiap hari. Namanya bukan sekadar lagu nyangkut. Namanya involuntary musical imagery.',
    cap: [
      'Kamu tidak sendirian.',
      'Hampir semua orang pernah mengalaminya: *sembilan* *puluh* *delapan* persen.',
      'Sembilan puluh satu koma tujuh persen mengalaminya minimal sekali seminggu.',
      'Sepertiganya, *setiap* *hari*.',
      'Namanya bukan sekadar lagu nyangkut. Namanya *involuntary* *musical* *imagery*.',
    ],
    pad: 1.45,
  },
  {
    id: 's3',
    key: 'r3',
    label: 'TANPA SUARA',
    index: '03',
    theme: 'dark',
    vo: 'Saat kamu mendengar lagu di kepala, otak memprosesnya seperti suara sungguhan. Korteks pendengaran menyala, padahal tidak ada satu pun bunyi yang masuk. Yang bekerja adalah phonological loop: ruang kerja memori untuk bunyi dan kata. Selama loop itu masih bisa memutar, lagu itu akan terus berputar.',
    cap: [
      'Saat kamu mendengar lagu di kepala, otak memprosesnya seperti suara sungguhan.',
      'Korteks pendengaran menyala, padahal tidak ada satu pun bunyi yang masuk.',
      'Yang bekerja adalah *phonological* *loop*: ruang kerja memori untuk bunyi dan kata.',
      'Selama loop itu masih bisa memutar, lagu itu akan terus berputar.',
    ],
    pad: 1.45,
  },
  {
    id: 's4',
    key: 'r4',
    label: 'FORMULA',
    index: '04',
    theme: 'dark',
    vo: 'Tapi tidak semua lagu bisa nyangkut. Peneliti membandingkan seratus lagu yang nyangkut dengan seratus lagu biasa. Tiga hal menonjol: tempo lebih cepat, dan ritme sederhana. Melodinya juga mudah ditebak naik turunnya. Lagu yang paling mudah ditebak, paling mudah nyangkut.',
    cap: [
      'Tapi tidak semua lagu bisa nyangkut.',
      'Peneliti membandingkan seratus lagu yang nyangkut dengan seratus lagu biasa.',
      'Tiga hal menonjol: tempo lebih cepat, dan ritme sederhana.',
      'Melodinya juga mudah ditebak naik turunnya.',
      'Lagu yang paling mudah ditebak, paling mudah *nyangkut*.',
    ],
    pad: 1.45,
  },
  {
    id: 's5',
    key: 'r5',
    label: 'SETENGAH',
    index: '05',
    theme: 'dark',
    vo: 'Dan ada satu pemicu yang paling kejam. Kamu dengar lagunya setengah, lalu berhenti. Yang setengah, paling sering kembali dalam dua puluh empat jam. Psikolog menyebutnya efek Zeigarnik: pikiran yang belum selesai tidak mau ditutup.',
    cap: [
      'Dan ada satu pemicu yang paling kejam.',
      'Kamu dengar lagunya setengah, lalu berhenti.',
      'Yang setengah, paling sering kembali dalam *dua* *puluh* *empat* jam.',
      'Psikolog menyebutnya efek Zeigarnik: pikiran yang belum selesai tidak mau ditutup.',
    ],
    pad: 1.45,
  },
  {
    id: 's6',
    key: 'r6',
    label: 'DUA PULUH TUJUH',
    index: '06',
    theme: 'dark',
    vo: 'Biasanya ini tidak lama. Rata-rata dua puluh tujuh menit, lalu hilang. Yang diputar cuma potongan pendek: lima belas sampai tiga puluh detik. Jarang yang bertahan sampai besok.',
    cap: [
      'Biasanya ini tidak lama.',
      'Rata-rata *dua* *puluh* *tujuh* menit, lalu hilang.',
      'Yang diputar cuma potongan pendek: lima belas sampai tiga puluh detik.',
      'Jarang yang bertahan sampai besok.',
    ],
    pad: 1.45,
  },
  {
    id: 's7',
    key: 'r7',
    label: 'PERMEN KARET',
    index: '07',
    theme: 'dark',
    vo: 'Dan cara menghentikannya tidak ada hubungannya dengan kemauan. Di satu eksperimen, orang diminta tidak memikirkan lagunya selama tiga menit. Rata-rata, lagu itu muncul sembilan kali. Tapi yang mengunyah permen karet, memutar ulang lagunya sepertiga lebih sedikit. Mulut dipakai, mesin lagu di kepala kehilangan tenaga.',
    cap: [
      'Dan cara menghentikannya tidak ada hubungannya dengan kemauan.',
      'Di satu eksperimen, orang diminta tidak memikirkan lagunya selama tiga menit.',
      'Rata-rata, lagu itu muncul *sembilan* kali.',
      'Tapi yang mengunyah permen karet, memutar ulang lagunya *sepertiga* lebih sedikit.',
      'Mulut dipakai, mesin lagu di kepala kehilangan tenaga.',
    ],
    pad: 1.45,
  },
  {
    id: 's8',
    key: 'r8',
    label: 'MELAWAN',
    index: '08',
    theme: 'dark',
    vo: 'Menahan diri memperkuatnya. Semakin kamu melarang satu pikiran, semakin sering ia kembali. Yang berhasil justru sebaliknya: selesaikan lagunya sampai habis. Atau pindahkan mulutmu ke pekerjaan lain.',
    cap: [
      'Menahan diri memperkuatnya.',
      'Semakin kamu melarang satu pikiran, semakin sering ia kembali.',
      'Yang berhasil justru sebaliknya: *selesaikan* lagunya sampai habis.',
      'Atau pindahkan mulutmu ke pekerjaan lain.',
    ],
    pad: 1.45,
  },
  {
    id: 's9',
    key: 'r9',
    label: 'LINGKARAN',
    index: '09',
    theme: 'dark',
    vo: 'Lagu yang nyangkut bukan gangguan. Itu otak yang mencoba menutup lingkaran yang belum selesai. Dan selama belum selesai, ia akan terus memutar. Tulis di komentar: lagu apa yang nyangkut di kepalamu sekarang.',
    cap: [
      'Lagu yang nyangkut bukan gangguan.',
      'Itu otak yang mencoba menutup lingkaran yang belum selesai.',
      'Dan selama belum selesai, ia akan terus memutar.',
      'Tulis di komentar: lagu apa yang nyangkut di kepalamu *sekarang*.',
    ],
    pad: 2.10,
  },
];
