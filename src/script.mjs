// Episode 12 — "Tiket pesawat tidak dijual. Ia dilelang." (dynamic pricing)
//
// Two spoken sentences per scene == two caption cards per scene, so every card
// is placed from the audio that was actually recorded, never from a guess.
//
// Thesis: an airline seat is perishable inventory, so a fare is not a sticker —
// it is an auction that opens the day the seat goes on sale. The popular
// "they track my cookies" story is wrong, and the truth is more useful: the
// three things that move the number are visible to you.

export const SERIES = 'NAYSI · HARGA';
export const BRAND = 'NAYSI';

export const SCENES = [
  {
    id: 's1',
    key: 'k1',
    label: 'HARGA YANG BERGERAK',
    index: '01',
    theme: 'dark',
    vo: 'Kemarin tiket ini tujuh ratus ribu. Hari ini sembilan ratus ribu, dan bukan karena maskapai mengawasi pencarianmu.',
    cap: 'Kemarin *Rp700 ribu*. Hari ini *Rp900 ribu*. ' + 'Bukan karena maskapai mengawasi pencarianmu. ',
    pad: 2.9,
  },
  {
    id: 's2',
    key: 'k2',
    label: 'BARANG BASI',
    index: '02',
    theme: 'dark',
    vo: 'Kursi pesawat itu barang yang cepat basi. Lewat satu menit saja setelah pintu ditutup, nilainya nol. Jadi maskapai tidak memasang harga, mereka melelangnya.',
    cap: 'Kursi pesawat *barang basi*: lewat jam terbang, nilainya nol. ' + 'Maskapai tidak memasang harga. Mereka *melelang*. ',
    pad: 2.7,
  },
  {
    id: 's3',
    key: 'k3',
    label: 'TINGKAT HARGA',
    index: '03',
    theme: 'dark',
    vo: 'Di dalam satu kabin ekonomi ada belasan tingkat harga. Kursi termurah dilepas dulu, dan begitu habis, harga melompat ke tingkat berikutnya.',
    cap: 'Satu kabin ekonomi, *belasan tingkat harga* yang tak terlihat. ' + 'Termurah habis dulu, lalu harga *melompat*. ',
    pad: 2.7,
  },
  {
    id: 's4',
    key: 'k4',
    label: 'YANG MENGGERAKKAN',
    index: '04',
    theme: 'dark',
    vo: 'Yang menggerakkan angkanya bukan kamu, tapi semua orang yang mencari rute itu, sisa waktu sebelum berangkat, dan harga pesaing.',
    cap: 'Penggeraknya: *semua orang* yang mencari rute itu. ' + 'Sisa waktu, dan *harga pesaing*. ',
    pad: 2.6,
  },
  {
    id: 's5',
    key: 'k5',
    label: 'JENDELA WAKTU',
    index: '05',
    theme: 'dark',
    vo: 'Harga naik makin dekat keberangkatan, paling tajam di dua minggu terakhir. Selasa sampai Kamis biasanya lebih murah. Mode incognito tidak menolong.',
    cap: 'Lonjakan paling tajam: *14 hari* terakhir. ' + '*Incognito* tidak menolong. ',
    pad: 2.8,
  },
  {
    id: 's6',
    key: 'k6',
    label: 'YANG BERJALAN TERUS',
    index: '06',
    theme: 'dark',
    vo: 'Tiket bukan angka yang menunggumu. Itu lelang yang sudah berjalan sejak kursinya dijual, dan kamu baru masuk ke ruangannya.',
    cap: 'Tiket bukan angka yang menunggumu. ' + 'Itu *lelang* yang berjalan terus. ',
    pad: 3.4,
  },
];
