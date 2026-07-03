import { describe, expect, it, vi } from 'vitest';
import { initCoordinator } from '../src/coordinator.js';
import '../src/tune-looper.js';

vi.mock('tone', () => {
  const transport = {
    PPQ: 480,
    bpm: { value: 120 },
    start: vi.fn(),
    stop: vi.fn(),
    cancel: vi.fn(),
    scheduleOnce: vi.fn(() => Math.random()),
    toSeconds: vi.fn(() => 0.1),
  };
  class FakeSynth {
    toDestination() {
      return this;
    }
    triggerAttackRelease() {}
    dispose() {}
  }
  return {
    start: vi.fn().mockResolvedValue(undefined),
    getTransport: () => transport,
    Synth: FakeSynth,
    MembraneSynth: FakeSynth,
    Frequency: (midi) => ({ toFrequency: () => midi }),
  };
});

function makeTune(id) {
  return {
    id,
    title: id,
    type: 'reel',
    tsNum: 4,
    tsDen: 4,
    downbeatTick: 0,
    practiceTempo: 90,
    measures: [{ index: 0, notes: [] }],
    parts: [{ name: 'A', startMeasure: 0, bars: 1 }],
    hints: { key: null, startingNote: null },
  };
}

describe('initCoordinator', () => {
  it('stops every other instance when one starts playing', () => {
    const a = document.createElement('tune-looper');
    const b = document.createElement('tune-looper');
    document.body.append(a, b);
    a.tune = makeTune('a');
    b.tune = makeTune('b');
    initCoordinator(document);

    b.play();
    a.play();

    expect(a.getState().playing).toBe(true);
    expect(b.getState().playing).toBe(false);
  });
});
