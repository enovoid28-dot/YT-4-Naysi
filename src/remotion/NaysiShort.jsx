import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';

// Ep24 — "Suara terkeras dalam sejarah ada di Indonesia." — Remotion Studio preview mirror.
// Master render stays the canvas pipeline (src/render.mjs, 2K 90fps, 9:16 short).

const SCENES = [
  {id: 's1', label: 'KRAKATAU', index: '01', start: 0, dur: 11.28, big: '1883', sub: '27 AGUSTUS · PUKUL 10.02', cap: ['Suara terkeras dalam sejarah datang dari Indonesia.', 'Tahun seribu delapan ratus delapan puluh tiga, Krakatau meledak.']},
  {id: 's2', label: '4.800 KM', index: '02', start: 11.28, dur: 8.82, big: '4.800 KM', sub: 'SAMPAI PULAU RODRIGUES', cap: ['Suaranya terdengar sampai empat ribu delapan ratus kilometer.', 'Hampir sejauh Sabang ke Merauke.']},
  {id: 's3', label: '170 dB', index: '03', start: 20.10, dur: 8.94, big: '170+ dB', sub: 'DIUKUR 160 KM DARI KRAKATAU', cap: ['Kerasnya lebih dari seratus tujuh puluh desibel.', 'Enam puluh empat kilometer jauhnya, gendang telinga pelaut pecah.']},
  {id: 's4', label: '3,5 KALI', index: '04', start: 29.04, dur: 8.70, big: '3,5×', sub: 'KELILING BUMI', cap: ['Gelombang tekanannya mengelilingi Bumi tiga setengah kali.', 'Barometer di seluruh dunia mencatatnya tujuh kali.']},
  {id: 's5', label: 'TSUNAMI', index: '05', start: 37.74, dur: 10.10, big: '36.417', sub: 'JIWA · CATATAN RESMI', cap: ['Tapi yang paling mematikan justru tsunaminya.', 'Ombak tiga puluh meter menewaskan lebih dari tiga puluh enam ribu orang.']},
  {id: 's6', label: 'LANGIT MERAH', index: '06', start: 47.84, dur: 10.54, big: 'ALARM PALSU', sub: 'NEW YORK · 1883', cap: ['Abunya membuat senja di seluruh dunia merah menyala.', 'Di New York, petugas pemadam sampai dipanggil karena dikira ada kebakaran.']},
  {id: 's7', label: 'ANAK KRAKATAU', index: '07', start: 58.38, dur: 11.18, big: 'ANAK KRAKATAU', sub: 'MASIH AKTIF', cap: ['Kini di kalderanya tumbuh Anak Krakatau, dan masih aktif.', 'Tulis di komentar: gunung api terdekat dari rumahmu apa?']},
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
  const prog = t / 72.84;
  return (
    <AbsoluteFill>
      <Scene scene={scene} local={local} />
      <div style={{position: 'absolute', left: 0, bottom: 0, height: 8, width: '100%', backgroundColor: 'rgba(243,239,228,0.16)'}}>
        <div style={{height: 8, width: `${prog * 100}%`, backgroundColor: AMBER}} />
      </div>
    </AbsoluteFill>
  );
};
