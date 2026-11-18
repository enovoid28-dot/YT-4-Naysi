// Episode 21 — "Tidur enam jam itu utang."
//
// Sleep debt, told from inside one bedroom: a clock that only ever counts one
// way, a debt column that grows across the work week, a brain that files the day
// only after the lights go out, a blood-sugar curve that bends, two appetite
// hormones that swap places, a caffeine dose that is still half-there, and the
// pattern that outlives any single bad night.
//
// Sources:
//   Sleep duration for adults: 7–9 h (AASM / Sleep Research Society consensus).
//   Dawson & Reid (1997, Nature) — 17 h awake ≈ 0.05 % blood alcohol;
//     24 h awake ≈ 0.10 %.
//   Spiegel, Leproult & Van Cauter (1999, Lancet) — 4 h in bed for 6 nights in
//     healthy young men reduced glucose tolerance towards a prediabetic state.
//   Spiegel et al. (2004) — sleep restriction raises ghrelin and lowers leptin.
//   Caffeine half-life ~5 h (range 3–7 h).
//   Slow-wave sleep replays the day from hippocampus to cortex (Wilson &
//     McNaughton 1994).
//   Chronic short sleep (<6 h) is associated with hypertension, diabetes and
//     weight gain (Cappuccio et al. 2010 meta-analysis) — association, stated as
//     association.
//
// One card = one clause, so no caption can change mid-sentence and each line
// stays short enough to be read from a phone at arm's length.

export const SERIES = 'NAYSI · MALAM';
export const BRAND = 'NAYSI';

