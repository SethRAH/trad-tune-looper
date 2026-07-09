---
name: verifier-tune-looper
description: Drive the Trad Tune Looper in a real headless Chromium (via Playwright) to verify UI and playback-scheduling changes actually work, instead of relying on the Vitest suite's mocked Tone.js.
---

Use this whenever a change touches `src/tune-looper.js`, `src/coordinator.js`,
or anything else on the playback path. The Vitest suite mocks Tone.js
entirely (see the comment at the top of `tests/tune-looper.test.js`) —
it verifies selection/render/event-wiring logic but tells you nothing
about real Transport scheduling. Chromium's Web Audio implementation runs
for real even in headless mode, so this is the only way to exercise the
actual scheduling code short of a human listening in a browser.

## Setup (one-time)

`@playwright/test` is a devDependency and Chromium is already installed
(`npx playwright install chromium`). Nothing else to install.

## Standard drive (always do this)

1. Start the dev server on a fixed port so scripts don't have to parse
   Vite's stdout for the port it picked:
   ```
   npm run dev -- --port 5183 --strictPort
   ```
2. Write a throwaway driver script in the scratchpad (never commit one —
   there's no fixed repro script because the interesting cases change
   with the bug) that:
   - Launches Chromium with `args: ['--autoplay-policy=no-user-gesture-required']`
     (otherwise `Tone.start()` never resolves headless).
   - Navigates to `http://localhost:5183/trad-tune-looper/`.
   - Drives the UI the way a user would: click measure cells
     (`[data-measure-index="N"]`) to select a range, check
     `.tl-rest-bar-toggle` / `.tl-metronome-toggle` / `.tl-count-in-toggle`,
     click `.tl-play-btn`.
   - Polls `document.querySelector('.tl-cell--current')?.dataset.measureIndex`
     every ~500ms for the duration you need and logs the trace. This
     confirms the transport is actually advancing measure-to-measure
     without stalling across loop wraps, rest bars, or tempo changes —
     it catches the "loop never comes back" class of bug even though it
     can't tell you whether a note was silently dropped.
   - Calls `document.querySelector('tune-looper').getState()` before/after
     for a sanity check on toggle state.
   - Takes a screenshot at a meaningful point.
3. Run it with `node <script>.mjs` from the repo root (needs to resolve
   `@playwright/test` from `node_modules`).
4. Kill the dev server when done.

This tier catches: crashes, stalled transport, broken toggles, selection
bugs, anything visible in the DOM.

## When the bug is about a note/click being silently dropped

The DOM highlight trace above won't catch this — the render callback and
the note/metronome callback are separate `scheduleOnce` calls, so a
dropped note doesn't necessarily stall or skip the highlight. Real Web
Audio graphs aren't inspectable well enough for `page.evaluate` to check
"did this oscillator actually fire" reliably, so patch the source
temporarily instead:

1. In `tune-looper.js`, inside the scheduled callback(s) you suspect are
   dropping events, add a one-line guarded push, e.g.:

   ```js
   if (window.__trace) window.__trace.push(['note', cursor + note.offsetTicks]);
   ```

   Do this for whichever callback(s) are in question (note trigger,
   metronome click, or both).

   **Closure-capture gotcha:** compute the tick into a `const` _before_
   the scheduled callback and log that, don't read an outer `let` from
   inside the deferred callback body. `#buildLoopIteration`'s `cursor` is
   a mutable `let` that gets reassigned as the loop advances through
   measures — a callback that captures it and reads `cursor` at fire time
   (rather than at schedule time) will see the _final_ post-loop value
   for every note in that iteration, not the value when it was scheduled.
   `#scheduleMetronomeForMeasure`'s `tick` is a fresh `const` per
   iteration of its loop, so it doesn't have this problem — mirror that
   pattern (snapshot to a `const` right where the tick is computed, log
   that) for any new trace point.

2. In the Playwright driver, `await page.evaluate(() => { window.__trace = []; })`
   before clicking Play, then after your wait window read it back with
   `page.evaluate(() => window.__trace)`.
3. Compute the _expected_ tick sequence by hand from the tune's
   `ticksPerBeat`/`ticksPerMeasure` and the selection/toggle state (the
   same arithmetic `#buildLoopIteration`/`#scheduleMetronomeForMeasure`
   do) and diff it against what actually fired. A gap in the actual trace
   at a tick the expected sequence has is your dropped event, and the
   trace tells you exactly which tick and which loop iteration.
4. **Revert the instrumentation before committing** — it's a debugging
   aid, not permanent code.

## Known limitations

- Headless Chromium's audio thread has real timing but isn't guaranteed
  identical to a real device's DAC latency — for tempo-sensitive or
  borderline-timing fixes, still worth a human ear once before calling it
  done.
- No pixel-perfect audio content check (can't assert "this exact pitch
  played") — the tier-2 recipe above checks _that_ a scheduled callback
  fired at a given tick, not what came out of the synth.
