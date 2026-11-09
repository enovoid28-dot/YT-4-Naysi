// Single source of truth for narration + captions + scene metadata.
// `vo` is exactly what the voice says; `cap` is the same words with `*`
// marking the words that light up in amber.

export const SCENES = [
  {
    id: 's1',
    key: 'clock',
    label: 'JAM',
    index: '01',
    vo: 'Jam tiga pagi. Kamu masih bangun. Alarm jam tujuh. Kalau malam ini kamu tidur empat jam, besok otakmu bekerja seperti orang yang mabuk.',
    cap: 'Jam *tiga pagi*. Kamu masih bangun. Alarm jam *tujuh*. Kalau malam ini kamu tidur *empat jam*, besok otakmu bekerja seperti orang yang *mabuk*.',
    pad: 0.55,
  },
  {
    id: 's2',
    key: 'debt',
    label: 'UTANG',
    index: '02',
    vo: 'Tubuhmu butuh tujuh sampai sembilan jam. Kamu cuma dapat enam. Kekurangannya tidak hilang. Dia menumpuk, hari demi hari, jadi utang tidur. Sampai akhir minggu, bisa belasan jam.',
    cap: 'Tubuhmu butuh *tujuh sampai sembilan jam*. Kamu cuma dapat *enam*. Kekurangannya tidak hilang. Dia *menumpuk*, hari demi hari, jadi *utang tidur*. Sampai akhir minggu, bisa *belasan jam*.',
    pad: 0.5,
  },
  {
    id: 's3',
    key: 'study',
    label: 'BUKTI',
    index: '03',
    vo: 'Ini yang paling mengejutkan. Tidur enam jam selama sepuluh hari menurunkan performamu setara begadang dua puluh empat jam. Dan mereka tidak merasa lebih buruk.',
    cap: 'Tidur *enam jam* selama *sepuluh hari* menurunkan performamu *setara begadang dua puluh empat jam*. Dan mereka *tidak merasa* lebih buruk.',
    pad: 0.5,
  },
  {
    id: 's4',
    key: 'brain',
    label: 'OTAK',
    index: '04',
    vo: 'Saat tidur, otak membersihkan limbah, mengunci ingatan, dan mengatur hormon lapar. Satu malam kurang tidur saja sudah menaikkan rasa lapar dan menurunkan fokus.',
    cap: 'Saat tidur, otak membersihkan *limbah*, mengunci *ingatan*, dan mengatur *hormon* lapar. Satu malam kurang tidur saja sudah *menaikkan rasa lapar* dan *menurunkan fokus*.',
    pad: 0.5,
  },
  {
    id: 's5',
    key: 'myth',
    label: 'MITOS',
    index: '05',
    vo: 'Jadi tidur dua belas jam di hari Minggu bisa membayar utangnya? Tidak. Tidak ada tombol reset. Yang justru terganggu bukan cuma jumlah jamnya, tapi jam internalmu.',
    cap: 'Jadi tidur *dua belas jam* di hari Minggu bisa membayar utangnya? *Tidak.* Tidak ada *tombol reset*. Yang terganggu bukan *cuma* jumlah jamnya, tapi *jam internalmu*.',
    pad: 0.55,
  },
  {
    id: 's6',
    key: 'fix',
    label: 'CARA',
    index: '06',
    vo: 'Yang benar-benar bekerja: bangun di jam yang sama setiap hari. Cahaya pagi sepuluh menit. Stop kafein delapan jam sebelum tidur. Dan turunkan suhu kamarmu.',
    cap: 'Yang benar-benar bekerja: *bangun di jam yang sama* setiap hari. Cahaya pagi *sepuluh menit*. Stop kafein *delapan jam* sebelum tidur. Dan *turunkan suhu* kamarmu.',
    pad: 0.5,
  },
  {
    id: 's7',
    key: 'outro',
    label: 'TIDUR',
    index: '07',
    vo: 'Tidur bukan kemewahan, bukan bonus, dan bukan sisa waktu. Tidur itu fondasi. Mau satu kebiasaan yang mengubah semuanya? Mulai malam ini.',
    cap: 'Tidur bukan *kemewahan*, bukan *bonus*, dan bukan sisa waktu. Tidur itu *fondasi*. Mau satu kebiasaan yang *mengubah semuanya*? Mulai *malam ini*.',
    pad: 1.5,
  },
];

export const BRAND = 'NAYSI';
export const SERIES = 'TIDUR · OTAK';
