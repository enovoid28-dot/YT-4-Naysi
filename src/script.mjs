// Episode 26 — "Tanpa Einstein, GPS di HP-mu nyasar sepuluh kilometer sehari."
//
// Relativity you carry in your pocket, told as one chain of numbers: a phone
// finds itself by timing signals from atomic clocks in orbit; one microsecond
// of error is three hundred metres; the satellite's speed slows its clock by
// seven microseconds a day, the weaker gravity up there speeds it up by
// forty-five; the net thirty-eight microseconds is more than ten kilometres;
// the 1977 test satellite measured it; today every clock leaves the ground
// already tuned slow.
//
// Sources (Nov 2026):
//   R. W. Pogge, "Real-World Relativity: The GPS Navigation System" (Ohio
//     State University): ~14,000 km/h, ~20,000 km up; special relativity
//     -7 us/day, general relativity +45 us/day, net +38 us/day; uncorrected,
//     errors would accumulate at about 10 km per day.
//   38 us x c = 11.4 km of range ("lebih dari sepuluh kilometer").
//   N. Ashby, "Relativity in the Global Positioning System", Living Reviews
//     in Relativity 6 (2003): NTS-2, launched 23 June 1977, first caesium
//     clock in orbit; some doubted the effect, so a frequency synthesizer
//     was built in; ~20 days uncorrected, measured +442.5 vs predicted
//     +446.5 parts in 10^12 (about 1 %). Satellite clocks are set before
//     launch to 10.22999999543 MHz instead of 10.23 MHz.
//
// Copy rules: two sentences per scene == two caption cards, so every card is
// a measured block of audio and can never drift. Numbers spelled the way
// the voice says them.

export const SERIES = 'NAYSI · FISIKA';
export const BRAND = 'NAYSI';

export const SCENES = [
  {
    id: 's1', key: 'y1', label: 'NYASAR', index: '01', theme: 'dark',
    vo: 'Tanpa teori Einstein, GPS di HP-mu bisa nyasar sepuluh kilometer setiap hari. Masalahnya bukan sinyal, tapi waktu.',
    cap: [
      'Tanpa teori Einstein, GPS di HP-mu bisa nyasar sepuluh kilometer setiap hari.',
      'Masalahnya bukan sinyal, tapi waktu.',
    ],
    lead: 0.36,
    pad: 0.55,
  },
  {
    id: 's2', key: 'y2', label: 'JAM ATOM', index: '02', theme: 'dark',
    vo: 'Satelit GPS membawa jam atom dan terus memancarkan waktunya. HP-mu menghitung jarak dari lama perjalanan sinyal itu.',
    cap: [
      'Satelit GPS membawa jam atom dan terus memancarkan waktunya.',
      'HP-mu menghitung jarak dari lama perjalanan sinyal itu.',
    ],
    pad: 0.55,
  },
  {
    id: 's3', key: 'y3', label: '300 METER', index: '03', theme: 'dark',
    vo: 'Sinyal itu melaju secepat cahaya. Jadi selisih satu mikrodetik saja, posisimu meleset tiga ratus meter.',
    cap: [
      'Sinyal itu melaju secepat cahaya.',
      'Jadi selisih satu mikrodetik saja, posisimu meleset tiga ratus meter.',
    ],
    pad: 0.55,
  },
  {
    id: 's4', key: 'y4', label: 'KECEPATAN', index: '04', theme: 'dark',
    vo: 'Satelitnya melesat hampir empat belas ribu kilometer per jam. Menurut relativitas khusus, jamnya melambat tujuh mikrodetik per hari.',
    cap: [
      'Satelitnya melesat hampir empat belas ribu kilometer per jam.',
      'Menurut relativitas khusus, jamnya melambat tujuh mikrodetik per hari.',
    ],
    pad: 0.55,
  },
  {
    id: 's5', key: 'y5', label: 'GRAVITASI', index: '05', theme: 'dark',
    vo: 'Tapi di ketinggian dua puluh ribu kilometer, gravitasi lebih lemah. Menurut relativitas umum, waktu di sana justru berjalan lebih cepat, empat puluh lima mikrodetik per hari.',
    cap: [
      'Tapi di ketinggian dua puluh ribu kilometer, gravitasi lebih lemah.',
      'Menurut relativitas umum, waktu di sana justru berjalan lebih cepat, empat puluh lima mikrodetik per hari.',
    ],
    pad: 0.55,
  },
  {
    id: 's6', key: 'y6', label: '38 MIKRODETIK', index: '06', theme: 'dark',
    vo: 'Hasilnya, jam satelit maju tiga puluh delapan mikrodetik setiap hari. Dikali kecepatan cahaya, itu lebih dari sepuluh kilometer.',
    cap: [
      'Hasilnya, jam satelit maju tiga puluh delapan mikrodetik setiap hari.',
      'Dikali kecepatan cahaya, itu lebih dari sepuluh kilometer.',
    ],
    pad: 0.55,
  },
  {
    id: 's7', key: 'y7', label: 'UJI 1977', index: '07', theme: 'dark',
    vo: 'Tahun seribu sembilan ratus tujuh puluh tujuh, masih ada yang ragu. Lalu satelit uji mengukurnya, hasilnya nyaris persis hitungan Einstein.',
    cap: [
      'Tahun seribu sembilan ratus tujuh puluh tujuh, masih ada yang ragu.',
      'Lalu satelit uji mengukurnya, hasilnya nyaris persis hitungan Einstein.',
    ],
    pad: 0.55,
  },
  {
    id: 's8', key: 'y8', label: 'DISETEL', index: '08', theme: 'dark',
    vo: 'Kini jam satelit sengaja disetel lebih lambat sebelum diluncurkan. Pernah nyasar gara-gara GPS? Tulis di komentar.',
    cap: [
      'Kini jam satelit sengaja disetel lebih lambat sebelum diluncurkan.',
      'Pernah nyasar gara-gara GPS? Tulis di komentar.',
    ],
    pad: 1.8,
  },
];
