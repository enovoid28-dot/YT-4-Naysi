import React from 'react';
import {Composition} from 'remotion';
import {NaysiShort} from './NaysiShort.jsx';
import timeline from '../oklo/timeline.json';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="NaysiShort"
        component={NaysiShort}
        durationInFrames={timeline.frames}
        fps={90}
        width={1440}
        height={2560}
      />
    </>
  );
};
