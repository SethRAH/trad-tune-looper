import { describe, expect, it } from 'vitest';
import { loadTune } from '../src/midi-loader.js';
import { buildMidi } from './fixtures/build-midi.js';

// 6/8 jig: ppq=480 (fixture default) -> ticksPerBeat=240, ticksPerMeasure=1440.
// pickupBeats=1 -> downbeatTick=240, pickup/lead-in window = 240 ticks.
const TICKS_PER_MEASURE = 1440;
const DOWNBEAT_TICK = 240;
// 4/4 with the fixture's default ppq=480 -> ticksPerMeasure = 480*4*4/4 = 1920.
const TICKS_PER_QUARTER_MEASURE = 1920;

function eightBarJigMidi() {
  return buildMidi({
    tempo: 120,
    timeSignature: [6, 8],
    notes: [
      { midi: 71, ticks: 0, durationTicks: 240 }, // bar-1 pickup (before downbeat)
      { midi: 62, ticks: DOWNBEAT_TICK, durationTicks: 240 }, // bar1 downbeat (A start)
      // interior pickup: tail of bar 4, leading into bar 5 (top of B)
      {
        midi: 74,
        ticks: DOWNBEAT_TICK + 4 * TICKS_PER_MEASURE - 180,
        durationTicks: 180,
      },
      { midi: 65, ticks: DOWNBEAT_TICK + 4 * TICKS_PER_MEASURE, durationTicks: 240 }, // bar5 downbeat (B start)
      { midi: 67, ticks: DOWNBEAT_TICK + 7 * TICKS_PER_MEASURE, durationTicks: 240 }, // bar8 (last measure)
    ],
  });
}

const eightBarJigMetadata = {
  id: 'test-jig',
  title: 'Test Jig',
  type: 'jig',
  pickupBeats: 1,
  parts: [
    { name: 'A', startMeasure: 1, bars: 4, repeats: 2 },
    { name: 'B', startMeasure: 5, bars: 4, repeats: 2 },
  ],
  hints: { key: 'G' },
};

