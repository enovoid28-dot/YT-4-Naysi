import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import timing from '../public/timing.json';
import {FPS, HEIGHT, SCENES, WIDTH} from '../src/story';

test('master is vertical 2K at 90 fps', () => {
  assert.equal(timing.fps, FPS);
  assert.equal(FPS, 90);
  assert.equal(timing.width, WIDTH);
  assert.equal(timing.height, HEIGHT);
  assert.equal(WIDTH / HEIGHT, 9 / 16);
  assert.ok(timing.totalFrames > 0);
  assert.ok(timing.duration < 180, 'Shorts eligible duration');
});

test('scenes are contiguous and cover the master', () => {
  assert.equal(timing.scenes.length, SCENES.length);
  let cursor = 0;
  for (const s of timing.scenes) {
    assert.equal(s.startFrame, cursor);
    assert.ok(s.durationFrames > 0);
    assert.ok(s.audioStartFrame >= s.startFrame);
    assert.ok(s.audioStartFrame + Math.ceil(s.audioDuration * FPS) <= s.startFrame + s.durationFrames + 1);
    cursor += s.durationFrames;
  }
  assert.equal(cursor, timing.totalFrames);
});

test('captions stay inside their scene and never overlap', () => {
  for (const s of timing.scenes) {
    let prevTo = -Infinity;
    for (const c of s.captions) {
      assert.ok(c.from >= s.start - 0.001);
      assert.ok(c.to <= s.start + s.duration + 0.001);
      assert.ok(c.from >= prevTo - 0.001, `caption overlap in ${s.id}`);
      assert.ok(c.to > c.from);
      for (const w of c.words) {
        assert.ok(w.start >= c.from - 0.001);
        assert.ok(w.end <= c.to + 0.001);
        assert.ok(w.end >= w.start);
      }
      prevTo = c.to;
    }
  }
});

test('required audio assets exist', () => {
  assert.ok(fs.existsSync('public/audio/bed.mp3'));
  for (const s of SCENES) assert.ok(fs.existsSync(`public/voice/${s.id}.mp3`), `missing voice ${s.id}`);
});

test('arithmetic shown in the film is exact', () => {
  assert.equal(100000 * 12, 1200000);
  assert.equal(3 * 100000, 300000);
  assert.equal(10000 * 12, 120000);
  assert.equal(1200000 + 120000, 1320000);
});
