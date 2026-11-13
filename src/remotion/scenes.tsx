import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONTS} from './fonts';
import {C, Check, Connector, Head, Hero, Icon, Panel, Pill, Receipt, Rule, Shadow, Stamp, back, clamp, pop, rupiah, seg, useT} from './ui';

const ease = seg;

function SwitchHead({t, at, kicker, accent, light, before, after}: {
  t: number; at: number; kicker: string; accent: string; light?: boolean;
  before: {text: string; accent?: boolean}[]; after: {text: string; accent?: boolean}[];
}) {
  const p = seg(t, at, at + 0.45);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, opacity: 1 - p, transform: `translateY(${-34 * p}px)`, pointerEvents: 'none'}}>
        <Head kicker={kicker} lines={before} accent={accent} light={light} t={t} />
      </div>
      <div style={{position: 'absolute', inset: 0, opacity: p, transform: `translateY(${(1 - p) * 34}px)`, pointerEvents: 'none'}}>
        <Head kicker={kicker} lines={after} accent={accent} light={light} t={Math.max(0, t - at)} />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 01 · Hook: the small button becomes a yearly commitment             */
/* ------------------------------------------------------------------ */

function Headphones({x, y, s = 1}: {x: number; y: number; s?: number}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-118 40 C-118 -128 118 -128 118 40" fill="none" stroke={C.ink} strokeWidth={40} strokeLinecap="round" />
      <path d="M-118 40 C-118 -128 118 -128 118 40" fill="none" stroke={C.ink3} strokeWidth={12} strokeLinecap="round" opacity={0.5} transform="translate(0 -8)" />
      <rect x={-152} y={16} width={84} height={150} rx={36} fill={C.coral} />
      <rect x={68} y={16} width={84} height={150} rx={36} fill={C.coral} />
      <rect x={-134} y={36} width={48} height={110} rx={22} fill={C.red} opacity={0.55} />
      <rect x={86} y={36} width={48} height={110} rx={22} fill={C.red} opacity={0.55} />
      <rect x={-146} y={24} width={20} height={134} rx={10} fill={C.white} opacity={0.22} />
      <rect x={74} y={24} width={20} height={134} rx={10} fill={C.white} opacity={0.22} />
    </g>
  );
}

