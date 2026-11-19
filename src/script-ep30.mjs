// Episode 30 — "Jejak bom nuklir di dalam gigimu."
//
// The bomb pulse: cosmic rays make a trickle of carbon-14 that every living
// thing absorbs; the 5,730-year half-life is far too slow to date modern
// objects, but the 500+ atmospheric nuclear tests of 1945-1980 doubled the
// atmospheric C-14 (peak 1963, ~2x natural), and the post-treaty decline drew
// a sharp time signature into everything that grew since. Forensics reads it:
// a Venetian cubist canvas attributed to Fernand Léger, "1913", whose cotton
// was harvested in 1959; elephant ivory dated against the 1989 global ban;
// tooth enamel, locked from childhood, gives a birth year within ~1.5 years
// and identified victims of the 2004 Indian Ocean tsunami; our own cells keep
// their birth C-14 (gut 5 days, fat ~10%/yr, over half of heart cells from
// birth). The Suess effect — fossil carbon with no C-14 — is now diluting the
// bomb signature back toward pre-1950 values, switching the clock off.
//
// Sources (verified Nov 2026): UNSCEAR / CTBTO test counts (528 atmospheric
// 1945-1980, last atmospheric 1980, PTBT 1963); bomb pulse ~200 pMC NH peak
// 1963, decline ~4%/yr; Caforio et al. 2014 Eur. Phys. J. Plus 129:6 (INFN
// Florence AMS, Léger-attributed canvas post-1959); Uno et al. 2013 PNAS
// 110(29) (ivory vs 1989 CITES ban); Spalding et al. 2005 Nature 437:333
// (enamel birth dating 1.3±1.0 yr, tsunami IDs); Spalding 2008 Cell / Bergmann
// 2009 Science (fat ~10%/yr, cardiomyocyte renewal); Hua et al. 2022
// Radiocarbon 64(4) & SUERC (post-2020 <100 pMC, Suess effect).
//
// Copy rules: one caption card per sentence, long sentences split at the
// comma, numbers spelled the way the voice says them.

export const SERIES = 'NAYSI · FORENSIK';
export const BRAND = 'NAYSI';

// finishing pass for this episode: lab dossiers on a dark cutting-mat desk
export const STYLE = { look: 'dossier', scrimY: 1786, scrimA: 0.55 };

