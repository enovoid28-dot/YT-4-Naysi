import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import timing from '../../public/timing.json';
import {BRAND, SCENES, SERIES} from '../story';
import {FONTS} from './fonts';
import {SCENE_COMPONENTS} from './scenes';
import {C, EZ, clamp} from './ui';

type SceneTiming = (typeof timing.scenes)[number];
const TRANS = 18;

function wipe(p: number, index: number) {
  const q = Math.max(0, Math.min(1, p));
  switch (index % 4) {
    case 1: return `inset(${(1 - q) * 100}% 0 0 0 round 56px)`;
    case 2: return `circle(${q * 160}% at 78% 68%)`;
    case 3: return `polygon(0 0, ${q * 128}% 0, ${Math.max(0, q * 128 - 28)}% 100%, 0 100%)`;
    default: return `inset(0 ${(1 - q) * 100}% 0 0 round 56px)`;
  }
}

function SceneSlot({s, index}: {s: SceneTiming; index: number}) {
  const frame = useCurrentFrame();
  const local = Math.min(frame, s.durationFrames);
  const Comp = SCENE_COMPONENTS[s.id];
  const def = SCENES[index];
  const light = def.theme === 'light';
  const reveal = index === 0 ? 1 : interpolate(frame, [0, TRANS], [0, 1], {...clamp, easing: EZ});
  const exit = interpolate(local, [s.durationFrames - TRANS, s.durationFrames], [1, 0], {...clamp, easing: EZ});
  const push = 1.0 + 0.028 * Math.min(1, local / s.durationFrames);
  const bg = light
    ? `linear-gradient(180deg, ${C.paper} 0%, ${C.paper2} 100%)`
    : `linear-gradient(180deg, ${C.ink} 0%, #0A161C 100%)`;
  return (
    <AbsoluteFill style={{
      zIndex: index + 1,
      background: bg,
      clipPath: index === 0 ? undefined : wipe(reveal, index),
      opacity: index === 0 ? 1 : Math.min(1, reveal * 1.6),
    }}>
      {/* large, quiet accent field — not particles */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `radial-gradient(1100px 780px at 84% 16%, ${def.accent}${light ? '20' : '2E'}, transparent 62%),
                          radial-gradient(900px 700px at 8% 92%, ${light ? 'rgba(14,30,38,0.06)' : 'rgba(252,250,244,0.05)'}, transparent 60%)`,
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        transform: `translateY(${(1 - exit) * -18}px) scale(${push * (0.985 + 0.015 * exit)})`,
        transformOrigin: '50% 46%',
      }}>
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
  const fadeIn = interpolate(t, [cap.from - 0.04, cap.from + 0.1], [0, 1], {...clamp, easing: EZ});
  const prog = Math.max(0, Math.min(1, (t - cap.from) / Math.max(0.01, cap.to - cap.from)));
  return (
    <div style={{
      position: 'absolute', left: 88, right: 88, top: 1864, height: 316, zIndex: 80,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: fadeIn, transform: `translateY(${(1 - fadeIn) * 18}px)`,
    }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 36,
        background: light ? 'rgba(243,240,231,0.88)' : 'rgba(10,22,28,0.78)',
        border: `2px solid ${light ? 'rgba(14,30,38,0.10)' : 'rgba(252,250,244,0.12)'}`,
        boxShadow: '0 18px 50px rgba(0,0,0,0.18)',
      }} />
      <div style={{position: 'absolute', left: 0, top: 26, bottom: 26, width: 7, borderRadius: 4, background: accent}} />
      <div style={{
        position: 'relative', display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
        columnGap: 18, rowGap: 6, maxWidth: 1180, padding: '0 34px',
        fontFamily: FONTS.head, fontWeight: 700, fontSize: 74, lineHeight: 1.08, letterSpacing: -1.6,
        textAlign: 'center', color: ink, fontVariantNumeric: 'tabular-nums',
      }}>
        {cap.words.map((w, i) => {
          const on = t >= w.start - 0.02;
          const hot = w.accent && on;
          return (
            <span key={i} style={{
              color: hot ? accent : ink,
              opacity: on ? 1 : 0.38,
              transform: `translateY(${on ? 0 : 7}px) scale(${hot ? 1.03 : 1})`,
              backgroundImage: hot ? `linear-gradient(${accent}, ${accent})` : undefined,
              backgroundSize: hot ? '100% 0.13em' : undefined,
              backgroundPosition: '0 92%', backgroundRepeat: 'no-repeat',
              textShadow: light ? 'none' : '0 3px 16px rgba(0,0,0,0.35)',
            }}>{w.text}</span>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 36, right: 36, bottom: 18, height: 5, borderRadius: 3, background: light ? 'rgba(14,30,38,0.10)' : 'rgba(252,250,244,0.12)'}}>
        <div style={{width: `${prog * 100}%`, height: '100%', borderRadius: 3, background: accent}} />
      </div>
    </div>
  );
}

function Chrome() {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const idx = timing.scenes.findIndex((s) => t >= s.start && t < s.start + s.duration);
  const i = Math.max(0, idx);
  const scene = timing.scenes[i];
  const def = SCENES[i];
  const light = def.theme === 'light';
  const ink = light ? C.ink : C.white;
  const faint = light ? 'rgba(14,30,38,0.55)' : 'rgba(252,250,244,0.55)';
  const prog = Math.min(1, frame / timing.totalFrames);
  const sceneProg = Math.max(0, Math.min(1, (t - scene.start) / scene.duration));
  return (
    <AbsoluteFill style={{zIndex: 120, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 96, top: 92, display: 'flex', alignItems: 'center', gap: 18}}>
        <div style={{width: 30, height: 30, borderRadius: 9, background: C.coral, position: 'relative', overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: 6, top: 13, width: 26, height: 4, background: C.white, transform: 'rotate(-35deg)', borderRadius: 2}} />
        </div>
        <div style={{fontFamily: FONTS.head, fontWeight: 800, fontSize: 40, letterSpacing: 8, color: ink}}>{BRAND}</div>
      </div>
      <div style={{position: 'absolute', right: 96, top: 102, fontFamily: FONTS.mono, fontSize: 25, letterSpacing: 5, color: faint}}>{SERIES}</div>

      <div style={{position: 'absolute', left: 96, bottom: 118, fontFamily: FONTS.mono, fontSize: 26, letterSpacing: 4, color: faint}}>
        {String(i + 1).padStart(2, '0')} / 08
      </div>
      <div style={{position: 'absolute', right: 96, bottom: 122, display: 'flex', gap: 10}}>
        {timing.scenes.map((s, k) => (
          <div key={s.id} style={{width: 36, height: 7, borderRadius: 4, background: light ? 'rgba(14,30,38,0.16)' : 'rgba(252,250,244,0.16)', overflow: 'hidden'}}>
            <div style={{width: k < i ? '100%' : k === i ? `${sceneProg * 100}%` : '0%', height: '100%', background: C.coral}} />
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 9, background: light ? 'rgba(14,30,38,0.10)' : 'rgba(252,250,244,0.10)'}}>
        <div style={{width: `${prog * 100}%`, height: '100%', background: C.coral}} />
      </div>
      <div style={{position: 'absolute', left: 96, bottom: 168, fontFamily: FONTS.mono, fontSize: 21, letterSpacing: 3, color: faint, opacity: 0.8}}>
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
