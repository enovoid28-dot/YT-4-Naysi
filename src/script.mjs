// Episode 36 — "Kamera di ponselmu lahir dari kamar gelap tahun 1011."
//
// Thesis: the camera in your pocket descends from a thousand-year-old
// experiment in a dark room in Cairo, made by a man who had failed at the one
// job he was hired for. The film is an optics bench: a real 3D dark chamber
// with a pinhole and an inverted wall image, ray bundles that obey the physics,
// candles that prove straight propagation, the eclipse crescent, an eye cut in
// half to kill the emission theory, three volumes of the Kitab al-Manazir on
// cream paper, and one unbroken light ray that runs from 1011 to the viewfinder
// in your hand.
//
// Sources (verified Nov 2026):
//   Ibn al-Haytham (Abu Ali al-Hasan ibn al-Hasan), born 965 Basra, died 1040
//     Cairo. Invited to Egypt by the Fatimid caliph al-Hakim to regulate the
//     Nile; after seeing the river he judged the project impossible, withdrew,
//     was placed under house arrest (c. 1011-1021) and is said to have feigned
//     madness to survive. Kitab al-Manazir (Book of Optics), seven volumes,
//     written 1011-1021.
//   The dark chamber he called al-bait al-muzlim ("the dark room"), Latin
//     camera obscura: a pinhole in a shuttered window throws an inverted image
//     of the outside world onto the facing wall; he used it to observe a solar
//     eclipse and saw the sun's disc arrive as a crescent. Multiple candles
//     each send their own beam through the hole without interfering -> light
//     travels in straight lines. Moving the screen changes the image size.
//   Vision: he rejected the extramission theory of Euclid and Ptolemy (rays
//     leaving the eye) and established intromission — light from objects enters
//     the eye — with anatomy of lens, cornea and retina. Not the first to see a
//     camera obscura (Mozi and Aristotle noted it), but the first to test,
//     measure and explain it.
//   Latin West: De Aspectibus / Perspectiva, printed by Friedrich Risner in
//     1572 as Opticae Thesaurus; read by Roger Bacon, Witelo, Leonardo,
//     Kepler, Descartes, Newton. Kepler's 1604 Ad Vitellionem builds on it.
//     First permanent photograph: Nicéphore Niépce, 1826 — 815 years later.
//
// Copy rules: one caption card per clause, numbers spelled the way the voice
// says them, and no card repeats the word of the visual it sits under.

export const SERIES = 'NAYSI · CAHAYA';
export const BRAND = 'NAYSI';

// finishing pass for this episode: a warm beam in a black room, cream pages
export const STYLE = { look: 'optika', scrimY: 1804, scrimA: 0.6 };

