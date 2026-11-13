import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONTS} from './fonts';

export const C = {
  ink: '#0E1E26',
  ink2: '#15303A',
  ink3: '#1E414D',
  paper: '#F3F0E7',
  paper2: '#E5DFD1',
  paper3: '#D8D0BE',
  coral: '#F06A45',
  red: '#D8482B',
  mint: '#7BB9A1',
  teal: '#176B5B',
  teal2: '#0F5246',
  amber: '#E9B867',
  white: '#FCFAF4',
  muted: '#8FA3A8',
  line: 'rgba(252,250,244,0.14)',
};

export const rupiah = (n: number) => 'Rp' + Math.round(n).toLocaleString('id-ID');
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const EZ = Easing.bezier(0.16, 1, 0.3, 1);
export const EZ_INOUT = Easing.bezier(0.65, 0, 0.35, 1);
export const seg = (t: number, a: number, b: number, easing = EZ) =>
  interpolate(t, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});
export const back = (t: number, a: number, b: number) =>
  interpolate(t, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.35))});

export function useT() {
  return useCurrentFrame() / useVideoConfig().fps;
}

export function pop(delay = 0, damping = 16) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping, stiffness: 140, mass: 0.75}});
}

/** Editorial headline: masked line reveals + animated kicker rule. */
export function Head({kicker, lines, light, accent, t}: {
  kicker: string; lines: {text: string; accent?: boolean}[]; light?: boolean; accent: string; t: number;
}) {
  const ink = light ? C.ink : C.white;
  const kp = seg(t, 0, 0.28);
  return (
    <div style={{position: 'absolute', left: 96, top: 248, width: 1248, zIndex: 5}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 20, marginBottom: 30, opacity: kp}}>
        <div style={{width: 74 * kp, height: 4, background: accent, borderRadius: 2}} />
        <div style={{fontFamily: FONTS.mono, fontSize: 27, letterSpacing: 7, color: accent}}>{kicker}</div>
      </div>
      {lines.map((l, i) => {
        const p = spring({frame: Math.round(t * 90) - i * 8, fps: 90, config: {damping: 22, stiffness: 120}});
        const size = l.text.length > 17 ? 88 : l.text.length > 13 ? 100 : 116;
        return (
          <div key={i} style={{overflow: 'hidden', paddingBottom: 6}}>
            <div style={{
              fontFamily: FONTS.head, fontWeight: 800, fontSize: size,
              lineHeight: 0.98, letterSpacing: -3.2, color: l.accent ? accent : ink,
              transform: `translateY(${(1 - p) * 118}%)`,
              fontVariantNumeric: 'tabular-nums',
            }}>{l.text}</div>
          </div>
        );
      })}
    </div>
  );
}

export function Hero({children, viewBox = '0 0 1200 1200', top = 620}: {children: React.ReactNode; viewBox?: string; top?: number}) {
  return (
    <svg viewBox={viewBox} width={1200} height={1200} style={{position: 'absolute', left: 120, top, overflow: 'visible'}}>
      {children}
    </svg>
  );
}

export function Shadow({cx, cy, rx, ry, a = 0.22}: {cx: number; cy: number; rx: number; ry: number; a?: number}) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`rgba(0,0,0,${a})`} />;
}

