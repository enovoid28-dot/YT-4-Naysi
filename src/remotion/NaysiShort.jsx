import React, {useEffect, useRef, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import timeline from '../heat/timeline.json';
import {draw, initAssets} from '../heat/draw.mjs';

export const NaysiShort = () => {
  const canvas=useRef(null);
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const [handle]=useState(()=>delayRender('Memuat tipografi dan tekstur 2D'));
  const [ready,setReady]=useState(false);
  useEffect(()=>{
    let cancelled=false;
    Promise.all(['PJS700','IT800','MONO6'].map(async name=>{
      const face=new FontFace(name,`url(${staticFile(`fonts/${name}.ttf`)})`);
      await face.load();document.fonts.add(face);
    })).then(()=>{
      if(cancelled)return;
      initAssets((w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;});
      setReady(true);continueRender(handle);
    }).catch(error=>{console.error(error);throw error;});
    return ()=>{cancelled=true;};
  },[handle]);
  useEffect(()=>{if(ready&&canvas.current)draw(canvas.current.getContext('2d'),frame/fps,timeline);},[frame,fps,ready]);
  return <AbsoluteFill style={{backgroundColor:'#0a1015'}}>
    <canvas ref={canvas} width={timeline.width} height={timeline.height} style={{width:'100%',height:'100%'}}/>
    <Audio src={staticFile('audio/ep33.mp3')}/>
  </AbsoluteFill>;
};
