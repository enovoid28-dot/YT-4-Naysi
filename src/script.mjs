// Episode 23 — "Kenapa Bulan selalu menghadap kita?"
//
// Tidal locking, told as a chain of facts: the same face for a lifetime, the
// 27.3-day match, the bulge that braked the spin, the wobble that lets us
// peek at 59%, the far side that is not dark, and the brake the Moon puts
// on Earth itself. Concise and structured, like CPI: one number per scene,
// one mechanism per scene, one insight at the end.
//
// Sources (Nov 2026):
//   Sidereal rotation = orbit = 27.32 days; same hemisphere faces Earth.
//   Formed ~4.5 billion years ago, spun faster; Earth's gravity raised a
//     tidal bulge, torque slowed the spin until it matched the orbit.
//   Libration (elliptical orbit) lets observers see ~59% of the surface.
//   Far side first photographed by Luna 3 in 1959; it gets equal sunlight.
//   Moon recedes ~3.8 cm/year; Earth's day was ~4 h early, now 24 h and
//     lengthening; mutual lock would take ~50 billion years (Sun first).
//
// Copy rules: two sentences per scene == two caption cards, so every card is
// a measured block of audio and can never drift. Numbers spelled the way
// the voice says them.

export const SERIES = 'NAYSI · LANGIT';
export const BRAND = 'NAYSI';

export const SCENES = [
  {
    id: 's1', key: 'v1', label: 'WAJAH SAMA', index: '01', theme: 'dark',
    vo: 'Kamu sudah lihat Bulan seumur hidup. Tapi kamu tidak pernah lihat sisi satunya.',
    cap: [
      'Kamu sudah lihat *Bulan* seumur hidup.',
      'Tapi kamu tidak pernah lihat *sisi* *satunya*.',
    ],
    pad: 1.5,
  },
  {
    id: 's2', key: 'v2', label: '27,3 HARI', index: '02', theme: 'dark',
    vo: 'Bulan berputar dua puluh tujuh koma tiga hari. Mengelilingi Bumi juga dua puluh tujuh koma tiga hari, sama persis.',
    cap: [
      'Bulan berputar *dua* *puluh* *tujuh* *koma* *tiga* *hari*.',
      'Mengelilingi *Bumi* juga *dua* *puluh* *tujuh* *koma* *tiga* *hari*, *sama* *persis*.',
    ],
    pad: 1.5,
  },
  {
    id: 's3', key: 'v3', label: 'REM', index: '03', theme: 'dark',
    vo: 'Dulu Bulan berputar jauh lebih cepat. Gravitasi Bumi menarik tonjolan terdekat, lalu melambat sampai pas.',
    cap: [
      'Dulu *Bulan* berputar jauh lebih cepat.',
      'Gravitasi *Bumi* menarik *tonjolan* terdekat, lalu melambat sampai pas.',
    ],
    pad: 1.5,
  },
  {
    id: 's4', key: 'v4', label: 'GOYANG', index: '04', theme: 'dark',
    vo: 'Tapi tidak kaku. Orbitnya elips, jadi Bulan bergoyang, dan kita bisa intip lima puluh sembilan persen.',
    cap: [
      'Tapi tidak *kaku*.',
      'Orbitnya *elips*, jadi *Bulan* bergoyang, dan kita bisa intip *lima* *puluh* *sembilan* *persen*.',
    ],
    pad: 1.5,
  },
  {
    id: 's5', key: 'v5', label: '1959', index: '05', theme: 'dark',
    vo: 'Sisi jauh bukan sisi gelap, ia kena matahari sama saja. Baru difoto tahun seribu sembilan ratus lima puluh sembilan oleh Luna tiga.',
    cap: [
      'Sisi jauh bukan *sisi* *gelap*, ia kena *matahari* sama saja.',
      'Baru difoto tahun *seribu* *sembilan* *ratus* *lima* *puluh* *sembilan* oleh *Luna* *tiga*.',
    ],
    pad: 1.5,
  },
  {
    id: 's6', key: 'v6', label: 'REM BUMI', index: '06', theme: 'dark',
    vo: 'Bulan juga mengerem Bumi. Dulu sehari cuma empat jam, sekarang dua puluh empat jam, dan terus memanjang.',
    cap: [
      '*Bulan* juga mengerem *Bumi*.',
      'Dulu sehari cuma *empat* *jam*, sekarang *dua* *puluh* *empat* *jam*, dan terus memanjang.',
    ],
    pad: 1.5,
  },
  {
    id: 's7', key: 'v7', label: 'TERKUNCI', index: '07', theme: 'dark',
    vo: 'Jadi Bulan tidak diam, ia terkunci. Tulis di komentar: kamu lihat Bulan purnama dari mana?',
    cap: [
      'Jadi *Bulan* tidak diam, ia *terkunci*.',
      'Tulis di komentar: kamu lihat *Bulan* *purnama* dari mana?',
    ],
    pad: 1.8,
  },
];
