# Trad Tune Looper

Static site of per-tune practice loopers. Full spec: `planning/prds/init-prd.md`.

## Non-obvious rules (see PRD for full detail)

- **Pickup rule (§4):** a pickup plays only when the measure it leads into is
  reached out of _music_, not out of silence. When rest bar is on, the
  pickup after the rest is suppressed — and suppression means skipping
  straight to the downbeat, never holding phantom silence.
- **`midi-loader.js` is pure**: no DOM, no Tone.js, no audio. It takes
  metadata + parsed MIDI and returns a `NormalizedTune`. Keep it that way —
  it's the unit-tested foundation everything else depends on.
- **No notation rendering.** The measure grid (numbered cells, A/B part bar)
  is the only structural scaffolding; staff notation is explicitly out of
  scope because it undercuts ear-training.
- **Solo playback via coordinator**: `<tune-looper>` instances never know
  about each other. `coordinator.js` is the only thing that knows the set of
  instances exists, and it's what makes sharing the single `Tone.Transport`
  across instances safe.
- **Metadata (`tunes/{id}.json`) carries only what MIDI can't give reliably**
  (pickupBeats, practiceTempo override, part boundaries, hints). Never
  duplicate measure count / tempo / time-sig from MIDI into the JSON.
- **Tempo changes while playing** ramp `Tone.Transport.bpm` in place — do not
  tear down and rebuild the schedule.

## Tooling

- Vite build → `/docs`, deployed via GitHub Pages from `main`. No no-build
  fallback. `/docs` is pure Vite build output (`emptyOutDir: true`) — never
  put hand-authored files there; PRDs/planning docs live in `planning/`.
- Vitest for tests (`tests/*.test.js`), ESLint + Prettier for lint/format,
  enforced via a Husky pre-commit hook.
