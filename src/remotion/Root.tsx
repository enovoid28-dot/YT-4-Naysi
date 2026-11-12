import React from 'react';
import {Composition} from 'remotion';
import {FPS, HEIGHT, WIDTH} from '../story';
import timing from '../../public/timing.json';
import {Film} from './Film';
import {ensureFonts} from './fonts';

ensureFonts();

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Paylater"
    component={Film}
    durationInFrames={timing.totalFrames}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
