import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';

// Ep23 — "Kenapa Bulan selalu menghadap kita?" — Remotion Studio preview mirror.
// Master render stays the canvas pipeline (src/render.mjs, 2K 90fps, 9:16 short).

const SCENES = [
  {id: 's1', label: 'WAJAH SAMA', index: '01', start: 0, dur: 7.82, big: '1', sub: 'WAJAH · SELAMANYA', cap: ['Kamu sudah lihat Bulan seumur hidup.', 'Tapi kamu tidak pernah lihat sisi satunya.']},
  {id: 's2', label: '27,3 HARI', index: '02', start: 7.82, dur: 10.04, big: '27,3', sub: 'PUTAR = ORBIT', cap: ['Bulan berputar dua puluh tujuh koma tiga hari.', 'Mengelilingi Bumi juga dua puluh tujuh koma tiga hari, sama persis.']},
  {id: 's3', label: 'REM', index: '03', start: 17.86, dur: 11.56, big: 'REM', sub: 'TONJOLAN = PEGANGAN', cap: ['Dulu Bulan berputar jauh lebih cepat.', 'Gravitasi Bumi menarik tonjolan terdekat, lalu melambat sampai pas.']},
  {id: 's4', label: 'GOYANG', index: '04', start: 29.42, dur: 10.32, big: '59%', sub: 'YANG BISA KITA INTIP', cap: ['Tapi tidak kaku.', 'Orbitnya elips, jadi Bulan bergoyang, dan kita bisa intip lima puluh sembilan persen.']},
  {id: 's5', label: '1959', index: '05', start: 39.74, dur: 12.32, big: '1959', sub: 'LUNA 3', cap: ['Sisi jauh bukan sisi gelap, ia kena matahari sama saja.', 'Baru difoto tahun seribu sembilan ratus lima puluh sembilan oleh Luna tiga.']},
  {id: 's6', label: 'REM BUMI', index: '06', start: 52.06, dur: 10.68, big: '24 JAM', sub: 'DULU 4 JAM', cap: ['Bulan juga mengerem Bumi.', 'Dulu sehari cuma empat jam, sekarang dua puluh empat jam, dan terus memanjang.']},
  {id: 's7', label: 'TERKUNCI', index: '07', start: 62.74, dur: 10.10, big: 'TERKUNCI', sub: 'BUKAN DIAM', cap: ['Jadi Bulan tidak diam, ia terkunci.', 'Tulis di komentar: kamu lihat Bulan purnama dari mana?']},
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
