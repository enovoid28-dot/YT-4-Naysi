// Episode 28 — "Hiu lebih tua dari pohon."
//
// Deep time told through one animal: the oldest shark evidence (scales,
// ~450 million years) against the first trees (~385 million years); the
// whole of Earth's history squeezed into one day; five mass extinctions
// survived; a fossil record made almost only of teeth; a living shark born in
// the age of the VOC — and the turn at the end: after 450 million years,
// overfishing, with Indonesia as the largest shark catcher on Earth.
//
// Sources (Nov 2026):
//   Natural History Museum (London), shark evolution timeline: earliest
//     shark-like scales from Late Ordovician rocks, ~450 million years
//     (Colorado); undisputed scales ~420 million years. Sharks survived all
//     five mass extinctions. NHM, "What can shark teeth tell us?": teeth
//     replaced like a conveyor belt, some species go through ~30,000.
//   W. E. Stein et al., Current Biology 30 (2020) / Stein et al., Nature 446
//     (2007): Archaeopteris and Wattieza (Gilboa and Cairo, New York),
//     the earliest trees and forests, ~385-386 million years.
//   J. Nielsen et al., "Eye lens radiocarbon reveals centuries of longevity
//     in the Greenland shark", Science 353 (2016): largest animal
//     392 ± 120 years, longest-lived vertebrate known.
//   N. K. Dulvy et al., "Overfishing drives over one-third of all sharks and
//     rays toward a global extinction crisis", Current Biology 31 (2021):
//     37.5 % threatened, overfishing the universal threat.
//   TRAFFIC (2019), "An overview of major shark traders, catchers and
//     species": Indonesia the top shark catcher 2007-2017, mean 110,737 t/yr.
//   Earth 4.54 billion years; Homo sapiens ~300,000 years: on a 24-hour
//     clock sharks arrive at 21:37, trees at 21:58, us 5.7 s before midnight.
//
// Copy rules: one caption card per sentence, long sentences split at the
// comma, so every card is a measured block of audio and can never drift.
// Numbers spelled the way the voice says them.

export const SERIES = 'NAYSI · PURBA';
export const BRAND = 'NAYSI';

// finishing pass for this episode: printed-paper look, no glow, no RGB split
export const STYLE = { look: 'print' };

export const SCENES = [
  {
    id: 's1', key: 'a1', label: 'LEBIH TUA', index: '01', theme: 'dark',
    vo: 'Hiu itu lebih tua dari pohon. Saat hiu pertama berenang di laut, daratan masih gundul, cuma ada lumut.',
    cap: [
      'Hiu itu lebih tua dari pohon.',
      'Saat hiu pertama berenang di laut, daratan masih gundul, cuma ada lumut.',
    ],
    lead: 0.36,
    pad: 0.42,
  },
  {
    id: 's2', key: 'a2', label: 'BUKTI FOSIL', index: '02', theme: 'dark',
    vo: 'Bukti hiu tertua: sisik berumur sekitar empat ratus lima puluh juta tahun. Pohon pertama baru muncul sekitar tiga ratus delapan puluh lima juta tahun lalu. Selisihnya enam puluh lima juta tahun.',
    cap: [
      'Bukti hiu tertua: sisik berumur sekitar empat ratus lima puluh juta tahun.',
      'Pohon pertama baru muncul sekitar tiga ratus delapan puluh lima juta tahun lalu.',
      'Selisihnya enam puluh lima juta tahun.',
    ],
    pad: 0.42,
  },
  {
    id: 's3', key: 'a3', label: 'JAM BUMI', index: '03', theme: 'dark',
    vo: 'Kalau sejarah bumi dipadatkan jadi dua puluh empat jam, hiu muncul jam sembilan lewat tiga puluh tujuh malam. Pohon, jam sepuluh kurang dua menit. Manusia? Baru muncul di enam detik terakhir.',
    cap: [
      'Kalau sejarah bumi dipadatkan jadi dua puluh empat jam,',
      'hiu muncul jam sembilan lewat tiga puluh tujuh malam.',
      'Pohon, jam sepuluh kurang dua menit.',
      'Manusia? Baru muncul di enam detik terakhir.',
    ],
    pad: 0.42,
  },
  {
    id: 's4', key: 'a4', label: 'LIMA KEPUNAHAN', index: '04', theme: 'dark',
    vo: 'Sejak itu, hiu selamat dari lima kepunahan massal. Termasuk hantaman asteroid yang memusnahkan dinosaurus, enam puluh enam juta tahun lalu.',
    cap: [
      'Sejak itu, hiu selamat dari lima kepunahan massal.',
      'Termasuk hantaman asteroid yang memusnahkan dinosaurus,',
      'enam puluh enam juta tahun lalu.',
    ],
    pad: 0.42,
  },
  {
    id: 's5', key: 'a5', label: 'FOSIL GIGI', index: '05', theme: 'dark',
    vo: 'Anehnya, fosil hiu hampir selalu berupa gigi. Kerangkanya tulang rawan, mudah hancur. Giginya terus berganti seperti ban berjalan. Ada yang sampai tiga puluh ribu gigi seumur hidup.',
    cap: [
      'Anehnya, fosil hiu hampir selalu berupa gigi.',
      'Kerangkanya tulang rawan, mudah hancur.',
      'Giginya terus berganti seperti ban berjalan.',
      'Ada yang sampai tiga puluh ribu gigi seumur hidup.',
    ],
    pad: 0.42,
  },
  {
    id: 's6', key: 'a6', label: 'HIU GREENLAND', index: '06', theme: 'dark',
    vo: 'Hiu Greenland bahkan bisa hidup berabad-abad. Yang tertua diperkirakan berumur sekitar empat ratus tahun, lahir di zaman VOC.',
    cap: [
      'Hiu Greenland bahkan bisa hidup berabad-abad.',
      'Yang tertua diperkirakan berumur sekitar empat ratus tahun, lahir di zaman VOC.',
    ],
    pad: 0.42,
  },
  {
    id: 's7', key: 'a7', label: 'TERANCAM', index: '07', theme: 'dark',
    vo: 'Tapi setelah empat ratus lima puluh juta tahun bertahan, lebih dari sepertiga jenis hiu dan pari kini terancam punah. Penyebab utamanya: penangkapan berlebihan.',
    cap: [
      'Tapi setelah empat ratus lima puluh juta tahun bertahan,',
      'lebih dari sepertiga jenis hiu dan pari kini terancam punah.',
      'Penyebab utamanya: penangkapan berlebihan.',
    ],
    pad: 0.42,
  },
  {
    id: 's8', key: 'a8', label: 'INDONESIA', index: '08', theme: 'dark',
    vo: 'Dan negara penangkap hiu terbesar di dunia adalah Indonesia. Menurutmu, hiu perlu dilindungi? Tulis di komentar.',
    cap: [
      'Dan negara penangkap hiu terbesar di dunia adalah Indonesia.',
      'Menurutmu, hiu perlu dilindungi? Tulis di komentar.',
    ],
    pad: 1.8,
  },
];
