// Episode 18 — "Kamu pernah jadi bayi. Kamu tidak ingat satu hari pun."
//
// Thesis: the first three years are not missing because time erased them; they
// were never written in the format that later memory uses. The baby brain is
// building connections at a million a second, but the part that stamps an event
// with "when" and "where" — the hippocampus — is not online yet, and without
// language there is no story to hang the event on. At seven, the pruning starts
// and a two-thirds share of what a three-year-old remembered is gone.
//
// Sources: Bauer / Emory (Memory, 2014) — children who described events at 3
// recalled 63-72% of them at 5-7, but only ~35% at 8-9; the age-7 onset of
// childhood amnesia. Wang & Peterson (Dev. Psych., 2014) — mean age of earliest
// memory 3.5 years. Harvard Center on the Developing Child — >1 million neural
// connections per second in the first years, peak density 50-60% above adult,
// then pruning. Rovee-Collier mobile conjugate reinforcement — 3-month-olds
// retain ~1 week, 6-month-olds ~2 weeks, and the memory is context-bound (change
// the crib liner and it is gone). Loftus & Pickrell (1995) — 25% of 24 adults
// "remembered" a fabricated mall event.
//
// Every card is a verbatim slice of the take; numerals live in the artwork.

export const SERIES = 'NAYSI · INGAT';
export const BRAND = 'NAYSI';