/** Soft material panel with top highlight and bottom shadow. */
export function Panel({x, y, w, h, r = 32, fill = C.white, stroke, dark}: {
  x: number; y: number; w: number; h: number; r?: number; fill?: string; stroke?: string; dark?: boolean;
}) {
  const id = React.useId().replace(/:/g, '');
  return (
    <g>
      <defs>
        <linearGradient id={`p${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={fill} />
          <stop offset="1" stopColor={dark ? C.ink2 : C.paper2} />
        </linearGradient>
      </defs>
      <rect x={x + 8} y={y + 16} width={w} height={h} rx={r} fill="rgba(0,0,0,0.18)" />
      <rect x={x} y={y} width={w} height={h} rx={r} fill={`url(#p${id})`} stroke={stroke ?? (dark ? C.line : 'rgba(14,30,38,0.10)')} strokeWidth={2} />
      <rect x={x + 3} y={y + 3} width={w - 6} height={h * 0.42} rx={r - 2} fill={dark ? 'rgba(252,250,244,0.05)' : 'rgba(255,255,255,0.45)'} />
    </g>
  );
}

export function Receipt({x, y, w, h, fill = C.white, children}: {x: number; y: number; w: number; h: number; fill?: string; children?: React.ReactNode}) {
  const teeth = Math.max(8, Math.round(w / 34));
  const pts: string[] = [`${x},${y}`, `${x + w},${y}`, `${x + w},${y + h}`];
  for (let i = teeth; i >= 0; i--) {
    const px = x + (w * i) / teeth;
    pts.push(`${px},${y + h + (i % 2 ? 13 : 0)}`);
  }
  pts.push(`${x},${y + h}`);
  return (
    <g>
      <polygon points={pts.join(' ')} fill="rgba(0,0,0,0.16)" transform="translate(9 15)" />
      <polygon points={pts.join(' ')} fill={fill} />
      <polygon points={`${x},${y} ${x + w},${y} ${x + w},${y + 46} ${x},${y + 46}`} fill="rgba(14,30,38,0.05)" />
      {children}
    </g>
  );
}

export function Check({x, y, p, color = C.teal, size = 54}: {x: number; y: number; p: number; color?: string; size?: number}) {
  const len = size * 1.5;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={size / 2} fill={color} opacity={0.14 + 0.86 * p} />
      <circle r={size / 2} fill="none" stroke={color} strokeWidth={3} opacity={0.35} />
      <path d={`M ${-size * 0.24} 0 L ${-size * 0.05} ${size * 0.2} L ${size * 0.28} ${-size * 0.22}`}
        fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray={len} strokeDashoffset={len * (1 - p)} />
    </g>
  );
}

/** Draw-on rule / underline. */
export function Rule({x, y, w, p, color = C.coral, h = 6}: {x: number; y: number; w: number; p: number; color?: string; h?: number}) {
  return <rect x={x} y={y} width={Math.max(0, w * p)} height={h} rx={h / 2} fill={color} />;
}

/** Impact stamp: overshoots then settles. */
export function Stamp({x, y, p, label, color = C.red, w = 360, h = 96, rot = -7}: {
  x: number; y: number; p: number; label: string; color?: string; w?: number; h?: number; rot?: number;
}) {
  const s = 0.6 + 0.4 * p;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot * p}) scale(${s})`} opacity={p}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={16} fill="none" stroke={color} strokeWidth={7} />
      <rect x={-w / 2 + 10} y={-h / 2 + 10} width={w - 20} height={h - 20} rx={10} fill="none" stroke={color} strokeWidth={2} opacity={0.55} />
      <text textAnchor="middle" y={h * 0.16} fontFamily={FONTS.head} fontWeight={800} fontSize={h * 0.42} fill={color} letterSpacing={2}>{label}</text>
    </g>
  );
}

/** Small pill label. */
export function Pill({x, y, w, h = 64, fill, text, color = C.white, size = 30, p = 1}: {
  x: number; y: number; w: number; h?: number; fill: string; text: string; color?: string; size?: number; p?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${0.86 + 0.14 * p})`} opacity={p}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={fill} />
      <text textAnchor="middle" y={size * 0.34} fontFamily={FONTS.body} fontWeight={700} fontSize={size} fill={color}>{text}</text>
    </g>
  );
}

/** Purposeful curved connector with draw-on + arrowhead. */
export function Connector({d, p, color = C.coral, width = 10, arrow}: {d: string; p: number; color?: string; width?: number; arrow?: {x: number; y: number; rot: number}}) {
  return (
    <g opacity={Math.min(1, p * 1.4)}>
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      {arrow && (
        <path d={`M ${arrow.x} ${arrow.y} l -22 -14 l 6 28 z`} fill={color}
          transform={`rotate(${arrow.rot} ${arrow.x} ${arrow.y})`} opacity={seg(p, 0.75, 1)} />
      )}
    </g>
  );
}

/** Minimal line icons for budget rows. */
export function Icon({name, x, y, s = 44, color = C.white}: {name: 'food' | 'home' | 'bolt' | 'card' | 'share'; x: number; y: number; s?: number; color?: string}) {
  const common = {fill: 'none', stroke: color, strokeWidth: s * 0.09, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  return (
    <g transform={`translate(${x} ${y}) scale(${s / 44})`}>
      {name === 'food' && <><path d="M10 4 v16 M18 4 v16 M14 4 v36 M30 4 c8 0 8 14 0 18 v18" {...common} /></>}
      {name === 'home' && <><path d="M6 20 L22 6 L38 20 M10 18 v20 h24 V18 M18 38 V26 h8 v12" {...common} /></>}
      {name === 'bolt' && <path d="M24 4 L10 24 h10 L18 40 L34 18 H24 Z" {...common} />}
      {name === 'card' && <><rect x={5} y={9} width={34} height={26} rx={5} {...common} /><path d="M5 17 h34 M11 27 h10" {...common} /></>}
      {name === 'share' && <><path d="M14 22 L30 12 M14 22 L30 32" {...common} /><circle cx={12} cy={22} r={5} {...common} /><circle cx={32} cy={11} r={5} {...common} /><circle cx={32} cy={33} r={5} {...common} /></>}
    </g>
  );
}