describe('loadTune', () => {
  it('buckets the bar-1 pickup into measure 0 with a negative offset', () => {
    const tune = loadTune(eightBarJigMetadata, eightBarJigMidi());
    const measure0 = tune.measures.find((m) => m.index === 0);
    const pickupNote = measure0.notes.find((n) => n.isPickup);

    expect(pickupNote).toBeDefined();
    expect(pickupNote.midi).toBe(71);
    expect(pickupNote.offsetTicks).toBeLessThan(0);
  });

  it('does not flag the bar-1 downbeat note as a pickup', () => {
    const tune = loadTune(eightBarJigMetadata, eightBarJigMidi());
    const measure0 = tune.measures.find((m) => m.index === 0);
    const downbeatNote = measure0.notes.find((n) => !n.isPickup);

    expect(downbeatNote).toBeDefined();
    expect(downbeatNote.midi).toBe(62);
    expect(downbeatNote.offsetTicks).toBe(0);
  });

  it('auto-detects an interior pickup (top of B) and buckets it into the target measure', () => {
    const tune = loadTune(eightBarJigMetadata, eightBarJigMidi());
    // Part B starts at (1-based) measure 5 -> normalized 0-based measure index 4.
    const measure4 = tune.measures.find((m) => m.index === 4);
    const pickupNote = measure4.notes.find((n) => n.isPickup);
    const downbeatNote = measure4.notes.find((n) => !n.isPickup);

    expect(pickupNote).toBeDefined();
    expect(pickupNote.midi).toBe(74);
    expect(pickupNote.offsetTicks).toBeLessThan(0);

    expect(downbeatNote).toBeDefined();
    expect(downbeatNote.midi).toBe(65);
    expect(downbeatNote.offsetTicks).toBe(0);
  });

  it('normalizes part startMeasure to 0-based in the output', () => {
    const tune = loadTune(eightBarJigMetadata, eightBarJigMidi());
    expect(tune.parts.map((p) => [p.name, p.startMeasure])).toEqual([
      ['A', 0],
      ['B', 4],
    ]);
  });

  it('computes the starting note from the first non-pickup note', () => {
    const tune = loadTune(eightBarJigMetadata, eightBarJigMidi());
    // midi 62 = D
    expect(tune.hints.startingNote).toBe('D');
  });

  it('passes through the authored key hint', () => {
    const tune = loadTune(eightBarJigMetadata, eightBarJigMidi());
    expect(tune.hints.key).toBe('G');
  });

  it('defaults attribution to null when not authored', () => {
    const tune = loadTune(eightBarJigMetadata, eightBarJigMidi());
    expect(tune.attribution).toBeNull();
  });

  it('passes through authored attribution', () => {
    const metadata = {
      ...eightBarJigMetadata,
      attribution: {
        source: 'The Session',
        sourceUrl: 'https://thesession.org/tunes/52',
        license: 'ODbl',
        licenseUrl: 'https://opendatacommons.org/licenses/odbl/1.0/',
        contributor: 'someuser',
        contributedDate: '2004-06-08',
      },
    };
    const tune = loadTune(metadata, eightBarJigMidi());
    expect(tune.attribution).toEqual(metadata.attribution);
  });

  it('derives practiceTempo from midiTempo when not authored', () => {
    const tune = loadTune(eightBarJigMetadata, eightBarJigMidi());
    expect(tune.midiTempo).toBe(120);
    expect(tune.practiceTempo).toBe(84); // round(120 * 0.7)
  });

  it('uses an authored practiceTempo override verbatim', () => {
    const tune = loadTune(
      { ...eightBarJigMetadata, practiceTempo: 100 },
      eightBarJigMidi(),
    );
    expect(tune.practiceTempo).toBe(100);
  });

  it('clamps a derived practiceTempo to the slider range', () => {
    const fastMidi = buildMidi({
      tempo: 300,
      timeSignature: [6, 8],
      notes: [{ midi: 62, ticks: 0, durationTicks: 240 }],
    });
    const tune = loadTune(
      {
        ...eightBarJigMetadata,
        pickupBeats: 0,
        parts: [{ name: 'A', startMeasure: 1, bars: 1 }],
      },
      fastMidi,
    );
    expect(tune.practiceTempo).toBe(180); // round(300*0.7)=210, clamped to 180
  });

  it('handles a tune with no pickup at all (pickupBeats omitted)', () => {
    const midi = buildMidi({
      tempo: 120,
      timeSignature: [4, 4],
      notes: [{ midi: 60, ticks: 0, durationTicks: 480 }],
    });
    const tune = loadTune(
      {
        id: 'no-pickup',
        title: 'No Pickup',
        type: 'reel',
        parts: [{ name: 'A', startMeasure: 1, bars: 1 }],
      },
      midi,
    );
    const measure0 = tune.measures.find((m) => m.index === 0);
    expect(measure0.notes[0].isPickup).toBe(false);
    expect(tune.downbeatTick).toBe(0);
  });

  it('includes a rest measure with an empty notes array instead of dropping it', () => {
    const midi = buildMidi({
      tempo: 120,
      timeSignature: [4, 4],
      // bar 1 has a note, bar 2 is a silent rest, bar 3 has a note
      notes: [
        { midi: 60, ticks: 0, durationTicks: 480 },
        { midi: 60, ticks: 2 * TICKS_PER_QUARTER_MEASURE, durationTicks: 480 },
      ],
    });
    const tune = loadTune(
      {
        id: 'rest-measure',
        title: 'Rest Measure',
        type: 'reel',
        parts: [{ name: 'A', startMeasure: 1, bars: 3 }],
      },
      midi,
    );

    expect(tune.measures.map((m) => m.index)).toEqual([0, 1, 2]);
    expect(tune.measures.find((m) => m.index === 1).notes).toEqual([]);
  });

  it('throws when a part startMeasure does not follow the previous part', () => {
    const badMetadata = {
      ...eightBarJigMetadata,
      parts: [
        { name: 'A', startMeasure: 1, bars: 4 },
        { name: 'B', startMeasure: 6, bars: 4 }, // should be 5
      ],
    };
    expect(() => loadTune(badMetadata, eightBarJigMidi())).toThrow(/startMeasure/);
  });

  it('throws when the sum of part bars does not match the total full measures', () => {
    const badMetadata = {
      ...eightBarJigMetadata,
      parts: [
        { name: 'A', startMeasure: 1, bars: 4 },
        { name: 'B', startMeasure: 5, bars: 10 }, // way more bars than exist
      ],
    };
    expect(() => loadTune(badMetadata, eightBarJigMidi())).toThrow(/total full measures/);
  });

  it('throws when a part startMeasure is out of range', () => {
    const badMetadata = {
      ...eightBarJigMetadata,
      parts: [{ name: 'A', startMeasure: 99, bars: 4 }],
    };
    expect(() => loadTune(badMetadata, eightBarJigMidi())).toThrow(/out of range/);
  });
});

