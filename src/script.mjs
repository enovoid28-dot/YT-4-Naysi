// Episode 5 — "Kamu Bukan Lapar" — narration + captions + scene metadata.
// Thesis: night-time hunger after a normal dinner is usually not hunger. It is
// short sleep changing appetite hormones and the reward system, and the fix is
// sleep, not willpower.

export const SCENES = [
  {
    id: 's1',
    key: 'k1',
    label: 'KULKAS',
    index: '01',
    vo: 'Jam sebelas malam lebih. Kamu sudah makan malam, kamu sudah kenyang, tapi kamu berdiri di depan kulkas lagi. Dan kamu menyebutnya lapar. Padahal lapar tidak seperti ini.',
    cap: 'Jam *sebelas malam* lebih. Kamu sudah makan malam, kamu sudah *kenyang*, tapi kamu berdiri di depan *kulkas* lagi. Dan kamu menyebutnya *lapar*. Padahal lapar *tidak seperti ini*.',
    pad: 0.9,
  },
  {
    id: 's2',
    key: 'k2',
    theme: 'light',
    label: 'SALAH TUDUH',
    index: '02',
    vo: 'Ini bukan soal niat. Bukan soal gula darah. Ini soal tidur. Kurang tidur membuat tubuhmu meminta makanan yang tidak kamu butuhkan.',
    cap: 'Ini bukan soal *niat*. Bukan soal *gula darah*. Ini soal *tidur*. Kurang tidur membuat tubuhmu meminta makanan yang *tidak kamu butuhkan*.',
    pad: 0.7,
  },
  {
    id: 's3',
    key: 'k3',
    label: 'HORMON',
    index: '03',
    vo: 'Tahun dua ribu empat, dua belas pria muda tidur empat jam selama dua malam. Ghrelin, sinyal lapar, naik dua puluh delapan persen. Leptin, sinyal kenyang, turun delapan belas persen. Rasa lapar mereka naik dua puluh empat persen.',
    cap: 'Tahun *dua ribu empat*, *12 pria muda* tidur *empat jam* selama dua malam. *Ghrelin*, sinyal lapar, naik *28 persen*. *Leptin*, sinyal kenyang, turun *18 persen*. Rasa lapar mereka naik *24 persen*.',
    pad: 0.7,
  },
  {
    id: 's4',
    key: 'k4',
    label: 'ANGKA',
    index: '04',
    vo: 'Efeknya terukur. Meta-analisis enam belas studi, empat ratus sembilan puluh enam orang: kurang tidur menambah asupan tiga ratus delapan puluh lima kalori per hari. Tanpa tambahan pembakaran. Struk malammu memang lebih panjang.',
    cap: 'Efeknya *terukur*. Meta-analisis *16 studi*, *496 orang*: kurang tidur menambah asupan *385 kalori* per hari. Tanpa tambahan *pembakaran*. Struk malammu memang *lebih panjang*.',
    pad: 0.7,
  },
  {
    id: 's5',
    key: 'k5',
    label: 'OTAK',
    index: '05',
    vo: 'Dan bukan cuma hormon. Setelah empat malam kurang tidur, sinyal hadiah di otak naik tiga puluh tiga persen, dan bertahan sampai jam sembilan malam. Saat diberi camilan, mereka makan lemak hampir dua kali lipat. Perutnya kenyang, otaknya belum.',
    cap: 'Dan bukan cuma *hormon*. Setelah empat malam kurang tidur, sinyal hadiah di otak naik *33 persen*, dan bertahan sampai *jam sembilan malam*. Saat diberi camilan, mereka makan lemak *hampir dua kali lipat*. Perutnya *kenyang*, otaknya *belum*.',
    pad: 0.7,
  },
  {
    id: 's6',
    key: 'k6',
    theme: 'light',
    label: 'BALIK',
    index: '06',
    vo: 'Kabar baiknya, ini bisa dibalik. Delapan puluh orang dewasa, dua minggu, tidurnya ditambah satu koma dua jam. Tanpa diet. Mereka makan dua ratus tujuh puluh kalori lebih sedikit tiap hari.',
    cap: 'Kabar baiknya, ini bisa *dibalik*. *80 orang dewasa*, dua minggu, tidurnya ditambah *1,2 jam*. Tanpa *diet*. Mereka makan *270 kalori* lebih sedikit tiap hari.',
    pad: 0.7,
  },
  {
    id: 's7',
    key: 'k7',
    label: 'MITOS',
    index: '07',
    vo: 'Tapi jangan berharap begadang membakar kalori. Satu jam terjaga hanya memakai sekitar tujuh belas kalori. Empat jam: tujuh puluh. Sementara kurang tidur menambah tiga ratus delapan puluh lima kalori masuk. Matematikanya tidak pernah menang.',
    cap: 'Tapi jangan berharap *begadang* membakar kalori. Satu jam terjaga hanya memakai sekitar *17 kalori*. Empat jam: *70*. Sementara kurang tidur menambah *385 kalori* masuk. Matematikanya *tidak pernah menang*.',
    pad: 0.7,
  },
  {
    id: 's8',
    key: 'k8',
    theme: 'light',
    label: 'JAMNYA',
    index: '08',
    vo: 'Yang bekerja cuma satu: tidur tujuh sampai sembilan jam, di jam yang sama tiap malam. Kalau setelah itu masih lapar, itu lapar sungguhan. Jadi, jam berapa kamu mulai lapar tadi malam?',
    cap: 'Yang bekerja cuma *satu*: tidur *tujuh sampai sembilan jam*, di jam yang *sama* tiap malam. Kalau setelah itu masih lapar, itu lapar *sungguhan*. Jadi, *jam berapa* kamu mulai lapar tadi malam?',
    pad: 2.0,
  },
];

export const BRAND = 'NAYSI';
export const SERIES = 'TIDUR · OTAK';
