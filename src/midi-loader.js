const SLIDER_MIN = 40;
const SLIDER_MAX = 180;

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function midiToPitchName(midi) {
  return NOTE_NAMES[((midi % 12) + 12) % 12];
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function pickMelodyTrack(tracks) {
  return tracks.reduce((best, track) =>
    track.notes.length > best.notes.length ? track : best,
  );
}

export function partScoreBars(part) {
  return part.endings
    ? part.bodyBars + part.endings.reduce((sum, e) => sum + e.bars, 0)
    : part.bars;
}

function sliceIndices(from, count) {
  return Array.from({ length: count }, (_, i) => from + i);
}

/**
 * Pure function: takes a tune's authored metadata + its parsed MIDI (via
 * @tonejs/midi) and returns the NormalizedTune model the rest of the app
 * consumes. No DOM, no audio — see PRD §6.
 */
export function loadTune(metadata, parsedMidi) {
  const { header } = parsedMidi;
  const ppq = header.ppq;
  const [tsNum, tsDen] =
    metadata.timeSignatureOverride ?? header.timeSignatures[0].timeSignature;
  const midiTempo = header.tempos[0].bpm;
  const melodyTrack = pickMelodyTrack(parsedMidi.tracks);

  const ticksPerBeat = (ppq * 4) / tsDen;
  const ticksPerMeasure = (ppq * 4 * tsNum) / tsDen;
  const pickupBeats = metadata.pickupBeats ?? 0;
  const downbeatTick = pickupBeats * ticksPerBeat;
  const pickupWindowTicks = downbeatTick;

  const measuresByIndex = new Map();
  const getMeasure = (index) => {
    if (!measuresByIndex.has(index)) {
      measuresByIndex.set(index, { index, notes: [] });
    }
    return measuresByIndex.get(index);
  };

  let maxMeasureIndex = -1;
  let earliestBodyNote = null;

  for (const note of melodyTrack.notes) {
    const tick = note.ticks;
    let measureIndex;
    let offsetTicks;
    let isPickup;

    if (tick < downbeatTick) {
      measureIndex = 0;
      offsetTicks = tick - downbeatTick;
      isPickup = true;
    } else {
      const rel = tick - downbeatTick;
      const naturalIndex = Math.floor(rel / ticksPerMeasure);
      const offsetInNatural = rel - naturalIndex * ticksPerMeasure;
      const inLeadInWindow =
        pickupWindowTicks > 0 && offsetInNatural >= ticksPerMeasure - pickupWindowTicks;

      if (inLeadInWindow) {
        measureIndex = naturalIndex + 1;
        offsetTicks = offsetInNatural - ticksPerMeasure;
        isPickup = true;
      } else {
        measureIndex = naturalIndex;
        offsetTicks = offsetInNatural;
        isPickup = false;
      }
    }

    getMeasure(measureIndex).notes.push({
      midi: note.midi,
      offsetTicks,
      durTicks: note.durationTicks,
      isPickup,
    });

    if (measureIndex > maxMeasureIndex) maxMeasureIndex = measureIndex;
    if (!isPickup && (earliestBodyNote === null || tick < earliestBodyNote.tick)) {
      earliestBodyNote = { tick, midi: note.midi };
    }
  }

  const totalFullMeasures = maxMeasureIndex + 1;

  const tuneRef = `Tune "${metadata.id}"`;

  for (const part of metadata.parts) {
    if (part.endings) {
      if (part.endings.length !== 2) {
        throw new Error(
          `${tuneRef}: Part "${part.name}" must have exactly two endings (1st/2nd), got ${part.endings.length}`,
        );
      }
      if (!(part.bodyBars > 0)) {
        throw new Error(
          `${tuneRef}: Part "${part.name}" bodyBars must be a positive number of bars, got ${part.bodyBars}`,
        );
      }
      for (const [i, ending] of part.endings.entries()) {
        if (!(ending.bars > 0)) {
          throw new Error(
            `${tuneRef}: Part "${part.name}" ending ${i + 1} bars must be a positive number of bars, got ${ending.bars}`,
          );
        }
      }
    }
  }
  for (const part of metadata.parts) {
    if (part.startMeasure < 1 || part.startMeasure > totalFullMeasures) {
      throw new Error(
        `${tuneRef}: Part "${part.name}" startMeasure ${part.startMeasure} is out of range (1..${totalFullMeasures})`,
      );
    }
  }
  for (let i = 1; i < metadata.parts.length; i += 1) {
    const prev = metadata.parts[i - 1];
    const curr = metadata.parts[i];
    const expected = prev.startMeasure + partScoreBars(prev);
    if (curr.startMeasure !== expected) {
      throw new Error(
        `${tuneRef}: Part "${curr.name}" startMeasure ${curr.startMeasure} does not follow "${prev.name}" ` +
          `(expected ${expected})`,
      );
    }
  }
  const barsSum = metadata.parts.reduce((sum, part) => sum + partScoreBars(part), 0);
  if (barsSum !== totalFullMeasures) {
    throw new Error(
      `${tuneRef}: Sum of part bars (${barsSum}) does not match total full measures (${totalFullMeasures})`,
    );
  }

  for (let i = 0; i < totalFullMeasures; i += 1) getMeasure(i);
  const measures = Array.from(measuresByIndex.values()).sort((a, b) => a.index - b.index);

  const practiceTempo =
    metadata.practiceTempo ?? clamp(Math.round(midiTempo * 0.7), SLIDER_MIN, SLIDER_MAX);

  const startingNote = earliestBodyNote ? midiToPitchName(earliestBodyNote.midi) : null;

  return {
    id: metadata.id,
    title: metadata.title,
    type: metadata.type,
    tsNum,
    tsDen,
    ppq,
    ticksPerBeat,
    ticksPerMeasure,
    downbeatTick,
    midiTempo,
    practiceTempo,
    measures,
    parts: metadata.parts.map((part) => {
      const startMeasure = part.startMeasure - 1;
      if (!part.endings) return { ...part, startMeasure };

      const bodyMeasures = sliceIndices(startMeasure, part.bodyBars);
      let cursor = startMeasure + part.bodyBars;
      const endings = part.endings.map((e) => {
        const endingMeasures = sliceIndices(cursor, e.bars);
        cursor += e.bars;
        return { bars: e.bars, measures: endingMeasures };
      });

      // A pickup transcribed at the tail of the body's last bar is
      // score-adjacent only to ending 1 (ending 2 always sits later on the
      // timeline), so the global tick-based bucketing above only ever
      // attaches it there. Both endings begin at the same as-played slot
      // right after the body, so duplicate that pickup onto ending 2's
      // first bar too — otherwise playing into ending 2 silently drops it.
      const [ending1, ending2] = endings;
      const pickupNotes = measures[ending1.measures[0]].notes.filter((n) => n.isPickup);
      if (pickupNotes.length > 0) {
        measures[ending2.measures[0]].notes.push(...pickupNotes.map((n) => ({ ...n })));
      }

      return {
        name: part.name,
        startMeasure,
        repeats: part.repeats,
        bodyBars: part.bodyBars,
        bodyMeasures,
        endings,
      };
    }),
    hints: { key: metadata.hints?.key ?? null, startingNote },
    attribution: metadata.attribution ?? null,
  };
}
