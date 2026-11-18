// Episode 17 — "Paylater tidak berbunga. Ia cuma pakai kata lain."
//
// Thesis: a paylater receipt has no interest line, so we read it as free. The
// cost did not disappear, it moved into a column with a softer name — biaya
// layanan, biaya penanganan, denda — and it is charged flat, on the original
// price, before anything is owed. Nol persen is a statement about the interest
// column, not about the price.
//
// Sources (Nov 2026): OJK RDKB — baki debet BNPL perbankan Rp31,50 triliun,
// 34,5 juta rekening (September 2026); pembiayaan BNPL multifinance Rp13,54
// triliun, 93,01% konsumsi (September 2026); rata-rata baki debet Rp940 ribu
// per rekening (Juni 2026). RIPLAY Kredivo (0% bunga 3 bulan, biaya layanan
// 9% akun Basic), SPayLater (bunga mulai 2,95%/bulan, biaya penanganan 1%,
// denda 5%/bulan), GoPay Later (1,75%/bulan).
//
// Every card is a verbatim slice of the take, numbers spelled the way the
// voice says them; the big numerals live in the artwork.

export const SERIES = 'NAYSI · HARGA';
export const BRAND = 'NAYSI';

export const SCENES = [
  {
    id: 's1',
    key: 'q1',
    label: 'KATA LAIN',
    index: '01',
    theme: 'light',
    vo: 'Paylater tidak berbunga. Ia memakai kata lain. Di iklannya tertulis nol persen, dan di bawahnya, dengan huruf yang lebih kecil, tertulis biaya layanan.',
    cap: [
      'Paylater tidak berbunga.',
      'Ia memakai *kata* *lain*.',
      'Di iklannya tertulis *nol* *persen*,',
      'dan di bawahnya, dengan huruf yang lebih kecil, tertulis *biaya* *layanan*.',
    ],
    pad: 1.45,
  },
  {
    id: 's2',
    key: 'q2',
    label: 'TIGA PULUH SATU',
    index: '02',
    theme: 'light',
    vo: 'Bank mencatat tiga puluh satu koma lima triliun rupiah paylater, dengan tiga puluh empat koma lima juta rekening. Rata-rata satu rekening berisi sembilan ratus empat puluh ribu. Uang sebesar itu tidak dipakai untuk usaha.',
    cap: [
      'Bank mencatat *tiga* *puluh* *satu* koma lima triliun rupiah paylater,',
      'dengan *tiga* *puluh* *empat* koma lima juta rekening.',
      'Rata-rata satu rekening berisi *sembilan* *ratus* *empat* *puluh* *ribu*.',
      'Uang sebesar itu tidak dipakai untuk usaha.',
    ],
    pad: 1.45,
  },
  {
    id: 's3',
    key: 'q3',
    label: 'KONSUMSI',
    index: '03',
    theme: 'light',
    vo: 'Sembilan puluh tiga persen dipakai untuk konsumsi. Bukan modal kerja, bukan alat produksi. Membeli sesuatu yang sudah bisa dibeli, dengan uang yang belum ada.',
    cap: [
      '*Sembilan* *puluh* *tiga* persen dipakai untuk konsumsi.',
      'Bukan modal kerja.',
      'Bukan alat produksi.',
      'Membeli sesuatu yang sudah bisa dibeli, dengan uang yang *belum* *ada*.',
    ],
    pad: 1.45,
  },
  {
    id: 's4',
    key: 'q4',
    label: 'HARGA PER BULAN',
    index: '04',
    theme: 'light',
    vo: 'Iklannya tidak menjual harga, ia menjual angka per bulan. Delapan juta dalam dua belas bulan, delapan ratus tujuh puluh empat ribu sebulan. Totalnya sepuluh juta empat ratus sembilan puluh enam ribu.',
    cap: [
      'Iklannya tidak menjual harga, ia menjual *angka* *per* *bulan*.',
      'Delapan juta dalam dua belas bulan, *delapan* *ratus* *tujuh* *puluh* *empat* *ribu* sebulan.',
      'Totalnya *sepuluh* *juta* *empat* *ratus* *sembilan* *puluh* *enam* *ribu*.',
    ],
    pad: 1.45,
  },
  {
    id: 's5',
    key: 'q5',
    label: 'BUNGA FLAT',
    index: '05',
    theme: 'light',
    vo: 'Bunganya dua koma enam persen per bulan, dan itu bunga flat. Dihitung dari harga awal, bukan dari sisa utang. Dua koma enam kali dua belas sama dengan tiga puluh satu koma dua persen. Bukan dua koma enam persen setahun.',
    cap: [
      'Bunganya *dua* koma enam persen per bulan, dan itu bunga *flat*.',
      'Dihitung dari harga awal, bukan dari sisa utang.',
      'Dua koma enam kali dua belas sama dengan *tiga* *puluh* *satu* koma dua persen.',
      'Bukan *dua* koma enam persen setahun.',
    ],
    pad: 1.45,
  },
  {
    id: 's6',
    key: 'q6',
    label: 'NOL PERSEN',
    index: '06',
    theme: 'light',
    vo: 'Yang paling rapi adalah tulisan nol persen. Untuk tiga bulan, satu penyedia menawarkan nol persen bunga, dengan biaya layanan sembilan persen dibayar di depan. Nol persen bunga. Sembilan persen biaya. Dalam tiga bulan, itu setara tiga puluh enam persen setahun.',
    cap: [
      'Yang paling rapi adalah tulisan *nol* *persen*.',
      'Untuk tiga bulan, satu penyedia menawarkan *nol* persen bunga,',
      'dengan *biaya* *layanan* *sembilan* *persen* dibayar di depan.',
      'Nol persen bunga.',
      'Sembilan persen biaya.',
      'Dalam tiga bulan, itu setara *tiga* *puluh* *enam* persen setahun.',
    ],
    pad: 1.45,
  },
  {
    id: 's7',
    key: 'q7',
    label: 'DENDA',
    index: '07',
    theme: 'light',
    vo: 'Kalau telat, dendanya lima persen per bulan, dihitung dari total tagihan. Satu juta yang telat tiga bulan menjadi satu juta seratus lima puluh tujuh ribu. Bukan karena bunganya naik, tapi karena dendanya menumpuk di atas denda.',
    cap: [
      'Kalau telat, dendanya *lima* *persen* per bulan, dihitung dari total tagihan.',
      'Satu juta yang telat tiga bulan menjadi *satu* *juta* *seratus* *lima* *puluh* *tujuh* *ribu*.',
      'Bukan karena bunganya naik, tapi karena *dendanya* *menumpuk* *di* *atas* *denda*.',
    ],
    pad: 1.45,
  },
  {
    id: 's8',
    key: 'q8',
    label: 'UJI LIMA BELAS',
    index: '08',
    theme: 'light',
    vo: 'Jadi ada satu uji yang bisa kamu pakai sekarang. Jumlahkan semua cicilan, lalu bagi dengan harga barangnya. Kalau hasilnya di atas lima belas persen untuk dua belas bulan, itu bukan kemudahan. Itu biaya.',
    cap: [
      'Jadi ada satu uji yang bisa kamu pakai sekarang.',
      'Jumlahkan semua cicilan, lalu bagi dengan *harga* *barangnya*.',
      'Kalau hasilnya di atas *lima* *belas* persen untuk dua belas bulan,',
      'itu bukan kemudahan. Itu *biaya*.',
    ],
    pad: 1.45,
  },
  {
    id: 's9',
    key: 'q9',
    label: 'SATU TAGIHAN',
    index: '09',
    theme: 'light',
    vo: 'Paylater tidak salah. Yang salah adalah tidak pernah menghitung totalnya. Buka satu tagihanmu, dan tulis di komentar: berapa persen yang kamu bayar di atas harga barangnya.',
    cap: [
      'Paylater tidak salah.',
      'Yang salah adalah tidak pernah menghitung totalnya.',
      'Buka satu tagihanmu, dan tulis di komentar:',
      'berapa persen yang kamu bayar *di* *atas* *harga* *barangnya*.',
    ],
    pad: 2.10,
  },
];
