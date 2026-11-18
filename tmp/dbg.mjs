import { buildTimeline, sceneAt } from '../src/timeline.mjs';
const tl = buildTimeline();
console.log('total', tl.total.toFixed(2));
for (const t of [3, 5, 7, 9, 13]) {
  const { scene, local } = sceneAt(tl, t);
  console.log(t, scene.id, 'local', local.toFixed(2), 'dur', scene.dur.toFixed(2), 'caps',
    scene.captions.map(c=>`${c.from?.toFixed(2)}-${c.to?.toFixed(2)}`).join(' | '));
}