export const SCENES = [
  {
    id: 's1', key: 't1', label: 'JAM DUA', index: '01', theme: 'light',
    vo: 'Jam dua pagi. Kamu masih bangun. Padahal besok pagi kamu harus tetap waras. Tubuhmu tidak menghitung jam. Ia menghitung utang. Dan utang itu tidak hilang hanya karena kamu terbiasa.',
    cap: [
      'Jam dua pagi.',
      'Kamu masih bangun.',
      'Padahal besok pagi kamu harus tetap waras.',
      'Tubuhmu tidak menghitung jam.',
      'Ia menghitung *utang*.',
      'Dan utang itu tidak hilang hanya karena kamu terbiasa.',
    ],
    pad: 1.45,
  },
  {
    id: 's2', key: 't2', label: 'UTANG', index: '02', theme: 'light',
    vo: 'Orang dewasa butuh tujuh sampai sembilan jam. Kalau kamu tidur enam jam, kurangnya dua jam. Lima hari kerja, sepuluh jam hilang. Satu malam penuh yang tidak pernah kamu ambil.',
    cap: [
      'Orang dewasa butuh *tujuh sampai sembilan* jam.',
      'Kalau kamu tidur enam jam, kurangnya dua jam.',
      'Lima hari kerja, *sepuluh jam* hilang.',
      'Satu malam penuh yang tidak pernah kamu ambil.',
    ],
    pad: 1.45,
  },
  {
    id: 's3', key: 't3', label: 'FOKUS', index: '03', theme: 'light',
    vo: 'Utang itu ditagih lebih cepat dari yang kamu kira. Setelah tujuh belas jam terjaga, fokusmu setara dengan orang berkadar alkohol nol koma nol lima persen. Reaksi melambat. Tiga detik mati rasa. Dan kamu tidak menyadarinya.',
    cap: [
      'Utang itu ditagih lebih cepat dari yang kamu kira.',
      'Setelah *tujuh belas jam* terjaga,',
      'fokusmu setara dengan orang berkadar alkohol nol koma nol lima persen.',
      'Reaksi melambat.',
      'Tiga detik mati rasa.',
      'Dan kamu tidak menyadarinya.',
    ],
    pad: 1.45,
  },
  {
    id: 's4', key: 't4', label: 'MEMORI', index: '04', theme: 'light',
    vo: 'Otak memindahkan ingatan saat tidur. Hipokampus menyerahkan catatan hari itu ke korteks. Tanpa itu, kamu bisa belajar semalaman dan tetap lupa esok hari. Belajar tanpa tidur itu menulis di atas air.',
    cap: [
      'Otak memindahkan ingatan saat tidur.',
      'Hipokampus menyerahkan catatan hari itu ke korteks.',
      'Tanpa itu, kamu bisa belajar semalaman dan tetap lupa esok hari.',
      'Belajar tanpa tidur itu menulis di atas *air*.',
    ],
    pad: 1.45,
  },
  {
    id: 's5', key: 't5', label: 'GULA', index: '05', theme: 'light',
    vo: 'Ada juga yang berubah di darah. Pemuda sehat yang tidur empat jam selama enam malam jadi kurang toleran terhadap gula. Kadarnya naik sampai ke wilayah pradiabetes. Hanya dari kurang tidur.',
    cap: [
      'Ada juga yang berubah di darah.',
      'Pemuda sehat yang tidur empat jam selama enam malam',
      'jadi kurang toleran terhadap gula.',
      'Kadarnya naik sampai ke wilayah *pradiabetes*.',
      'Hanya dari kurang tidur.',
    ],
    pad: 1.45,
  },
  {
    id: 's6', key: 't6', label: 'LAPAR', index: '06', theme: 'light',
    vo: 'Kurang tidur juga mengubah rasa lapar. Hormon lapar naik, hormon kenyang turun. Kamu lebih sering merasa lapar. Yang dicari bukan sayur, tapi karbohidrat dan lemak. Itu sebabnya malam berakhir di kulkas.',
    cap: [
      'Kurang tidur juga mengubah rasa lapar.',
      'Hormon lapar naik, hormon kenyang turun.',
      'Kamu lebih sering merasa lapar.',
      'Yang dicari bukan sayur, tapi karbohidrat dan lemak.',
      'Itu sebabnya malam berakhir di kulkas.',
    ],
    pad: 1.45,
  },
  {
    id: 's7', key: 't7', label: 'KAFEIN', index: '07', theme: 'light',
    vo: 'Lalu ada kopi. Kafein tidak menghapus kantuk. Ia hanya menutup reseptornya. Separuh dosisnya masih ada lima jam kemudian. Kopi jam empat sore masih bekerja saat kamu tidur jam sepuluh.',
    cap: [
      'Lalu ada kopi.',
      'Kafein tidak menghapus kantuk.',
      'Ia hanya menutup reseptornya.',
      'Separuh dosisnya masih ada *lima jam* kemudian.',
      'Kopi jam empat sore masih bekerja saat kamu tidur jam sepuluh.',
    ],
    pad: 1.45,
  },
  {
    id: 's8', key: 't8', label: 'POLA', index: '08', theme: 'light',
    vo: 'Yang berbahaya bukan satu malam, tapi polanya. Tidur di bawah enam jam setiap malam berhubungan dengan tekanan darah tinggi, diabetes, dan berat badan naik. Bukan hukuman. Hanya harga.',
    cap: [
      'Yang berbahaya bukan satu malam, tapi *polanya*.',
      'Tidur di bawah enam jam setiap malam',
      'berhubungan dengan tekanan darah tinggi, diabetes, dan berat badan naik.',
      'Bukan hukuman.',
      'Hanya harga.',
    ],
    pad: 1.45,
  },
  {
    id: 's9', key: 't9', label: 'MALAM INI', index: '09', theme: 'light',
    vo: 'Malam ini tidak perlu sempurna. Bangun di jam yang sama, matikan lampu satu jam lebih awal. Tidur bukan waktu yang hilang. Ia tempat otak membereskan hari. Tulis di komentar: jam berapa kamu tidur semalam?',
    cap: [
      'Malam ini tidak perlu sempurna.',
      'Bangun di jam yang sama, matikan lampu satu jam lebih awal.',
      'Tidur bukan waktu yang hilang.',
      'Ia tempat otak membereskan hari.',
      'Tulis di komentar: jam berapa kamu tidur semalam?',
    ],
    pad: 2.10,
  },
];