function Scene1() {
  const t = useT();
  const enter = back(t, -0.05, 0.65);
  const mult = back(t, 2.15, 2.65);
  const fan = ease(t, 2.3, 3.1);
  const totalP = ease(t, 3.45, 4.05);
  const total = interpolate(t, [3.55, 4.75], [100000, 1200000], {...clamp, easing: undefined});
  const settle = 1 + Math.sin(Math.min(t, 1.2) * 9) * 0.004 * (1 - ease(t, 0.8, 1.4));
  return (
    <>
      <SwitchHead t={t} at={3.35} kicker="01 · TOMBOL KECIL" accent={C.coral}
        before={[{text: 'CUMA'}, {text: 'Rp100 RIBU?', accent: true}]}
        after={[{text: 'SATU TAHUN:', accent: true}, {text: 'Rp1.200.000'}]} />
      <Hero>
        <defs>
          <linearGradient id="s1body" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#46626E" /><stop offset="0.5" stopColor="#1B333D" /><stop offset="1" stopColor="#0A171D" />
          </linearGradient>
          <linearGradient id="s1screen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#EFEAE0" />
          </linearGradient>
          <linearGradient id="s1btn" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#F06A45" /><stop offset="1" stopColor="#D8482B" />
          </linearGradient>
        </defs>

        <Panel x={170} y={110} w={860} h={980} r={64} fill={C.ink2} dark />
        <Shadow cx={600} cy={1092} rx={320} ry={36} a={0.32} />

        {/* receipt fan: each slip is a month commitment */}
        {[-1, 0, 1].map((i) => {
          const p = ease(t, 2.35 + Math.abs(i) * 0.12, 3.05 + Math.abs(i) * 0.12);
          return (
            <g key={i} transform={`translate(${600 + i * 250 * fan} ${470 + Math.abs(i) * 54}) rotate(${i * 13 * fan})`} opacity={p}>
              <Receipt x={-128} y={-180} w={256} h={360} fill={i === 0 ? C.amber : C.paper}>
                <text textAnchor="middle" y={-84} fontFamily={FONTS.mono} fontSize={24} fill={C.ink} letterSpacing={3}>BULAN {i === -1 ? '01' : i === 0 ? '06' : '12'}</text>
                <line x1={-92} y1={-56} x2={92} y2={-56} stroke={C.paper3} strokeWidth={3} />
                <text textAnchor="middle" y={18} fontFamily={FONTS.head} fontWeight={800} fontSize={52} fill={C.ink}>Rp100rb</text>
                <text textAnchor="middle" y={78} fontFamily={FONTS.mono} fontSize={22} fill={C.teal}>TERJADWAL</text>
              </Receipt>
            </g>
          );
        })}

        {/* phone */}
        <g transform={`translate(0 ${(1 - enter) * 150}) rotate(${(1 - enter) * -3} 600 560) scale(${settle})`} opacity={Math.min(1, enter * 1.4)}>
          <rect x={330} y={70} width={540} height={960} rx={72} fill="url(#s1body)" />
          <rect x={336} y={76} width={528} height={948} rx={68} fill="none" stroke="rgba(252,250,244,0.18)" strokeWidth={2} />
          <rect x={356} y={108} width={488} height={884} rx={52} fill="url(#s1screen)" />
          <rect x={520} y={126} width={160} height={26} rx={13} fill="#0B1A21" />
          <text x={392} y={200} fontFamily={FONTS.mono} fontSize={22} fill={C.muted} letterSpacing={3}>TOKO · AUDIO</text>
          <rect x={392} y={228} width={416} height={300} rx={28} fill={C.paper} />
          <Headphones x={600} y={360} s={0.82} />
          <text x={600} y={600} textAnchor="middle" fontFamily={FONTS.head} fontWeight={800} fontSize={76} fill={C.ink}>Rp100.000</text>
          <text x={600} y={648} textAnchor="middle" fontFamily={FONTS.mono} fontSize={28} fill="#6B7A7E">/ bulan · 12 bulan</text>
          <rect x={400} y={690} width={400} height={96} rx={48} fill="url(#s1btn)" />
          <text x={600} y={750} textAnchor="middle" fontFamily={FONTS.body} fontWeight={700} fontSize={36} fill={C.white}>Beli sekarang</text>
          <text x={600} y={842} textAnchor="middle" fontFamily={FONTS.mono} fontSize={25} fill="#8A9498">bayar nanti →</text>
          <rect x={400} y={874} width={400} height={54} rx={27} fill={C.paper2} />
          <text x={600} y={909} textAnchor="middle" fontFamily={FONTS.mono} fontSize={22} fill={C.teal}>CICILAN AKTIF</text>
        </g>

        {/* multiplier stamp */}
        <g transform={`translate(830 210) scale(${0.5 + 0.5 * mult}) rotate(${-10 * mult})`} opacity={mult}>
          <circle r={86} fill={C.amber} />
          <circle r={72} fill="none" stroke={C.ink} strokeWidth={4} opacity={0.35} />
          <text textAnchor="middle" y={22} fontFamily={FONTS.head} fontWeight={800} fontSize={64} fill={C.ink}>×12</text>
        </g>

        {/* total banner */}
        <g opacity={totalP} transform={`translate(0 ${(1 - totalP) * 46})`}>
          <rect x={230} y={1046} width={740} height={118} rx={30} fill={C.coral} />
          <rect x={230} y={1046} width={740} height={52} rx={30} fill={C.white} opacity={0.12} />
          <text x={600} y={1122} textAnchor="middle" fontFamily={FONTS.head} fontWeight={800} fontSize={56} fill={C.white} style={{fontVariantNumeric: 'tabular-nums'}}>
            12 bulan = {rupiah(total)}
          </text>
          <Rule x={262} y={1140} w={676} p={ease(t, 4.2, 4.9)} color={C.white} h={5} />
        </g>
      </Hero>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 02 · Perception: today vs the full price                            */
/* ------------------------------------------------------------------ */

function Scene2() {
  const t = useT();
  const p = ease(t, 0, 0.6);
  const shift = ease(t, 2.7, 3.5);
  const cells = ease(t, 2.9, 4.5);
  const total = back(t, 3.4, 4.0);
  const leftScale = 1.02 - 0.06 * shift;
  const rightScale = 0.94 + 0.08 * shift;
  return (
    <>
      <SwitchHead t={t} at={2.85} kicker="02 · HARGA PENUH" accent={C.teal} light
        before={[{text: 'YANG TERLIHAT:'}, {text: 'CICILAN.', accent: true}]}
        after={[{text: 'YANG TERLUPA:'}, {text: 'TOTAL.', accent: true}]} />
      <Hero>
        <Shadow cx={600} cy={1058} rx={480} ry={38} a={0.14} />
        <Connector d={`M 360 560 C 500 ${500 - 24 * shift} 700 ${500 + 24 * shift} 840 560`} p={ease(t, 0.7, 1.5)} color={C.coral} width={12} arrow={{x: 840, y: 560, rot: 90}} />

        {/* left: parcel / today */}
        <g transform={`translate(${(1 - p) * -140} 0) scale(${leftScale})`} opacity={p * (1 - 0.22 * shift)}>
          <Panel x={80} y={330} w={430} h={400} r={28} fill="#C99B62" />
          <rect x={80} y={330} width={430} height={86} rx={28} fill="#B8854C" />
          <rect x={266} y={330} width={58} height={400} fill={C.paper} opacity={0.85} />
          <text x={295} y={548} textAnchor="middle" fontFamily={FONTS.head} fontWeight={800} fontSize={50} fill={C.ink}>HARI INI</text>
          <Pill x={295} y={808} w={330} h={104} fill={C.teal} text="Rp100.000" size={48} p={p} />
          <text x={295} y={890} textAnchor="middle" fontFamily={FONTS.mono} fontSize={24} fill={C.teal} letterSpacing={3}>TERLIHAT KECIL</text>
        </g>

        {/* right: calendar / commitment */}
        <g transform={`translate(${(1 - p) * 140} 0) scale(${rightScale})`} opacity={p * (0.78 + 0.22 * shift)}>
          <Panel x={650} y={210} w={460} h={560} r={32} fill={C.white} />
          <rect x={650} y={210} width={460} height={112} rx={32} fill={C.coral} />
          {[724, 880, 1036].map((x) => <rect key={x} x={x - 14} y={180} width={28} height={70} rx={14} fill={C.ink} />)}
          <text x={880} y={282} textAnchor="middle" fontFamily={FONTS.body} fontWeight={700} fontSize={38} fill={C.white}>BULAN DEPAN</text>
          {Array.from({length: 12}, (_, i) => {
            const col = i % 4, row = Math.floor(i / 4);
            const on = ease(t, 2.9 + i * 0.11, 3.25 + i * 0.11);
            return (
              <g key={i}>
                <rect x={692 + col * 100} y={362 + row * 108} width={76} height={76} rx={16} fill={C.paper2} />
                <rect x={692 + col * 100} y={362 + row * 108} width={76} height={76} rx={16} fill={C.teal} opacity={on} />
                <text x={730 + col * 100} y={410 + row * 108} textAnchor="middle" fontFamily={FONTS.mono} fontSize={24} fill={on > 0.5 ? C.white : C.muted}>{i + 1}</text>
              </g>
            );
          })}
          <g opacity={total} transform={`translate(880 868) scale(${0.8 + 0.2 * total})`}>
            <rect x={-205} y={-58} width={410} height={116} rx={28} fill={C.ink} />
            <text textAnchor="middle" y={22} fontFamily={FONTS.head} fontWeight={800} fontSize={52} fill={C.white}>Rp1.200.000</text>
          </g>
          <text x={880} y={962} textAnchor="middle" fontFamily={FONTS.mono} fontSize={24} fill={C.red} letterSpacing={3} opacity={cells}>TOTAL KOMITMEN</text>
        </g>
      </Hero>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 03 · Three small bills become one due date                          */
/* ------------------------------------------------------------------ */

function PayCard({x, y, rot, label, p, color, n}: {x: number; y: number; rot: number; label: string; p: number; color: string; n: string}) {
  const id = React.useId().replace(/:/g, '');
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${0.72 + 0.28 * p})`} opacity={p}>
      <defs>
        <linearGradient id={`card${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={color} /><stop offset="1" stopColor={C.ink2} />
        </linearGradient>
      </defs>
      <rect x={-230} y={-140} width={460} height={280} rx={30} fill="rgba(0,0,0,0.22)" transform="translate(10 18)" />
      <rect x={-230} y={-140} width={460} height={280} rx={30} fill={`url(#card${id})`} />
      <rect x={-230} y={-140} width={460} height={280} rx={30} fill="none" stroke="rgba(252,250,244,0.22)" strokeWidth={2} />
      <rect x={-190} y={-96} width={64} height={48} rx={10} fill={C.amber} opacity={0.9} />
      <path d="M -176 -84 h36 M -176 -72 h36" stroke={C.ink} strokeWidth={3} opacity={0.4} />
      <text x={200} y={-84} textAnchor="end" fontFamily={FONTS.mono} fontSize={26} fill={C.white} opacity={0.8}>{label}</text>
      <text x={-190} y={26} fontFamily={FONTS.head} fontWeight={800} fontSize={58} fill={C.white}>Rp100.000</text>
      <text x={-190} y={78} fontFamily={FONTS.mono} fontSize={25} fill={C.white} opacity={0.82}>/ bulan · jatuh tempo {n}</text>
      <path d="M 150 60 a 26 26 0 0 1 0 44 M 166 48 a 44 44 0 0 1 0 68" fill="none" stroke={C.white} strokeWidth={5} opacity={0.55} strokeLinecap="round" />
    </g>
  );
}

function Scene3() {
  const t = useT();
  const a = back(t, 0.05, 0.75), b = back(t, 0.4, 1.1), c = back(t, 0.75, 1.45);
  const together = ease(t, 3.45, 4.35);
  const stamp = back(t, 4.15, 4.65);
  const total = interpolate(t, [3.9, 5.1], [0, 300000], clamp);
  const spread = 1 - together * 0.78;
  return (
    <>
      <SwitchHead t={t} at={3.5} kicker="03 · JATUH TEMPO" accent={C.amber}
        before={[{text: 'KECIL SAAT'}, {text: 'SENDIRI.', accent: true}]}
        after={[{text: 'BERSAMAAN:'}, {text: 'Rp300.000', accent: true}]} />
      <Hero>
        <Shadow cx={600} cy={1064} rx={460} ry={42} a={0.3} />
        <g transform="translate(600 500)">
          <PayCard x={-280 * spread} y={-170 * spread} rot={-11 * spread} label="CICILAN 1" p={a} color={C.teal} n="05" />
          <PayCard x={0} y={30 * spread} rot={0} label="CICILAN 2" p={b} color={C.coral} n="05" />
          <PayCard x={280 * spread} y={-170 * spread} rot={11 * spread} label="CICILAN 3" p={c} color="#3A6EA5" n="05" />
        </g>
        <Stamp x={870} y={330} p={stamp} label="JATUH TEMPO" color={C.amber} w={380} h={100} rot={-9} />
        <g opacity={together} transform={`translate(600 900) scale(${0.82 + 0.18 * together})`}>
          <rect x={-350} y={-74} width={700} height={148} rx={32} fill={C.amber} />
          <rect x={-350} y={-74} width={700} height={60} rx={32} fill={C.white} opacity={0.14} />
          <text textAnchor="middle" y={26} fontFamily={FONTS.head} fontWeight={800} fontSize={70} fill={C.ink} style={{fontVariantNumeric: 'tabular-nums'}}>TOTAL {rupiah(total)}</text>
          <Rule x={-318} y={52} w={636} p={ease(t, 4.6, 5.3)} color={C.ink} h={5} />
        </g>
      </Hero>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 04 · Zero interest is not zero cost                                 */
/* ------------------------------------------------------------------ */

function Scene4() {
  const t = useT();
  const p = ease(t, 0, 0.6);
  const needle = ease(t, 0.5, 1.6);
  const print = ease(t, 1.35, 3.25);
  const extra = back(t, 3.55, 4.15);
  const total = back(t, 4.15, 4.75);
  const rows = [
    {y: 330, label: 'Cicilan / bulan', val: 'Rp100.000', at: 1.5},
    {y: 438, label: 'Admin / bulan', val: 'Rp10.000', at: 1.95, hot: true},
    {y: 546, label: '× 12 bulan', val: '', at: 2.35},
    {y: 654, label: 'Tambahan admin', val: 'Rp120.000', at: 3.55, hot: true},
    {y: 762, label: 'Total contoh', val: 'Rp1.320.000', at: 4.15},
  ];
  return (
    <>
      <Head kicker="04 · BUNGA ≠ BIAYA" light accent={C.red} t={t}
        lines={[{text: '0% BUNGA'}, {text: '≠ Rp0 BIAYA', accent: true}]} />
      <Hero>
        <defs><clipPath id="s4clip"><rect x={630} y={130} width={490} height={880 * print} /></clipPath></defs>
        <Shadow cx={600} cy={1084} rx={480} ry={38} a={0.14} />

        {/* dial */}
        <g transform={`translate(320 560) scale(${0.82 + 0.18 * p})`} opacity={p}>
          <circle r={272} fill={C.ink} />
          <circle r={272} fill="none" stroke={C.ink3} strokeWidth={3} />
          {Array.from({length: 24}, (_, i) => {
            const a = (i / 24) * Math.PI * 2 - Math.PI / 2;
            const r1 = i % 6 === 0 ? 226 : 240, r2 = 254;
            return <line key={i} x1={Math.cos(a) * r1} y1={Math.sin(a) * r1} x2={Math.cos(a) * r2} y2={Math.sin(a) * r2} stroke={C.muted} strokeWidth={i % 6 === 0 ? 5 : 2} opacity={0.6} />;
          })}
          <circle r={204} fill={C.paper} />
          <text textAnchor="middle" y={36} fontFamily={FONTS.head} fontWeight={800} fontSize={164} fill={C.ink}>0%</text>
          <text textAnchor="middle" y={118} fontFamily={FONTS.mono} fontSize={29} fill={C.red} letterSpacing={4}>BUNGA</text>
          <g transform={`rotate(${-130 + 130 * needle})`}>
            <path d="M 0 -212 l -13 -26 h 26 z" fill={C.red} />
          </g>
        </g>

        {/* printed receipt */}
        <g clipPath="url(#s4clip)">
          <Receipt x={650} y={150} w={440} h={840} fill={C.white}>
            <text x={690} y={224} fontFamily={FONTS.mono} fontSize={20} fill={C.ink} letterSpacing={2}>CONTOH · BUKAN TARIF UNIVERSAL</text>
            <line x1={690} y1={250} x2={1050} y2={250} stroke={C.paper2} strokeWidth={3} />
            {rows.map((r) => {
              const rp = ease(t, r.at, r.at + 0.4);
              return (
                <g key={r.label} opacity={rp} transform={`translate(${(1 - rp) * 18} 0)`}>
                  {r.hot && <rect x={676} y={r.y - 34} width={388} height={r.val ? 92 : 56} rx={14} fill={C.red} opacity={0.09} />}
                  <text x={690} y={r.y} fontFamily={FONTS.body} fontWeight={700} fontSize={30} fill={C.ink}>{r.label}</text>
                  {r.val && <text x={1050} y={r.y + 46} textAnchor="end" fontFamily={FONTS.head} fontWeight={800} fontSize={r.hot ? 44 : 40} fill={r.hot ? C.red : C.ink}>{r.val}</text>}
                </g>
              );
            })}
            <text x={690} y={902} fontFamily={FONTS.mono} fontSize={21} fill="#8A9498">Cek biaya di aplikasi masing-masing.</text>
          </Receipt>
        </g>
        <g opacity={extra}><Pill x={870} y={1040} w={300} h={70} fill={C.red} text="+Rp120.000" size={34} p={extra} /></g>
        <g opacity={total}><Pill x={320} y={900} w={300} h={70} fill={C.ink} text="BIAYA NYATA" size={30} p={total} /></g>
      </Hero>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 05 · One salary, many claims on it                                  */
/* ------------------------------------------------------------------ */

function Scene5() {
  const t = useT();
  const p = ease(t, 0, 0.6);
  const squeeze = ease(t, 3.0, 4.9);
  const warn = ease(t, 4.6, 5.4);
  const inner = 920;
  const cicilanW = 150 + 150 * squeeze;
  const rest = inner - cicilanW - 3 * 16;
  const essentials = [
    {label: 'MAKAN', icon: 'food' as const, share: 0.40, color: C.mint},
    {label: 'KOS', icon: 'home' as const, share: 0.34, color: '#5E9E86'},
    {label: 'LISTRIK', icon: 'bolt' as const, share: 0.26, color: '#3E7E6A'},
  ];
  let x = 140;
  return (
    <>
      <Head kicker="05 · RUANG GAJI" accent={C.mint} t={t}
        lines={[{text: 'GAJINYA SATU.'}, {text: 'TOMBOLNYA BANYAK.', accent: true}]} />
      <Hero>
        <Shadow cx={600} cy={1056} rx={480} ry={40} a={0.28} />
        <g transform={`translate(0 ${(1 - p) * 70})`} opacity={p}>
          <Panel x={100} y={300} w={1000} h={620} r={44} fill={C.ink2} dark />
          <text x={150} y={382} fontFamily={FONTS.mono} fontSize={28} fill={C.muted} letterSpacing={4}>ILUSTRASI RUANG GAJI</text>
          <rect x={140} y={412} width={920} height={14} rx={7} fill={C.ink} />
          <rect x={140} y={412} width={920 * ease(t, 0.1, 0.9)} height={14} rx={7} fill={C.mint} />

          {essentials.map((b, i) => {
            const w = rest * b.share;
            const bx = x; x += w + 16;
            const grow = ease(t, 0.05 + i * 0.18, 0.75 + i * 0.18);
            return (
              <g key={b.label} transform={`translate(${bx} 470)`}>
                <rect width={Math.max(0, w * grow)} height={300} rx={22} fill={b.color} />
                <rect width={Math.max(0, w * grow)} height={92} rx={22} fill={C.white} opacity={0.10} />
                <g opacity={grow}><Icon name={b.icon} x={w / 2 - 22} y={70} s={44} /></g>
                <text x={w / 2} y={205} textAnchor="middle" fontFamily={FONTS.head} fontWeight={800} fontSize={w < 170 ? 28 : 36} fill={C.white} opacity={grow}>{b.label}</text>
              </g>
            );
          })}
          <g transform={`translate(${x} 470)`}>
            <rect width={cicilanW} height={300} rx={22} fill={C.coral} />
            <rect width={cicilanW} height={92} rx={22} fill={C.white} opacity={0.12} />
            <Icon name="card" x={cicilanW / 2 - 22} y={70} s={44} />
            <text x={cicilanW / 2} y={205} textAnchor="middle" fontFamily={FONTS.head} fontWeight={800} fontSize={34} fill={C.white}>CICILAN</text>
            {/* pressure arrows pushing into essentials */}
            <g opacity={squeeze}>
              <path d={`M -10 150 l -34 0 m 12 -14 l -12 14 l 12 14`} fill="none" stroke={C.white} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>
          <text x={600} y={868} textAnchor="middle" fontFamily={FONTS.body} fontWeight={700} fontSize={34} fill={warn > 0.4 ? C.amber : C.muted} opacity={0.55 + 0.45 * warn}>
            Kebutuhan wajib tidak bisa ditunda.
          </text>
        </g>
      </Hero>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 06 · National scale: proper data-viz, not decoration                */
/* ------------------------------------------------------------------ */

function Scene6() {
  const t = useT();
  const p = ease(t, 0, 0.6);
  const n = interpolate(t, [0.7, 2.5], [0, 31.5], clamp);
  const prev = 31.5 / 1.2668;
  const barA = ease(t, 1.1, 2.2);
  const barB = ease(t, 1.5, 2.8);
  const growth = back(t, 3.0, 3.6);
  const accounts = ease(t, 4.3, 5.2);
  const chartX = 150, chartW = 900, max = 34;
  return (
    <>
      <Head kicker="06 · DATA OJK" accent={C.amber} t={t}
        lines={[{text: 'BUKAN CUMA'}, {text: 'CERITAMU.', accent: true}]} />
      <Hero>
        <Shadow cx={600} cy={1084} rx={500} ry={42} a={0.3} />
        <g transform={`translate(0 ${(1 - p) * 50})`} opacity={p}>
          <Panel x={110} y={170} w={980} h={760} r={44} fill={C.ink2} dark />
          <text x={600} y={330} textAnchor="middle" fontFamily={FONTS.head} fontWeight={800} fontSize={176} fill={C.white} style={{fontVariantNumeric: 'tabular-nums'}}>
            Rp{n.toFixed(2).replace('.', ',')} T
          </text>
          <text x={600} y={404} textAnchor="middle" fontFamily={FONTS.body} fontWeight={700} fontSize={38} fill={C.muted}>baki debet paylater perbankan</text>
          <g opacity={growth} transform={`translate(600 492) scale(${0.8 + 0.2 * growth})`}>
            <rect x={-250} y={-56} width={500} height={112} rx={28} fill={C.coral} />
            <text textAnchor="middle" y={22} fontFamily={FONTS.head} fontWeight={800} fontSize={60} fill={C.white}>+26,68% yoy</text>
          </g>

          {/* bar chart */}
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={chartX} y1={600 + i * 70} x2={chartX + chartW} y2={600 + i * 70} stroke={C.line} strokeWidth={2} />
          ))}
          <g>
            <rect x={chartX} y={616} width={chartW * (prev / max) * barA} height={52} rx={12} fill={C.muted} opacity={0.55} />
            <text x={chartX} y={600} fontFamily={FONTS.mono} fontSize={24} fill={C.muted}>SEP 2025 · implisit</text>
            <text x={chartX + chartW * (prev / max) * barA + 16} y={652} fontFamily={FONTS.head} fontWeight={800} fontSize={32} fill={C.muted} opacity={barA}>{prev.toFixed(1).replace('.', ',')} T</text>
          </g>
          <g>
            <rect x={chartX} y={716} width={chartW * (31.5 / max) * barB} height={52} rx={12} fill={C.amber} />
            <text x={chartX} y={700} fontFamily={FONTS.mono} fontSize={24} fill={C.white}>SEP 2026</text>
            <text x={chartX + chartW * (31.5 / max) * barB + 16} y={752} fontFamily={FONTS.head} fontWeight={800} fontSize={34} fill={C.white} opacity={barB}>31,5 T</text>
          </g>

          <g opacity={accounts} transform={`translate(600 852)`}>
            <rect x={-310} y={-44} width={620} height={88} rx={22} fill={C.ink} stroke={C.line} strokeWidth={2} />
            <text textAnchor="middle" y={12} fontFamily={FONTS.mono} fontSize={28} fill={C.white}>34,5 juta rekening · September 2026</text>
          </g>
        </g>
        <text x={600} y={1030} textAnchor="middle" fontFamily={FONTS.mono} fontSize={23} fill={C.muted} opacity={p}>OJK · RDKB Oktober 2026 · posisi September 2026</text>
        <text x={600} y={1068} textAnchor="middle" fontFamily={FONTS.mono} fontSize={20} fill={C.muted} opacity={p * 0.8}>*2025 dihitung dari 31,5 T ÷ 1,2668</text>
      </Hero>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 07 · Pre-click checklist                                            */
/* ------------------------------------------------------------------ */

function Scene7() {
  const t = useT();
  const p = ease(t, 0, 0.6);
  const rows = [
    {label: 'Cek total biaya, bukan cicilan', at: 0.7},
    {label: 'Jumlahkan tagihan bulan depan', at: 2.4},
    {label: 'Bayar utang pakai utang baru?', at: 4.3, stop: true},
  ];
  const stop = back(t, 5.0, 5.6);
  return (
    <>
      <Head kicker="07 · SEBELUM KLIK" light accent={C.teal} t={t}
        lines={[{text: 'CEK TOTAL.'}, {text: 'BUKAN CICILAN.', accent: true}]} />
      <Hero>
        <Shadow cx={600} cy={1084} rx={420} ry={38} a={0.14} />
        <g transform={`translate(0 ${(1 - p) * 70})`} opacity={p}>
          <Receipt x={230} y={150} w={740} h={900} fill={C.white}>
            <text x={290} y={244} fontFamily={FONTS.head} fontWeight={800} fontSize={56} fill={C.ink}>SEBELUM KLIK</text>
            <Rule x={290} y={272} w={620} p={ease(t, 0.4, 1.1)} color={C.teal} h={5} />
            {rows.map((r, i) => {
              const rp = ease(t, r.at, r.at + 0.5);
              const cp = ease(t, r.at + 0.25, r.at + 0.85);
              return (
                <g key={r.label} opacity={rp} transform={`translate(${(1 - rp) * 26} 0)`}>
                  <Check x={330} y={380 + i * 170} p={cp} color={r.stop ? C.red : C.teal} size={64} />
                  <text x={392} y={394 + i * 170} fontFamily={FONTS.body} fontWeight={700} fontSize={r.stop ? 29 : 31} fill={C.ink}>{r.label}</text>
                  {r.stop && (
                    <g transform="translate(895 720)" opacity={cp}>
                      <path d="M -26 0 a 26 26 0 1 1 8 18" fill="none" stroke={C.red} strokeWidth={6} strokeLinecap="round" />
                      <path d="M -30 26 L 30 -26" stroke={C.red} strokeWidth={7} strokeLinecap="round" />
                    </g>
                  )}
                </g>
              );
            })}
            <g opacity={stop} transform={`translate(600 900) scale(${0.7 + 0.3 * stop})`}>
              <rect x={-230} y={-58} width={460} height={116} rx={28} fill={C.red} />
              <text textAnchor="middle" y={22} fontFamily={FONTS.head} fontWeight={800} fontSize={52} fill={C.white}>BERHENTI DULU</text>
            </g>
          </Receipt>
        </g>
      </Hero>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 08 · Payment moves forward; loop back to the hook                   */
/* ------------------------------------------------------------------ */

function Scene8() {
  const t = useT();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = ease(t, 0, 0.6);
  const move = ease(t, 0.5, 3.2);
  const share = back(t, 5.0, 5.7);
  const belt = (frame / fps) * 150;
  const x = 220 + move * 560;
  return (
    <>
      <Head kicker="08 · PINDAH KE DEPAN" accent={C.coral} t={t}
        lines={[{text: 'BAYARNYA PINDAH.'}, {text: 'BUKAN GRATIS.', accent: true}]} />
      <Hero>
        <Shadow cx={600} cy={1064} rx={480} ry={40} a={0.3} />
        <g opacity={p}>
          {/* timeline */}
          <line x1={180} y1={470} x2={1020} y2={470} stroke={C.line} strokeWidth={6} strokeLinecap="round" />
          <line x1={180} y1={470} x2={180 + 840 * move} y2={470} stroke={C.coral} strokeWidth={8} strokeLinecap="round" />
          <circle cx={180} cy={470} r={14} fill={C.mint} />
          <circle cx={1020} cy={470} r={14} fill={C.coral} />
          <circle cx={180 + 840 * move} cy={470} r={20} fill={C.white} stroke={C.coral} strokeWidth={7} />
          <text x={180} y={420} textAnchor="middle" fontFamily={FONTS.mono} fontSize={28} fill={C.muted} letterSpacing={3}>HARI INI</text>
          <text x={1020} y={420} textAnchor="middle" fontFamily={FONTS.mono} fontSize={28} fill={C.muted} letterSpacing={3}>BULAN DEPAN</text>

          {/* conveyor */}
          <rect x={100} y={720} width={1000} height={92} rx={46} fill={C.ink2} stroke={C.line} strokeWidth={2} />
          {Array.from({length: 11}, (_, i) => (
            <rect key={i} x={130 + ((i * 90 + belt) % 900)} y={756} width={44} height={20} rx={10} fill={C.ink3} />
          ))}
          <g transform={`translate(${x} 560)`}>
            <Panel x={-150} y={-110} w={300} h={220} r={22} fill={C.mint} />
            <text textAnchor="middle" y={-10} fontFamily={FONTS.head} fontWeight={800} fontSize={44} fill={C.ink}>BARANG</text>
            <text textAnchor="middle" y={50} fontFamily={FONTS.mono} fontSize={27} fill={C.ink}>diterima</text>
          </g>
          <g transform={`translate(${1020 - move * 0} 600)`} opacity={move}>
            <Receipt x={-130} y={-90} w={260} h={180} fill={C.paper}>
              <text textAnchor="middle" y={-20} fontFamily={FONTS.mono} fontSize={22} fill={C.ink}>TAGIHAN</text>
              <text textAnchor="middle" y={34} fontFamily={FONTS.head} fontWeight={800} fontSize={38} fill={C.red}>Rp100rb</text>
            </Receipt>
          </g>
        </g>

        {/* share card loops to hook */}
        <g opacity={share} transform={`translate(600 270) scale(${0.68 + 0.32 * share}) rotate(${(1 - share) * -5})`}>
          <rect x={-340} y={-112} width={680} height={224} rx={36} fill={C.coral} />
          <rect x={-340} y={-112} width={680} height={90} rx={36} fill={C.white} opacity={0.12} />
          <text textAnchor="middle" y={-12} fontFamily={FONTS.head} fontWeight={800} fontSize={54} fill={C.white}>“CUMA Rp100 RIBU?”</text>
          <g transform="translate(-110 62)"><Icon name="share" x={0} y={-22} s={40} color={C.white} /></g>
          <text x={20} y={74} textAnchor="middle" fontFamily={FONTS.body} fontWeight={700} fontSize={33} fill={C.white}>Kirim ke temanmu</text>
        </g>
      </Hero>
    </>
  );
}

export const SCENE_COMPONENTS: Record<string, React.FC> = {
  '01': Scene1, '02': Scene2, '03': Scene3, '04': Scene4,
  '05': Scene5, '06': Scene6, '07': Scene7, '08': Scene8,
};
