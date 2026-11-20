// Episode 32 — "Kenapa kamu lupa mau ngapain setelah masuk kamar?"
//
// The doorway effect: passing through a doorway makes people forget what they
// came for. Radvansky, Krawietz & Tamplin (2011) ran it in real rooms and in
// virtual reality: after a doorway, recall of the object just carried/held
// drops sharply versus the same walk inside one room — and walking back does
// not simply restore it. The mechanism is event segmentation (Zacks et al.
// 2007): the brain cuts continuous experience into discrete events and keeps
// the current one in working memory; a boundary (doorway, staircase, task
// switch) archives the previous event. Forgetting here is a feature: without
// event cuts the stream of detail would drown working memory. Emotion tags
// events as significant (McGaugh 2004), which is why emotional memories resist
// the cut. Context cues (an object from the old room, spoken goal words)
// keep the archived event reachable (context-dependent memory, cf. Godden &
// Baddeley 1975).
//
// Sources (to re-verify at paket time): Radvansky, Krawietz & Tamplin (2011),
// "Walking Through Doorways Causes Forgetting: Further Explorations";
// Zacks, Speer, Swallow, Braver & Reynolds (2007), event segmentation review;
// McGaugh (2004), emotional memory consolidation; Godden & Baddeley (1975),
// context-dependent memory.
//
// Copy rules: one caption card per sentence, long sentences split at the
// comma, numbers spelled the way the voice says them.

export const SERIES = 'NAYSI · PSIKOLOGI';
export const BRAND = 'NAYSI';

// finishing pass for this episode: full-frame room/door worlds, house style
export const STYLE = { look: 'pintu', scrimY: 1786, scrimA: 0.55 };

