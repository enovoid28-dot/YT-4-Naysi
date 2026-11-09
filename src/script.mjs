// Single source of truth for narration + captions + scene metadata.
// `vo` is exactly what the voice says; `cap` is the same words with `*`
// marking the words that light up in amber.

export const SCENES = [
  {
    id: 's1',
    key: 'hook',
    label: 'HARGA',
    index: '01',
    vo: 'Harga bensin naik. Tiket pesawat naik. Belanja bulananmu juga naik. Kenapa semuanya terasa makin mahal?',
    cap: 'Harga bensin *naik*. Tiket pesawat *naik*. Belanja bulananmu juga *naik*. Kenapa semuanya terasa makin *mahal*?',
    pad: 0.55,
  },
  {
    id: 's2',
    key: 'cpi',
    label: 'CPI',
    index: '02',
    vo: 'Semua itu punya satu angka yang menjelaskannya: CPI. Indeks Harga Konsumen. Dia mengukur perubahan harga dari sekumpulan barang dan jasa yang biasa kamu beli.',
    cap: 'Semua itu punya satu angka yang menjelaskannya: *CPI*. *Indeks Harga Konsumen*. Dia *mengukur* perubahan harga dari sekumpulan barang dan jasa yang biasa kamu beli.',
    pad: 0.42,
  },
  {
    id: 's3',
    key: 'oil',
    label: 'MINYAK',
    index: '03',
    vo: 'Contoh paling gampang: minyak. Konflik di Timur Tengah mendorong harga minyak dunia ke seratus dolar per barel. Bensin di pompa langsung ikut naik nol koma enam persen dalam sebulan.',
    cap: 'Contoh paling gampang: *minyak*. Konflik di Timur Tengah mendorong harga minyak dunia ke *seratus dolar* per barel. Bensin di pompa langsung ikut naik *nol koma enam persen*.',
    pad: 0.5,
  },
  {
    id: 's4',
    key: 'flight',
    label: 'TIKET',
    index: '04',
    vo: 'Efeknya merambat. Biaya bahan bakar maskapai melonjak, dan tiket penerbangan ikut naik dua puluh dua persen.',
    cap: 'Efeknya *merambat*. Biaya bahan bakar maskapai *melonjak*, dan tiket penerbangan ikut naik *dua puluh dua persen*.',
    pad: 0.45,
  },
  {
    id: 's5',
    key: 'basket',
    label: 'BELANJA',
    index: '05',
    vo: 'Satu tahun lalu, keranjang belanja ini seratus dolar. Sekarang, barang yang sama jadi seratus tiga koma tujuh puluh dolar. Kamu tidak beli lebih banyak. Kamu hanya bayar lebih mahal.',
    cap: 'Satu tahun lalu, keranjang belanja ini *seratus dolar*. Sekarang, barang yang sama jadi *seratus tiga koma tujuh puluh dolar*. Kamu *tidak* beli lebih banyak. Kamu hanya bayar *lebih mahal*.',
    pad: 0.5,
  },
  {
    id: 's6',
    key: 'wage',
    label: 'UPAH',
    index: '06',
    vo: 'Sementara upahmu naik satu koma tiga persen, harga naik satu koma empat persen. Selisih kecil itulah yang diam-diam menggerus daya belimu.',
    cap: 'Sementara upahmu naik *satu koma tiga persen*, harga naik *satu koma empat persen*. Selisih kecil itulah yang diam-diam menggerus *daya belimu*.',
    pad: 0.5,
  },
  {
    id: 's7',
    key: 'outro',
    label: 'CPI',
    index: '07',
    vo: 'Jadi, lain kali kamu dengar angka inflasi, ingat: itu bukan sekadar statistik. Itu harga yang kamu bayar. Pantau terus, karena CPI adalah cermin dompetmu.',
    cap: 'Jadi, lain kali kamu dengar angka inflasi, ingat: itu bukan sekadar *statistik*. Itu *harga yang kamu bayar*. Pantau terus, karena CPI adalah *cermin dompetmu*.',
    pad: 1.5,
  },
];

export const BRAND = 'NAYSI';
export const SERIES = 'CPI · INFLASI';
