# Feature request: volta (1st/2nd ending) support

Adds 1st/2nd ending (volta) handling to the existing `<tune-looper>` component,
metadata schema, and MIDI loader. Most tunes have different endings on the A and B
parts; the current model treats a part as a flat run of bars and can't represent
"play the body, take ending 1 and repeat, take ending 2 and continue."

This is a change request against the shipped component — it references the existing
pickup rule, loader, grid, and coordinator rather than redefining them. Where this
doc says "as today," keep current behavior.

---

## 1. What a volta actually is (the model)

A 1st/2nd ending is **a branch on the repeat**, not two bits of music appended in
score order. A part with a volta has three chunks: a shared **body**, an **ending 1**,
and an **ending 2**. The as-played sequence for the full part is:

```
body → ending1 → body → ending2
```

Each ending has a musical role, and this drives the playback logic (§4):

- **ending 1** = the turnaround: leads back to the top of its own part.
- **ending 2** = the exit: leads out to whatever comes next (other part / tune end).

Endings are **not always one bar.** They're usually 1 bar but can be longer — e.g.
_Old Man Dillon_'s B part has two **4-bar** voltas. The schema must not assume length.

### MIDI reality

MuseScore exports notes in **score order, one pass, repeats not expanded**: `body,
ending1, ending2` laid out consecutively on the timeline, with **no marker** saying
ending1 and ending2 are alternatives. Bucketed naively by the current loader this
reads as one straight run (body + e1 + e2 played consecutively), which is musically
wrong twice over: it plays e1 and e2 back-to-back (they're alternatives, never
consecutive) and loses the branch. **Therefore voltas must be declared in metadata** —
they are genuinely not recoverable from the note stream alone. The MIDI provides the
notes in score order; the metadata says which bars are body / ending1 / ending2.

---

## 2. Metadata schema change

Replace a volta part's flat `bars` with an explicit body count plus an ordered list
of endings. Parts **without** voltas are unchanged (keep `bars` as today).

```jsonc
{
  "name": "B",
  "startMeasure": 9,        // score-order 1-based position of the part's first body bar
  "bodyBars": 4,            // shared bars, same on every pass
  "endings": [
    { "bars": 4 },          // ending 1 — the next N bars in score order after the body
    { "bars": 4 }           // ending 2 — the N bars after that
  ],
  "repeats": 2              // informational, as today
}

// one-bar volta (the common case):
{ "name": "A", "startMeasure": 1, "bodyBars": 7,
  "endings": [ { "bars": 1 }, { "bars": 1 } ], "repeats": 2 }
```

Rules:

- `endings` is **optional and per-part.** A part may have voltas while the other
  doesn't. Absent `endings` ⇒ plain part, current behavior.
- Endings are **positional in score order** — `endings[0]` is the 1st ending and is
  the run of `endings[0].bars` bars immediately after the body in the MIDI;
  `endings[1]` follows it. This matches MuseScore's export order, so no per-ending
  tick offsets are needed.
- `bars` on a volta part is **removed** in favor of `bodyBars` + `endings`. The loader
  derives whatever counts it needs (§3).
- v1 assumes **exactly two endings** where present (1st/2nd). The list is ordered so
  3+ endings are a future extension, but don't build UI for it now.

---

## 3. Loader changes (`midi-loader.js`)

The loader consumes score-order MIDI. For a volta part starting at score bar
`startMeasure`:

```
body    = the first  bodyBars      bars
ending1 = the next   endings[0].bars bars
ending2 = the next   endings[1].bars bars
MIDI bars consumed by this part = bodyBars + endings[0].bars + endings[1].bars
```

**Two coordinate systems — keep them distinct.** This is the main correctness trap:

- **Score order** (what MuseScore shows, what `startMeasure` and the assertions use):
  ending1 and ending2 occupy _different_ bar numbers. For part B above:
  body = score bars 9–12, ending1 = 13–16, ending2 = 17–20.
- **As-played position** (what the grid displays, what the ear cares about): both
  endings occupy the _same_ slot after the body — "the bars that complete the part."

The loader tags each measure with both: its score index (for slicing/assertions) and
its role (`body` / `ending:1` / `ending:2`) plus its as-played position within the
part. The rest of the app reasons in as-played position; only the loader and
transcription-time assertions touch score order.

**Assertion update.** The part-boundary consistency check becomes:

```
next.startMeasure === this.startMeasure
  + this.bodyBars
  + sum(this.endings.map(e => e.bars))   // 0 if no endings
```

Total-bars assertion sums `bodyBars + all ending bars` across parts against the MIDI's
full-measure count. These assertions run in **score order** and should throw/warn
loudly on mismatch — they catch transcription slips, which are the likely error.

**Normalized model additions.** Each part gains:

```
{
  name, startMeasure /* 0-based as before */, repeats,
  bodyBars,
  endings: [ { bars, measures: [ /* note buckets */ ] },   // may be absent
             { bars, measures: [ ... ] } ],
  bodyMeasures: [ /* note buckets */ ]
}
```

Pickup handling (existing rule) is unaffected — a pickup into the top of a part still
works; it leads into the first body bar.

---

## 4. Playback logic — which ending plays