export const SCENES = [
  {
    id: 's1', key: 'c1', label: 'MASUK KAMAR', index: '01', theme: 'dark',
    vo: 'Kamu masuk kamar buat ambil sesuatu. Sampai di dalam, kosong. Kamu berdiri bingung: mau ngapain tadi? Tenang, kamu tidak pikun. Otakmu baru saja melakukan hal yang sangat wajar.',
    cap: [
      'Kamu masuk kamar buat ambil sesuatu.',
      'Sampai di dalam, kosong.',
      'Kamu berdiri bingung: mau ngapain tadi?',
      'Tenang, kamu tidak pikun.',
      'Otakmu baru saja melakukan hal yang sangat wajar.',
    ],
    lead: 0.4,
    pad: 0.5,
  },
  {
    id: 's2', key: 'c2', label: 'EFEK PINTU', index: '02', theme: 'dark',
    vo: 'Ada nama resmi untuk momen itu: doorway effect, efek ambang pintu. Psikolog mengujinya lewat ruangan nyata dan dunia virtual, dan hasilnya konsisten: lewat pintu membuat memori pendekmu goyah.',
    cap: [
      'Ada nama resmi untuk momen itu:',
      'doorway effect, efek ambang pintu.',
      'Psikolog mengujinya lewat ruangan nyata',
      'dan dunia virtual, dan hasilnya konsisten:',
      'lewat pintu membuat memori pendekmu goyah.',
    ],
    pad: 0.5,
  },
  {
    id: 's3', key: 'c3', label: 'UJI 2011', index: '03', theme: 'dark',
    vo: 'Dalam eksperimen dua ribu sebelas, peserta membawa benda lalu melewati pintu. Setelah itu mereka jauh lebih gagal mengingat benda tadi, dibanding berjalan jarak yang sama di satu ruangan saja.',
    cap: [
      'Dalam eksperimen dua ribu sebelas,',
      'peserta membawa benda lalu melewati pintu.',
      'Setelah itu mereka jauh lebih gagal mengingat',
      'benda tadi, dibanding berjalan jarak yang sama',
      'di satu ruangan saja.',
    ],
    pad: 0.5,
  },
  {
    id: 's4', key: 'c4', label: 'EDITOR OTAK', index: '04', theme: 'dark',
    vo: 'Kenapa bisa? Karena otak tidak merekam hidupmu sebagai satu film panjang. Otak memotong pengalaman jadi peristiwa-peristiwa kecil, seperti editor video menaruh cut di setiap adegan.',
    cap: [
      'Kenapa bisa?',
      'Karena otak tidak merekam hidupmu',
      'sebagai satu film panjang.',
      'Otak memotong pengalaman jadi peristiwa kecil,',
      'seperti editor video menaruh cut tiap adegan.',
    ],
    pad: 0.5,
  },
  {
    id: 's5', key: 'c5', label: 'BERKAS BARU', index: '05', theme: 'dark',
    vo: 'Begitu kamu lewat ambang pintu, otak menutup berkas lama dan membuka berkas baru. Isi ruangan sebelumnya ikut terarsip. Bukan hilang, tapi susah dipanggil ulang.',
    cap: [
      'Begitu kamu lewat ambang pintu,',
      'otak menutup berkas lama dan membuka berkas baru.',
      'Isi ruangan sebelumnya ikut terarsip.',
      'Bukan hilang, tapi susah dipanggil ulang.',
    ],
    pad: 0.5,
  },
  {
    id: 's6', key: 'c6', label: 'JALAN BALIK', index: '06', theme: 'dark',
    vo: 'Dan jangan senang dulu: jalan balik ke ruangan awal ternyata tidak otomatis membuka berkasnya lagi. Bagi otak, peristiwa itu sudah selesai. Titik.',
    cap: [
      'Dan jangan senang dulu:',
      'jalan balik ke ruangan awal ternyata',
      'tidak otomatis membuka berkasnya lagi.',
      'Bagi otak, peristiwa itu sudah selesai. Titik.',
    ],
    pad: 0.5,
  },
  {
    id: 's7', key: 'c7', label: 'BATAS HALUS', index: '07', theme: 'dark',
    vo: 'Pintu bukan satu-satunya batas. Tangga, lift, gerbang sekolah, bahkan pindah aplikasi di ponselmu, semua bisa menjadi ambang peristiwa. Makin banyak batas, makin sering kamu lupa.',
    cap: [
      'Pintu bukan satu-satunya batas.',
      'Tangga, lift, gerbang sekolah,',
      'bahkan pindah aplikasi di ponselmu,',
      'semua bisa menjadi ambang peristiwa.',
      'Makin banyak batas, makin sering kamu lupa.',
    ],
    pad: 0.5,
  },
  {
    id: 's8', key: 'c8', label: 'FITUR, BUKAN BUG', index: '08', theme: 'dark',
    vo: 'Tapi justru di sini letak jeniusnya. Kalau otak menyimpan semua detail tanpa pernah memotong, kamu akan tenggelam dalam informasi. Lupa adalah cara otak menjaga yang penting tetap terapung.',
    cap: [
      'Tapi justru di sini letak jeniusnya.',
      'Kalau otak menyimpan semua detail',
      'tanpa pernah memotong,',
      'kamu akan tenggelam dalam informasi.',
      'Lupa adalah cara otak menjaga yang penting.',
    ],
    pad: 0.5,
  },
  {
    id: 's9', key: 'c9', label: 'EMOSI', index: '09', theme: 'dark',
    vo: 'Itu sebabnya hal yang emosional susah lupa: malu, takut, jatuh cinta. Emosi menandai sebuah peristiwa sebagai penting, sehingga otak menolak menutup berkasnya.',
    cap: [
      'Itu sebabnya hal yang emosional susah lupa:',
      'malu, takut, jatuh cinta.',
      'Emosi menandai sebuah peristiwa sebagai penting,',
      'sehingga otak menolak menutup berkasnya.',
    ],
    pad: 0.5,
  },
  {
    id: 's10', key: 'c10', label: 'TRIK SUARA', index: '10', theme: 'dark',
    vo: 'Lalu bagaimana supaya tidak kosong lagi saat masuk kamar? Sebut tujuanmu dengan suara pelan sebelum lewat pintu. Satu kalimat saja: ambil charger. Kata yang terdengar menjaga memori tetap terbuka.',
    cap: [
      'Lalu bagaimana supaya tidak kosong lagi',
      'saat masuk kamar?',
      'Sebut tujuanmu dengan suara pelan',
      'sebelum lewat pintu. Satu kalimat saja:',
      'ambil charger.',
      'Kata yang terdengar menjaga memori terbuka.',
    ],
    pad: 0.5,
  },
  {
    id: 's11', key: 'c11', label: 'JEMBATAN', index: '11', theme: 'dark',
    vo: 'Trik kedua: bayangkan benda tujuannya sebelum melangkah, dan bawa satu benda dari ruangan lama. Jembatan kecil itu cukup untuk menahan berkas lama agar tidak tertutup rapat.',
    cap: [
      'Trik kedua: bayangkan benda tujuannya',
      'sebelum melangkah,',
      'dan bawa satu benda dari ruangan lama.',
      'Jembatan kecil itu cukup untuk menahan',
      'berkas lama agar tidak tertutup rapat.',
    ],
    pad: 0.5,
  },
  {
    id: 's12', key: 'c12', label: 'OTAK BEKERJA', index: '12', theme: 'dark',
    vo: 'Jadi lain kali kamu berdiri kosong di tengah kamar, jangan marah pada dirimu. Kamu sedang menonton otakmu bekerja: memotong, menyimpan, dan merapikan hidupmu menjadi cerita.',
    cap: [
      'Jadi lain kali kamu berdiri kosong',
      'di tengah kamar, jangan marah pada dirimu.',
      'Kamu sedang menonton otakmu bekerja:',
      'memotong, menyimpan, dan merapikan',
      'hidupmu menjadi cerita.',
    ],
    pad: 0.5,
  },
  {
    id: 's13', key: 'c13', label: 'KOMENTAR', index: '13', theme: 'dark',
    vo: 'Ruangan mana yang paling sering membuatmu lupa? Tulis di komentar, dan ikuti Naysi untuk fakta sehari-hari berikutnya.',
    cap: [
      'Ruangan mana yang paling sering membuatmu lupa?',
      'Tulis di komentar, dan ikuti Naysi',
      'untuk fakta sehari-hari berikutnya.',
    ],
    pad: 0.6,
  },
];