export const SCENES = [
  {
    id: 's1', key: 'o1', label: 'KAMAR GELAP', index: '01', theme: 'dark',
    vo: 'Setiap kali kamu memotret, kamu memakai penemuan seorang tahanan dari Kairo. Namanya Ibn al-Haytham.',
    cap: [
      'Setiap kali kamu memotret,',
      'kamu memakai penemuan seorang tahanan dari Kairo.',
      'Namanya Ibn al-Haytham.',
    ],
    lead: 0.34,
    pad: 0.44,
  },
  {
    id: 's2', key: 'o2', label: 'BASRA, 965', index: '02', theme: 'dark',
    vo: 'Tahun sembilan ratus enam puluh lima, ia lahir di Basra. Lalu ia dipanggil ke Kairo.',
    cap: [
      'Tahun sembilan ratus enam puluh lima,',
      'ia lahir di Basra.',
      'Lalu ia dipanggil ke Kairo.',
    ],
    pad: 0.44,
  },
  {
    id: 's3', key: 'o3', label: 'SUNGAI NIL', index: '03', theme: 'dark',
    vo: 'Tugasnya mengatur Sungai Nil. Ia melihat sungainya, lalu sadar proyek itu mustahil. Gagal berarti mati.',
    cap: [
      'Tugasnya mengatur Sungai Nil.',
      'Ia melihat sungainya, lalu sadar proyek itu mustahil.',
      'Gagal berarti mati.',
    ],
    pad: 0.44,
  },
  {
    id: 's4', key: 'o4', label: 'SEPULUH TAHUN', index: '04', theme: 'dark',
    vo: 'Jadi ia berpura-pura gila, dan dikurung di rumahnya sendiri selama sepuluh tahun. Di dalam gelap itulah semuanya dimulai.',
    cap: [
      'Jadi ia berpura-pura gila,',
      'dan dikurung di rumahnya sendiri selama sepuluh tahun.',
      'Di dalam gelap itulah semuanya dimulai.',
    ],
    pad: 0.44,
  },
  {
    id: 's5', key: 'o5', label: 'AL-BAIT AL-MUZLIM', index: '05', theme: 'dark',
    vo: 'Cahaya masuk lewat satu lubang kecil. Di dinding seberang, dunia muncul terbalik. Ia menyebutnya al-bait al-muzlim: rumah yang gelap.',
    cap: [
      'Cahaya masuk lewat satu lubang kecil.',
      'Di dinding seberang, dunia muncul terbalik.',
      'Ia menyebutnya al-bait al-muzlim: rumah yang gelap.',
    ],
    pad: 0.44,
  },
  {
    id: 's6', key: 'o6', label: 'TIGA LILIN', index: '06', theme: 'dark',
    vo: 'Ia menguji dengan tiga lilin. Setiap berkas lewat lubang tanpa saling mengganggu. Cahaya berjalan lurus.',
    cap: [
      'Ia menguji dengan tiga lilin.',
      'Setiap berkas lewat lubang tanpa saling mengganggu.',
      'Cahaya berjalan lurus.',
    ],
    pad: 0.44,
  },
  {
    id: 's7', key: 'o7', label: 'SABIT DI DINDING', index: '07', theme: 'dark',
    vo: 'Gerhana matahari pun ia lihat dari kamar itu. Matahari yang bulat datang ke dinding sebagai sabit.',
    cap: [
      'Gerhana matahari pun ia lihat dari kamar itu.',
      'Matahari yang bulat datang ke dinding sebagai sabit.',
    ],
    pad: 0.44,
  },
  {
    id: 's8', key: 'o8', label: 'MATA BUKAN LAMPU', index: '08', theme: 'dark',
    vo: 'Selama seribu tahun, orang percaya mata memancarkan cahaya, seperti senter. Ia membuktikan sebaliknya: cahaya masuk ke mata. Mata bukan lampu. Mata adalah jendela.',
    cap: [
      'Selama seribu tahun, orang percaya mata memancarkan cahaya.',
      'Ia membuktikan sebaliknya: cahaya masuk ke mata.',
      'Mata bukan lampu. Mata adalah jendela.',
    ],
    pad: 0.44,
  },
  {
    id: 's9', key: 'o9', label: 'UJI, UKUR, ULANG', index: '09', theme: 'dark',
    vo: 'Yang lebih penting dari temuannya adalah caranya: menguji, mengukur, mengulang. Lima abad kemudian, cara itu disebut metode ilmiah.',
    cap: [
      'Yang lebih penting dari temuannya adalah caranya:',
      'menguji, mengukur, mengulang.',
      'Lima abad kemudian, cara itu disebut metode ilmiah.',
    ],
    pad: 0.44,
  },
  {
    id: 's10', key: 'o10', label: 'TUJUH JILID', index: '10', theme: 'dark',
    vo: 'Semuanya ia tulis dalam tujuh jilid, Kitab al-Manazir, antara seribu sebelas dan seribu dua puluh satu.',
    cap: [
      'Semuanya ia tulis dalam tujuh jilid:',
      'Kitab al-Manazir,',
      'antara seribu sebelas dan seribu dua puluh satu.',
    ],
    pad: 5.4,
  },
];
