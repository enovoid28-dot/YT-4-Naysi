import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONTS} from './fonts';

export const C = {
  ink: '#10222B',
  ink2: '#18333D',
  paper: '#F2EFE6',
  paper2: '#E4DED0',
  coral: '#F16A45',
  red: '#D9482B',
  mint: '#79B8A0',
  teal: '#176B5B',
  amber: '#EAB866',
  white: '#FBF9F3',
  muted: '#8FA3A8',
};

export const rupiah = (n: number) => 'Rp' + Math.round(n).toLocaleString('id-ID');

export function useT() {
  return useCurrentFrame() / useVideoConfig().fps;
}

export function pop(delay = 0, damping = 18) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping, stiffness: 120, mass: 0.8}});
}

export function Head({kicker, lines, light, accent, t}: {
  kicker: string; lines: {text: string; accent?: boolean}[]; light?: boolean; accent: string; t: number;
}) {
  const ink = light ? C.ink : C.white;
  return (
    <div style={{position: 'absolute', left: 96, top: 250, width: 1248, zIndex: 5}}>
      <div style={{
        fontFamily: FONTS.mono, fontSize: 28, letterSpacing: 7, color: accent,
        opacity: interpolate(t, [0, 0.35], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
        marginBottom: 28,
      }}>{kicker}</div>
      {lines.map((l, i) => {
        const p = spring({frame: Math.round(t * 90) - i * 7, fps: 90, config: {damping: 20, stiffness: 110}});
        return (
          <div key={i} style={{
            fontFamily: FONTS.head, fontWeight: 800, fontSize: l.text.length > 16 ? 92 : 112,
            lineHeight: 0.98, letterSpacing: -3, color: l.accent ? accent : ink,
            transform: `translateY(${(1 - p) * 46}px)`, opacity: p,
          }}>{l.text}</div>
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

export function Receipt({x, y, w, h, fill = C.white, children}: {x: number; y: number; w: number; h: number; fill?: string; children?: React.ReactNode}) {
  const teeth = 10;
  const pts: string[] = [`${x},${y}`, `${x + w},${y}`, `${x + w},${y + h}`];
  for (let i = teeth; i >= 0; i--) {
    const px = x + (w * i) / teeth;
    pts.push(`${px},${y + h + (i % 2 ? 14 : 0)}`);
  }
  pts.push(`${x},${y + h}`);
  return (
    <g>
      <polygon points={pts.join(' ')} fill="rgba(0,0,0,0.18)" transform="translate(10 14)" />
      <polygon points={pts.join(' ')} fill={fill} />
      {children}
    </g>
  );
}

export function Coin({x, y, r = 44, label = 'Rp'}: {x: number; y: number; r?: number; label?: string}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill={C.amber} />
      <circle r={r * 0.72} fill="none" stroke="#B98A3A" strokeWidth={4} />
      <text textAnchor="middle" y={r * 0.28} fontFamily={FONTS.head} fontWeight={800} fontSize={r * 0.7} fill="#6B4A16">{label}</text>
    </g>
  );
}

export function Check({x, y, p, color = C.teal, size = 54}: {x: number; y: number; p: number; color?: string; size?: number}) {
  const len = size * 1.5;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={size / 2} fill={color} opacity={0.16 + 0.84 * p} />
      <path d={`M ${-size * 0.24} 0 L ${-size * 0.05} ${size * 0.2} L ${size * 0.28} ${-size * 0.22}`}
        fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray={len} strokeDashoffset={len * (1 - p)} />
    </g>
  );
}

export function Dots({light}: {light?: boolean}) {
  return (
    <div style={{
      position: 'absolute', inset: 0, opacity: light ? 0.05 : 0.07, pointerEvents: 'none',
      backgroundImage: `radial-gradient(${light ? C.ink : C.white} 1.2px, transparent 1.2px)`,
      backgroundSize: '34px 34px',
    }} />
  );
}
