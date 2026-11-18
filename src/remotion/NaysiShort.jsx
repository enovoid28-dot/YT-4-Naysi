import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';

// Ep22 — "Dua puluh tiga menit." — Remotion Studio preview mirror.
// Master render stays the canvas pipeline (src/render.mjs, 2K 90fps).
// This composition mirrors the same 9 scenes, captions and chrome for live preview.

const SCENES = [
  {id: 's1', label: 'SATU CEK', index: '01', start: 0, dur: 10.22, big: '1', sub: 'DETIK', cap: ['Kamu cek HP. Satu detik.', 'Lalu otakmu butuh dua puluh tiga menit', 'untuk kembali ke tempat ia berhenti.']},
  {id: 's2', label: 'PENGUKURAN', index: '02', start: 10.22, dur: 13.60, big: '23:15', sub: 'MENIT · UNTUK KEMBALI', cap: ['Angka itu bukan kiasan.', 'Dua puluh tiga menit lima belas detik.', 'Rata-rata dari penelitian di kantor nyata.']},
  {id: 's3', label: 'EMPAT PULUH TUJUH', index: '03', start: 23.82, dur: 12.40, big: '47', sub: 'DETIK DI SATU LAYAR', cap: ['Dan potongannya datang terus.', 'Rata-rata orang bertahan empat puluh tujuh detik di satu layar.', 'Di kantor, potongannya datang tiap tiga menit.']},
  {id: 's4', label: 'RESIDU', index: '04', start: 36.22, dur: 11.20, big: 'RESIDU', sub: 'PERHATIAN TERTINGGAL', cap: ['Yang hilang bukan cuma waktunya.', 'Sebagian perhatianmu tertinggal di tugas sebelumnya.', 'Namanya residu perhatian.']},
  {id: 's5', label: 'TIGA', index: '05', start: 47.42, dur: 10.08, big: '3', sub: 'KALI BERHENTI', cap: ['Sebelum kembali, kamu menyelipkan dua tugas lain.', 'Jadi bukan satu kali berhenti.', 'Tiga.']},
  {id: 's6', label: 'TAGIHAN', index: '06', start: 57.50, dur: 10.44, big: '2 JAM+', sub: 'HILANG SEHARI', cap: ['Enam kali cek sehari.', 'Dua jam lebih, cuma untuk kembali ke tempat yang sama.', 'Bukan kerja. Cuma pulang.']},
  {id: 's7', label: 'INDONESIA', index: '07', start: 67.94, dur: 13.60, big: '3:07', sub: 'SEHARI DI MEDSOS', cap: ['Indonesia: tiga jam tujuh menit sehari di media sosial.', 'Peringkat enam belas dunia.', 'Dan itu belum chat, kerja, dan video.']},
  {id: 's8', label: 'MITOS', index: '08', start: 81.54, dur: 11.24, big: '8s', sub: 'ITU MITOS', cap: ['Rentang perhatian delapan detik itu mitos.', 'Yang nyata: empat puluh tujuh detik sebelum pindah.', 'Solusinya bukan detoks.']},
  {id: 's9', label: 'SATU HAL', index: '09', start: 92.78, dur: 16.84, big: '1 HAL', sub: 'DI RUANGAN LAIN', cap: ['Jauhkan HP dari jangkauan tangan.', 'Bukan senyap. Bukan terbalik.', 'Di ruangan lain.']},
];

const PAPER = '#F3E8D3';
const INK = '#171310';
const RED = '#B32E1C';
const BLUE = '#1B3FD6';

function Scene({scene, local}) {
  const {fps} = useVideoConfig();
  const p = spring({frame: local * fps, fps, config: {damping: 18, stiffness: 120}});
  const capIdx = Math.min(scene.cap.length - 1, Math.floor((local / scene.dur) * scene.cap.length));
  const capText = scene.cap[capIdx];
  const capP = interpolate(local, [(capIdx / scene.cap.length) * scene.dur, (capIdx / scene.cap.length) * scene.dur + 0.4], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor: PAPER, padding: 104}}>
      <div style={{position: 'absolute', top: 96, left: 104, right: 104, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <div style={{width: 16, height: 16, backgroundColor: RED, borderRadius: 4}} />
          <span style={{fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 34, letterSpacing: 7, color: INK}}>NAYSI</span>
        </div>
        <span style={{fontFamily: 'IBM Plex Mono, monospace', fontSize: 25, letterSpacing: 5, color: 'rgba(23,19,16,0.55)'}}>NAYSI · FOKUS</span>
      </div>
      <div style={{marginTop: 260, opacity: p, transform: `translateY(${(1 - p) * 40}px)`}}>
        <div style={{fontFamily: 'IBM Plex Mono, monospace', fontSize: 21, letterSpacing: 7, color: 'rgba(23,19,16,0.5)'}}>{scene.index} — {scene.label}</div>
        <div style={{fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: scene.big.length > 4 ? 200 : 340, lineHeight: 0.95, color: INK, marginTop: 24, letterSpacing: -8}}>{scene.big}</div>
        <div style={{fontFamily: 'IBM Plex Mono, monospace', fontSize: 28, letterSpacing: 9, color: RED, marginTop: 18}}>{scene.sub}</div>
        <div style={{height: 3, backgroundColor: 'rgba(23,19,16,0.14)', marginTop: 60, position: 'relative'}}>
          <div style={{position: 'absolute', left: 0, top: 0, height: 3, width: `${(local / scene.dur) * 100}%`, backgroundColor: RED}} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 104, right: 104, top: 1798, opacity: capP, transform: `translateY(${(1 - capP) * 24}px)`}}>
        <div style={{fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: 104, lineHeight: 1.12, color: INK}}>{capText}</div>
      </div>
      <div style={{position: 'absolute', left: 104, bottom: 96, fontFamily: 'IBM Plex Mono, monospace', fontSize: 26, letterSpacing: 4, color: 'rgba(23,19,16,0.62)'}}>
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
  const prog = t / 109.62;
  return (
    <AbsoluteFill>
      <Scene scene={scene} local={local} />
      <div style={{position: 'absolute', left: 0, bottom: 0, height: 8, width: '100%', backgroundColor: 'rgba(23,19,16,0.16)'}}>
        <div style={{height: 8, width: `${prog * 100}%`, backgroundColor: RED}} />
      </div>
    </AbsoluteFill>
  );
};
