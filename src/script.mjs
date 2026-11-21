// Episode 35 — "Voyager 1: Satu Hari Cahaya dari Bumi."
//
// Thesis: on 18 November 2026 a machine built for a five-year tour of two
// planets becomes the first human object one light-day from home. The film is
// a mission console: starfields in parallax layers, a golden record spinning
// its grooves, a trajectory line with planet nodes, heliopause arcs, watt
// gauges and odometer distances — because the argument is about distance,
// decay and a message that outlives its transmitter.
//
// Sources (Nov 2026):
//   NASA / JPL via theglobalspy (19 Nov 2026) — one light-day reached
//     18 Nov 2026 at 25.9 billion km; heliopause 25 Aug 2012 at ~122 AU;
//     11 instruments at launch, 2 alive in 2026 (MAG + PWS); RTGs -4 W/yr;
//     Golden Record: 55 languages, 35 Earth sounds, 90 min music, 115 images.
//   supernovatribune (Oct 2026) — launch 5 Sep 1977 12:56 UT, Titan IIIE;
//     172.36 AU / 25.78 billion km on 8 Oct 2026; 17 km/s, +1.5 million km/day,
//     +3.6 AU/yr; ~470 W at launch; LECP off 17 Apr 2026.
//   spaceosmosis (Oct 2026) — record 30 cm, 16 2/3 rpm; scale 1 AU = 1 m ->
//     Voyager 170 m, Proxima 269 km, ~75,000 yr; 68x airliner; Pale Blue Dot
//     1990 from 6 billion km.
//   slsc.org (11 Nov 2026) — Sep 2026 "Big Bang" power swap; Oct 2026 48-hour
//     comms silence then recovery; 24 h one-way light time.
//
// Copy rules: one card = one clause, numbers spelled the way the voice says
// them, and no card repeats the word of the visual it sits under.

export const SERIES = 'NAYSI · ANTARIKSA';
export const BRAND = 'NAYSI';

export const STYLE = { look: 'voyager', scrimY: 1786, scrimA: 0.55 };

