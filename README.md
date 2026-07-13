# Trad Tune Looper

A static site of per-tune practice loopers for traditional (trad) music
sessions. Pick a tune, select a range of measures, and loop it at a slower
practice tempo — with optional rest bars, metronome click, and count-in — to
drill a tricky passage by ear.

## Features

- Per-tune measure grid with click-to-select looping range
- Adjustable playback tempo, independent of the tune's authored tempo
- Optional rest bar (silent measure) between loop repeats
- Optional metronome click and count-in before playback starts
- A/B part markers and volta (repeat ending) support
- Pickup-beat (lead-in note) handling that respects whether the tune is
  entering from silence or mid-loop
- Solo playback across tunes — starting one tune's looper stops any other

No staff notation is rendered; this is an ear-training tool, not a sheet
music reader.

## Getting started

```bash
npm install
npm run dev
```

This starts the Vite dev server. Open the printed local URL in a browser.

## Commands

- `npm run dev` — start the Vite dev server
- `npm run build` — build the static site to `docs/` (the deploy output)
- `npm run preview` — preview the production build locally
- `npm test` — run the Vitest suite once (`npm run test:watch` for watch mode)
- `npm run lint` — run ESLint
- `npm run format` — run Prettier

## Architecture

Data flow: `main.js` fetches `tunes/manifest.json`, then per tune fetches
`tunes/{id}.json` (authored metadata) and `tunes/{id}.mid` (parsed via
`@tonejs/midi`), and passes both into `midi-loader.js`'s `loadTune()` to
produce a normalized tune. One `<tune-looper>` custom element is created per
tune and given the normalized tune via its `.tune` setter.

- **`midi-loader.js`** — pure transform (metadata + parsed MIDI →
  normalized tune). No DOM or audio code; this is the unit-tested
  foundation everything else depends on.
- **`tune-looper.js`** — the `<tune-looper>` custom element. Owns UI state
  (selection range, toggles, tempo slider) and Tone.js playback, scheduled
  against the shared `Tone.Transport`.
- **`coordinator.js`** — listens for playback events at the document level
  and stops every other `<tune-looper>` instance, so only one tune plays at
  a time.
- **`main.js`** — wires the above together: fetches manifest and per-tune
  data, instantiates the elements, and starts the coordinator.
- **Tune content lives in `public/tunes/`**: `manifest.json` (session title
  and tune id list), `{id}.json` (authored metadata), `{id}.mid` (MIDI
  source of truth for notes/tempo/time-sig/measure count).

See `planning/prds/init-prd.md` for the full product spec.

## Adding a tune

1. Transcribe the tune by hand (e.g. in MuseScore) and export a MIDI file to
   `public/tunes/{id}.mid`.
2. Add a `public/tunes/{id}.json` metadata file alongside it, containing
   only what the MIDI can't reliably provide (pickup beats, part
   boundaries, tempo override, hints) — never duplicate measure count,
   tempo, or time signature from the MIDI.
3. Add the tune id to `public/tunes/manifest.json`.

## Testing

- `tests/midi-loader.test.js` covers the audio-agnostic pickup-rule logic
  directly.
- `tests/tune-looper.test.js` mocks Tone.js and only verifies
  selection/render/event-wiring logic, not real playback scheduling.
- For changes to the actual playback/scheduling path, use the
  `verifier-tune-looper` Claude Code skill, which drives a real headless
  Chromium via Playwright.

## Deployment

Built with Vite to `docs/` and deployed via GitHub Pages from `main`. There
is no no-build fallback — `docs/` is pure build output and should never
contain hand-authored files.

## AI disclosure

This project's **application code** was written with AI assistance (Claude Code)
and human-reviewed before commit. Full machine-readable details follow the
[ai-disclosure convention](https://github.com/ggfevans/ai-disclosure) — see
[`AI_DISCLOSURE.md`](./AI_DISCLOSURE.md).

The **musical content is not AI-generated.** Every tune was hand-transcribed
from notation in MuseScore and exported to MIDI by a human. No score or MIDI
file was created by, edited by, or passed through any AI system.

---

**How this was made**

The looper software was built with AI assistance and reviewed by hand. The
music was not: every tune here was transcribed by ear and by hand from
notation, then exported to MIDI. No AI touched the tunes.

> Software built with AI assistance · tunes hand-transcribed, no AI

## License

Application code is MIT-licensed — see [`LICENSE`](./LICENSE).

Tune content (`public/tunes/`) is **not** covered by that license and
carries mixed terms per tune (Open Database License for tunes sourced from
The Session; used-with-permission, site-only for tunes transcribed from a
copyrighted book). See [`public/tunes/NOTICE.md`](./public/tunes/NOTICE.md)
and each tune's `attribution` metadata for specifics.
