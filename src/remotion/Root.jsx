import React from 'react';
import {Composition} from 'remotion';
import {NaysiShort} from './NaysiShort.jsx';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="NaysiShort"
        component={NaysiShort}
        durationInFrames={16144}
        fps={90}
        width={1440}
        height={2560}
      />
    </>
  );
};
