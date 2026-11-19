// Episode 31 — "Peta lidah yang kamu hafal di sekolah itu salah."
//
// The classroom tongue map (sweet tip, salty/sour sides, bitter back) is a
// century-old misreading: Hänig's 1901 psychophysics measured only slight
// threshold differences around the tongue's edge; Boring's 1942 textbook
// redraw of that data turned the dips into exclusive zones, and schoolbooks
// copied it for generations. Collings (1974, Percept. Psychophys.) re-tested
// and closed the case: every region detects every basic taste. Real anatomy:
// 2,000-10,000 taste buds, 50-100 cells each, renewed every ~10-14 days, each
// bud reading all tastes. The map even missed umami (Ikeda 1908, kombu
// glutamate; T1R1+T1R3 receptor confirmed ~2002), while cats lack sweet
// detection entirely (Tas1r2 pseudogene, Li et al. 2005 PLoS Genetics) and a
// sixth taste, oleogustus (fat, NEFA), was proposed in 2015 (Running, Craig &
// Mattes, Chem. Senses 40:507).
//
// Sources (verified Nov 2026): Hänig, "Zur Psychophysik des Geschmackssinnes"
// (1901); Boring, "Sensation and Perception in the History of Experimental
// Psychology" (1942); Collings (1974); Ikeda (1908) & receptor confirmation
// ~2002; Li et al. (2005) PLoS Genetics 1:e3; Running et al. (2015) Chemical
// Senses 40(7):507-516; taste-bud counts/turnover standard histology.
//
// Copy rules: one caption card per sentence, long sentences split at the
// comma, numbers spelled the way the voice says them.

export const SERIES = 'NAYSI · BIOLOGI';
export const BRAND = 'NAYSI';

// finishing pass for this episode: school-textbook pages corrected in red pen
export const STYLE = { look: 'textbook', scrimY: 1786, scrimA: 0.55 };

export const SCENES = [
  {
    id: 's1', key: 'b1', label: 'PETA SALAH', index: '01', theme: 'dark',
    vo: 'Manis di ujung, asin di samping, pahit di belakang. Peta lidah yang kamu hafal di sekolah itu salah total. Dan salahnya sudah bertahan seabad.',
    cap: [
      'Manis di ujung, asin di samping, pahit di belakang.',
      'Peta lidah yang kamu hafal di sekolah itu salah total.',
      'Dan salahnya sudah bertahan seabad.',
    ],
    lead: 0.4,
    pad: 0.5,
  },
  {
    id: 's2', key: 'b2', label: '1901', index: '02', theme: 'dark',
    vo: 'Semua berawal dari makalah Jerman tahun seribu sembilan ratus satu. Henig mengukur ambang rasa di titik-titik lidah: semua rasa terasa di mana-mana, selisihnya tipis.',
    cap: [
      'Semua berawal dari makalah Jerman',
      'tahun seribu sembilan ratus satu.',
      'Hänig mengukur ambang rasa di titik-titik lidah:',
      'semua rasa terasa di mana-mana, selisihnya tipis.',
    ],
    pad: 0.5,
  },
  {
    id: 's3', key: 'b3', label: '1942', index: '03', theme: 'dark',
    vo: 'Tapi tahun seribu sembilan ratus empat puluh dua, data itu digambar ulang jadi zona-zona tegas. Buku pelajaran menyalinnya, dan mitosnya masuk kelas sampai sekarang.',
    cap: [
      'Tapi tahun seribu sembilan ratus empat puluh dua,',
      'data itu digambar ulang jadi zona-zona tegas.',
      'Buku pelajaran menyalinnya,',
      'dan mitosnya masuk kelas sampai sekarang.',
    ],
    pad: 0.5,
  },
  {
    id: 's4', key: 'b4', label: '1974', index: '04', theme: 'dark',
    vo: 'Uji ulang tahun seribu sembilan ratus tujuh puluh empat menutup kasusnya. Setiap regio lidah mendeteksi semua rasa dasar. Peta zona itu tidak pernah nyata.',
    cap: [
      'Uji ulang tahun seribu sembilan ratus tujuh puluh empat',
      'menutup kasusnya.',
      'Setiap regio lidah mendeteksi semua rasa dasar.',
      'Peta zona itu tidak pernah nyata.',
    ],
    pad: 0.5,
  },
  {
    id: 's5', key: 'b5', label: 'KUNCUP RASA', index: '05', theme: 'dark',
    vo: 'Yang nyata: sampai sepuluh ribu kuncup rasa di lidahmu. Tiap kuncup berisi lima puluh sampai seratus sel, diganti baru tiap dua minggu, dan membaca semua rasa.',
    cap: [
      'Yang nyata: sampai sepuluh ribu kuncup rasa di lidahmu.',
      'Tiap kuncup berisi lima puluh sampai seratus sel,',
      'diganti baru tiap dua minggu, dan membaca semua rasa.',
    ],
    pad: 0.5,
  },
  {
    id: 's6', key: 'b6', label: 'UMAMI', index: '06', theme: 'dark',
    vo: 'Bahkan peta itu ketinggalan satu rasa: umami, gurihnya kaldu, ditemukan tahun seribu sembilan ratus delapan, reseptornya dikonfirmasi sekitar tahun dua ribu dua.',
    cap: [
      'Bahkan peta itu ketinggalan satu rasa:',
      'umami, gurihnya kaldu,',
      'ditemukan tahun seribu sembilan ratus delapan,',
      'reseptornya dikonfirmasi sekitar tahun dua ribu dua.',
    ],
    pad: 0.5,
  },
  {
    id: 's7', key: 'b7', label: 'RASA KEENAM', index: '07', theme: 'dark',
    vo: 'Kucing bahkan tidak punya reseptor manis sama sekali. Dan manusia masih mengejar rasa keenam: oleogustus, rasa lemak, diusulkan tahun dua ribu lima belas.',
    cap: [
      'Kucing bahkan tidak punya reseptor manis sama sekali.',
      'Dan manusia masih mengejar rasa keenam:',
      'oleogustus, rasa lemak,',
      'diusulkan tahun dua ribu lima belas.',
    ],
    pad: 0.5,
  },
  {
    id: 's8', key: 'b8', label: 'ORKESTRA', index: '08', theme: 'dark',
    vo: 'Jadi lidahmu bukan peta zona, melainkan orkestra: setiap titik menyanyikan semua rasa dengan volume nyaris sama.',
    cap: [
      'Jadi lidahmu bukan peta zona, melainkan orkestra:',
      'setiap titik menyanyikan semua rasa dengan volume nyaris sama.',
    ],
    pad: 0.5,
  },
  {
    id: 's9', key: 'b9', label: 'KOMENTAR', index: '09', theme: 'dark',
    vo: 'Kamu tim manis, tim pedas, atau tim umami? Tulis di komentar, dan ikuti Naysi untuk fakta sehari-hari berikutnya.',
    cap: [
      'Kamu tim manis, tim pedas, atau tim umami?',
      'Tulis di komentar, dan ikuti Naysi untuk fakta sehari-hari berikutnya.',
    ],
    pad: 1.8,
  },
];
