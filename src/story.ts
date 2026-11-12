export const FPS = 90;
export const WIDTH = 1440;
export const HEIGHT = 2560;
export const TITLE = 'Paylater: Cicilan Kecil, Tagihan Besar';
export const BRAND = 'NAYSI';
export const SERIES = 'UANG · SEHARI-HARI';

export type SceneDef = {
  id: string;
  chapter: string;
  theme: 'dark' | 'light';
  accent: string;
  captions: string[];
  accents: string[];
  head: number;
  tail: number;
};

export const SCENES: SceneDef[] = [
  {
    id: '01', chapter: 'CUMA SERATUS RIBU?', theme: 'dark', accent: '#F16A45',
    captions: ['Seratus ribu per bulan.', 'Kedengarannya kecil, kan?', 'Tapi coba kalikan dua belas.', 'Satu koma dua juta.'],
    accents: ['seratus', 'kecil', 'dua belas', 'juta'], head: 0.3, tail: 0.36,
  },
  {
    id: '02', chapter: 'HARGA PENUH', theme: 'light', accent: '#176B5B',
    captions: ['Mata melihat cicilan.', 'Bukan harga penuh.', 'Barangnya datang hari ini,', 'tetapi bayarnya menempel', 'sampai bulan depan.'],
    accents: ['cicilan', 'penuh', 'hari ini', 'menempel', 'bulan depan'], head: 0.28, tail: 0.34,
  },
  {
    id: '03', chapter: 'JATUH TEMPO', theme: 'dark', accent: '#EAB866',
    captions: ['Sekarang ada tiga cicilan.', 'Masing-masing seratus ribu.', 'Kecil saat sendiri,', 'tiga ratus ribu', 'saat jatuh tempo bersamaan.'],
    accents: ['tiga', 'seratus', 'sendiri', 'tiga ratus', 'bersamaan'], head: 0.28, tail: 0.34,
  },
  {
    id: '04', chapter: 'NOL PERSEN', theme: 'light', accent: '#D9482B',
    captions: ['Nol persen belum tentu gratis.', 'Contoh: biaya admin', 'sepuluh ribu per bulan.', 'Setahun, tambah', 'seratus dua puluh ribu.'],
    accents: ['nol', 'gratis', 'admin', 'sepuluh', 'seratus dua puluh'], head: 0.28, tail: 0.34,
  },
  {
    id: '05', chapter: 'RUANG GAJI', theme: 'dark', accent: '#79B8A0',
    captions: ['Gaji tidak membayar', 'satu tombol saja.', 'Ada makan, kos, listrik.', 'Cicilan kecil bisa berebut ruang', 'dengan kebutuhan wajib.'],
    accents: ['gaji', 'satu', 'makan', 'berebut', 'wajib'], head: 0.28, tail: 0.34,
  },
  {
    id: '06', chapter: 'SKALA NASIONAL', theme: 'dark', accent: '#EAB866',
    captions: ['Skalanya besar.', 'Data OJK: paylater perbankan', 'tiga puluh satu koma lima', 'triliun rupiah,', 'September dua ribu dua puluh enam.', 'Naik hampir dua puluh tujuh', 'persen setahun.'],
    accents: ['besar', 'OJK', 'tiga puluh', 'triliun', 'September', 'dua puluh tujuh', 'setahun'], head: 0.28, tail: 0.4,
  },
  {
    id: '07', chapter: 'SEBELUM KLIK', theme: 'light', accent: '#176B5B',
    captions: ['Sebelum klik, cek total biaya.', 'Jumlahkan cicilan bulan depan.', 'Kalau bayar utang', 'harus pakai utang baru,', 'berhenti dulu.'],
    accents: ['total', 'jumlahkan', 'utang', 'utang baru', 'berhenti'], head: 0.28, tail: 0.34,
  },
  {
    id: '08', chapter: 'PINDAH KE DEPAN', theme: 'dark', accent: '#F16A45',
    captions: ['Paylater memindahkan pembayaran', 'ke depan,', 'bukan menggratiskan barang.', 'Kirim ini ke teman yang bilang:', 'cuma seratus ribu per bulan.'],
    accents: ['memindahkan', 'depan', 'menggratiskan', 'kirim', 'cuma'], head: 0.28, tail: 0.5,
  },
];

export const SOURCES = [
  {label: 'OJK / RDKB Oktober 2026, posisi September 2026', value: 'Baki debet BNPL perbankan Rp31,50 T; +26,68% yoy; 34,5 juta rekening', url: 'https://tirto.id/utang-paylater-warga-naik-jadi-rp315-triliun-di-september-2026-hZ1s'},
  {label: 'Ilustrasi aritmetika, bukan tarif universal', value: 'Rp100.000 × 12 = Rp1.200.000; admin contoh Rp10.000 × 12 = Rp120.000', url: ''},
];
