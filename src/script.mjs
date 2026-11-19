// Episode 29 — "Indonesia lebih lebar dari Amerika Serikat."
//
// Why the map on every classroom wall makes Indonesia look small: Mercator's
// 1569 sailing chart stretches the world away from the equator (area x4 at
// 60 degrees), so Greenland rivals Africa (really 14x smaller) and Europe is
// drawn at more than twice its size, while Indonesia, on the equator, is
// drawn almost true. Moved at true size, Sabang-Merauke runs from Ireland past
// the Caspian Sea; its width beats the United States coast to coast; and on
// 4 September 2026 the UN General Assembly backed equal-area maps 164 to 1,
// the one "no" being the United States.
//
// Sources (Nov 2026):
//   Mercator, "Nova et Aucta Orbis Terrae Descriptio" (1569); Mercator scale
//     factor sec(lat), area factor sec^2(lat): x2.00 at 45 deg, x2.42 at 50,
//     x4.00 at 60, x10.5 at 72 (Greenland).
//   Areas: Africa 30.37 million km2, Greenland 2.17 million km2 (UN 2017
//     figures as quoted by Visual Capitalist, Jan 2026) -> about 14x.
//   Indonesia: 6 N - 11 S, 95 E - 141 E, ~5,120 km east-west (CIA / standard
//     references); our Natural Earth 1:50m geometry: 5,175 km between the
//     extreme points, Sabang-Merauke 5,248 km great-circle.
//   Contiguous United States: ~2,800 mi (4,500 km) coast to coast; Natural
//     Earth: 124.7 W - 67.0 E, 4,544 km along 45 N, 4,322 km great-circle.
//   True-size move (rotation on the sphere, no Mercator rescale): Sabang set on
//     west Ireland (9.7 W, 52.8 N) puts Merauke at 59.3 E, 40.1 N
//     (Turkmenistan, east of the Caspian Sea).
//   UN General Assembly, "Correct the Map: rebalancing global cartographic
//     representation ... particularly Africa", A/RES/80/307 (draft A/80/L.104),
//     adopted 4 Sept 2026: 164 in favour, 1 against (United States),
//     6 abstentions; non-binding; encourages Equal Earth and other equal-area
//     projections (Šavrič, Patterson & Jenny 2018).
//
// Copy rules: one caption card per sentence, long sentences split at the
// comma, numbers spelled the way the voice says them.

export const SERIES = 'NAYSI · ATLAS';
export const BRAND = 'NAYSI';

// finishing pass for this episode: atlas sheets dealt onto a dark chart table
export const STYLE = { look: 'atlas', scrimY: 1786, scrimA: 0.55 };

export const SCENES = [
  {
    id: 's1', key: 'g1', label: 'LEBIH LEBAR', index: '01', theme: 'dark',
    vo: 'Indonesia itu lebih lebar dari Amerika Serikat. Tapi di peta dunia yang kita lihat sejak SD, Indonesia terlihat kecil.',
    cap: [
      'Indonesia itu lebih lebar dari Amerika Serikat.',
      'Tapi di peta dunia yang kita lihat sejak SD, Indonesia terlihat kecil.',
    ],
    lead: 0.36,
    pad: 0.42,
  },
  {
    id: 's2', key: 'g2', label: 'MERCATOR', index: '02', theme: 'dark',
    vo: 'Penyebabnya proyeksi Mercator, peta buatan tahun seribu lima ratus enam puluh sembilan untuk para pelaut. Bumi yang bulat dibentangkan jadi persegi panjang. Makin jauh dari khatulistiwa, wilayah makin digelembungkan.',
    cap: [
      'Penyebabnya proyeksi Mercator,',
      'peta buatan tahun seribu lima ratus enam puluh sembilan untuk para pelaut.',
      'Bumi yang bulat dibentangkan jadi persegi panjang.',
      'Makin jauh dari khatulistiwa, wilayah makin digelembungkan.',
    ],
    pad: 0.42,
  },
  {
    id: 's3', key: 'g3', label: 'DISTORSI', index: '03', theme: 'dark',
    vo: 'Di garis lintang enam puluh derajat, luasnya sudah empat kali lipat. Greenland terlihat sebesar Afrika, padahal Afrika empat belas kali lebih luas.',
    cap: [
      'Di garis lintang enam puluh derajat, luasnya sudah empat kali lipat.',
      'Greenland terlihat sebesar Afrika,',
      'padahal Afrika empat belas kali lebih luas.',
    ],
    pad: 0.42,
  },
  {
    id: 's4', key: 'g4', label: 'KHATULISTIWA', index: '04', theme: 'dark',
    vo: 'Indonesia ada tepat di khatulistiwa, jadi ukurannya hampir tidak digelembungkan. Sementara Eropa tampil lebih dari dua kali luas aslinya.',
    cap: [
      'Indonesia ada tepat di khatulistiwa,',
      'jadi ukurannya hampir tidak digelembungkan.',
      'Sementara Eropa tampil lebih dari dua kali luas aslinya.',
    ],
    pad: 0.42,
  },
  {
    id: 's5', key: 'g5', label: 'UKURAN ASLI', index: '05', theme: 'dark',
    vo: 'Sekarang pindahkan Indonesia ke Eropa dengan ukuran aslinya. Dari Sabang sampai Merauke, ia membentang dari Irlandia sampai melewati Laut Kaspia.',
    cap: [
      'Sekarang pindahkan Indonesia ke Eropa dengan ukuran aslinya.',
      'Dari Sabang sampai Merauke,',
      'ia membentang dari Irlandia sampai melewati Laut Kaspia.',
    ],
    pad: 0.42,
  },
  {
    id: 's6', key: 'g6', label: 'AMERIKA', index: '06', theme: 'dark',
    vo: 'Lebarnya sekitar lima ribu seratus kilometer. Amerika Serikat dari pantai ke pantai cuma sekitar empat ribu lima ratus.',
    cap: [
      'Lebarnya sekitar lima ribu seratus kilometer.',
      'Amerika Serikat dari pantai ke pantai cuma sekitar empat ribu lima ratus.',
    ],
    pad: 0.42,
  },
  {
    id: 's7', key: 'g7', label: 'PBB', index: '07', theme: 'dark',
    vo: 'Empat September lalu, PBB mendukung pemakaian peta yang ukurannya sesuai luas asli. Seratus enam puluh empat negara setuju. Yang menolak cuma satu: Amerika Serikat.',
    cap: [
      'Empat September lalu,',
      'PBB mendukung pemakaian peta yang ukurannya sesuai luas asli.',
      'Seratus enam puluh empat negara setuju.',
      'Yang menolak cuma satu: Amerika Serikat.',
    ],
    pad: 0.42,
  },
  {
    id: 's8', key: 'g8', label: 'PULAUMU', index: '08', theme: 'dark',
    vo: 'Jadi, Indonesia tidak sekecil yang kamu kira. Kamu tinggal di pulau mana? Tulis di komentar.',
    cap: [
      'Jadi, Indonesia tidak sekecil yang kamu kira.',
      'Kamu tinggal di pulau mana? Tulis di komentar.',
    ],
    pad: 1.8,
  },
];