export const SCENES = [
  {
    id: 's1',
    key: 'r1',
    label: 'KOSONG',
    index: '01',
    theme: 'dark',
    vo: 'Coba pikirkan memori paling awal yang kamu ingat. Sekarang mundur lebih jauh. Kosong. Bukan karena kamu lupa. Kamu memang belum bisa menyimpannya. Kamu pernah jadi bayi selama dua tahun penuh, dan tidak ada satu hari pun yang tersisa.',
    cap: [
      'Coba pikirkan memori paling awal yang kamu ingat.',
      'Sekarang mundur lebih jauh. *Kosong*.',
      'Bukan karena kamu lupa. Kamu memang *belum* *bisa* menyimpannya.',
      'Kamu pernah jadi bayi selama *dua* *tahun* penuh, dan tidak ada satu hari pun yang tersisa.',
    ],
    pad: 1.45,
  },
  {
    id: 's2',
    key: 'r2',
    label: 'TIGA SETENGAH',
    index: '02',
    theme: 'dark',
    vo: 'Rata-rata orang dewasa menyebut memori pertamanya di usia tiga setengah tahun. Di bawah itu, nol. Tiga tahun pertama hidupmu bukan hilang karena waktu. Ia hilang karena tidak pernah ditulis.',
    cap: [
      'Rata-rata orang dewasa menyebut memori pertamanya di usia *tiga* *setengah* tahun.',
      'Di bawah itu, *nol*.',
      'Tiga tahun pertama hidupmu bukan hilang karena waktu.',
      'Ia hilang karena *tidak* *pernah* ditulis.',
    ],
    pad: 1.45,
  },
  {
    id: 's3',
    key: 'r3',
    label: 'DIBANGUN',
    index: '03',
    theme: 'dark',
    vo: 'Otak bayi bukan gudang yang rusak. Ia justru sedang dibangun paling cepat. Satu juta sambungan saraf baru setiap detik, di dua tahun pertama. Lalu dipangkas. Yang tidak dipakai, dibuang.',
    cap: [
      'Otak bayi bukan gudang yang *rusak*.',
      'Ia justru sedang *dibangun* paling cepat.',
      'Satu juta sambungan saraf baru *setiap* *detik*, di dua tahun pertama.',
      'Lalu dipangkas. Yang tidak dipakai, *dibuang*.',
    ],
    pad: 1.45,
  },
  {
    id: 's4',
    key: 'r4',
    label: 'TANPA TANGGAL',
    index: '04',
    theme: 'dark',
    vo: 'Yang belum siap adalah hipokampus. Bagian otak yang menempelkan keterangan kapan dan di mana pada setiap kejadian. Ia baru matang sekitar usia tiga sampai empat tahun. Sebelum itu, kejadian lewat tanpa tanggal.',
    cap: [
      'Yang belum siap adalah *hipokampus*.',
      'Bagian otak yang menempelkan keterangan *kapan* dan *di* *mana* pada setiap kejadian.',
      'Ia baru matang sekitar usia *tiga* sampai *empat* tahun.',
      'Sebelum itu, kejadian lewat *tanpa* *tanggal*.',
    ],
    pad: 1.45,
  },
  {
    id: 's5',
    key: 'r5',
    label: 'SEPRAI',
    index: '05',
    theme: 'dark',
    vo: 'Tapi bayi jelas bisa ingat. Dalam eksperimen klasik, bayi tiga bulan mengingat mainan gantung selama satu minggu. Bayi enam bulan, dua minggu. Satu syarat: jangan ganti seprai. Karena memori bayi menempel pada tempat, bukan pada cerita.',
    cap: [
      'Tapi bayi jelas *bisa* ingat.',
      'Dalam eksperimen klasik, bayi tiga bulan mengingat mainan gantung selama *satu* *minggu*.',
      'Bayi enam bulan, *dua* *minggu*.',
      'Satu syarat: jangan ganti seprai.',
      'Karena memori bayi menempel pada *tempat*, bukan pada cerita.',
    ],
    pad: 1.45,
  },
  {
    id: 's6',
    key: 'r6',
    label: 'BAHASA',
    index: '06',
    theme: 'dark',
    vo: 'Dan cerita butuh bahasa. Sebelum bisa bicara, tidak ada yang bisa mengikat kejadian jadi kalimat. Anak yang paling banyak ditanya, terus apa lagi, adalah anak yang memorinya paling panjang.',
    cap: [
      'Dan cerita butuh *bahasa*.',
      'Sebelum bisa bicara, tidak ada yang bisa mengikat kejadian jadi *kalimat*.',
      'Anak yang paling banyak ditanya, *terus* *apa* *lagi*,',
      'adalah anak yang memorinya paling *panjang*.',
    ],
    pad: 1.45,
  },
  {
    id: 's7',
    key: 'r7',
    label: 'TUJUH TAHUN',
    index: '07',
    theme: 'dark',
    vo: 'Lalu di usia tujuh, pembersihan besar dimulai. Dalam studi yang mengikuti anak-anak sejak umur tiga: di usia lima sampai tujuh, mereka masih ingat enam puluh tiga sampai tujuh puluh dua persen. Di usia delapan sampai sembilan, tinggal tiga puluh lima persen.',
    cap: [
      'Lalu di usia *tujuh*, pembersihan besar dimulai.',
      'Dalam studi yang mengikuti anak-anak sejak umur tiga:',
      'di usia lima sampai tujuh, mereka masih ingat *enam* *puluh* *tiga*',
      'sampai *tujuh* *puluh* *dua* persen.',
      'Di usia delapan sampai sembilan, tinggal *tiga* *puluh* *lima* persen.',
    ],
    pad: 1.45,
  },
  {
    id: 's8',
    key: 'r8',
    label: 'BUKAN REKAMAN',
    index: '08',
    theme: 'dark',
    vo: 'Dan sisa yang kamu sebut kenangan bukan rekaman. Setiap kali kamu mengingatnya, otak menulis ulang. Dan bisa menambah yang tidak pernah ada. Dalam satu studi, dua puluh lima persen orang dewasa mengaku ingat pernah tersesat di mal. Kejadian itu tidak pernah terjadi.',
    cap: [
      'Dan sisa yang kamu sebut kenangan bukan *rekaman*.',
      'Setiap kali kamu mengingatnya, otak *menulis* *ulang*.',
      'Dan bisa menambah yang *tidak* *pernah* ada.',
      'Dalam satu studi, *dua* *puluh* *lima* persen orang dewasa mengaku ingat pernah tersesat di mal.',
      'Kejadian itu tidak pernah terjadi.',
    ],
    pad: 1.45,
  },
  {
    id: 's9',
    key: 'r9',
    label: 'CERITA HILANG',
    index: '09',
    theme: 'dark',
    vo: 'Jadi bayi yang tidak kamu ingat bukan hilang. Ia masih ada, di caramu takut, caramu tenang, caramu percaya. Yang hilang cuma ceritanya. Coba tulis di komentar: memori paling awal yang kamu ingat, dan umur berapa.',
    cap: [
      'Jadi bayi yang tidak kamu ingat *bukan* *hilang*.',
      'Ia masih ada, di caramu takut, caramu tenang, caramu percaya.',
      'Yang hilang cuma *ceritanya*.',
      'Coba tulis di komentar: memori paling awal yang kamu ingat, dan umur berapa.',
    ],
    pad: 2.10,
  },
];
