import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import timing from '../../public/timing.json';
import {BRAND, SCENES, SERIES} from '../story';
import {FONTS} from './fonts';
import {SCENE_COMPONENTS} from './scenes';
import {C, Dots} from './ui';

type SceneTiming = (typeof timing.scenes)[number];
const TRANS = 16;

function SceneSlot({s, index}: {s: SceneTiming; index: number}) {
  const frame = useCurrentFrame();
  const local = Math.min(frame, s.durationFrames);
  const Comp = SCENE_COMPONENTS[s.id];
  const def = SCENES[index];
  const light = def.theme === 'light';
  const reveal = index === 0 ? 1 : interpolate(frame, [0, TRANS], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const exit = interpolate(local, [s.durationFrames - 10, s.durationFrames], [1, 0.92], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{
      zIndex: index + 1,
      background: light ? C.paper : C.ink,
      backgroundImage: `radial-gradient(circle at 82% 18%, ${def.accent}${light ? '18' : '24'}, transparent 46%)`,
      clipPath: index === 0 ? undefined : `circle(${reveal * 155}% at 82% 72%)`,
      opacity: exit,
    }}>
      <Dots light={light} />
      <div style={{position: 'absolute', inset: 0, transform: `scale(${0.985 + 0.015 * Math.min(1, local / s.durationFrames)})`}}>
        {Comp ? <Comp /> : null}
      </div>
    </AbsoluteFill>
  );
}

function Captions() {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  type Active = {cap: SceneTiming['captions'][number]; scene: SceneTiming; index: number};
  let active: Active | null = null;
  for (let index = 0; index < timing.scenes.length; index++) {
    const scene = timing.scenes[index];
    for (const cap of scene.captions) {
      if (t >= cap.from - 0.04 && t < cap.to) active = {cap, scene, index};
    }
  }
  if (!active) return null;
  const {cap, index} = active;
  const def = SCENES[index];
  const light = def.theme === 'light';
  const accent = def.accent;
  const ink = light ? C.ink : C.white;
  const fadeIn = interpolate(t, [cap.from - 0.04, cap.from + 0.08], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{
      position: 'absolute', left: 90, right: 90, top: 1880, height: 300, zIndex: 80,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: fadeIn,
    }}>
      <div style={{
        position: 'absolute', inset: -40, borderRadius: 40,
        background: light ? 'rgba(242,239,230,0.72)' : 'rgba(16,34,43,0.62)',
      }} />
      <div style={{
        position: 'relative', display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
        columnGap: 18, rowGap: 4, maxWidth: 1240,
        fontFamily: FONTS.head, fontWeight: 700, fontSize: 76, lineHeight: 1.08, letterSpacing: -1.5,
        textAlign: 'center', color: ink,
      }}>
        {cap.words.map((w, i) => {
          const on = t >= w.start - 0.02;
          return (
            <span key={i} style={{
              color: w.accent && on ? accent : ink,
              opacity: on ? 1 : 0.42,
              transform: `translateY(${on ? 0 : 8}px)`,
              textShadow: light ? 'none' : '0 3px 18px rgba(0,0,0,0.35)',
            }}>{w.text}</span>
          );
        })}
      </div>
    </div>
  );
}

function Chrome() {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const idx = timing.scenes.findIndex((s) => t >= s.start && t < s.start + s.duration);
  const scene = timing.scenes[Math.max(0, idx)];
  const def = SCENES[Math.max(0, idx)];
  const light = def.theme === 'light';
  const ink = light ? C.ink : C.white;
  const prog = Math.min(1, frame / timing.totalFrames);
  return (
    <AbsoluteFill style={{zIndex: 120, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 96, top: 96, display: 'flex', alignItems: 'center', gap: 18}}>
        <div style={{width: 22, height: 22, borderRadius: 6, background: C.coral}} />
        <div style={{fontFamily: FONTS.head, fontWeight: 800, fontSize: 40, letterSpacing: 8, color: ink}}>{BRAND}</div>
      </div>
      <div style={{position: 'absolute', right: 96, top: 104, fontFamily: FONTS.mono, fontSize: 26, letterSpacing: 5, color: light ? 'rgba(16,34,43,0.6)' : 'rgba(251,249,243,0.6)'}}>{SERIES}</div>
      <div style={{position: 'absolute', left: 96, bottom: 120, fontFamily: FONTS.mono, fontSize: 26, letterSpacing: 4, color: light ? 'rgba(16,34,43,0.62)' : 'rgba(251,249,243,0.62)'}}>
        {String(Math.max(0, idx) + 1).padStart(2, '0')} / 08
      </div>
      <div style={{position: 'absolute', right: 96, bottom: 120, display: 'flex', gap: 10}}>
        {timing.scenes.map((s, i) => (
          <div key={s.id} style={{width: 34, height: 7, borderRadius: 4, background: i === idx ? C.coral : (light ? 'rgba(16,34,43,0.22)' : 'rgba(251,249,243,0.22)')}} />
        ))}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 10, background: light ? 'rgba(16,34,43,0.12)' : 'rgba(251,249,243,0.12)'}}>
        <div style={{width: `${prog * 100}%`, height: '100%', background: C.coral}} />
      </div>
      <div style={{position: 'absolute', left: 96, bottom: 170, fontFamily: FONTS.mono, fontSize: 22, letterSpacing: 3, color: light ? 'rgba(16,34,43,0.4)' : 'rgba(251,249,243,0.4)'}}>
        {scene?.id === '06' ? 'SUMBER: OJK · POSISI SEPTEMBER 2026' : 'CONTOH ARITMETIKA · BUKAN TARIF UNIVERSAL'}
      </div>
    </AbsoluteFill>
  );
}

export const Film: React.FC = () => (
  <AbsoluteFill style={{background: C.ink}}>
    <Audio src={staticFile('audio/bed.mp3')} volume={0.9} />
    {timing.scenes.map((s, i) => (
      <Sequence key={`v-${s.id}`} from={s.startFrame} durationInFrames={s.durationFrames + (i < timing.scenes.length - 1 ? TRANS : 0)} layout="none">
        <SceneSlot s={s} index={i} />
      </Sequence>
    ))}
    {timing.scenes.map((s) => (
      <Sequence key={`a-${s.id}`} from={s.audioStartFrame} durationInFrames={Math.ceil(s.audioDuration * 90)} layout="none">
        <Audio src={staticFile(`voice/${s.id}.mp3`)} volume={1} />
      </Sequence>
    ))}
    <Captions />
    <Chrome />
  </AbsoluteFill>
);
