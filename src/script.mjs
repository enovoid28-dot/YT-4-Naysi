// Episode 16 — "Token seratus ribu bukan seratus ribu."
//
// Thesis: a prepaid token is not a purchase of electricity, it is a purchase
// of electricity MINUS three things nobody prints on the receipt: the admin
// fee, the municipal street-lighting tax (PPJ), and a tariff that depends on
// which column your house falls into. The kWh counter is the only honest
// number on the meter — everything else is arithmetic on top of it.
//
// Sources (Nov 2026): PLN tariff schedule per golongan (Kompas, 26 Oct 2026),
// PPJ DKI 2,4% / 3% / 4% and the 2,4–10% national range, admin Rp2.500–3.500,
// 100.000 rupiah at 1.300 VA = 65,8 kWh (Jakarta) vs 60,2 kWh (PPJ 10%).
//
// Every card is a verbatim slice of the take, numbers spelled the way the
// voice says them; the big numerals live in the artwork.

export const SERIES = 'NAYSI · HARGA';
export const BRAND = 'NAYSI';

export const SCENES = [
  {
    id: 's1',
    key: 'p1',
    label: 'EMPAT POTONG',
    index: '01',
    theme: 'dark',
    vo: 'Kamu beli token seratus ribu. Meteran menulis enam puluh lima koma delapan kilowatt jam. Bukan salah hitung. Ada empat potong sebelum listrik itu sampai ke rumahmu.',
    cap: [
      'Kamu beli token *seratus* *ribu*.',
      'Meteran menulis *enam* *puluh* *lima* koma delapan kilowatt jam.',
      'Bukan salah hitung.',
      'Ada *empat* *potong* sebelum listrik itu sampai ke rumahmu.',
    ],
    pad: 1.45,
  },
  {
    id: 's2',
    key: 'p2',
    label: 'TIGA BARIS',
    index: '02',
    theme: 'dark',
    vo: 'Uangmu tidak langsung berubah jadi listrik. Tiga baris memotong duluan. Biaya admin, dua ribu lima ratus sampai tiga ribu lima ratus. Pajak penerangan jalan, dua koma empat sampai sepuluh persen. Baru sisanya dibagi tarif per kilowatt jam.',
    cap: [
      'Uangmu tidak langsung berubah jadi listrik.',
      'Tiga baris memotong duluan.',
      'Biaya admin, *dua* *ribu* *lima* *ratus* sampai *tiga* *ribu* *lima* *ratus*.',
      'Pajak penerangan jalan, *dua* koma empat sampai *sepuluh* *persen*.',
      'Baru sisanya dibagi tarif per kilowatt jam.',
    ],
    pad: 1.45,
  },
  {
    id: 's3',
    key: 'p3',
    label: 'PAJAK DAERAH',
    index: '03',
    theme: 'dark',
    vo: 'Pajak itu bukan pajak PLN. Itu pajak daerah. Jakarta memotong dua koma empat persen untuk daya kecil. Bangka Belitung memotong sepuluh persen. Tarif listriknya sama. Potongannya tidak.',
    cap: [
      'Pajak itu bukan pajak PLN. Itu *pajak* *daerah*.',
      'Jakarta memotong *dua* koma empat persen untuk daya kecil.',
      'Bangka Belitung memotong *sepuluh* *persen*.',
      'Tarif listriknya sama. *Potongannya* *tidak*.',
    ],
    pad: 1.40,
  },
  {
    id: 's4',
    key: 'p4',
    label: 'SELISIHNYA',
    index: '04',
    theme: 'dark',
    vo: 'Dengan seratus ribu dan daya seribu tiga ratus, Jakarta dapat enam puluh lima koma delapan kilowatt jam. Bangka dapat enam puluh koma dua. Selisih lima koma enam kilowatt jam. Delapan ribu seratus rupiah yang tidak pernah jadi listrik.',
    cap: [
      'Dengan seratus ribu dan daya seribu tiga ratus,',
      'Jakarta dapat *enam* *puluh* *lima* koma delapan kilowatt jam.',
      'Bangka dapat *enam* *puluh* koma dua.',
      'Selisih *lima* koma enam kilowatt jam.',
      'Delapan ribu seratus rupiah yang tidak pernah jadi listrik.',
    ],
    pad: 1.45,
  },
  {
    id: 's5',
    key: 'p5',
    label: 'GOLONGAN',
    index: '05',
    theme: 'dark',
    vo: 'Lalu tarifnya juga bukan satu angka. Empat ratus lima puluh volt ampere subsidi, empat ratus lima belas rupiah per kilowatt jam. Sembilan ratus subsidi, enam ratus lima. Tapi sembilan ratus RTM, seribu tiga ratus lima puluh dua. Daya sama. Harga dua kali lipat.',
    cap: [
      'Lalu tarifnya juga bukan satu angka.',
      'Empat ratus lima puluh volt ampere subsidi,',
      '*empat* *ratus* *lima* *belas* rupiah per kilowatt jam.',
      'Sembilan ratus subsidi, *enam* *ratus* *lima*.',
      'Tapi sembilan ratus RTM, *seribu* *tiga* *ratus* *lima* *puluh* *dua*.',
      'Daya sama. Harga *dua* *kali* *lipat*.',
    ],
    pad: 1.45,
  },
  {
    id: 's6',
    key: 'p6',
    label: 'HARGA ASLI',
    index: '06',
    theme: 'dark',
    vo: 'Jadi harga listrikmu bukan seribu empat ratus empat puluh empat koma tujuh puluh. Setelah admin dan pajak, seratus ribu itu setara seribu lima ratus sembilan belas rupiah per kilowatt jam. Kamu membeli listrik lima persen di atas tarif.',
    cap: [
      'Jadi harga listrikmu bukan *seribu* *empat* *ratus* *empat* *puluh* *empat* koma tujuh puluh.',
      'Setelah admin dan pajak, seratus ribu itu setara',
      '*seribu* *lima* *ratus* *sembilan* *belas* rupiah per kilowatt jam.',
      'Kamu membeli listrik *lima* *persen* di atas tarif.',
    ],
    pad: 1.45,
  },
  {
    id: 's7',
    key: 'p7',
    label: 'ARTINYA',
    index: '07',
    theme: 'dark',
    vo: 'Enam puluh lima kilowatt jam itu apa? AC satu PK menyala terus delapan puluh delapan jam. Setrika tiga ratus lima puluh watt, seratus delapan puluh delapan jam. Kulkas seratus watt, dua puluh tujuh hari.',
    cap: [
      'Enam puluh lima kilowatt jam itu apa?',
      'AC satu PK menyala terus *delapan* *puluh* *delapan* *jam*.',
      'Setrika tiga ratus lima puluh watt, *seratus* *delapan* *puluh* *delapan* *jam*.',
      'Kulkas seratus watt, *dua* *puluh* *tujuh* *hari*.',
    ],
    pad: 1.45,
  },
  {
    id: 's8',
    key: 'p8',
    label: 'YANG TIDUR',
    index: '08',
    theme: 'dark',
    vo: 'Dan token habis bukan karena AC. Setiap dua puluh watt yang tidak pernah tidur makan empat belas koma empat kilowatt jam sebulan. Router, televisi standby, charger, lampu teras. Seperlima tokenmu pergi tanpa kamu nyalakan apa pun.',
    cap: [
      'Dan token habis bukan karena AC.',
      'Setiap *dua* *puluh* *watt* yang tidak pernah tidur',
      'makan *empat* *belas* koma empat kilowatt jam sebulan.',
      'Router, televisi standby, charger, lampu teras.',
      'Seperlima tokenmu pergi *tanpa* *kamu* *nyalakan* *apa* *pun*.',
    ],
    pad: 1.45,
  },
  {
    id: 's9',
    key: 'p9',
    label: 'SATU METERAN',
    index: '09',
    theme: 'dark',
    vo: 'Listriknya tidak mahal. Yang mahal adalah tidak pernah tahu ke mana uangnya pergi. Empat potong, satu meteran. Cek struk token terakhirmu, lalu tulis di komentar: berapa kilowatt jam yang masuk, dan pajak daerahmu berapa persen.',
    cap: [
      'Listriknya tidak mahal.',
      'Yang mahal adalah tidak pernah tahu ke mana uangnya pergi.',
      'Empat potong, satu meteran.',
      'Cek struk token terakhirmu, lalu tulis di komentar:',
      'berapa kilowatt jam yang masuk, dan pajak daerahmu berapa persen.',
    ],
    pad: 2.10,
  },
];
