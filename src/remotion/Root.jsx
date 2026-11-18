import React from 'react';
import {Composition} from 'remotion';
import {NaysiShort} from './NaysiShort.jsx';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="NaysiShort"
        component={NaysiShort}
        duration={9866}
        fps={90}
        width={1440}
        height={2560}
      />
    </>
  );
};