export const SCENES = [
  {
    id: 's1', key: 'd1', label: 'JEJAK BOM', index: '01', theme: 'dark',
    vo: 'Di lapisan terkeras gigimu, tersimpan jejak bom nuklir Perang Dingin. Jejak yang sama kini membongkar lukisan palsu miliaran rupiah. Ini cerita jam atom di tubuh kita.',
    cap: [
      'Di lapisan terkeras gigimu,',
      'tersimpan jejak bom nuklir Perang Dingin.',
      'Jejak yang sama kini membongkar lukisan palsu miliaran rupiah.',
      'Ini cerita jam atom di tubuh kita.',
    ],
    lead: 0.4,
    pad: 0.6,
  },
  {
    id: 's2', key: 'd2', label: 'SINAR KOSMIK', index: '02', theme: 'dark',
    vo: 'Semuanya dimulai dari luar angkasa. Sinar kosmik membombardir atmosfer, melahirkan karbon radioaktif yang menyerap ke tumbuhan, lalu ke setiap rantai makanan. Termasuk ke tubuhmu, tanpa berhenti.',
    cap: [
      'Semuanya dimulai dari luar angkasa.',
      'Sinar kosmik membombardir atmosfer,',
      'melahirkan karbon radioaktif yang menyerap ke tumbuhan,',
      'lalu ke setiap rantai makanan.',
      'Termasuk ke tubuhmu, tanpa berhenti.',
    ],
    pad: 0.6,
  },
  {
    id: 's3', key: 'd3', label: 'WAKTU PARUH', index: '03', theme: 'dark',
    vo: 'Karbon ini meluruh dengan waktu paruh lima ribu tujuh ratus tiga puluh tahun. Sempurna untuk mumi purba, tapi hampir buta untuk benda modern berusia puluhan tahun.',
    cap: [
      'Karbon ini meluruh dengan waktu paruh',
      'lima ribu tujuh ratus tiga puluh tahun.',
      'Sempurna untuk mumi purba,',
      'tapi hampir buta untuk benda modern berusia puluhan tahun.',
    ],
    pad: 0.6,
  },
  {
    id: 's4', key: 'd4', label: 'UJI ATMOSFER', index: '04', theme: 'dark',
    vo: 'Lalu manusia menambahkannya sendiri. Selama tiga puluh lima tahun sejak seribu sembilan ratus empat puluh lima, lebih dari lima ratus ledakan nuklir atmosfer menggandakan karbon radioaktif di udara.',
    cap: [
      'Lalu manusia menambahkannya sendiri.',
      'Selama tiga puluh lima tahun sejak',
      'seribu sembilan ratus empat puluh lima,',
      'lebih dari lima ratus ledakan nuklir atmosfer',
      'menggandakan karbon radioaktif di udara.',
    ],
    pad: 0.6,
  },
  {
    id: 's5', key: 'd5', label: 'PUNCAK', index: '05', theme: 'dark',
    vo: 'Puncaknya seribu sembilan ratus enam puluh tiga: kadarnya nyaris dua kali lipat alamiah. Setelah uji atmosfer dilarang, kurvanya turun cepat, meninggalkan tanda waktu yang tajam.',
    cap: [
      'Puncaknya seribu sembilan ratus enam puluh tiga:',
      'kadarnya nyaris dua kali lipat alamiah.',
      'Setelah uji atmosfer dilarang,',
      'kurvanya turun cepat,',
      'meninggalkan tanda waktu yang tajam.',
    ],
    pad: 0.6,
  },
  {
    id: 's6', key: 'd6', label: 'KANVAS PALSU', index: '06', theme: 'dark',
    vo: 'Sebuah lukisan kubisme karya Fernand Leje, katanya dibuat tahun seribu sembilan ratus tiga belas. Tapi serat kanvasnya bercerita lain: kapasnya dipanen tahun seribu sembilan ratus lima puluh sembilan.',
    cap: [
      'Sebuah lukisan kubisme karya Fernand Léger,',
      'katanya dibuat tahun seribu sembilan ratus tiga belas.',
      'Tapi serat kanvasnya bercerita lain:',
      'kapasnya dipanen tahun seribu sembilan ratus lima puluh sembilan.',
    ],
    pad: 0.6,
  },
  {
    id: 's7', key: 'd7', label: 'GADING ILEGAL', index: '07', theme: 'dark',
    vo: 'Gading gajah penyelundupan pun ketahuan. Jam yang sama mengungkap tahun gajah itu mati. Jika hasilnya setelah larangan global sembilan belas delapan puluh sembilan, itu gading buruan ilegal.',
    cap: [
      'Gading gajah penyelundupan pun ketahuan.',
      'Jam yang sama mengungkap tahun gajah itu mati.',
      'Jika hasilnya setelah larangan global',
      'sembilan belas delapan puluh sembilan,',
      'itu gading buruan ilegal.',
    ],
    pad: 0.6,
  },
  {
    id: 's8', key: 'd8', label: 'TERKUNCI', index: '08', theme: 'dark',
    vo: 'Kembali ke gigimu. Lapisan keras pembungkus gigi terbentuk saat kamu masih kecil, lalu terkunci selamanya. Berbeda dengan tulang yang terus membongkar pasang dirinya sepanjang hidup.',
    cap: [
      'Kembali ke gigimu.',
      'Lapisan keras pembungkus gigi terbentuk',
      'saat kamu masih kecil, lalu terkunci selamanya.',
      'Berbeda dengan tulang yang terus',
      'membongkar pasang dirinya sepanjang hidup.',
    ],
    pad: 0.6,
  },
  {
    id: 's9', key: 'd9', label: 'TAHUN LAHIR', index: '09', theme: 'dark',
    vo: 'Maka tahun lahirmu tercatat di sana, akurat sampai satu koma lima tahun. Setelah tsunami Samudra Hindia dua ribu empat, cara ini membantu memberi nama para korban.',
    cap: [
      'Maka tahun lahirmu tercatat di sana,',
      'akurat sampai satu koma lima tahun.',
      'Setelah tsunami Samudra Hindia dua ribu empat,',
      'cara ini membantu memberi nama para korban.',
    ],
    pad: 0.6,
  },
  {
    id: 's10', key: 'd10', label: 'UMUR SEL', index: '10', theme: 'dark',
    vo: 'Jam yang sama membocorkan umur sel-selmu. Sel usus berumur lima hari; sel lemak diganti sepuluh persen per tahun. Dan separuh sel jantungmu bawaan sejak lahir.',
    cap: [
      'Jam yang sama membocorkan umur sel-selmu.',
      'Sel usus berumur lima hari;',
      'sel lemak diganti sepuluh persen per tahun.',
      'Dan separuh sel jantungmu bawaan sejak lahir.',
    ],
    pad: 0.6,
  },
  {
    id: 's11', key: 'd11', label: 'JAM PADAM', index: '11', theme: 'dark',
    vo: 'Namun ada satu batas: sejak manusia membakar batu bara dan minyak, karbon purba mengencerkan jejak bom di udara. Untuk bahan yang tumbuh sekarang, jam ini perlahan kehilangan ketepatannya.',
    cap: [
      'Namun ada satu batas:',
      'sejak manusia membakar batu bara dan minyak,',
      'karbon purba mengencerkan jejak bom di udara.',
      'Untuk bahan yang tumbuh sekarang,',
      'jam ini perlahan kehilangan ketepatannya.',
    ],
    pad: 0.6,
  },
  {
    id: 's12', key: 'd12', label: 'KALENDER RAHASIA', index: '12', theme: 'dark',
    vo: 'Jadi ledakan bom yang dulu menakutkan dunia, justru meninggalkan kalender rahasia di dalam gigi kita, di kanvas lukisan, dan di setiap sel tubuh. Sains membaca jam itu, dan menangkap pemalsu yang kira dirinya aman.',
    cap: [
      'Jadi ledakan bom yang dulu menakutkan dunia,',
      'justru meninggalkan kalender rahasia',
      'di dalam gigi kita, di kanvas lukisan,',
      'dan di setiap sel tubuh.',
      'Sains membaca jam itu,',
      'dan menangkap pemalsu yang kira dirinya aman.',
    ],
    pad: 0.6,
  },
  {
    id: 's13', key: 'd13', label: 'KOMENTAR', index: '13', theme: 'dark',
    vo: 'Fakta mana yang paling membuatmu terperangah? Tulis di komentar, dan ikuti Naysi untuk sains sehari-hari berikutnya.',
    cap: [
      'Fakta mana yang paling membuatmu terperangah?',
      'Tulis di komentar, dan ikuti Naysi untuk sains sehari-hari berikutnya.',
    ],
    pad: 2.2,
  },
];
