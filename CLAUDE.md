# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Static site of per-tune practice loopers. Full spec: `planning/prds/init-prd.md`.

## Commands

- `npm run dev` — Vite dev server. Use `npm run dev -- --port 5183 --strictPort` for a fixed port (needed by Playwright-driven verification).
- `npm run build` — Vite build to `docs/` (deploy output, see Tooling).
- `npm test` — run Vitest once. `npm run test:watch` for watch mode.
  - Single file: `npx vitest run tests/midi-loader.test.js`
  - Single test: `npx vitest run tests/midi-loader.test.js -t "test name substring"`
- `npm run lint` / `npm run format` — ESLint / Prettier (also enforced via Husky pre-commit + lint-staged).

## Architecture

Data flow: `main.js` fetches `tunes/manifest.json`, then per tune fetches
`tunes/{id}.json` (authored metadata) + `tunes/{id}.mid` (parsed via
`@tonejs/midi`), and passes both into `midi-loader.js`'s `loadTune()` to
produce a `NormalizedTune`. One `<tune-looper>` custom element
(`tune-looper.js`) is created per tune and given the normalized tune via its
`.tune` setter.

- **`midi-loader.js`** — pure transform (metadata + parsed MIDI →
  `NormalizedTune`). Converts MIDI ticks into per-measure note lists,
  applies the pickup-beat window to reclassify lead-in notes as belonging to
  the _next_ measure, validates part boundaries against the measure count,
  and derives `practiceTempo` (70% of MIDI tempo, clamped) when not
  overridden in metadata. This is the unit-tested foundation; no DOM/Tone.js
  here (see Non-obvious rules).
- **`tune-looper.js`** — the `<tune-looper>` custom element: owns UI state
  (selection range, rest-bar/metronome/count-in toggles, tempo slider,
  hints visibility) and owns Tone.js playback (builds/schedules loop
  iterations against the shared `Tone.Transport`, using `Tone.Synth` for
  melody and `Tone.MembraneSynth` for the metronome click). Dispatches
  `tune-play`/`tune-stop` custom events; never talks to other instances
  directly.
- **`coordinator.js`** — listens for `tune-play` at the document level and
  stops every other `<tune-looper>` instance. This is the _only_ file aware
  that multiple instances exist, which is what makes sharing Tone.js's
  single global `Transport` across instances safe.
- **`main.js`** — wires the above together: fetch manifest + per-tune
  metadata/MIDI, instantiate elements, call `initCoordinator(document)`.
- **Tune content lives in `public/tunes/`**: `manifest.json` (session title
  and tune id list), `{id}.json` (authored metadata), `{id}.mid` (MIDI
  source of truth for notes/tempo/time-sig/measure count).

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

## Testing caveat

`tests/tune-looper.test.js` fully mocks `tone` (see the comment at the top
of that file) — it only verifies selection/render/event-wiring logic, not
real Transport scheduling. `tests/midi-loader.test.js` covers the
audio-agnostic pickup-rule logic directly. `tests/coordinator.test.js`
covers the solo-playback stop-all-others logic. For changes to the actual
playback/scheduling path, use the `verifier-tune-looper` skill (drives a
real headless Chromium via Playwright) rather than trusting Vitest alone.

## Tooling

- Vite build → `/docs`, deployed via GitHub Pages from `main`. No no-build
  fallback. `/docs` is pure Vite build output (`emptyOutDir: true`) — never
  put hand-authored files there; PRDs/planning docs live in `planning/`.
- Vitest for tests (`tests/*.test.js`), ESLint + Prettier for lint/format,
  enforced via a Husky pre-commit hook.
- CI (`.github/workflows/ci.yml`) runs `npm ci`, `lint`, `test`, and `build`
  on every push to `main` and every PR — mirror that sequence locally
  before pushing.
