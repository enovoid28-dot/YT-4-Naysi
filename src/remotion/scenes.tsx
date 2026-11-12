import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONTS} from './fonts';
import {C, Check, Coin, Head, Hero, Receipt, Shadow, pop, rupiah, useT} from './ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);

function Phone({t}: {t: number}) {
  const p = pop(4);
  const total = interpolate(t, [3.5, 4.6], [100000, 1200000], clamp);
  const show = ease(t, 3.3, 3.8);
  return (
    <Hero>
      <defs>
        <linearGradient id="s1body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3A5560" /><stop offset="1" stopColor="#0B1A21" />
        </linearGradient>
        <linearGradient id="s1btn" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#F16A45" /><stop offset="1" stopColor="#D9482B" />
        </linearGradient>
      </defs>
      <Shadow cx={600} cy={1080} rx={330} ry={42} a={0.3} />
      {/* receipt fan */}
      {[-1, 0, 1].map((i) => (
        <g key={i} transform={`translate(${600 + i * 210} ${500 + Math.abs(i) * 40}) rotate(${i * 14}) scale(${0.8 + 0.2 * p})`} opacity={0.9 * show}>
          <Receipt x={-130} y={-190} w={260} h={380} fill={i === 0 ? C.amber : C.paper2}>
            <text textAnchor="middle" y={-70} fontFamily={FONTS.mono} fontSize={30} fill={C.ink}>CICILAN</text>
            <text textAnchor="middle" y={10} fontFamily={FONTS.head} fontWeight={800} fontSize={54} fill={C.ink}>×12</text>
            <text textAnchor="middle" y={80} fontFamily={FONTS.mono} fontSize={24} fill={C.ink}>BULAN</text>
          </Receipt>
        </g>
      ))}
      <g transform={`translate(0 ${(1 - p) * 80}) rotate(${Math.sin(t * 0.8) * 1.2} 600 560)`}>
        <rect x={330} y={70} width={540} height={960} rx={72} fill="url(#s1body)" />
        <rect x={356} y={108} width={488} height={884} rx={52} fill={C.white} />
        <rect x={520} y={126} width={160} height={26} rx={13} fill="#0B1A21" />
        {/* headphones product */}
        <path d="M470 430 C470 260 730 260 730 430" fill="none" stroke={C.ink} strokeWidth={42} strokeLinecap="round" />
        <rect x={438} y={400} width={86} height={150} rx={34} fill={C.coral} />
        <rect x={676} y={400} width={86} height={150} rx={34} fill={C.coral} />
        <rect x={456} y={420} width={50} height={110} rx={22} fill={C.ink} opacity={0.25} />
        <rect x={694} y={420} width={50} height={110} rx={22} fill={C.ink} opacity={0.25} />
        <text x={600} y={650} textAnchor="middle" fontFamily={FONTS.head} fontWeight={800} fontSize={78} fill={C.ink}>Rp100.000</text>
        <text x={600} y={700} textAnchor="middle" fontFamily={FONTS.mono} fontSize={30} fill="#6B7A7E">/ bulan</text>
        <rect x={400} y={750} width={400} height={98} rx={49} fill="url(#s1btn)" />
        <text x={600} y={812} textAnchor="middle" fontFamily={FONTS.body} fontWeight={700} fontSize={36} fill={C.white}>Beli sekarang</text>
        <text x={600} y={900} textAnchor="middle" fontFamily={FONTS.mono} fontSize={26} fill="#8A9498">bayar nanti →</text>
      </g>
      <g opacity={show} transform={`translate(0 ${(1 - show) * 30})`}>
        <rect x={250} y={1060} width={700} height={110} rx={28} fill={C.coral} />
        <text x={600} y={1132} textAnchor="middle" fontFamily={FONTS.head} fontWeight={800} fontSize={56} fill={C.white}>12 bulan = {rupiah(total)}</text>
      </g>
    </Hero>
  );
}