The live ending is **computed from the selection by default**, and only set manually
as an override. The user should almost never have to pick; the structure picks
correctly, the grid shows what it chose, and they override only to drill a specific
ending.

### 4.1 Full-part selection ⇒ play the branch

If the selection spans a **complete** part (its whole body through where the endings
live), play the real expansion:

```
body → ending1 → body → ending2 → (loop)
```

Rest-bar-between-loops, if on, goes between the **end of the whole expansion** and the
next repeat — not between the internal body repeats. The internal `body→e1→body→e2`
is one musical unit. Pickup rule applies at the outer seam as today.

### 4.2 Fragment selection ending at the volta ⇒ single ending by wrap-target

If the selection is a **fragment** that reaches a part's endings but doesn't span the
whole part, pick **one** ending by where the loop returns:

> **If the loop wraps back to the top of the _same_ part, use ending 1 (the
> turnaround). If the loop continues into a _different_ part, or the selection starts
> outside this part, use ending 2 (the exit).**

Worked cases:

- **Select 7–10** (A-tail into B-body), loop wraps back to bar 7 in A → moving
  _through_ B, not repeating it → **ending 2**. (This is the transition-practice case:
  A → B-body → 2nd ending → back to A.)
- **Select 6–8 inside B** (fragment ending at the volta), loop wraps back to 6, still
  in B → repeating B → **ending 1**.
- **Select just the B part** → full-part ⇒ §4.1 (both endings).

### 4.3 Manual override

If the selection **explicitly includes a specific ending cell** (user clicked the 1st-
or 2nd-ending row), honor that ending regardless of the wrap-target default. This is
the "drill 8a in isolation" path. Clicking an ending row sets the override; changing
the body selection recomputes the default and clears a stale override.

### 4.4 Edge case — selection entirely within the endings

If the selection is _only_ the endings (both, nothing else), play them in order
(ending1 → ending2) as a "compare the two endings" drill. Define it rather than
letting it crash; it's unusual but sensible.

### 4.5 Transition-practice loop target (confirmed intent)

For the 7–10 case, the loop wraps **back to the start of the selection** (bar 7 of A),
looping the A→B join tightly with ending 2 as the bar before the wrap. It does **not**
play ending 2 out into B's continuation — the goal is the seam, not the resolution.
(Standard loop behavior; called out so it isn't "fixed" the other way.)

---

## 5. UI changes — the grid

Volta parts render in a **two-column body/endings layout** instead of the single
continuous measure row:

- **Left column: body** — normal numbered cells, flex-sized to `bodyBars`.
- **Right column: endings** — two stacked rows, 1st ending on top, 2nd below, each
  flex-sized to its `bars`. First cell of each row carries a small bracket-style label
  (`1st` / `2nd`). Columns flex to their bar counts, so a typical **1-bar** volta
  renders as a wide body + a narrow endings column ("body plus a tail"); Old Man
  Dillon's **4-bar** voltas happen to make the columns roughly equal — that's correct,
  not a bug.

Behavior:

- **Cross-seam selection must work.** You can click-drag/click-click a range that
  starts in the body (or in A) and extends **into** an ending — e.g. bars 3–6a. The
  ending cells participate in range selection, not just ending-picking. (The earlier
  mockup blocked this; that was a prototype shortcut — real component must allow it.)
- **Live-ending display.** Highlight the ending the structure chose (§4), dim the
  other, **even when the user didn't pick it**, so it's always visible what will play.
  Recompute on every selection change. A manual override (§4.3) overrides the
  highlight.
- **As-played numbering in the grid.** Both ending rows show the _as-played_ position
  (both occupy the slot after the body), NOT score-order numbers — the ear cares about
  position, not the notation's 13–16 / 17–20 split. (Loader keeps score order
  internally per §3.)
- **Anchor state** while mid-selection stays as today (the fix already specced).

Layout-mode decision to confirm (§7): whether _every_ part renders in the
body/endings frame for consistency (endings column empty on plain parts) or only
volta parts get the two-column treatment.

### Playing feedback

On a full-part play (§4.1) the body cells pulse **twice** per loop (once per pass).
Confirmed acceptable: the double-highlight _is_ the volta lesson; no pass-indicator
needed.

---

## 6. Component API / coordinator

No changes. Solo-playback coordinator and the imperative `play()`/`stop()`/`getState()`
API are unaffected. `getState()` may optionally add the current live-ending if it's
cheap, but it's not required.

---

## 7. Decisions to confirm before implementing

1. **Layout mode:** every part in the body/endings frame (empty endings column when no
   voltas) for visual consistency, vs. only volta parts get two columns? (Author leaned
   "two-column works and is expected"; confirm whether it applies to all parts or only
   volta parts.)
2. **Live-ending default vs. always-manual:** spec above makes live ending _computed
   with manual override_. Confirmed as the intended behavior; flagged here only because
   the alternative (always pick explicitly) is more predictable but more clicks.

## 8. Test fixtures

Add a real transcribed fixture with voltas — **Old Man Dillon** (B part, two 4-bar
voltas) is the stress case for non-trivial ending length. Also add a **1-bar-volta**
tune for the common case. Loader unit tests should cover: score↔as-played mapping, the
boundary/total assertions with endings, and the four playback selection cases in §4
(full-part, fragment-wrap-to-same-part, fragment-into-different-part, endings-only).
