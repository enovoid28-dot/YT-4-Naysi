// Episode 32 — "Gempa Sumatera 2004 Memperpendek Hari di Seluruh Bumi."
//
// The Sumatra-Andaman megathrust earthquake (00:58:53 UTC, 26 Dec 2004, Mw
// 9.1-9.3) is the third largest instrumentally recorded quake (after Chile
// 1960 M9.5 and Alaska 1964 M9.2): ~1,300 km of the Sunda megathrust unzipped
// northward at ~2-3 km/s with 15-20 m slip over 8.3-10 minutes — the longest
// rupture and longest faulting duration ever observed. The seafloor lurched
// up several metres over ~200,000 km2, launching the tsunami (run-up ~30 m in
// Aceh, waves reaching Somalia after ~7 h; ~228,000 deaths in 14 countries).
// Rayleigh waves made every point on Earth move by up to ~1 cm and the
// planet rang in its normal modes for weeks. Redistribution of mass shortened
// the length of day by 2.68 microseconds and shifted the mean North pole /
// figure axis ~2.5 cm toward 145 deg E (NASA JPL, Gross & Chao); oblateness
// fell ~1 part in 10 billion — the spinning-skater mechanism. GPS measured
// the Andaman-Nicobar islands shifting metres SW; the quake triggered events
// as far as Alaska. Legacy: the 2005 Indian Ocean Tsunami Warning System.
//
// Sources (verified Nov 2026): USGS event page M9.1 off N Sumatra; NASA JPL
// "NASA Details Earthquake Effects on the Earth" (Gross & Chao, 2005); NOAA
// NCEI 2004 tsunami review; Stein & Okal (2005) speed of the rupture; Tsunami
// Warning System (UNESCO/IOC, 2005).
//
// Copy rules: one caption card per sentence, long sentences split at the
// comma, numbers spelled the way the voice says them.

export const SERIES = 'NAYSI · BUMI';
export const BRAND = 'NAYSI';

// finishing pass for this episode: full-frame geophysics worlds, house style
export const STYLE = { look: 'gempa', scrimY: 1786, scrimA: 0.55 };

