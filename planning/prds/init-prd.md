# Trad Tune Looper — PRD & Architecture

A static site of per-tune practice loopers for a beginner slow trad session. Each
tune gets a component that parses a MIDI file, lets you click-select a range of
measures, and loops that range at a slow practice tempo — with optional count-in,
rest bar between loops, and metronome. The point is **learning tunes by ear** with
fine control over _which part_ and _how slow_, which existing slow-downer tools
don't give.

Built to live in one repo and deploy to GitHub Pages. No backend.

---

## 1. Problem & goals

**Problem.** Slow trad sessions build a repertoire week over week. Catching up on
missed tunes by ear is hard: recordings don't let you isolate the B part, loop
eight bars, or crawl the tempo down without pitch artifacts. Reading the dots
defeats the goal of learning to hear the tune.

**Goals.**

- Isolate any contiguous range of measures in a tune and loop it.
- Slow the tempo well below session speed without pitch distortion (synth playback,
  not time-stretched audio — tempo is just a scheduling number).
- Support the two distinct practice modes: _in-the-flow_ (continuous loop) and
  _isolated-with-breathing-room_ (rest bar between loops).
- One page holds many tunes; starting one stops the others (solo playback).
- Optional ear-training scaffolding (key / starting-note hints) that you reveal
  only when you want it, so it doesn't short-circuit the listening.

**Non-goals (for v1).**

- No audio-file playback or time-stretching. MIDI/synth only.
- No notation rendering. A structural grid (measure cells, A/B labels) is fine and
  desired; staff notation is explicitly out — it undercuts ear learning.
- No recording, no tempo automation curves, no simultaneous multi-tune playback.
- No accounts, no persistence beyond the static data files.

---

## 2. Repo layout & deployment

Single repo, everything co-located. Recommended structure:

```
/
  index.html            # the session page; lists all tunes
  /src
    tune-looper.js      # the <tune-looper> custom element
    coordinator.js      # page-level solo-playback coordinator
    midi-loader.js      # schema + parsed MIDI -> normalized tune model
    main.js             # boots the page: fetch manifest, render instances, wire coordinator
    styles.css
  /tunes
    manifest.json       # list of tune ids (or inline metadata; see §5)
    out-on-the-ocean.json
    out-on-the-ocean.mid
    kesh.json
    kesh.mid
    ...
  /docs                 # Vite build output, served by GH Pages   (if using Vite)
  vite.config.js
  package.json
  PRD.md                # this file
```

**Build & deploy.** Recommended: **Vite**, output to `/docs`, GH Pages set to serve
from `/docs` on `main`. Vite handles bundling `tone` and `@tonejs/midi` from npm and
gives hot reload during development. `base` in `vite.config.js` must be set to the
repo name (`/tune-looper/`) so asset paths resolve on Pages.