export const SCENES = [
  {
    id: 's1', key: 'x1', label: 'SATU HARI CAHAYA', index: '01', theme: 'dark',
    vo: 'Hari ini, delapan belas November dua ribu dua puluh enam, benda buatan manusia pertama menyentuh jarak satu hari cahaya dari Bumi: Voyager satu.',
    cap: [
      'Hari ini, delapan belas November',
      'dua ribu dua puluh enam, benda buatan',
      'manusia pertama menyentuh jarak',
      'satu hari cahaya dari Bumi: Voyager satu.',
    ],
    pad: 1.2,
  },
  {
    id: 's2', key: 'x2', label: '25,9 MILIAR KM', index: '02', theme: 'dark',
    vo: 'Dua puluh lima koma sembilan miliar kilometer dari rumah. Sinyal radio yang kita kirim butuh dua puluh empat jam penuh untuk tiba.',
    cap: [
      'Dua puluh lima koma sembilan miliar',
      'kilometer dari rumah.',
      'Sinyal radio yang kita kirim butuh',
      'dua puluh empat jam penuh untuk tiba.',
    ],
    pad: 1.2,
  },
  {
    id: 's3', key: 'x3', label: 'MISI LIMA TAHUN', index: '03', theme: 'dark',
    vo: 'Padahal ia lahir untuk tugas lima tahun: melintasi Jupiter tahun seribu sembilan ratus tujuh puluh sembilan dan Saturnus tahun seribu sembilan ratus delapan puluh.',
    cap: [
      'Padahal ia lahir untuk tugas lima tahun:',
      'melintasi Jupiter tahun seribu sembilan',
      'ratus tujuh puluh sembilan dan Saturnus',
      'tahun seribu sembilan ratus delapan puluh.',
    ],
    pad: 1.2,
  },
  {
    id: 's4', key: 'x4', label: 'PELUNCURAN 1977', index: '04', theme: 'dark',
    vo: 'Tanggal lima September seribu sembilan ratus tujuh puluh tujuh, roket Titan mengangkatnya dari Cape Canaveral; tak ada yang merencanakan perpisahan sepanjang ini.',
    cap: [
      'Tanggal lima September seribu sembilan',
      'ratus tujuh puluh tujuh, roket Titan',
      'mengangkatnya dari Cape Canaveral;',
      'tak ada yang merencanakan perpisahan sepanjang ini.',
    ],
    pad: 1.2,
  },
  {
    id: 's5', key: 'x5', label: 'TITIK BIRU PUCAT', index: '05', theme: 'dark',
    vo: 'Tahun seribu sembilan ratus sembilan puluh, dari enam miliar kilometer, ia memotret Bumi: titik biru pucat, satu piksel dalam gelap.',
    cap: [
      'Tahun seribu sembilan ratus sembilan puluh,',
      'dari enam miliar kilometer,',
      'ia memotret Bumi: titik biru pucat,',
      'satu piksel dalam gelap.',
    ],
    pad: 1.2,
  },
  {
    id: 's6', key: 'x6', label: 'HELIOPAUSE 2012', index: '06', theme: 'dark',
    vo: 'Dua puluh lima Agustus dua ribu dua belas, Voyager satu menembus heliopause pada seratus dua puluh dua unit astronomi: makhluk buatan pertama di ruang antarbintang.',
    cap: [
      'Dua puluh lima Agustus dua ribu dua belas,',
      'Voyager satu menembus heliopause',
      'pada seratus dua puluh dua unit astronomi:',
      'makhluk buatan pertama di ruang antarbintang.',
    ],
    pad: 1.2,
  },
  {
    id: 's7', key: 'x7', label: '17 KM PER DETIK', index: '07', theme: 'dark',
    vo: 'Kecepatannya tujuh belas kilometer per detik: enam puluh satu ribu dua ratus kilometer per jam, menambah satu setengah juta kilometer setiap hari.',
    cap: [
      'Kecepatannya tujuh belas kilometer per detik:',
      'enam puluh satu ribu dua ratus',
      'kilometer per jam, menambah satu setengah',
      'juta kilometer setiap hari.',
    ],
    pad: 1.2,
  },
  {
    id: 's8', key: 'x8', label: 'LISTRIK MELURUH', index: '08', theme: 'dark',
    vo: 'Listriknya dari panas plutonium yang meluruh: sekitar empat ratus tujuh puluh watt saat berangkat, kini menyusut empat watt setiap tahun.',
    cap: [
      'Listriknya dari panas plutonium yang meluruh:',
      'sekitar empat ratus tujuh puluh watt',
      'saat berangkat, kini menyusut',
      'empat watt setiap tahun.',
    ],
    pad: 1.2,
  },
  {
    id: 's9', key: 'x9', label: 'DUA PENDENGAR', index: '09', theme: 'dark',
    vo: 'Sebelas instrumen ilmiah dulu; hari ini hanya dua yang masih mendengar: magnetometer dan subsistem gelombang plasma.',
    cap: [
      'Sebelas instrumen ilmiah dulu;',
      'hari ini hanya dua yang masih mendengar:',
      'magnetometer dan subsistem',
      'gelombang plasma.',
    ],
    pad: 1.2,
  },
  {
    id: 's10', key: 'x10', label: 'OPERASI HEMAT', index: '10', theme: 'dark',
    vo: 'September dua ribu dua puluh enam, tim melakukan operasi hemat daya besar-besaran agar satu instrumen lagi tidak mati musim panas dua ribu dua puluh tujuh.',
    cap: [
      'September dua ribu dua puluh enam,',
      'tim melakukan operasi hemat daya',
      'besar-besaran agar satu instrumen lagi',
      'tidak mati musim panas dua ribu dua puluh tujuh.',
    ],
    pad: 1.2,
  },
  {
    id: 's11', key: 'x11', label: '48 JAM SUNYI', index: '11', theme: 'dark',
    vo: 'Oktober dua ribu dua puluh enam, sinyalnya sempat hilang empat puluh delapan jam; seluruh ruangan menahan napas — lalu ia menjawab lagi.',
    cap: [
      'Oktober dua ribu dua puluh enam,',
      'sinyalnya sempat hilang',
      'empat puluh delapan jam; seluruh ruangan',
      'menahan napas — lalu ia menjawab lagi.',
    ],
    pad: 1.2,
  },
  {
    id: 's12', key: 'x12', label: 'PIRINGAN EMAS', index: '12', theme: 'dark',
    vo: 'Di tubuhnya terpaut piringan tembaga berlapis emas: tiga puluh sentimeter, diputar enam belas dua per tiga putaran per menit.',
    cap: [
      'Di tubuhnya terpaut piringan',
      'tembaga berlapis emas: tiga puluh sentimeter,',
      'diputar enam belas dua per tiga',
      'putaran per menit.',
    ],
    pad: 1.2,
  },
  {
    id: 's13', key: 'x13', label: 'ISI PIRINGAN', index: '13', theme: 'dark',
    vo: 'Isinya sapaan lima puluh lima bahasa, suara ombak, angin, paus, dan sembilan puluh menit musik dari seluruh peradaban kita.',
    cap: [
      'Isinya sapaan lima puluh lima bahasa,',
      'suara ombak, angin, paus,',
      'dan sembilan puluh menit musik',
      'dari seluruh peradaban kita.',
    ],
    pad: 1.2,
  },
  {
    id: 's14', key: 'x14', label: 'SKALA KOSONG', index: '14', theme: 'dark',
    vo: 'Jika satu AU jadi satu meter, Voyager sudah seratus tujuh puluh meter jauhnya; bintang terdekat dua ratus enam puluh sembilan kilometer — tujuh puluh lima ribu tahun lagi.',
    cap: [
      'Jika satu AU jadi satu meter,',
      'Voyager sudah seratus tujuh puluh meter jauhnya;',
      'bintang terdekat dua ratus enam puluh',
      'sembilan kilometer — tujuh puluh lima ribu tahun lagi.',
    ],
    pad: 1.2,
  },
  {
    id: 's15', key: 'x15', label: 'PESAN ABADI', index: '15', theme: 'dark',
    vo: 'Lampu pemancarnya akan padam, tetapi piringan emas itu akan meluncur selamanya. Komentar: pesan apa yang akan kamu titipkan untuk makhluk yang menemukannya?',
    cap: [
      'Lampu pemancarnya akan padam,',
      'tetapi piringan emas itu',
      'akan meluncur selamanya.',
      'Komentar: pesan apa yang akan kamu titipkan',
      'untuk makhluk yang menemukannya?',
    ],
    pad: 1.2,
  },
];
