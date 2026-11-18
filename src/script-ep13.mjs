// Episode 13 — "Paylater bukan uangmu. Itu uang bulan depanmu." (BNPL)
//
// Thesis: a paylater purchase is not a discount and not a payment plan, it is
// a loan you take to move next month's money into today — with rent, a fee that
// is quoted per month so it looks small, and a penalty that is quoted per
// month but charged per day late.
//
// Every card below is a verbatim slice of the take, so a caption can never say
// something the voice did not.

export const SERIES = 'NAYSI · UANG';
export const BRAND = 'NAYSI';

export const SCENES = [
  {
    id: 's1',
    key: 'n1',
    label: 'HARGA YANG DIPINJAM',
    index: '01',
    theme: 'dark',
    vo: 'Sepatu ini satu juta dua ratus ribu. Kamu bayarnya seratus dua puluh ribu, lalu merasa cuma belanja segitu.',
    cap: [
      'Sepatu ini *satu* *juta* *dua* *ratus* *ribu*.',
      'Kamu bayarnya *seratus* *dua* *puluh* *ribu*,',
      'Lalu merasa cuma belanja segitu.',
    ],
    pad: 0.65,
  },
  {
    id: 's2',
    key: 'n2',
    label: 'BUNGA YANG KECIL',
    index: '02',
    theme: 'dark',
    vo: 'Bunganya hampir tiga persen sebulan. Kedengarannya kecil, karena kamu bandingkan dengan satu juta. Bukan dengan setahun: tiga puluh lima persen.',
    cap: [
      'Bunganya hampir *tiga* *persen* sebulan.',
      'Kedengarannya kecil, karena kamu bandingkan dengan satu juta.',
      'Bukan dengan setahun:',
      'Tiga puluh *lima* *persen*.',
    ],
    pad: 0.55,
  },
  {
    id: 's3',
    key: 'n3',
    label: 'SATU HARI TERLAMBAT',
    index: '03',
    theme: 'dark',
    vo: 'Telat satu hari saja, dendanya lima persen dari seluruh tagihan. Tanpa masa tenggang. Itu bunga dua bulan, dihapus sehari.',
    cap: [
      'Telat *satu* *hari* saja, dendanya lima persen dari seluruh tagihan.',
      'Tanpa masa tenggang.',
      'Itu bunga *dua* *bulan*, dihapus sehari.',
    ],
    pad: 0.60,
  },
  {
    id: 's4',
    key: 'n4',
    label: 'ANGKA YANG DIPECAH',
    index: '04',
    theme: 'dark',
    vo: 'Kenapa tidak terasa? Karena angkanya dipecah. Seratus dua puluh ribu jauh dari satu juta dua ratus, jadi kamu membaca angka pertama, bukan totalnya.',
    cap: [
      'Kenapa tidak terasa?',
      'Karena angkanya *dipecah*.',
      'Seratus dua puluh ribu jauh dari satu juta dua ratus,',
      'Jadi kamu membaca angka pertama, bukan totalnya.',
    ],
    pad: 0.50,
  },
  {
    id: 's5',
    key: 'n5',
    label: 'YANG SEDANG TERJADI',
    index: '05',
    theme: 'dark',
    vo: 'Dan itu bekerja. Utang paylater di bank naik hampir sepertiga setahun: dua puluh empat triliun, dari dua puluh sembilan juta rekening.',
    cap: [
      'Dan itu *bekerja*.',
      'Utang paylater di bank naik hampir sepertiga setahun:',
      'Dua puluh *empat* *triliun*,',
      'Dari dua puluh sembilan juta rekening.',
    ],
    pad: 0.55,
  },
  {
    id: 's6',
    key: 'n6',
    label: 'UANG BULAN DEPAN',
    index: '06',
    theme: 'dark',
    vo: 'Paylater bukan uangmu. Itu uang bulan depanmu, dipinjam hari ini, dengan sewa. Sebelum mencicil, tanya: ini menghasilkan, atau cuma menua?',
    cap: [
      'Paylater bukan *uangmu*.',
      'Itu uang bulan depanmu, dipinjam hari ini, dengan sewa.',
      'Sebelum mencicil, tanya:',
      'Ini menghasilkan, atau cuma *menua*?',
    ],
    pad: 1.30,
  },
];