**No-build fallback** (acceptable, author's choice): skip Vite, import deps as ES
modules from a CDN (`esm.sh` / `jsdelivr`) in `<script type="module">`, serve the repo
root directly. Simpler config, worse authoring ergonomics. Either is fine; the code
shouldn't need to change much between them.

---

## 3. Architecture overview

Three layers, deliberately decoupled:

1. **`<tune-looper>` custom element** — self-contained. Owns its UI (measure grid,
   controls), its selection state, and its playback scheduling. Knows nothing about
   other instances. Exposes an imperative API and emits events.

2. **Coordinator** (page-level) — holds references to all instances. Enforces solo
   playback: when any instance emits `tune-play`, it calls `.stop()` on every other
   instance. This is the _only_ thing that knows instances exist as a set.

3. **MIDI loader** — pure function. Takes a tune's metadata object + its parsed MIDI
   and returns the normalized model the component consumes (measures bucketed, pickups
   flagged, tempo resolved, boundaries asserted). No DOM, no audio; unit-testable.

**Why solo playback simplifies everything:** Tone.js has a single global
`Tone.Transport`. If multiple instances scheduled against it simultaneously they'd
collide. Because the coordinator guarantees only one instance ever plays at a time,
the shared Transport is safe — the instance that's playing owns it exclusively.
Building the coordinator early isn't just UX polish; it sidesteps the hardest timing
problem in the project. (If simultaneous multi-tune playback is ever wanted, each
instance would need isolated timing via `Tone.now()` + a manual scheduling loop
instead of the shared Transport. Out of scope for v1.)

---

## 4. The pickup rule (most important behavioral spec)

A pickup (anacrusis) is **not a property of a part** — it's a property of the _seam_
between phrases. The B-pickup's job is "you just finished a phrase, launch into B."
So it isn't assigned statically to A or B. Instead:

> **Play a pickup only when the measure it leads into is arrived at, in the actual
> playback stream, out of music — not out of silence or a rest.**

This single rule resolves every case correctly:

| Scenario                         | Preceding the target downbeat  | Pickup?          |
| -------------------------------- | ------------------------------ | ---------------- |
| A alone, continuous loop         | end of A (loop)                | plays each loop  |
| A alone, **rest bar** on         | silence (the rest)             | suppressed       |
| B alone, continuous loop         | end of B (loop)                | plays each loop  |
| B alone, **rest bar** on         | silence (the rest)             | suppressed       |
| A→B together, continuous         | A flows into B; B loops into A | all pickups play |
| First iteration, before any loop | silence (start)                | suppressed       |

This makes the **rest-bar toggle do real musical work**: it's not just inserting a
gap, it's changing whether pickups fire — which is exactly the pedagogical
distinction between isolated and in-the-flow practice.

**Suppression behavior:** when a pickup is suppressed, **skip straight to the
downbeat** — do _not_ hold phantom silence for the pickup's duration. Loop-body
length is measured downbeat-to-downbeat; suppressed pickups don't pad it. (Holding
the silence would make the rest bar feel like "a rest bar plus a bit," the floaty
weirdness we're avoiding.)

**How pickups are identified:** any note whose start tick falls _before_ the downbeat
of the measure it's bucketed into is a pickup into that measure. This auto-detects
interior pickups (top of B, etc.). The one case that can't be auto-detected is bar 1,
where there's no preceding bar — so `pickupBeats` in metadata declares how far before
bar 1's downbeat the anacrusis begins. See §6 loader.

---

## 5. Metadata schema (per-tune JSON)

One JSON file per tune (author's decision: separate files over one big file — easier
to hand-edit, no merge conflicts if it ever goes collaborative). A `manifest.json`
lists tune ids; the page fetches each tune's JSON + MIDI.

**Design principle:** metadata carries _only_ what MIDI can't give cleanly or
reliably. Measure count, note positions, written tempo, and time signature come from
the MIDI and are **never** duplicated here (two sources of truth drift).

```jsonc
{
  "id": "out-on-the-ocean", // stable slug; used as component instance key
  "title": "Out on the Ocean",
  "type": "jig", // jig | slip-jig | reel | hornpipe | polka | ...
  "midi": "tunes/out-on-the-ocean.mid",

  "pickupBeats": 1, // anacrusis into bar 1 ONLY; interior pickups
  // auto-detected. 0 or omit if none.

  "practiceTempo": 80, // optional. If omitted: round(midiTempo * 0.7),
  // clamped to the tempo slider range.

  "parts": [
    { "name": "A", "startMeasure": 1, "bars": 8, "repeats": 2 },
    { "name": "B", "startMeasure": 9, "bars": 8, "repeats": 2 },
  ],
  // startMeasure: 1-based; first FULL bar is 1 (pickup notes live in bar 0 / index -1)
  // bars:    unique bars in the part (NOT counting written repeats) — this is the
  //          selectable unit; the looper handles repetition
  // repeats: as-written repeat count. Informational/display only.

  "hints": {
    "key": "G", // shown only when the hint toggle is on.
    // startingNote is COMPUTED from MIDI (pitch of
    // first non-pickup note) and shown behind the
    // same toggle — not authored here.
  },

  "source": "https://thesession.org/tunes/52", // optional; the setting you transcribed

  "timeSignatureOverride": null, // optional escape hatch for tunes whose MIDI
  // time-sig meta is missing/wrong. Expect ~never.
}
```

**`manifest.json`:**

```jsonc
{
  "session": "Beginner Slow Trad — Tuesdays",
  "tunes": ["out-on-the-ocean", "kesh", "morrisons"], // ids; page fetches {id}.json
}
```

Notes on specific fields:

- **`startMeasure` is intentionally redundant** with the running sum of `bars` +
  pickup. Kept because explicit boundaries are eyeball-verifiable against notation
  while transcribing, and the loader can _assert_ consistency (see §6) to catch
  transcription mistakes.
- **`hints` is deliberately not in the header UI.** Key and starting note are
  revealed on demand so ear-training isn't short-circuited — commit to a guess, then
  peek. Key = gentle nudge; starting note = stronger. See §7 hint UX.

---

## 6. MIDI loader (pure function spec)

`loadTune(metadata, parsedMidi) -> NormalizedTune`

Reads from parsed MIDI (via `@tonejs/midi`): `ppq`, first time signature
(`tsNum`/`tsDen`), first tempo (bpm), and note events (midi pitch, start tick,
duration ticks). Picks the melody track as the track with the most notes.

**Derived constants:**

```
ticksPerBeat    = ppq * 4 / tsDen
ticksPerMeasure = ppq * 4 * tsNum / tsDen
downbeatTick    = (metadata.pickupBeats ?? 0) * ticksPerBeat
```

**Bucketing:** for each note,

```
measureIndex = floor((tick - downbeatTick) / ticksPerMeasure)
offsetInMeasure = (tick - downbeatTick) - measureIndex * ticksPerMeasure
```

Notes with `measureIndex < 0` are the bar-1 pickup (bucket them into measure 0 as
`isPickup: true`, or a dedicated pickup bucket). For notes in measure ≥ 0, flag
`isPickup: true` if the note _belongs to_ the next measure's lead-in — i.e. detect
interior pickups by noting any run of notes sitting in the tail of a measure that
musically lead into the next downbeat. **Simplest robust approach:** treat a note as
a pickup into measure _m_ if its start tick is within the pickup window _before_
`m`'s downbeat. Since `pickupBeats` gives the window size for bar 1, reuse that width
to detect interior pickups (trad pickups are consistent within a tune). Flag them
associated with the measure they lead into.

**Resolve tempo:**

```
practiceTempo = metadata.practiceTempo ?? clamp(round(midiTempo * 0.7), SLIDER_MIN, SLIDER_MAX)
```

**Compute starting note:** pitch (spelled note name, e.g. "B") of the first
non-pickup note. Store on the model for the hint UI.

**Assertions (throw / warn loudly on failure — these catch transcription errors):**

- For each part _n>0_: `parts[n].startMeasure === parts[n-1].startMeasure + parts[n-1].bars`
- `sum(parts.bars) === totalFullMeasures` (measures excluding the bar-1 pickup)
- Every part's `startMeasure` is within range.

**Returns `NormalizedTune`:**

```
{
  id, title, type,
  tsNum, tsDen, ppq,
  ticksPerBeat, ticksPerMeasure, downbeatTick,
  midiTempo, practiceTempo,
  measures: [ { index, notes: [ { midi, offsetTicks, durTicks, isPickup } ] } ],
  parts:    [ { name, startMeasure, bars, repeats } ],  // startMeasure normalized to 0-based here
  hints:    { key, startingNote },
  source
}
```

Pure: no DOM, no audio. Unit-test it with hand-built MIDI fixtures, especially the
pickup cases and the assertions.

---

## 7. `<tune-looper>` component

A vanilla custom element. Takes a `NormalizedTune` (set as a property, not an
attribute — it's an object). Renders its own UI and owns its playback.

### 7.1 UI

- **Header:** tune title, type, time signature, bar count. A small **hint toggle**
  (icon/ghost button). When on, reveals key + "starts on {note}". Off by default.
- **Part bar:** a row of labeled segments (Part A, Part B) sized proportionally to
  their bar counts. Clicking a segment selects that whole part.
- **Measure grid:** a row of numbered cells (bar 1..N). If there's a bar-1 pickup,
  render a narrow lead-in cell before bar 1 (visually distinct, not separately
  selectable — it follows the pickup rule). Click a cell to set the selection start
  (anchor), click another to close the range. Cells in the selection are accented.
  **Anchor state:** while mid-selection (one click made, waiting for the second),
  the anchored cell must look visibly different from a completed range so it's clear
  the first click "took." (Prototype lacked this; add it.)
- **Transport:** play/stop button; tempo slider (defaulted to `practiceTempo`,
  range e.g. 40–180) with a numeric readout.
- **Toggles:** rest bar between loops; metronome; count-in (count-in default on).
- **Playing feedback:** the current measure pulses as it plays.

Follow the ear-first principle: the structural grid is scaffolding and is good; do
**not** add notation.

### 7.2 Playback scheduling

- Tempo is a scheduling number; slowing down never affects pitch.
- Beat/measure durations computed from the slider bpm and the tune's time signature.
- Build the loop body from the selected measures, honoring the **pickup rule** (§4)
  at the seam into the first selected measure and — when rest bar is on — inserting
  one empty bar and suppressing the pickup after it.
- **Count-in:** one bar of metronome before the _first_ iteration only (distinct from
  the between-loops rest bar — different need, don't conflate).
- **Metronome during a rest bar:** click through it (keeps you oriented; staying in
  time across the gap is the skill). Default behavior; make it a choice only if cheap.
- **Tempo change while playing:** prefer ramping `Tone.Transport.bpm` in place over
  tearing down and rebuilding the schedule, so it adjusts smoothly instead of jumping
  to the loop start. (Prototype rebuilt on every change — improve this.)

### 7.3 Component API (imperative + events)

Imperative methods:

```
play()      // start playback (also emits 'tune-play')
stop()      // stop (also emits 'tune-stop')
getState()  // { playing, selStart, selEnd, bpm, restBar, metronome, countIn }
```

Events (`CustomEvent`, `bubbles: true` so the coordinator can listen at the page
level):

```
'tune-play'   detail: { id }
'tune-stop'   detail: { id }
'tune-loop'   detail: { id, iteration }        // optional; fires each loop restart
'tune-measure' detail: { id, measureIndex }    // optional; fires on each bar (page-level bar display)
```

`'tune-loop'` / `'tune-measure'` are optional for v1 — the in-component pulse covers
the core need. Add if the page ever wants a global "now playing bar" display.

### 7.4 Coordinator

```
coordinator.js:
  - collect all <tune-looper> instances on the page (querySelectorAll)
  - listen for 'tune-play' (bubbled) at document level
  - on 'tune-play' from instance X: call .stop() on every OTHER instance
```

Instances stay ignorant of each other; the coordinator is the only set-aware piece.
This _is_ the solo-playback guarantee that keeps the shared `Tone.Transport` safe.

---

## 8. Audio

- **v1:** `Tone.Synth` (simple oscillator) — zero assets, fine for feeling out
  interaction. Beepy but workable.
- **v2:** `Tone.Sampler` with a handful of real instrument samples (fiddle / flute /
  a decent piano) across the pitch range; it interpolates the rest. Much easier on
  the ears for hours of practice. Build against `Synth` first so playback isn't
  blocked on sourcing samples; leave a clean seam to swap in the sampler.
- Metronome: a short percussive synth, accented downbeat vs. weak beats.

---

## 9. Build order (suggested for the Claude Code session)

1. **`midi-loader.js` + tests.** Pure, no deps on DOM/audio. Nail the pickup
   detection and assertions with MIDI fixtures. Everything downstream eats its output.
2. **`<tune-looper>` shell** — render header, part bar, measure grid, controls from a
   `NormalizedTune`. Click-selection with the anchor state. No audio yet.
3. **Playback** — `Tone.Synth`, the loop scheduler honoring the pickup rule,
   count-in, rest bar, metronome, in-place tempo. Measure pulse.
4. **Coordinator + `main.js`** — fetch manifest, load each tune (json + mid), parse
   MIDI, run loader, instantiate components, wire solo playback.
5. **Vite + GH Pages** — `base` set to repo name, build to `/docs`, Pages serves it.
6. **Polish** — hint toggle UX, `Tone.Sampler` swap (v2).

---

## 10. Open decisions (flagged for the author)

- **Build vs. no-build:** Vite recommended; no-build CDN-modules is an acceptable
  fallback. Author to confirm before the coding session.
- **Metronome during rest bar:** default is click-through; confirm you don't want it
  to go silent to mark the boundary.
- **`tune-loop` / `tune-measure` events:** ship in v1 or defer? In-component pulse
  covers the core; these are only needed for a page-level "now playing" readout.
- **Manifest vs. directory scan:** `manifest.json` is explicit and simple on GH Pages
  (no directory listing available). Confirm you're happy authoring the id list.
