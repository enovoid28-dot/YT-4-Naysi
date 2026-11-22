// Episode 36 (remake of Ep29) — "Indonesia Lebih Lebar dari Amerika Serikat."
//
// Thesis: the classroom map lies. Mercator's 1569 sailing chart inflates
// everything away from the equator, so Indonesia — straddling it — reads tiny,
// while Greenland fakes Africa's size. At true size Indonesia's 5,100 km span
// outruns the contiguous United States' 4,500 km, reaches from Ireland past
// the Caspian, and on 4 Sept 2026 the UN General Assembly backed equal-area
// maps 164-1, the lone "no" being the United States.
//
// Remake note: Ep29 told this in 8 beats on paper atlas sheets. This version
// retells it in 15 beats inside a holographic projection room — a wire globe,
// a live Mercator lattice that inflates with latitude, glowing coastlines,
// calipers, zone dials and a UN vote tally — the house standard since Ep33.
//
// Sources (carried from Ep29 dossier, Nov 2026):
//   Mercator 1569; scale factor sec(lat), area sec^2(lat): x2.00 @45, x2.42
//     @50, x4.00 @60, x10.5 @72 (Greenland).
//   Africa 30.37 M km2 vs Greenland 2.17 M km2 -> ~14x (UN 2017 figures).
//   Indonesia 6 N-11 S, 95 E-141 E; ~5,120 km east-west; Sabang-Merauke
//     5,248 km great-circle; Natural Earth extremes 5,175 km.
//   Contiguous US ~4,500 km coast to coast (4,544 km along 45 N).
//   True-size move: Sabang on west Ireland (9.7 W, 52.8 N) -> Merauke at
//     59.3 E, 40.1 N (east of the Caspian).
//   UNGA A/RES/80/307, adopted 4 Sept 2026: 164-1-6, non-binding, encourages
//     Equal Earth (Šavrič, Patterson & Jenny 2018).
//   Indonesia: >17,000 islands, 3 time zones (WIB/WITA/WIT, UTC+7/+8/+9),
//     coastline ~99,000 km, second longest on Earth.
//
// Copy rules: one caption card per clause, numbers spelled the way the voice
// says them, max three caption lines on screen at once.

export const SERIES = 'NAYSI · KARTOGRAFI';
export const BRAND = 'NAYSI';

// finishing pass for this episode: holographic projection room
export const STYLE = { look: 'proyeksi', scrimY: 1786, scrimA: 0.55 };

