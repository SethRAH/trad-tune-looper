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

import * as Tone from 'tone';
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

function makeVoltaTune() {
  return {
    id: 'test-volta-tune',
    title: 'Test Volta Tune',
    type: 'reel',
    tsNum: 4,
    tsDen: 4,
    ppq: 480,
    ticksPerBeat: 480,
    ticksPerMeasure: 1920,
    downbeatTick: 0,
    practiceTempo: 90,
    measures: [0, 1, 2, 3, 4, 5].map((index) => ({ index, notes: [] })),
    parts: [
      { name: 'A', startMeasure: 0, bars: 2, repeats: 1 },
      {
        name: 'B',
        startMeasure: 2,
        bodyBars: 2,
        bodyMeasures: [2, 3],
        endings: [
          { bars: 1, measures: [4] },
          { bars: 1, measures: [5] },
        ],
        repeats: 2,
      },
    ],
    hints: { key: 'G', startingNote: 'D' },
  };
}

// Drives real playback scheduling (mocked Tone) and reconstructs the actual
// measure-play order from the "set current measure" callbacks passed to
// Tone.Transport.scheduleOnce — these are the zero-arg callbacks scheduled
// per measure in #buildLoopIteration, distinguishable from the one-arg
// note/metronome callbacks and from the single trailing zero-arg
// loop-continuation call (which we deliberately never invoke, to avoid
// recursing into the next loop iteration).
async function playedMeasureSequence(el) {
  const transport = Tone.getTransport();
  transport.scheduleOnce.mockClear();
  el.play();
  await Promise.resolve();
  await Promise.resolve();

  const calls = transport.scheduleOnce.mock.calls;
  const setterCalls = calls.slice(0, -1).filter(([callback]) => callback.length === 0);
  return setterCalls.map(([callback]) => {
    callback();
    return Number(el.querySelector('.tl-cell--current').dataset.measureIndex);
  });
}

