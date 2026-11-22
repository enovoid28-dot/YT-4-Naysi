// Episode 36 — Psychology: why you cannot reliably tickle yourself.
//
// Core evidence: self-generated sensations are attenuated when the brain can
// predict their timing and consequences. A delayed or spatially altered
// self-produced touch feels more ticklish. Cerebellar forward-modeling is one
// important contributor; the mechanism is not a simple on/off switch.
//
// Research: Blakemore, Wolpert & Frith, "Central cancellation of self-produced
// tickle sensation," Nature Neuroscience 1, 635–640 (1998), doi:10.1038/2870;
// Blakemore, Frith & Wolpert, "Spatio-Temporal Prediction Modulates the
// Perception of Self-Produced Stimuli," Journal of Cognitive Neuroscience
// 11(5), 551–559 (1999), doi:10.1162/089892999563607.
//
// Audience/retention choice: immediate self-test hook, quick reveal of the
// prediction mechanism, a robotic experiment as evidence, and a playful loop.

export const SERIES = 'NAYSI · PSIKOLOGI';
export const BRAND = 'NAYSI';
export const STYLE = { scrimY: 1760, scrimA: 0.5 };

export const SCENES = [
  {
    id: 's1', key: 'psych', label: 'COBA SENDIRI', index: '01', theme: 'dark',
    vo: 'Coba gelitik telapak kakimu sendiri. Susah, kan? Tapi kalau orang lain yang melakukannya, kamu bisa langsung tertawa.',
    cap: ['Coba gelitik telapak kakimu sendiri.', 'Susah, kan?', 'Tapi kalau orang lain yang melakukannya, kamu bisa langsung tertawa.'],
    lead: 0.30, pad: 0.36,
  },
  {
    id: 's2', key: 'psych', label: 'OTAK MENEBAK', index: '02', theme: 'dark',
    vo: 'Ini bukan soal kulitmu kurang peka. Otakmu terus menebak apa yang akan terjadi sepersekian detik berikutnya.',
    cap: ['Ini bukan soal kulitmu kurang peka.', 'Otakmu terus menebak apa yang akan terjadi sepersekian detik berikutnya.'],
    pad: 0.38,
  },
  {
    id: 's3', key: 'psych', label: 'SALINAN PERINTAH', index: '03', theme: 'dark',
    vo: 'Saat tanganmu bergerak, otak mengirim perintah sekaligus salinan prediksi ke sistem sensorik.',
    cap: ['Saat tanganmu bergerak,', 'otak mengirim perintah sekaligus salinan prediksi ke sistem sensorik.'],
    pad: 0.38,
  },
  {
    id: 's4', key: 'psych', label: 'SENSASI DIREDAM', index: '04', theme: 'dark',
    vo: 'Jadi sebelum sentuhan tiba, otak sudah tahu: ini datang dari gerakanku sendiri. Sensasinya diredam.',
    cap: ['Jadi sebelum sentuhan tiba,', 'otak sudah tahu: ini datang dari gerakanku sendiri.', 'Sensasinya diredam.'],
    pad: 0.38,
  },
  {
    id: 's5', key: 'psych', label: 'UJI ROBOT', index: '05', theme: 'dark',
    vo: 'Peneliti Sarah-Jayne Blakemore mengujinya dengan robot. Peserta menggerakkan alat untuk menggelitik telapak tangannya sendiri.',
    cap: ['Peneliti Sarah-Jayne Blakemore mengujinya dengan robot.', 'Peserta menggerakkan alat untuk menggelitik telapak tangannya sendiri.'],
    pad: 0.38,
  },
  {
    id: 's6', key: 'psych', label: 'JEDA TAK TERDUGA', index: '06', theme: 'dark',
    vo: 'Kalau gerak robot tertunda, sentuhannya terasa lebih kuat. Makin tak terduga waktunya, makin sulit otak membatalkan sinyal.',
    cap: ['Kalau gerak robot tertunda, sentuhannya terasa lebih kuat.', 'Makin tak terduga waktunya, makin sulit otak membatalkan sinyal.'],
    pad: 0.38,
  },
  {
    id: 's7', key: 'psych', label: 'PREDIKSI OTAK KECIL', index: '07', theme: 'dark',
    vo: 'Otak kecil, serebelum, membantu menghitung prediksi itu. Bukan menghapus sentuhan, hanya mengurangi kejutan yang kamu sebabkan sendiri.',
    cap: ['Otak kecil, serebelum, membantu menghitung prediksi itu.', 'Bukan menghapus sentuhan, hanya mengurangi kejutan yang kamu sebabkan sendiri.'],
    pad: 0.38,
  },
  {
    id: 's8', key: 'psych', label: 'BUKAN SIHIR', index: '08', theme: 'dark',
    vo: 'Orang lain mematahkan prediksimu, maka geli terasa lebih kuat. Coba lagi, dan jangan kaget kalau kali ini tetap tidak berhasil.',
    cap: ['Orang lain mematahkan prediksimu, maka geli terasa lebih kuat.', 'Coba lagi, dan jangan kaget kalau kali ini tetap tidak berhasil.'],
    pad: 1.25,
  },
];