export const SCENES = [
  {
    id: 's1', key: 'i1', label: 'LEBIH LEBAR', index: '01', theme: 'dark',
    vo: 'Indonesia itu lebih lebar dari Amerika Serikat. Tapi di peta dunia yang kita hafal sejak sekolah dasar, Indonesia terlihat kecil.',
    cap: [
      'Indonesia itu lebih lebar',
      'dari Amerika Serikat.',
      'Tapi di peta dunia yang kita hafal',
      'sejak sekolah dasar,',
      'Indonesia terlihat kecil.',
    ],
    lead: 0.36,
    pad: 1.0,
  },
  {
    id: 's2', key: 'i2', label: 'MERCATOR 1569', index: '02', theme: 'dark',
    vo: 'Penyebabnya proyeksi Mercator: peta tahun seribu lima ratus enam puluh sembilan, dibuat untuk pelaut yang berlayar lurus. Bumi yang bulat dibentangkan jadi persegi panjang.',
    cap: [
      'Penyebabnya proyeksi Mercator:',
      'peta tahun seribu lima ratus',
      'enam puluh sembilan,',
      'dibuat untuk pelaut yang berlayar lurus.',
      'Bumi yang bulat dibentangkan',
      'jadi persegi panjang.',
    ],
    pad: 1.0,
  },
  {
    id: 's3', key: 'i3', label: 'DIGELEMBUNGKAN', index: '03', theme: 'dark',
    vo: 'Makin jauh dari khatulistiwa, wilayah makin digelembungkan. Di lintang enam puluh derajat, luasnya sudah empat kali lipat.',
    cap: [
      'Makin jauh dari khatulistiwa,',
      'wilayah makin digelembungkan.',
      'Di lintang enam puluh derajat,',
      'luasnya sudah empat kali lipat.',
    ],
    pad: 1.0,
  },
  {
    id: 's4', key: 'i4', label: 'GREENLAND vs AFRIKA', index: '04', theme: 'dark',
    vo: 'Greenland terlihat sebesar Afrika, padahal Afrika empat belas kali lebih luas. Eropa tampil lebih dari dua kali luas aslinya.',
    cap: [
      'Greenland terlihat sebesar Afrika,',
      'padahal Afrika empat belas kali',
      'lebih luas.',
      'Eropa tampil lebih dari dua kali',
      'luas aslinya.',
    ],
    pad: 1.0,
  },
  {
    id: 's5', key: 'i5', label: 'DI KHATULISTIWA', index: '05', theme: 'dark',
    vo: 'Indonesia justru duduk tepat di khatulistiwa, jadi tubuhnya hampir tidak digelembungkan sama sekali: ia tampil apa adanya, kecil di peta yang bohong.',
    cap: [
      'Indonesia justru duduk tepat',
      'di khatulistiwa,',
      'jadi tubuhnya hampir tidak',
      'digelembungkan sama sekali:',
      'ia tampil apa adanya,',
      'kecil di peta yang bohong.',
    ],
    pad: 1.0,
  },
  {
    id: 's6', key: 'i6', label: '46 DERAJAT BUJUR', index: '06', theme: 'dark',
    vo: 'Padahal bentangnya sembilan puluh lima sampai seratus empat puluh satu derajat bujur timur: empat puluh enam derajat, tepat di bagian terlebar Bumi.',
    cap: [
      'Padahal bentangnya sembilan puluh',
      'lima sampai seratus empat puluh satu',
      'derajat bujur timur:',
      'empat puluh enam derajat,',
      'tepat di bagian terlebar Bumi.',
    ],
    pad: 1.0,
  },
  {
    id: 's7', key: 'i7', label: 'UKURAN ASLI', index: '07', theme: 'dark',
    vo: 'Sekarang pindahkan Indonesia ke Eropa dengan ukuran aslinya. Dari Sabang sampai Merauke, ia membentang dari Irlandia sampai melewati Laut Kaspia.',
    cap: [
      'Sekarang pindahkan Indonesia',
      'ke Eropa dengan ukuran aslinya.',
      'Dari Sabang sampai Merauke,',
      'ia membentang dari Irlandia',
      'sampai melewati Laut Kaspia.',
    ],
    pad: 1.0,
  },
  {
    id: 's8', key: 'i8', label: '5.100 vs 4.500', index: '08', theme: 'dark',
    vo: 'Lebarnya sekitar lima ribu seratus kilometer. Amerika Serikat, dari pantai ke pantai, cuma sekitar empat ribu lima ratus.',
    cap: [
      'Lebarnya sekitar lima ribu',
      'seratus kilometer.',
      'Amerika Serikat, dari pantai',
      'ke pantai,',
      'cuma sekitar empat ribu lima ratus.',
    ],
    pad: 1.0,
  },
  {
    id: 's9', key: 'i9', label: 'TELANGKUPKAN', index: '09', theme: 'dark',
    vo: 'Telangkupkan Indonesia di atas Amerika Serikat: kedua ujungnya menonjol keluar, melewati Atlantik dan Pasifik sekaligus.',
    cap: [
      'Telangkupkan Indonesia',
      'di atas Amerika Serikat:',
      'kedua ujungnya menonjol keluar,',
      'melewati Atlantik dan Pasifik',
      'sekaligus.',
    ],
    pad: 1.0,
  },
  {
    id: 's10', key: 'i10', label: '17 RIBU PULAU', index: '10', theme: 'dark',
    vo: 'Lebar itu bukan satu daratan: lebih dari tujuh belas ribu pulau, dirangkai laut, dengan garis pantai terpanjang kedua di dunia.',
    cap: [
      'Lebar itu bukan satu daratan:',
      'lebih dari tujuh belas ribu pulau,',
      'dirangkai laut,',
      'dengan garis pantai terpanjang',
      'kedua di dunia.',
    ],
    pad: 1.0,
  },
  {
    id: 's11', key: 'i11', label: 'TIGA ZONA WAKTU', index: '11', theme: 'dark',
    vo: 'Saking lebarnya, satu negara memakai tiga zona waktu: saat pukul tujuh pagi matahari sudah tinggi di Jayapura, Banda Aceh masih pukul lima.',
    cap: [
      'Saking lebarnya, satu negara',
      'memakai tiga zona waktu:',
      'saat pukul tujuh pagi matahari',
      'sudah tinggi di Jayapura,',
      'Banda Aceh masih pukul lima.',
    ],
    pad: 1.0,
  },
  {
    id: 's12', key: 'i12', label: 'SUARA PBB 164-1', index: '12', theme: 'dark',
    vo: 'Empat September lalu, Majelis Umum PBB mendukung peta yang menjaga luas asli tiap benua. Seratus enam puluh empat negara setuju; yang menolak cuma satu: Amerika Serikat.',
    cap: [
      'Empat September lalu,',
      'Majelis Umum PBB mendukung peta',
      'yang menjaga luas asli tiap benua.',
      'Seratus enam puluh empat negara',
      'setuju;',
      'yang menolak cuma satu:',
      'Amerika Serikat.',
    ],
    pad: 1.0,
  },
  {
    id: 's13', key: 'i13', label: 'EQUAL EARTH', index: '13', theme: 'dark',
    vo: 'Peta itu bernama Equal Earth, lahir tahun dua ribu delapan belas: bentuk tetap dikenali, luas tetap jujur.',
    cap: [
      'Peta itu bernama Equal Earth,',
      'lahir tahun dua ribu delapan belas:',
      'bentuk tetap dikenali,',
      'luas tetap jujur.',
    ],
    pad: 1.0,
  },
  {
    id: 's14', key: 'i14', label: 'PETA MENGATUR', index: '14', theme: 'dark',
    vo: 'Karena peta yang kita hafal diam-diam memutuskan siapa yang terlihat raksasa dan siapa yang terlihat kecil.',
    cap: [
      'Karena peta yang kita hafal',
      'diam-diam memutuskan',
      'siapa yang terlihat raksasa',
      'dan siapa yang terlihat kecil.',
    ],
    pad: 1.0,
  },
  {
    id: 's15', key: 'i15', label: 'PULAUMU', index: '15', theme: 'dark',
    vo: 'Jadi Indonesia tidak sekecil yang kamu kira. Kamu tinggal di pulau mana? Tulis di komentar.',
    cap: [
      'Jadi Indonesia tidak sekecil',
      'yang kamu kira.',
      'Kamu tinggal di pulau mana?',
      'Tulis di komentar.',
    ],
    pad: 1.0,
  },
];
