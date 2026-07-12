import { beforeEach, describe, expect, it, vi } from 'vitest';

// Tone.js requires a real Web Audio API, unavailable in the happy-dom test
// environment. These component tests only exercise selection/render/event
// logic (see tests/midi-loader.test.js for the audio-agnostic pickup-rule
// logic) — real playback is verified manually in a browser, per the plan.
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

import '../src/tune-looper.js';

function makeTune() {
  return {
    id: 'test-tune',
    title: 'Test Tune',
    type: 'reel',
    tsNum: 4,
    tsDen: 4,
    downbeatTick: 0,
    practiceTempo: 90,
    measures: [0, 1, 2, 3].map((index) => ({ index, notes: [] })),
    parts: [
      { name: 'A', startMeasure: 0, bars: 2, repeats: 2 },
      { name: 'B', startMeasure: 2, bars: 2, repeats: 3 },
    ],
    hints: { key: 'G', startingNote: 'D' },
  };
}

describe('<tune-looper>', () => {
  let el;

  beforeEach(() => {
    el = document.createElement('tune-looper');
    document.body.appendChild(el);
    el.tune = makeTune();
  });

  it('renders one grid cell per measure', () => {
    expect(el.querySelectorAll('[data-measure-index]')).toHaveLength(4);
  });

  it('renders a distinct lead-in cell only when the tune has a bar-1 pickup', () => {
    expect(el.querySelector('.tl-cell--pickup')).toBeNull();

    el.tune = { ...makeTune(), downbeatTick: 240 };
    expect(el.querySelector('.tl-cell--pickup')).not.toBeNull();
  });

  it('marks the first click as anchored, distinct from a completed selection', () => {
    el.querySelector('[data-measure-index="1"]').click();

    expect(el.getState().selStart).toBe(1);
    expect(el.getState().selEnd).toBeNull();
    expect(el.querySelector('[data-measure-index="1"]').className).toContain(
      'tl-cell--anchored',
    );
  });

  it('closes the range on a second click and marks the span as selected', () => {
    el.querySelector('[data-measure-index="1"]').click();
    el.querySelector('[data-measure-index="3"]').click();

    const state = el.getState();
    expect(state.selStart).toBe(1);
    expect(state.selEnd).toBe(3);
    expect(el.querySelector('[data-measure-index="1"]').className).toContain(
      'tl-cell--selected',
    );
    expect(el.querySelector('[data-measure-index="2"]').className).toContain(
      'tl-cell--selected',
    );
    expect(el.querySelector('[data-measure-index="3"]').className).toContain(
      'tl-cell--selected',
    );
    expect(el.querySelector('[data-measure-index="0"]').className).not.toContain(
      'tl-cell--selected',
    );
  });

  it('normalizes a reversed click order into an ascending range', () => {
    el.querySelector('[data-measure-index="3"]').click();
    el.querySelector('[data-measure-index="1"]').click();

    const state = el.getState();
    expect(state.selStart).toBe(1);
    expect(state.selEnd).toBe(3);
  });

  it('selects a whole part on click', () => {
    el.querySelector('[data-part-index="1"]').click();

    const state = el.getState();
    expect(state.selStart).toBe(2);
    expect(state.selEnd).toBe(3);
  });

  it('selects the whole tune on click', () => {
    el.querySelector('.tl-select-all').click();

    const state = el.getState();
    expect(state.selStart).toBe(0);
    expect(state.selEnd).toBe(3);
    expect(state.wholeTuneSelected).toBe(true);
  });

  it('shows the flat bar count normally, and the repeats-expanded count once whole tune is selected', () => {
    expect(el.querySelector('.tl-barcount').textContent.trim()).toBe('4 bars');

    el.querySelector('.tl-select-all').click();
    expect(el.querySelector('.tl-barcount').textContent.trim()).toBe(
      '10 bars with repeats',
    );

    el.querySelector('[data-part-index="0"]').click();
    expect(el.querySelector('.tl-barcount').textContent.trim()).toBe('4 bars');
  });

  it('drops out of whole-tune mode when a measure or part is selected afterward', () => {
    el.querySelector('.tl-select-all').click();
    expect(el.getState().wholeTuneSelected).toBe(true);

    el.querySelector('[data-measure-index="1"]').click();
    expect(el.getState().wholeTuneSelected).toBe(false);

    el.querySelector('.tl-select-all').click();
    expect(el.getState().wholeTuneSelected).toBe(true);

    el.querySelector('[data-part-index="1"]').click();
    expect(el.getState().wholeTuneSelected).toBe(false);
  });

  it('starts a new selection after a completed range is clicked again', () => {
    el.querySelector('[data-measure-index="0"]').click();
    el.querySelector('[data-measure-index="1"]').click();
    el.querySelector('[data-measure-index="2"]').click();

    const state = el.getState();
    expect(state.selStart).toBe(2);
    expect(state.selEnd).toBeNull();
  });

  it('emits tune-play/tune-stop and toggles the button label', () => {
    let playDetail = null;
    let stopDetail = null;
    el.addEventListener('tune-play', (e) => (playDetail = e.detail));
    el.addEventListener('tune-stop', (e) => (stopDetail = e.detail));

    el.querySelector('.tl-play-btn').click();
    expect(playDetail).toEqual({ id: 'test-tune' });
    expect(el.getState().playing).toBe(true);
    expect(el.querySelector('.tl-play-btn').textContent.trim()).toBe('Stop');

    el.querySelector('.tl-play-btn').click();
    expect(stopDetail).toEqual({ id: 'test-tune' });
    expect(el.getState().playing).toBe(false);
    expect(el.querySelector('.tl-play-btn').textContent.trim()).toBe('Play');
  });

  it('hides hints by default and reveals them on toggle', () => {
    expect(el.querySelector('.tl-hints')).toBeNull();

    el.querySelector('.tl-hint-toggle').click();

    expect(el.querySelector('.tl-hints')).not.toBeNull();
    expect(el.textContent).toContain('Key: G');
    expect(el.textContent).toContain('Starts on D');
  });

  it('renders no attribution when the tune has none', () => {
    expect(el.querySelector('.tl-attribution')).toBeNull();
  });

  it('renders an always-visible attribution note when the tune has one', () => {
    el.tune = {
      ...makeTune(),
      attribution: {
        source: 'The Session',
        sourceUrl: 'https://thesession.org/tunes/52',
        license: 'ODbl',
        licenseUrl: 'https://opendatacommons.org/licenses/odbl/1.0/',
        contributor: 'someuser',
        contributedDate: '2004-06-08',
      },
    };

    const attribution = el.querySelector('.tl-attribution');
    expect(attribution).not.toBeNull();

    const sourceLink = attribution.querySelector(
      'a[href="https://thesession.org/tunes/52"]',
    );
    expect(sourceLink.textContent).toBe('The Session');

    const licenseLink = attribution.querySelector(
      'a[href="https://opendatacommons.org/licenses/odbl/1.0/"]',
    );
    expect(licenseLink.textContent).toBe('ODbl');

    expect(attribution.textContent).toContain('Added by someuser on 2004-06-08.');
  });

  it('defaults the tempo slider to the practiceTempo', () => {
    expect(el.getState().bpm).toBe(90);
    expect(el.querySelector('.tl-tempo-slider').value).toBe('90');
  });
});
