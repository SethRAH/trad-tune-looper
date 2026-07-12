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