function Scene1() {
  const t = useT();
  const late = t > 3.5;
  return (
    <>
      <Head kicker="01 · TOMBOL KECIL" accent={C.coral} t={t}
        lines={late ? [{text: 'SATU TAHUN:', accent: true}, {text: 'Rp1.200.000'}] : [{text: 'CUMA'}, {text: 'Rp100 RIBU?', accent: true}]} />
      <Phone t={t} />
    </>
  );
}

function Scene2() {
  const t = useT();
  const p = pop(6);
  const flip = ease(t, 2.8, 4.2);
  const total = ease(t, 3.2, 4.0);
  return (
    <>
      <Head kicker="02 · HARGA PENUH" light accent={C.teal} t={t}
        lines={t > 3 ? [{text: 'YANG TERLUPA:'}, {text: 'TOTAL.', accent: true}] : [{text: 'YANG TERLIHAT:'}, {text: 'CICILAN.', accent: true}]} />
      <Hero>
        <Shadow cx={600} cy={1050} rx={480} ry={40} a={0.14} />
        {/* elastic */}
        <path d={`M 330 560 C 480 ${520 + Math.sin(t * 2) * 12} 720 ${520 - Math.sin(t * 2) * 12} 870 560`} fill="none" stroke={C.coral} strokeWidth={14} strokeLinecap="round" opacity={0.8} />
        {/* parcel */}
        <g transform={`translate(${(1 - p) * -160} 0)`}>
          <rect x={90} y={360} width={420} height={360} rx={24} fill="#C99B62" />
          <rect x={90} y={360} width={420} height={90} rx={24} fill="#B8854C" />
          <rect x={270} y={360} width={60} height={360} fill={C.paper} opacity={0.85} />
          <text x={300} y={560} textAnchor="middle" fontFamily={FONTS.head} fontWeight={800} fontSize={52} fill={C.ink}>HARI INI</text>
          <g transform={`translate(300 800) scale(${0.8 + 0.2 * p})`}>
            <rect x={-160} y={-50} width={320} height={100} rx={24} fill={C.teal} />
            <text textAnchor="middle" y={20} fontFamily={FONTS.head} fontWeight={800} fontSize={48} fill={C.white}>Rp100.000</text>
          </g>
        </g>
        {/* calendar */}
        <g transform={`translate(${(1 - p) * 160} 0) rotate(${Math.sin(t * 1.2) * 1.5} 870 500)`}>
          <rect x={660} y={220} width={440} height={540} rx={32} fill={C.white} />
          <rect x={660} y={220} width={440} height={110} rx={32} fill={C.coral} />
          {[730, 880, 1030].map((x) => <rect key={x} x={x - 14} y={190} width={28} height={70} rx={14} fill={C.ink} />)}
          <text x={880} y={292} textAnchor="middle" fontFamily={FONTS.body} fontWeight={700} fontSize={38} fill={C.white}>BULAN DEPAN</text>
          {Array.from({length: 12}, (_, i) => {
            const col = i % 4, row = Math.floor(i / 4);
            const on = i / 12 < flip;
            return <rect key={i} x={700 + col * 96} y={370 + row * 104} width={72} height={72} rx={14} fill={on ? C.teal : C.paper2} opacity={on ? 1 : 0.7} />;
          })}
          <g opacity={total} transform={`translate(880 860) scale(${0.85 + 0.15 * total})`}>
            <rect x={-190} y={-56} width={380} height={112} rx={26} fill={C.ink} />
            <text textAnchor="middle" y={22} fontFamily={FONTS.head} fontWeight={800} fontSize={52} fill={C.white}>Rp1.200.000</text>
          </g>
        </g>
      </Hero>
    </>
  );
}

