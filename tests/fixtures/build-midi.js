import { Midi } from '@tonejs/midi';

/**
 * Build an in-memory @tonejs/midi Midi object for tests, without needing
 * real .mid files on disk. Note: @tonejs/midi's Header.ppq has no public
 * setter, so fixtures always use its default of 480 ticks per quarter note.
 */
export function buildMidi({ tempo = 120, timeSignature = [4, 4], notes = [] }) {
  const midi = new Midi();
  midi.header.tempos.push({ ticks: 0, bpm: tempo });
  midi.header.timeSignatures.push({ ticks: 0, timeSignature });

  const track = midi.addTrack();
  for (const note of notes) {
    track.addNote({
      midi: note.midi,
      ticks: note.ticks,
      durationTicks: note.durationTicks,
    });
  }

  return midi;
}