export const SCENES = [
  {
    id: 's1', key: 'c1', label: 'SEPULUH MENIT', index: '01', theme: 'dark',
    vo: 'Pagi itu, tanah Aceh bergetar selama sepuluh menit. Bukan sepuluh detik: sepuluh menit. Dan getaran itu tidak tinggal di sana. Ia mengubah cara Bumi berputar, selamanya.',
    cap: [
      'Pagi itu, tanah Aceh bergetar',
      'selama sepuluh menit.',
      'Bukan sepuluh detik: sepuluh menit.',
      'Dan getaran itu tidak tinggal di sana.',
      'Ia mengubah cara Bumi berputar, selamanya.',
    ],
    lead: 0.25,
    pad: 0.2,
  },
  {
    id: 's2', key: 'c2', label: 'PEGAS TERKUNCI', index: '02', theme: 'dark',
    vo: 'Penyebabnya tidur di bawah laut: lempeng India menyelam di bawah lempeng Sunda, terkunci ratusan tahun, menegang seperti pegas raksasa. Pagi itu, pegasnya lepas sekaligus.',
    cap: [
      'Penyebabnya tidur di bawah laut:',
      'lempeng India menyelam di bawah lempeng Sunda,',
      'terkunci ratusan tahun,',
      'menegang seperti pegas raksasa.',
      'Pagi itu, pegasnya lepas sekaligus.',
    ],
    pad: 0.2,
  },
  {
    id: 's3', key: 'c3', label: 'ROBEKAN 1.300 KM', index: '03', theme: 'dark',
    vo: 'Retakan merobek patahan sepanjang seribu tiga ratus kilometer, dari Aceh sampai Kepulauan Andaman, merayap dua sampai tiga kilometer per detik. Dasar laut terhentak naik beberapa meter.',
    cap: [
      'Retakan merobek patahan sepanjang',
      'seribu tiga ratus kilometer,',
      'dari Aceh sampai Kepulauan Andaman,',
      'merayap dua sampai tiga kilometer per detik.',
      'Dasar laut terhentak naik beberapa meter.',
    ],
    pad: 0.2,
  },
  {
    id: 's4', key: 'c4', label: 'LONCENG PLANET', index: '04', theme: 'dark',
    vo: 'Itu robekan terpanjang dan getaran terlama yang pernah terekam alat. Seluruh planet bergetar sampai satu sentimeter, dan berdering seperti lonceng berminggu-minggu setelahnya.',
    cap: [
      'Itu robekan terpanjang dan getaran terlama',
      'yang pernah terekam alat.',
      'Seluruh planet bergetar sampai satu sentimeter,',
      'dan berdering seperti lonceng',
      'berminggu-minggu setelahnya.',
    ],
    pad: 0.2,
  },
  {
    id: 's5', key: 'c5', label: 'TSUNAMI', index: '05', theme: 'dark',
    vo: 'Hentakan dasar laut mendorong seluruh kolom air di atasnya. Lahirlah tsunami: dinding air setinggi tiga puluh meter di Aceh, menyeberangi samudra sampai tujuh jam.',
    cap: [
      'Hentakan dasar laut mendorong',
      'seluruh kolom air di atasnya.',
      'Lahirlah tsunami: dinding air',
      'setinggi tiga puluh meter di Aceh,',
      'menyeberangi samudra sampai tujuh jam.',
    ],
    pad: 0.2,
  },
  {
    id: 's6', key: 'c6', label: 'HARI MEMENDEK', index: '06', theme: 'dark',
    vo: 'Tapi ada efek yang lebih sunyi dan lebih aneh. Massa Bumi tersusun ulang sedikit lebih dekat ke poros, sehingga putaran Bumi bertambah cepat. Hari menjadi lebih pendek: dua koma enam delapan mikrodetik.',
    cap: [
      'Tapi ada efek yang lebih sunyi dan lebih aneh.',
      'Massa Bumi tersusun ulang',
      'sedikit lebih dekat ke poros,',
      'sehingga putaran Bumi bertambah cepat.',
      'Hari menjadi lebih pendek:',
      'dua koma enam delapan mikrodetik.',
    ],
    pad: 0.2,
  },
  {
    id: 's7', key: 'c7', label: 'POROS 2,5 CM', index: '07', theme: 'dark',
    vo: 'Poros Bumi juga bergeser sekitar dua setengah sentimeter ke arah seratus empat puluh lima derajat bujur timur. Kecil? Ya. Tapi itu poros seluruh planet, digeser oleh satu pagi di Sumatera.',
    cap: [
      'Poros Bumi juga bergeser sekitar',
      'dua setengah sentimeter,',
      'ke arah seratus empat puluh lima derajat bujur timur.',
      'Kecil? Ya. Tapi itu poros seluruh planet,',
      'digeser oleh satu pagi di Sumatera.',
    ],
    pad: 0.2,
  },
  {
    id: 's8', key: 'c8', label: 'PENARI ES', index: '08', theme: 'dark',
    vo: 'Fisikanya sama seperti pemain seluncur es yang menarik lengannya: badan merapat ke poros, putaran bertambah cepat. Bumi melakukan persis itu pada dua puluh enam Desember dua ribu empat.',
    cap: [
      'Fisikanya sama seperti pemain seluncur es',
      'yang menarik lengannya:',
      'badan merapat ke poros, putaran bertambah cepat.',
      'Bumi melakukan persis itu',
      'pada dua puluh enam desember dua ribu empat.',
    ],
    pad: 0.2,
  },
  {
    id: 's9', key: 'c9', label: 'TERBESAR KETIGA', index: '09', theme: 'dark',
    vo: 'Skalanya memang raksasa: magnitudo sembilan koma satu, gempa terbesar ketiga yang pernah dicatat seismograf, setelah Chile seribu sembilan ratus enam puluh dan Alaska seribu sembilan ratus enam puluh empat.',
    cap: [
      'Skalanya memang raksasa:',
      'magnitudo sembilan koma satu,',
      'gempa terbesar ketiga yang pernah dicatat seismograf,',
      'setelah Chile seribu sembilan ratus enam puluh',
      'dan Alaska seribu sembilan ratus enam puluh empat.',
    ],
    pad: 0.2,
  },
  {
    id: 's10', key: 'c10', label: 'JEJAK TERUKUR', index: '10', theme: 'dark',
    vo: 'Jejaknya terukur nyata: pulau-pulau di Andaman bergeser beberapa meter, garis pantai Aceh berubah, dan getarannya memicu gempa sampai sejauh Alaska.',
    cap: [
      'Jejaknya terukur nyata:',
      'pulau-pulau di Andaman bergeser beberapa meter,',
      'garis pantai Aceh berubah,',
      'dan getarannya memicu gempa sampai sejauh Alaska.',
    ],
    pad: 0.2,
  },
  {
    id: 's11', key: 'c11', label: 'PERMANEN', index: '11', theme: 'dark',
    vo: 'Perubahan panjang harinya kecil, tertutup pasang Bulan yang jauh lebih besar. Tapi geserannya nyata, terukur satelit, dan permanen: Bumi tidak pernah kembali persis seperti semula.',
    cap: [
      'Perubahan panjang harinya kecil,',
      'tertutup pasang Bulan yang jauh lebih besar.',
      'Tapi geserannya nyata, terukur satelit,',
      'dan permanen:',
      'Bumi tidak pernah kembali persis seperti semula.',
    ],
    pad: 0.2,
  },
  {
    id: 's12', key: 'c12', label: 'PERINGATAN DINI', index: '12', theme: 'dark',
    vo: 'Dari bencana itu lahir sistem peringatan tsunami Samudra Hindia, supaya pagi yang sama tidak berulang tanpa aba-aba. Bumi adalah mesin yang hidup; kita belajar membaca geraknya.',
    cap: [
      'Dari bencana itu lahir sistem peringatan',
      'tsunami Samudra Hindia,',
      'supaya pagi yang sama tidak berulang',
      'tanpa aba-aba.',
      'Bumi adalah mesin yang hidup;',
      'kita belajar membaca geraknya.',
    ],
    pad: 0.2,
  },
  {
    id: 's13', key: 'c13', label: 'KOMENTAR', index: '13', theme: 'dark',
    vo: 'Di mana kamu pagi itu, dan siapa yang pertama kamu cari? Tulis di komentar, dan ikuti Naysi untuk fakta sehari-hari berikutnya.',
    cap: [
      'Di mana kamu pagi itu,',
      'dan siapa yang pertama kamu cari?',
      'Tulis di komentar, dan ikuti Naysi',
      'untuk fakta sehari-hari berikutnya.',
    ],
    pad: 0.3,
  },
];