function PayCard({x, y, rot, label, p, color}: {x: number; y: number; rot: number; label: string; p: number; color: string}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${0.7 + 0.3 * p})`} opacity={p}>
      <rect x={-230} y={-140} width={460} height={280} rx={32} fill="rgba(0,0,0,0.2)" transform="translate(10 16)" />
      <rect x={-230} y={-140} width={460} height={280} rx={32} fill={color} />
      <rect x={-230} y={-140} width={460} height={70} rx={32} fill="rgba(0,0,0,0.12)" />
      <text x={-190} y={-20} fontFamily={FONTS.mono} fontSize={28} fill={C.white} opacity={0.85}>{label}</text>
      <text x={-190} y={60} fontFamily={FONTS.head} fontWeight={800} fontSize={58} fill={C.white}>Rp100.000</text>
      <text x={-190} y={108} fontFamily={FONTS.mono} fontSize={26} fill={C.white} opacity={0.8}>/ bulan</text>
    </g>
  );
}

function Scene3() {
  const t = useT();
  const a = ease(t, 0.3, 1.0), b = ease(t, 0.8, 1.5), c = ease(t, 1.3, 2.0);
  const together = ease(t, 3.6, 4.6);
  const total = interpolate(t, [4.0, 5.2], [0, 300000], clamp);
  const spread = 1 - together * 0.72;
  return (
    <>
      <Head kicker="03 · JATUH TEMPO" accent={C.amber} t={t}
        lines={together > 0.5 ? [{text: 'BERSAMAAN:'}, {text: rupiah(total), accent: true}] : [{text: 'KECIL SAAT'}, {text: 'SENDIRI.', accent: true}]} />
      <Hero>
        <Shadow cx={600} cy={1060} rx={460} ry={44} a={0.3} />
        <g transform={`translate(600 520)`}>
          <PayCard x={-260 * spread} y={-180 * spread} rot={-10 * spread} label="CICILAN 1" p={a} color={C.teal} />
          <PayCard x={0} y={40 * spread} rot={0} label="CICILAN 2" p={b} color={C.coral} />
          <PayCard x={260 * spread} y={-180 * spread} rot={10 * spread} label="CICILAN 3" p={c} color="#3A6EA5" />
        </g>
        <g opacity={together} transform={`translate(600 900) scale(${0.8 + 0.2 * together})`}>
          <rect x={-330} y={-70} width={660} height={140} rx={32} fill={C.amber} />
          <text textAnchor="middle" y={24} fontFamily={FONTS.head} fontWeight={800} fontSize={72} fill={C.ink}>TOTAL {rupiah(total)}</text>
        </g>
      </Hero>
    </>
  );
}

function Scene4() {
  const t = useT();
  const p = pop(5);
  const unroll = ease(t, 1.6, 3.4);
  const extra = ease(t, 3.6, 4.6);
  return (
    <>
      <Head kicker="04 · BUNGA ≠ BIAYA" light accent={C.red} t={t}
        lines={[{text: '0% BUNGA'}, {text: '≠ Rp0 BIAYA', accent: true}]} />
      <Hero>
        <defs>
          <clipPath id="s4clip"><rect x={640} y={140} width={460} height={860 * unroll} /></clipPath>
        </defs>
        <Shadow cx={600} cy={1080} rx={480} ry={40} a={0.14} />
        <g transform={`translate(330 560) scale(${0.8 + 0.2 * p})`}>
          <circle r={270} fill={C.ink} />
          <circle r={236} fill="none" stroke={C.red} strokeWidth={26} strokeDasharray={`${2 * Math.PI * 236 * 0.001} ${2 * Math.PI * 236}`} />
          <circle r={206} fill={C.paper} />
          <text textAnchor="middle" y={40} fontFamily={FONTS.head} fontWeight={800} fontSize={170} fill={C.ink}>0%</text>
          <text textAnchor="middle" y={120} fontFamily={FONTS.mono} fontSize={30} fill={C.red}>BUNGA</text>
        </g>
        <g clipPath="url(#s4clip)">
          <Receipt x={660} y={160} w={420} h={820} fill={C.white}>
            <text x={700} y={235} fontFamily={FONTS.mono} fontSize={20} fill={C.ink}>CONTOH · BUKAN TARIF UNIVERSAL</text>
            <line x1={700} y1={260} x2={1040} y2={260} stroke={C.paper2} strokeWidth={3} />
            <text x={700} y={320} fontFamily={FONTS.body} fontWeight={700} fontSize={30} fill={C.ink}>Cicilan / bulan</text>
            <text x={1040} y={365} textAnchor="end" fontFamily={FONTS.head} fontWeight={800} fontSize={40} fill={C.ink}>Rp100.000</text>
            <text x={700} y={430} fontFamily={FONTS.body} fontWeight={700} fontSize={30} fill={C.ink}>Admin / bulan</text>
            <text x={1040} y={475} textAnchor="end" fontFamily={FONTS.head} fontWeight={800} fontSize={40} fill={C.red}>Rp10.000</text>
            <text x={700} y={540} fontFamily={FONTS.body} fontWeight={700} fontSize={30} fill={C.ink}>× 12 bulan</text>
            <line x1={700} y1={570} x2={1040} y2={570} stroke={C.paper2} strokeWidth={3} />
            <text x={700} y={630} fontFamily={FONTS.body} fontWeight={700} fontSize={30} fill={C.ink}>Tambahan admin</text>
            <text x={1040} y={675} textAnchor="end" fontFamily={FONTS.head} fontWeight={800} fontSize={44} fill={C.red} opacity={extra}>Rp120.000</text>
            <text x={700} y={740} fontFamily={FONTS.body} fontWeight={700} fontSize={30} fill={C.ink}>Total contoh</text>
            <text x={1040} y={785} textAnchor="end" fontFamily={FONTS.head} fontWeight={800} fontSize={44} fill={C.ink} opacity={extra}>Rp1.320.000</text>
            <text x={700} y={880} fontFamily={FONTS.mono} fontSize={22} fill="#8A9498">Cek biaya di aplikasi masing-masing.</text>
          </Receipt>
        </g>
      </Hero>
    </>
  );
}

function Scene5() {
  const t = useT();
  const p = pop(4);
  const squeeze = ease(t, 3.2, 5.0);
  const blocks = [
    {label: 'MAKAN', w: 260, color: C.mint},
    {label: 'KOS', w: 210, color: '#5E9E86'},
    {label: 'LISTRIK', w: 170, color: '#3E7E6A'},
    {label: 'CICILAN', w: 150 + 100 * squeeze, color: C.coral},
  ];
  let x = 130;
  return (
    <>
      <Head kicker="05 · RUANG GAJI" accent={C.mint} t={t}
        lines={[{text: 'GAJINYA SATU.'}, {text: 'TOMBOLNYA BANYAK.', accent: true}]} />
      <Hero>
        <Shadow cx={600} cy={1050} rx={480} ry={42} a={0.28} />
        <g transform={`translate(0 ${(1 - p) * 60})`}>
          <rect x={100} y={330} width={1000} height={560} rx={48} fill={C.ink2} stroke="#2E4C56" strokeWidth={4} />
          <text x={150} y={410} fontFamily={FONTS.mono} fontSize={30} fill={C.muted}>ILUSTRASI RUANG GAJI</text>
          {blocks.map((b, i) => {
            const bx = x; x += b.w + 16;
            const grow = ease(t, 0.6 + i * 0.35, 1.4 + i * 0.35);
            return (
              <g key={b.label} transform={`translate(${bx} 470) scale(${grow} 1)`}>
                <rect width={b.w} height={300} rx={24} fill={b.color} />
                <text x={b.w / 2} y={165} textAnchor="middle" fontFamily={FONTS.head} fontWeight={800} fontSize={b.label.length > 6 ? 34 : 42} fill={C.white}>{b.label}</text>
              </g>
            );
          })}
          <text x={600} y={960} textAnchor="middle" fontFamily={FONTS.body} fontWeight={700} fontSize={36} fill={C.muted}>Kebutuhan wajib tidak bisa ditunda.</text>
        </g>
        {[0, 1, 2, 3, 4].map((i) => {
          const fall = (t * 0.6 + i * 0.2) % 1;
          return <Coin key={i} x={260 + i * 170} y={120 + fall * 180} r={34} />;
        })}
      </Hero>
    </>
  );
}

function Scene6() {
  const t = useT();
  const p = pop(5);
  const n = interpolate(t, [0.8, 2.6], [0, 31.5], clamp);
  const growth = ease(t, 3.0, 4.2);
  return (
    <>
      <Head kicker="06 · DATA OJK" accent={C.amber} t={t}
        lines={[{text: 'BUKAN CUMA'}, {text: 'CERITAMU.', accent: true}]} />
      <Hero>
        <Shadow cx={600} cy={1080} rx={500} ry={44} a={0.3} />
        {/* coin towers */}
        {Array.from({length: 14}, (_, i) => {
          const h = 80 + ((i * 73) % 360);
          const grow = ease(t, 0.4 + i * 0.06, 1.6 + i * 0.06);
          const x = 110 + i * 72;
          return (
            <g key={i} opacity={0.55}>
              {Array.from({length: Math.max(1, Math.round(h / 34 * grow))}, (_, j) => (
                <ellipse key={j} cx={x} cy={1000 - j * 30} rx={30} ry={12} fill={j % 2 ? C.amber : '#C9973F'} />
              ))}
            </g>
          );
        })}
        <g transform={`translate(600 430) scale(${0.85 + 0.15 * p})`}>
          <text textAnchor="middle" y={0} fontFamily={FONTS.head} fontWeight={800} fontSize={190} fill={C.white}>Rp{n.toFixed(2).replace('.', ',')} T</text>
          <text textAnchor="middle" y={80} fontFamily={FONTS.body} fontWeight={700} fontSize={40} fill={C.muted}>baki debet paylater perbankan</text>
        </g>
        <g opacity={growth} transform={`translate(600 640) scale(${0.8 + 0.2 * growth})`}>
          <rect x={-260} y={-60} width={520} height={120} rx={30} fill={C.coral} />
          <text textAnchor="middle" y={24} fontFamily={FONTS.head} fontWeight={800} fontSize={64} fill={C.white}>+26,68% yoy</text>
        </g>
        <g opacity={ease(t, 4.4, 5.4)} transform="translate(600 800)">
          <rect x={-300} y={-48} width={600} height={96} rx={24} fill={C.ink2} stroke="#2E4C56" strokeWidth={3} />
          <text textAnchor="middle" y={-8} fontFamily={FONTS.mono} fontSize={26} fill={C.white}>34,5 juta rekening</text>
          <text textAnchor="middle" y={30} fontFamily={FONTS.mono} fontSize={26} fill={C.muted}>September 2026</text>
        </g>
        <text x={600} y={1120} textAnchor="middle" fontFamily={FONTS.mono} fontSize={24} fill={C.muted}>OJK · RDKB Oktober 2026 · posisi September 2026</text>
      </Hero>
    </>
  );
}

function Scene7() {
  const t = useT();
  const p = pop(4);
  const checks = [ease(t, 0.8, 1.5), ease(t, 2.6, 3.3), ease(t, 4.6, 5.4)];
  const rows = ['Cek total biaya, bukan cicilan', 'Jumlahkan tagihan bulan depan', 'Bayar utang pakai utang baru?'];
  return (
    <>
      <Head kicker="07 · SEBELUM KLIK" light accent={C.teal} t={t}
        lines={[{text: 'CEK TOTAL.'}, {text: 'BUKAN CICILAN.', accent: true}]} />
      <Hero>
        <Shadow cx={600} cy={1080} rx={420} ry={40} a={0.14} />
        <g transform={`translate(0 ${(1 - p) * 70})`}>
          <Receipt x={230} y={150} w={740} h={900} fill={C.white}>
            <text x={290} y={240} fontFamily={FONTS.head} fontWeight={800} fontSize={56} fill={C.ink}>SEBELUM KLIK</text>
            <line x1={290} y1={275} x2={910} y2={275} stroke={C.paper2} strokeWidth={4} />
            {rows.map((r, i) => (
              <g key={r}>
                <Check x={330} y={380 + i * 170} p={checks[i]} color={i === 2 ? C.red : C.teal} size={64} />
                <text x={390} y={395 + i * 170} fontFamily={FONTS.body} fontWeight={700} fontSize={30} fill={C.ink}>{r}</text>
              </g>
            ))}
            <g opacity={checks[2]} transform="translate(600 900)">
              <rect x={-220} y={-56} width={440} height={112} rx={28} fill={C.red} />
              <text textAnchor="middle" y={22} fontFamily={FONTS.head} fontWeight={800} fontSize={54} fill={C.white}>BERHENTI DULU</text>
            </g>
          </Receipt>
        </g>
      </Hero>
    </>
  );
}

function Scene8() {
  const t = useT();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = pop(4);
  const move = ease(t, 0.6, 3.4);
  const share = ease(t, 5.2, 6.2);
  const belt = (frame / fps) * 120;
  return (
    <>
      <Head kicker="08 · PINDAH KE DEPAN" accent={C.coral} t={t}
        lines={[{text: 'BAYARNYA PINDAH.'}, {text: 'BUKAN GRATIS.', accent: true}]} />
      <Hero>
        <Shadow cx={600} cy={1060} rx={480} ry={42} a={0.3} />
        {/* conveyor */}
        <rect x={100} y={720} width={1000} height={90} rx={45} fill={C.ink2} />
        {Array.from({length: 12}, (_, i) => (
          <circle key={i} cx={140 + ((i * 90 + belt) % 920)} cy={765} r={18} fill="#2E4C56" />
        ))}
        <g transform={`translate(${220 + move * 560} 560)`}>
          <rect x={-150} y={-110} width={300} height={220} rx={20} fill={C.mint} />
          <text textAnchor="middle" y={-10} fontFamily={FONTS.head} fontWeight={800} fontSize={44} fill={C.ink}>BARANG</text>
          <text textAnchor="middle" y={50} fontFamily={FONTS.mono} fontSize={28} fill={C.ink}>hari ini</text>
        </g>
        <g transform="translate(220 920)">
          <text textAnchor="middle" fontFamily={FONTS.mono} fontSize={30} fill={C.muted}>HARI INI</text>
        </g>
        <g transform="translate(900 920)">
          <text textAnchor="middle" fontFamily={FONTS.mono} fontSize={30} fill={C.muted}>BULAN DEPAN</text>
        </g>
        <path d="M 300 420 C 500 260 760 260 920 420" fill="none" stroke={C.coral} strokeWidth={12} strokeLinecap="round" strokeDasharray="20 18" opacity={0.8} />
        <g opacity={share} transform={`translate(600 300) scale(${0.7 + 0.3 * share}) rotate(${(1 - share) * -6})`}>
          <rect x={-330} y={-110} width={660} height={220} rx={36} fill={C.coral} />
          <text textAnchor="middle" y={-10} fontFamily={FONTS.head} fontWeight={800} fontSize={54} fill={C.white}>“CUMA Rp100 RIBU?”</text>
          <text textAnchor="middle" y={62} fontFamily={FONTS.body} fontWeight={700} fontSize={34} fill={C.white}>Kirim ke temanmu ↗</text>
        </g>
        <g transform={`translate(0 ${(1 - p) * 40})`} opacity={p}>
          <Coin x={170} y={300} r={48} />
          <Coin x={1030} y={330} r={40} />
        </g>
      </Hero>
    </>
  );
}

export const SCENE_COMPONENTS: Record<string, React.FC> = {
  '01': Scene1, '02': Scene2, '03': Scene3, '04': Scene4,
  '05': Scene5, '06': Scene6, '07': Scene7, '08': Scene8,
};
