import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';

// Ep25 — "Golongan darah yang cuma dimiliki satu orang." — Remotion Studio preview mirror.
// Master render stays the canvas pipeline (src/render.mjs, 2K 90fps, 9:16 short).

const SCENES = [
  {id: 's1', label: 'SATU ORANG', index: '01', start: 0.00, dur: 10.36, big: '1 ORANG', sub: 'PUNYA GOLONGAN DARAH INI', cap: ['Ada golongan darah yang cuma dimiliki satu orang di dunia.', 'Dan itu bukan A, B, AB, atau O.']},
  {id: 's2', label: 'PENANDA', index: '02', start: 10.36, dur: 12.02, big: '1901', sub: 'KARL LANDSTEINER · SISTEM ABO', cap: ['Golongan darah ditentukan oleh penanda kecil di permukaan sel darah merah.', 'Sistem A, B, O ditemukan tahun seribu sembilan ratus satu.']},
  {id: 's3', label: '49 SISTEM', index: '03', start: 22.38, dur: 9.50, big: '49 SISTEM', sub: '360+ PENANDA (ANTIGEN)', cap: ['Tapi A, B, O cuma satu dari empat puluh sembilan sistem golongan darah.', 'Penandanya sudah lebih dari tiga ratus enam puluh.']},
  {id: 's4', label: 'RHESUS', index: '04', start: 31.88, dur: 10.54, big: '< 1%', sub: 'RHESUS NEGATIF DI INDONESIA', cap: ['Yang paling sering dicek selain itu adalah rhesus, positif atau negatif.', 'Di Indonesia, rhesus negatif kurang dari satu persen.']},
  {id: 's5', label: 'DARAH EMAS', index: '05', start: 42.42, dur: 10.86, big: '< 50', sub: 'DARAH EMAS · RH-NULL', cap: ['Lalu ada darah emas, rhesus nol, tanpa satu pun penanda rhesus.', 'Pemiliknya kurang dari lima puluh orang di seluruh dunia.']},
  {id: 's6', label: 'GWADA', index: '06', start: 53.28, dur: 12.90, big: 'GWADA −', sub: 'PRANCIS 2025 · SISTEM KE-48', cap: ['Tahun dua ribu dua puluh lima, Prancis mengumumkan golongan darah baru, Gwada negatif.', 'Pemiliknya baru satu perempuan, dan darahnya hanya cocok dengan dirinya sendiri.']},
  {id: 's7', label: 'GOLONGANMU', index: '07', start: 66.18, dur: 8.82, big: 'PUNYAMU?', sub: 'TULIS DI KOMENTAR', cap: ['Jadi golongan darah bukan cuma huruf dan plus minus.', 'Tulis di komentar: golongan darahmu apa?']},
];

const VOID = '#03050A';
const BONE = '#F3EFE4';
const AMBER = '#FFB03A';

function Scene({scene, local}) {
  const {fps} = useVideoConfig();
  const p = spring({frame: local * fps, fps, config: {damping: 18, stiffness: 120}});
  const capIdx = Math.min(scene.cap.length - 1, Math.floor((local / scene.dur) * scene.cap.length));
  const capText = scene.cap[capIdx];
  const capP = interpolate(local, [(capIdx / scene.cap.length) * scene.dur, (capIdx / scene.cap.length) * scene.dur + 0.4], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor: VOID, padding: 104}}>
      <div style={{position: 'absolute', top: 96, left: 104, right: 104, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <div style={{width: 16, height: 16, backgroundColor: AMBER, borderRadius: 4}} />
          <span style={{fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 34, letterSpacing: 7, color: BONE}}>NAYSI</span>
        </div>
        <span style={{fontFamily: 'IBM Plex Mono, monospace', fontSize: 25, letterSpacing: 5, color: 'rgba(243,239,228,0.55)'}}>NAYSI · LANGIT</span>
      </div>
      <div style={{marginTop: 260, opacity: p, transform: `translateY(${(1 - p) * 40}px)`}}>
        <div style={{fontFamily: 'IBM Plex Mono, monospace', fontSize: 21, letterSpacing: 7, color: 'rgba(243,239,228,0.5)'}}>{scene.index} — {scene.label}</div>
        <div style={{fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: scene.big.length > 4 ? 200 : 340, lineHeight: 0.95, color: BONE, marginTop: 24, letterSpacing: -8}}>{scene.big}</div>
        <div style={{fontFamily: 'IBM Plex Mono, monospace', fontSize: 28, letterSpacing: 9, color: AMBER, marginTop: 18}}>{scene.sub}</div>
        <div style={{height: 3, backgroundColor: 'rgba(243,239,228,0.14)', marginTop: 60, position: 'relative'}}>
          <div style={{position: 'absolute', left: 0, top: 0, height: 3, width: `${(local / scene.dur) * 100}%`, backgroundColor: AMBER}} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 104, right: 104, top: 1798, opacity: capP, transform: `translateY(${(1 - capP) * 24}px)`}}>
        <div style={{fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: 104, lineHeight: 1.12, color: BONE}}>{capText}</div>
      </div>
      <div style={{position: 'absolute', left: 104, bottom: 96, fontFamily: 'IBM Plex Mono, monospace', fontSize: 26, letterSpacing: 4, color: 'rgba(243,239,228,0.62)'}}>
        {scene.index} — {scene.label}
      </div>
    </AbsoluteFill>
  );
}

export const NaysiShort = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const scene = SCENES.find((s) => t >= s.start && t < s.start + s.dur) || SCENES[SCENES.length - 1];
  const local = t - scene.start;
  const prog = t / 75.00;
  return (
    <AbsoluteFill>
      <Scene scene={scene} local={local} />
      <div style={{position: 'absolute', left: 0, bottom: 0, height: 8, width: '100%', backgroundColor: 'rgba(243,239,228,0.16)'}}>
        <div style={{height: 8, width: `${prog * 100}%`, backgroundColor: AMBER}} />
      </div>
    </AbsoluteFill>
  );
};
