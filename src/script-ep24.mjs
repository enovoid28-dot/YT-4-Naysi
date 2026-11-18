// Episode 24 — "Suara terkeras dalam sejarah ada di Indonesia."
//
// Krakatau, 27 August 1883, told as a chain of measurements: where the sound
// was heard, how loud it was, how many times it went round the planet, what
// actually killed people, what the ash did to skies on the other side of the
// world, and what is growing in the hole today. One number per scene, one
// picture per number, a question at the end that every viewer can answer.
//
// Sources (Nov 2026):
//   27 Aug 1883, final explosion ~10:02; heard on Rodrigues Island 4,800 km
//     away as "the roar of heavy guns", and in Perth (3,110 km).
//   Batavia gasworks gauge, 160 km away: spike > 2.5 inHg (8.5 kPa), off the
//     scale = more than 172 dB.
//   Norham Castle, 40 mi (64 km) away: "the ear-drums of over half my crew
//     have been shattered" (captain's log).
//   Pressure wave rounded the globe 3.5 times; barographs worldwide recorded
//     it seven times over five days.
//   Tsunami over 30 m; official death toll 36,417; 165 villages destroyed.
//   Red sunsets worldwide; "fire engines were called out in New York,
//     Poughkeepsie and New Haven to quench the apparent conflagration".
//   Anak Krakatau emerged from the caldera in 1927; PVMBG Level III (Siaga)
//     after a 25-hour continuous eruption on 4-6 September 2026.
//
// Copy rules: two sentences per scene == two caption cards, so every card is
// a measured block of audio and can never drift. Numbers spelled the way
// the voice says them.

export const SERIES = 'NAYSI · BUMI';
export const BRAND = 'NAYSI';

export const SCENES = [
  {
    id: 's1', key: 'w1', label: 'KRAKATAU', index: '01', theme: 'dark',
    vo: 'Suara terkeras dalam sejarah datang dari Indonesia. Tahun seribu delapan ratus delapan puluh tiga, Krakatau meledak.',
    cap: [
      'Suara *terkeras* dalam sejarah datang dari *Indonesia*.',
      'Tahun *seribu* *delapan* *ratus* *delapan* *puluh* *tiga*, *Krakatau* meledak.',
    ],
    pad: 1.0,
  },
  {
    id: 's2', key: 'w2', label: '4.800 KM', index: '02', theme: 'dark',
    vo: 'Suaranya terdengar sampai empat ribu delapan ratus kilometer. Hampir sejauh Sabang ke Merauke.',
    cap: [
      'Suaranya terdengar sampai *empat* *ribu* *delapan* *ratus* *kilometer*.',
      'Hampir sejauh *Sabang* ke *Merauke*.',
    ],
    pad: 1.0,
  },
  {
    id: 's3', key: 'w3', label: '170 dB', index: '03', theme: 'dark',
    vo: 'Kerasnya lebih dari seratus tujuh puluh desibel. Enam puluh empat kilometer jauhnya, gendang telinga pelaut pecah.',
    cap: [
      'Kerasnya lebih dari *seratus* *tujuh* *puluh* *desibel*.',
      '*Enam* *puluh* *empat* *kilometer* jauhnya, *gendang* *telinga* pelaut *pecah*.',
    ],
    pad: 1.0,
  },
  {
    id: 's4', key: 'w4', label: '3,5 KALI', index: '04', theme: 'dark',
    vo: 'Gelombang tekanannya mengelilingi Bumi tiga setengah kali. Barometer di seluruh dunia mencatatnya tujuh kali.',
    cap: [
      'Gelombang tekanannya mengelilingi *Bumi* *tiga* *setengah* *kali*.',
      '*Barometer* di seluruh dunia mencatatnya *tujuh* *kali*.',
    ],
    pad: 1.0,
  },
  {
    id: 's5', key: 'w5', label: 'TSUNAMI', index: '05', theme: 'dark',
    vo: 'Tapi yang paling mematikan justru tsunaminya. Ombak tiga puluh meter menewaskan lebih dari tiga puluh enam ribu orang.',
    cap: [
      'Tapi yang paling mematikan justru *tsunaminya*.',
      'Ombak *tiga* *puluh* *meter* menewaskan lebih dari *tiga* *puluh* *enam* *ribu* orang.',
    ],
    pad: 1.0,
  },
  {
    id: 's6', key: 'w6', label: 'LANGIT MERAH', index: '06', theme: 'dark',
    vo: 'Abunya membuat senja di seluruh dunia merah menyala. Di New York, petugas pemadam sampai dipanggil karena dikira ada kebakaran.',
    cap: [
      'Abunya membuat *senja* di seluruh dunia *merah* *menyala*.',
      'Di *New* *York*, petugas *pemadam* sampai dipanggil karena dikira ada *kebakaran*.',
    ],
    pad: 1.0,
  },
  {
    id: 's7', key: 'w7', label: 'ANAK KRAKATAU', index: '07', theme: 'dark',
    vo: 'Kini di kalderanya tumbuh Anak Krakatau, dan masih aktif. Tulis di komentar: gunung api terdekat dari rumahmu apa?',
    cap: [
      'Kini di kalderanya tumbuh *Anak* *Krakatau*, dan masih *aktif*.',
      'Tulis di komentar: *gunung* *api* terdekat dari rumahmu apa?',
    ],
    pad: 1.8,
  },
];