describe('<tune-looper> voltas', () => {
  let el;

  beforeEach(() => {
    el = document.createElement('tune-looper');
    document.body.appendChild(el);
    el.tune = makeVoltaTune();
  });

  it("selects a volta part's full score-order span on part-name click", () => {
    el.querySelector('[data-part-index="1"]').click();
    const state = el.getState();
    expect(state.selStart).toBe(2);
    expect(state.selEnd).toBe(5);
  });

  it('plays the whole tune correctly (voltas expanded, no double-repeat) with nothing selected', async () => {
    const sequence = await playedMeasureSequence(el);
    // A (plain, repeats: 1) then B's one body->e1->body->e2 cycle.
    expect(sequence).toEqual([0, 1, 2, 3, 4, 2, 3, 5]);
  });

  it('plays identically whether nothing is selected or "Whole Tune" is explicitly clicked', async () => {
    const noSelectionSequence = await playedMeasureSequence(el);
    el.querySelector('.tl-select-all').click();
    const wholeTuneSequence = await playedMeasureSequence(el);
    expect(noSelectionSequence).toEqual(wholeTuneSequence);
  });

  it('plays exactly one body->ending1->body->ending2 cycle for a full-part selection (repeats is baked into the endings)', async () => {
    // part B's `repeats: 2` is informational once it has endings — the
    // body->e1->body->e2 cycle already plays the body twice (once per
    // ending), so it must not also be multiplied by `repeats` again.
    el.querySelector('[data-part-index="1"]').click();
    const sequence = await playedMeasureSequence(el);
    expect(sequence).toEqual([2, 3, 4, 2, 3, 5]);
  });

  it('wraps a same-part fragment to ending 1 (repeating the part)', async () => {
    el.querySelector('[data-measure-index="3"]').click();
    el.querySelector('[data-measure-index="4"]').click();
    const sequence = await playedMeasureSequence(el);
    expect(sequence).toEqual([3, 4]);
  });

  it('wraps a cross-part fragment to ending 2 (the exit), not ending 1', async () => {
    // selStart is in part A, so the loop wraps out of B rather than
    // repeating it, and the wrap target is ending 2 even though ending 1
    // sits earlier in score order.
    el.querySelector('[data-measure-index="1"]').click();
    el.querySelector('[data-measure-index="5"]').click();
    const sequence = await playedMeasureSequence(el);
    expect(sequence).toEqual([1, 2, 3, 5]);
  });

  it('honors a direct click on an ending cell as an override, even against the wrap-target default', async () => {
    // Same cross-part setup as above (wrap target would be ending 2), but
    // clicking ending 1's own cell explicitly should win regardless.
    el.querySelector('[data-measure-index="1"]').click();
    el.querySelector('[data-measure-index="4"]').click();
    const sequence = await playedMeasureSequence(el);
    expect(sequence).toEqual([1, 2, 3, 4]);
  });

  it('clears a stale ending override once a non-ending click changes the selection', async () => {
    el.querySelector('[data-measure-index="1"]').click();
    el.querySelector('[data-measure-index="4"]').click(); // override -> ending 1
    el.querySelector('[data-measure-index="1"]').click(); // new anchor, no ending role
    el.querySelector('[data-measure-index="5"]').click(); // completes range, no override
    const sequence = await playedMeasureSequence(el);
    expect(sequence).toEqual([1, 2, 3, 5]); // back to wrap-target default (ending 2)
  });

  it('plays both endings in order for an endings-only selection', async () => {
    el.querySelector('[data-measure-index="4"]').click();
    el.querySelector('[data-measure-index="5"]').click();
    const sequence = await playedMeasureSequence(el);
    expect(sequence).toEqual([4, 5]);
  });

  it('renders a volta part as a two-column body/endings frame, plain parts unchanged', () => {
    expect(el.querySelector('.tl-part-frame')).not.toBeNull();
    expect(el.querySelectorAll('.tl-part-body [data-measure-index]')).toHaveLength(2);
    expect(el.querySelectorAll('.tl-ending-row')).toHaveLength(2);
    expect(el.querySelectorAll('.tl-ending-row [data-measure-index]')).toHaveLength(2);

    // Part A (plain, no endings) still renders as flat cells with no frame.
    const aCell = el.querySelector('[data-measure-index="0"]');
    expect(aCell.closest('.tl-part-frame')).toBeNull();
  });

  it('labels cells by a running as-played position, with both endings sharing the same number', () => {
    // A has 2 bars, B's body has 2 more -> B's body bars read 3, 4.
    const bodyCell = el.querySelector('.tl-part-body [data-measure-index="2"]');
    expect(bodyCell.textContent.trim()).toBe('3');
    expect(
      el.querySelector('.tl-part-body [data-measure-index="3"]').textContent.trim(),
    ).toBe('4');

    // Both 1-bar endings occupy the same as-played slot right after the
    // body (5), not their own restarted 1-based count and not their
    // differing raw score indices (4 and 5).
    const ending1Cell = el.querySelector('[data-measure-index="4"]');
    const ending2Cell = el.querySelector('[data-measure-index="5"]');
    expect(ending1Cell.textContent.trim()).toContain('5');
    expect(ending2Cell.textContent.trim()).toContain('5');
    expect(ending1Cell.dataset.endingRole).toBe('1');
    expect(ending2Cell.dataset.endingRole).toBe('2');
  });

  it('dims the non-live ending row and highlights the wrap-target ending for a fragment selection', () => {
    el.querySelector('[data-measure-index="1"]').click();
    el.querySelector('[data-measure-index="5"]').click(); // wrap target: ending 2

    const rows = el.querySelectorAll('.tl-ending-row');
    expect(rows[0].className).toContain('tl-ending-row--dim');
    expect(rows[1].className).toContain('tl-ending-row--live');
  });

  it('does not dim either ending row for a full-part selection', () => {
    el.querySelector('[data-part-index="1"]').click();

    const rows = el.querySelectorAll('.tl-ending-row');
    expect(rows[0].className).not.toContain('tl-ending-row--dim');
    expect(rows[1].className).not.toContain('tl-ending-row--dim');
  });

  it('highlights a cross-seam range that extends from the body into an ending row', () => {
    el.querySelector('[data-measure-index="3"]').click();
    el.querySelector('[data-measure-index="4"]').click();

    expect(el.querySelector('[data-measure-index="3"]').className).toContain(
      'tl-cell--selected',
    );
    expect(el.querySelector('[data-measure-index="4"]').className).toContain(
      'tl-cell--selected',
    );
  });

  it('continues as-played numbering seamlessly across two volta parts (The Black Rogue shape)', () => {
    // A: 7 body bars + two 1-bar endings. B: 7 body bars + two 1-bar
    // endings. Score-order indices run 0..17 (9 for A, 9 for B), but the
    // as-played numbering a musician reads off the grid should look like
    // "1 2 3 4 5 6 7 8 8 9 10 11 12 13 14 15 16 16" — never jumping ahead
    // to account for score bars that aren't actually shown (e.g. B's body
    // must never read starting at 10 just because its raw score index is 9).
    const tune = {
      id: 'black-rogue-shape',
      title: 'Black Rogue Shape',
      type: 'jig',
      tsNum: 6,
      tsDen: 8,
      ppq: 480,
      ticksPerBeat: 240,
      ticksPerMeasure: 1440,
      downbeatTick: 0,
      practiceTempo: 90,
      measures: Array.from({ length: 18 }, (_, index) => ({ index, notes: [] })),
      parts: [
        {
          name: 'A',
          startMeasure: 0,
          bodyBars: 7,
          bodyMeasures: [0, 1, 2, 3, 4, 5, 6],
          endings: [
            { bars: 1, measures: [7] },
            { bars: 1, measures: [8] },
          ],
          repeats: 2,
        },
        {
          name: 'B',
          startMeasure: 9,
          bodyBars: 7,
          bodyMeasures: [9, 10, 11, 12, 13, 14, 15],
          endings: [
            { bars: 1, measures: [16] },
            { bars: 1, measures: [17] },
          ],
          repeats: 2,
        },
      ],
      hints: { key: 'D' },
    };

    el.tune = tune;

    const labelFor = (measureIndex) =>
      el.querySelector(`[data-measure-index="${measureIndex}"]`).textContent.trim();

    expect([0, 1, 2, 3, 4, 5, 6].map(labelFor)).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
    ]);
    // Ending cells carry a "1st"/"2nd" bracket-label prefix, so check the
    // as-played number is present rather than an exact match.
    expect(labelFor(7)).toContain('8');
    expect(labelFor(8)).toContain('8');
    expect([9, 10, 11, 12, 13, 14, 15].map(labelFor)).toEqual([
      '9',
      '10',
      '11',
      '12',
      '13',
      '14',
      '15',
    ]);
    expect(labelFor(16)).toContain('16');
    expect(labelFor(17)).toContain('16');
  });

  it('sizes the part-name button to match its grid frame width, even when parts have differently-shaped endings (Old Man Dillon shape)', () => {
    // A: 7 body bars + two 1-bar endings (9 bars total, but the endings
    // stack in one column so the on-screen width only needs to fit 1 of
    // them: 7+1=8). B: 4 body bars + two 4-bar endings (12 bars total,
    // on-screen width 4+4=8). A and B need equal *visual* width (8 and 8)
    // even though their bar-count totals differ (9 vs 12) — sizing the
    // "A"/"B" buttons by bar-count total instead of visual width would
    // drift them out of alignment with their own cells below.
    const tune = {
      id: 'old-man-dillon-shape',
      title: 'Old Man Dillon Shape',
      type: 'jig',
      tsNum: 6,
      tsDen: 8,
      ppq: 480,
      ticksPerBeat: 240,
      ticksPerMeasure: 1440,
      downbeatTick: 0,
      practiceTempo: 90,
      measures: Array.from({ length: 21 }, (_, index) => ({ index, notes: [] })),
      parts: [
        {
          name: 'A',
          startMeasure: 0,
          bodyBars: 7,
          bodyMeasures: [0, 1, 2, 3, 4, 5, 6],
          endings: [
            { bars: 1, measures: [7] },
            { bars: 1, measures: [8] },
          ],
          repeats: 2,
        },
        {
          name: 'B',
          startMeasure: 9,
          bodyBars: 4,
          bodyMeasures: [9, 10, 11, 12],
          endings: [
            { bars: 4, measures: [13, 14, 15, 16] },
            { bars: 4, measures: [17, 18, 19, 20] },
          ],
          repeats: 2,
        },
      ],
      hints: { key: 'A Dorian' },
    };

    el.tune = tune;

    const flexOf = (element) => Number(element.style.flex.split(' ')[0]);
    const partButtons = el.querySelectorAll('.tl-part');
    const partFrames = el.querySelectorAll('.tl-part-frame');

    expect(flexOf(partButtons[0])).toBe(flexOf(partFrames[0])); // A: 8 === 8
    expect(flexOf(partButtons[1])).toBe(flexOf(partFrames[1])); // B: 8 === 8
    expect(flexOf(partButtons[0])).toBe(8);
    expect(flexOf(partButtons[1])).toBe(8);
  });
});

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

  it('expands each plain part by its own repeats exactly once for whole-tune playback', async () => {
    el.querySelector('.tl-select-all').click();
    const sequence = await playedMeasureSequence(el);
    // A (bars [0,1], repeats: 2) then B (bars [2,3], repeats: 3).
    expect(sequence).toEqual([0, 1, 0, 1, 2, 3, 2, 3, 2, 3]);
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