describe('loadTune with voltas', () => {
  // 4/4, ppq=480 (fixture default) -> ticksPerMeasure = 1920, no pickup.
  const TPM = 1920;

  function voltaTuneMidi({ bodyBars = 2, endingBars = 1 } = {}) {
    // Part A: 2 plain bars. Part B: bodyBars body + endingBars e1 + endingBars e2.
    const notes = [
      { midi: 60, ticks: 0, durationTicks: 480 }, // A bar 1
      { midi: 62, ticks: TPM, durationTicks: 480 }, // A bar 2
    ];
    let tick = 2 * TPM;
    for (let i = 0; i < bodyBars; i += 1, tick += TPM) {
      notes.push({ midi: 64, ticks: tick, durationTicks: 480 });
    }
    for (let i = 0; i < endingBars; i += 1, tick += TPM) {
      notes.push({ midi: 65, ticks: tick, durationTicks: 480 }); // ending 1
    }
    for (let i = 0; i < endingBars; i += 1, tick += TPM) {
      notes.push({ midi: 67, ticks: tick, durationTicks: 480 }); // ending 2
    }
    return buildMidi({ tempo: 120, timeSignature: [4, 4], notes });
  }

  function voltaMetadata({ bodyBars = 2, endingBars = 1 } = {}) {
    return {
      id: 'volta-test',
      title: 'Volta Test',
      type: 'reel',
      parts: [
        { name: 'A', startMeasure: 1, bars: 2 },
        {
          name: 'B',
          startMeasure: 3,
          bodyBars,
          endings: [{ bars: endingBars }, { bars: endingBars }],
        },
      ],
    };
  }

  it('slices a 1-bar volta part into contiguous score-order body/ending index arrays', () => {
    const tune = loadTune(voltaMetadata(), voltaTuneMidi());
    const partB = tune.parts.find((p) => p.name === 'B');

    expect(partB.startMeasure).toBe(2); // 0-based
    expect(partB.bodyBars).toBe(2);
    expect(partB.bodyMeasures).toEqual([2, 3]);
    expect(partB.endings).toHaveLength(2);
    expect(partB.endings[0]).toEqual({ bars: 1, measures: [4] });
    expect(partB.endings[1]).toEqual({ bars: 1, measures: [5] });
  });

  it('slices a multi-bar (4-bar) volta part the same way, proving length-agnosticism', () => {
    const tune = loadTune(
      voltaMetadata({ bodyBars: 4, endingBars: 4 }),
      voltaTuneMidi({ bodyBars: 4, endingBars: 4 }),
    );
    const partB = tune.parts.find((p) => p.name === 'B');

    expect(partB.bodyMeasures).toEqual([2, 3, 4, 5]);
    expect(partB.endings[0].measures).toEqual([6, 7, 8, 9]);
    expect(partB.endings[1].measures).toEqual([10, 11, 12, 13]);
  });

  it('does not affect plain-part pickup bucketing when a volta part is present', () => {
    const tune = loadTune(voltaMetadata(), voltaTuneMidi());
    const measure0 = tune.measures.find((m) => m.index === 0);
    expect(measure0.notes[0].isPickup).toBe(false);
    expect(measure0.notes[0].midi).toBe(60);
  });

  it('validates part-boundary contiguity against a previous volta part', () => {
    const badMetadata = {
      ...voltaMetadata(),
      parts: [
        voltaMetadata().parts[0],
        { ...voltaMetadata().parts[1], startMeasure: 4 }, // should be 3
      ],
    };
    expect(() => loadTune(badMetadata, voltaTuneMidi())).toThrow(/startMeasure/);
  });

  it('validates total-bars-sum against a volta part (bodyBars + endings)', () => {
    const badMetadata = {
      ...voltaMetadata(),
      parts: [voltaMetadata().parts[0], { ...voltaMetadata().parts[1], bodyBars: 99 }],
    };
    expect(() => loadTune(badMetadata, voltaTuneMidi())).toThrow(/total full measures/);
  });

  it('throws when a volta part does not have exactly two endings', () => {
    const badMetadata = {
      ...voltaMetadata(),
      parts: [
        voltaMetadata().parts[0],
        { ...voltaMetadata().parts[1], endings: [{ bars: 1 }] },
      ],
    };
    expect(() => loadTune(badMetadata, voltaTuneMidi())).toThrow(/exactly two endings/);
  });

  it('throws when a volta part has a non-positive bodyBars', () => {
    const badMetadata = {
      ...voltaMetadata(),
      parts: [voltaMetadata().parts[0], { ...voltaMetadata().parts[1], bodyBars: 0 }],
    };
    expect(() => loadTune(badMetadata, voltaTuneMidi())).toThrow(
      /must be a positive number of bars/,
    );
  });

  it('throws when a volta part has a non-positive ending bar count', () => {
    const badMetadata = {
      ...voltaMetadata(),
      parts: [
        voltaMetadata().parts[0],
        { ...voltaMetadata().parts[1], endings: [{ bars: 1 }, { bars: 0 }] },
      ],
    };
    expect(() => loadTune(badMetadata, voltaTuneMidi())).toThrow(
      /must be a positive number of bars/,
    );
  });

  it('duplicates a pickup at the top of the endings onto both ending 1 and ending 2', () => {
    // The pickup-window bucketing is global/score-order-only, so a pickup
    // transcribed at the tail of the body's last bar is score-adjacent only
    // to ending 1 (ending 2 sits later on the timeline) and would otherwise
    // never reach ending 2's bucket at all — silently dropping that note
    // whenever playback wraps into ending 2 instead of ending 1.
    const pickupBeats = 1;
    const ticksPerBeat = 480; // ppq(480)*4/4 for 4/4
    const downbeatTick = pickupBeats * ticksPerBeat;

    const notes = [
      { midi: 60, ticks: downbeatTick + 0 * TPM, durationTicks: 480 }, // A bar 1
      { midi: 62, ticks: downbeatTick + 1 * TPM, durationTicks: 480 }, // A bar 2
      { midi: 64, ticks: downbeatTick + 2 * TPM, durationTicks: 480 }, // B body bar 1
      { midi: 65, ticks: downbeatTick + 3 * TPM, durationTicks: 480 }, // B body bar 2 downbeat
      // Pickup in the tail of B's last body bar, leading into the endings slot.
      { midi: 69, ticks: downbeatTick + 4 * TPM - 100, durationTicks: 100 },
      { midi: 67, ticks: downbeatTick + 4 * TPM, durationTicks: 480 }, // ending 1 downbeat
      { midi: 71, ticks: downbeatTick + 5 * TPM, durationTicks: 480 }, // ending 2 downbeat
    ];
    const midi = buildMidi({ tempo: 120, timeSignature: [4, 4], notes });
    const metadata = {
      id: 'volta-pickup-test',
      title: 'Volta Pickup Test',
      type: 'reel',
      pickupBeats,
      parts: [
        { name: 'A', startMeasure: 1, bars: 2 },
        { name: 'B', startMeasure: 3, bodyBars: 2, endings: [{ bars: 1 }, { bars: 1 }] },
      ],
    };

    const tune = loadTune(metadata, midi);
    const partB = tune.parts.find((p) => p.name === 'B');
    const ending1Measure = tune.measures[partB.endings[0].measures[0]];
    const ending2Measure = tune.measures[partB.endings[1].measures[0]];

    const ending1Pickup = ending1Measure.notes.find((n) => n.isPickup);
    const ending2Pickup = ending2Measure.notes.find((n) => n.isPickup);

    expect(ending1Pickup).toBeDefined();
    expect(ending1Pickup.midi).toBe(69);

    expect(ending2Pickup).toBeDefined();
    expect(ending2Pickup.midi).toBe(69);
    expect(ending2Pickup.offsetTicks).toBe(ending1Pickup.offsetTicks);

    // The ending's own downbeat note must still be there alongside the
    // duplicated pickup, not overwritten by it.
    expect(ending2Measure.notes.some((n) => n.midi === 71 && !n.isPickup)).toBe(true);
  });
});
