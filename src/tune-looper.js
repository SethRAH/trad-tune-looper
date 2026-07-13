import * as Tone from 'tone';
import { partScoreBars } from './midi-loader.js';

const TEMPO_MIN = 40;
const TEMPO_MAX = 180;

// The parts-label row and the grid row must agree on how wide each part is,
// or the "A"/"B" buttons drift out of alignment with their own cells below.
// partScoreBars() (body + sum of every ending's bars) is the right measure
// for bar-count totals, but not for width: the two endings render as
// *stacked* rows sharing one column, so the on-screen width only needs to
// fit the wider one of the two, not both summed.
function partVisualWidth(part) {
  if (!part.endings) return part.bars;
  return part.bodyBars + Math.max(...part.endings.map((e) => e.bars));
}

function partLabelStyle(part) {
  return `flex: ${partVisualWidth(part)} 1 0`;
}

function findEndingContaining(tune, measureIndex) {
  for (const part of tune.parts) {
    if (!part.endings) continue;
    for (let endingIndex = 0; endingIndex < part.endings.length; endingIndex += 1) {
      if (part.endings[endingIndex].measures.includes(measureIndex)) {
        return { part, endingIndex };
      }
    }
  }
  return null;
}

function findOwningPart(tune, measureIndex) {
  for (const part of tune.parts) {
    if (part.endings) {
      if (part.bodyMeasures.includes(measureIndex)) return part;
      if (part.endings.some((e) => e.measures.includes(measureIndex))) return part;
    } else if (
      measureIndex >= part.startMeasure &&
      measureIndex < part.startMeasure + part.bars
    ) {
      return part;
    }
  }
  return null;
}

export class TuneLooper extends HTMLElement {
  #tune = null;
  #selStart = null;
  #selEnd = null;
  #wholeTuneSelected = false;
  #endingOverride = null;
  #playing = false;
  #bpm = null;
  #restBar = false;
  #metronome = false;
  #countIn = true;
  #hintsVisible = false;
  #currentMeasure = null;

  #synth = null;
  #metronomeSynth = null;
  #stopped = true;

  set tune(value) {
    this.#teardownPlayback();
    this.#playing = false;
    this.#currentMeasure = null;
    this.#tune = value;
    this.#bpm = value.practiceTempo;
    this.#setSelection(null, null, false);
    this.#hintsVisible = false;
    this.#render();
  }

  get tune() {
    return this.#tune;
  }

  connectedCallback() {
    this.addEventListener('click', this.#onClick);
    this.addEventListener('input', this.#onInput);
    this.#render();
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.#onClick);
    this.removeEventListener('input', this.#onInput);
    this.#teardownPlayback();
  }

  play() {
    this.#teardownPlayback();
    this.#playing = true;
    this.#stopped = false;
    this.dispatchEvent(
      new CustomEvent('tune-play', { bubbles: true, detail: { id: this.#tune.id } }),
    );
    this.#render();

    Tone.start().then(() => {
      if (this.#stopped) return;
      this.#startSchedule();
    });
  }

  stop() {
    this.#teardownPlayback();
    this.#playing = false;
    this.#currentMeasure = null;
    this.dispatchEvent(
      new CustomEvent('tune-stop', { bubbles: true, detail: { id: this.#tune.id } }),
    );
    this.#render();
  }

  #teardownPlayback() {
    this.#stopped = true;
    const transport = Tone.getTransport();
    transport.stop();
    transport.cancel(0);
    if (this.#synth) {
      this.#synth.dispose();
      this.#synth = null;
    }
    if (this.#metronomeSynth) {
      this.#metronomeSynth.dispose();
      this.#metronomeSynth = null;
    }
  }

  #startSchedule() {
    const tune = this.#tune;
    const transport = Tone.getTransport();
    transport.PPQ = tune.ppq;
    transport.bpm.value = this.#bpm;

    this.#synth = new Tone.Synth().toDestination();
    this.#metronomeSynth = new Tone.MembraneSynth().toDestination();

    const selStart = this.#selStart ?? 0;
    const selEnd = this.#selEnd ?? tune.measures.length - 1;
    const measureSequence = this.#buildMeasureSequence(selStart, selEnd);

    let cursor = 0;
    if (this.#countIn) {
      cursor = this.#scheduleMetronomeForMeasure(cursor, /* alwaysClick */ true);
    }
    // The pickup rule (PRD §4) suppresses a pickup reached out of silence —
    // but starting playback at the tune's actual first bar isn't silence,
    // it's the tune's own beginning, so only suppress here when playback
    // enters somewhere other than measure 0.
    const suppressInitialPickup = measureSequence[0] !== 0;
    // A pickup note's offsetTicks is negative (it leads into the downbeat),
    // so without a count-in bar to push `cursor` forward first, `cursor +
    // offsetTicks` goes negative and Tone.js can't schedule it. Reserve the
    // pickup's own duration as lead-in so its earliest note lands at tick 0
    // instead.
    if (!suppressInitialPickup) {
      cursor = Math.max(cursor, tune.downbeatTick);
    }
    this.#runLoop(cursor, measureSequence, suppressInitialPickup);

    transport.start();
  }

  #expandPart(part) {
    if (!part.endings) {
      const bars = [];
      for (let m = part.startMeasure; m < part.startMeasure + part.bars; m += 1)
        bars.push(m);
      const repeats = part.repeats ?? 1;
      const range = [];
      for (let r = 0; r < repeats; r += 1) range.push(...bars);
      return range;
    }
    // `repeats` is informational for a volta part (PRD §2) — the
    // body->ending1->body->ending2 cycle already *is* the full repeat (the
    // body is played once per ending), so it must not be multiplied again.
    return [
      ...part.bodyMeasures,
      ...part.endings[0].measures,
      ...part.bodyMeasures,
      ...part.endings[1].measures,
    ];
  }

  #buildWholeTuneSequence() {
    const seq = [];
    for (const part of this.#tune.parts) {
      seq.push(...this.#expandPart(part));
    }
    return seq;
  }

  #buildFullPartSequence(part) {
    return this.#expandPart(part);
  }

  #buildEndingsOnlySequence(part) {
    return [...part.endings[0].measures, ...part.endings[1].measures];
  }

  #buildFragmentSequence(selStart, selEnd, classification) {
    const { part, endingIndex: targetIndex } = classification;
    const rawEnding = findEndingContaining(this.#tune, selEnd);

    if (!rawEnding) {
      const seq = [];
      for (let m = selStart; m <= selEnd; m += 1) seq.push(m);
      return seq;
    }

    // A literal selStart..selEnd walk would pass through whichever ending
    // sits *between* the body and the target ending in score order (e1
    // always precedes e2) — e1/e2 are alternatives at the same as-played
    // slot, not a contiguous run, so always rebuild explicitly as
    // body-through-selStart + the target ending's parallel bars, rather
    // than ever walking a flat range through the endings block.
    const rawMeasures = rawEnding.part.endings[rawEnding.endingIndex].measures;
    const offset = rawMeasures.indexOf(selEnd);
    const targetMeasures = part.endings[targetIndex].measures.slice(0, offset + 1);
    const bodyLast = part.bodyMeasures[part.bodyMeasures.length - 1];

    const seq = [];
    for (let m = selStart; m <= bodyLast; m += 1) seq.push(m);
    seq.push(...targetMeasures);
    return seq;
  }

  #buildMeasureSequence(selStart, selEnd) {
    // With nothing selected at all, play the whole tune the same correct
    // way "Whole Tune" does (repeats/voltas expanded) rather than a naive
    // score-order walk through the raw measures array.
    if (this.#wholeTuneSelected || this.#selStart === null) {
      return this.#buildWholeTuneSequence();
    }

    const classification = this.#classifySelection();
    switch (classification.kind) {
      case 'full-part':
        return this.#buildFullPartSequence(classification.part);
      case 'endings-only':
        return this.#buildEndingsOnlySequence(classification.part);
      case 'fragment-wrap':
        return this.#buildFragmentSequence(selStart, selEnd, classification);
      default: {
        const seq = [];
        for (let m = selStart; m <= selEnd; m += 1) seq.push(m);
        return seq;
      }
    }
  }

  #runLoop(cursor, measureSequence, suppressEntryPickup) {
    const loopEnd = this.#buildLoopIteration(
      cursor,
      measureSequence,
      suppressEntryPickup,
    );

    let nextCursor = loopEnd;
    if (this.#restBar) {
      nextCursor = this.#scheduleMetronomeForMeasure(loopEnd, /* alwaysClick */ false);
    }
    const suppressNext = this.#restBar;

    const transport = Tone.getTransport();
    // Build the next iteration's events right after *this* one starts, not
    // right before it's due. This callback itself is firing at tick
    // `cursor` (Tone's Timeline snapshots the event list for the tick
    // before invoking a callback, so scheduling for that same tick from
    // inside it gets silently dropped) — one tick later is the earliest
    // safe point, and it buys a full iteration's worth of lead time before
    // nextCursor, instead of the single tick we'd have scheduling right at
    // the boundary. Tone's Transport clock processes ticks in real-time
    // lookahead batches, not one at a time, so that single tick of margin
    // isn't reliably enough — this was silently dropping the resumed
    // measure's downbeat note and click on loop wrap.
    transport.scheduleOnce(
      () => {
        if (this.#stopped) return;
        this.#runLoop(nextCursor, measureSequence, suppressNext);
      },
      `${cursor + 1}i`,
    );
  }

  #buildLoopIteration(cursor, measureSequence, suppressEntryPickup) {
    const tune = this.#tune;
    const transport = Tone.getTransport();

    measureSequence.forEach((m, i) => {
      const measure = tune.measures[m];
      const isEntryMeasure = i === 0;

      transport.scheduleOnce(() => {
        if (this.#stopped) return;
        this.#currentMeasure = m;
        this.#render();
      }, `${cursor}i`);

      for (const note of measure.notes) {
        if (note.isPickup && isEntryMeasure && suppressEntryPickup) continue;

        transport.scheduleOnce(
          (time) => {
            if (this.#stopped) return;
            const freq = Tone.Frequency(note.midi, 'midi').toFrequency();
            const durSeconds = transport.toSeconds(`${note.durTicks}i`);
            this.#synth.triggerAttackRelease(freq, durSeconds, time);
          },
          `${cursor + note.offsetTicks}i`,
        );
      }

      if (this.#metronome) {
        cursor = this.#scheduleMetronomeForMeasure(cursor, false);
      } else {
        cursor += tune.ticksPerMeasure;
      }
    });

    return cursor;
  }

  #scheduleMetronomeForMeasure(startTick, alwaysClick) {
    const tune = this.#tune;
    const transport = Tone.getTransport();

    for (let beat = 0; beat < tune.tsNum; beat += 1) {
      const tick = startTick + beat * tune.ticksPerBeat;
      transport.scheduleOnce((time) => {
        if (this.#stopped) return;
        if (!alwaysClick && !this.#metronome) return;
        const pitch = beat === 0 ? 'C3' : 'C2';
        this.#metronomeSynth.triggerAttackRelease(pitch, '32n', time);
      }, `${tick}i`);
    }

    return startTick + tune.ticksPerMeasure;
  }

  getState() {
    return {
      playing: this.#playing,
      selStart: this.#selStart,
      selEnd: this.#selEnd,
      wholeTuneSelected: this.#wholeTuneSelected,
      bpm: this.#bpm,
      restBar: this.#restBar,
      metronome: this.#metronome,
      countIn: this.#countIn,
    };
  }

  #onClick = (event) => {
    const cell = event.target.closest('[data-measure-index]');
    const part = event.target.closest('[data-part-index]');
    const selectAll = event.target.closest('.tl-select-all');
    const playBtn = event.target.closest('.tl-play-btn');
    const hintToggle = event.target.closest('.tl-hint-toggle');

    if (cell) {
      this.#selectMeasure(Number(cell.dataset.measureIndex), cell.dataset.endingRole);
    } else if (part) {
      this.#selectPart(Number(part.dataset.partIndex));
    } else if (selectAll) {
      this.#selectAll();
    } else if (playBtn) {
      this.#playing ? this.stop() : this.play();
    } else if (hintToggle) {
      this.#hintsVisible = !this.#hintsVisible;
      this.#render();
    }
  };

  #onInput = (event) => {
    if (event.target.matches('.tl-tempo-slider')) {
      this.#bpm = Number(event.target.value);
      if (this.#playing) {
        Tone.getTransport().bpm.value = this.#bpm;
      }
      this.#render();
    } else if (event.target.matches('.tl-rest-bar-toggle')) {
      this.#restBar = event.target.checked;
    } else if (event.target.matches('.tl-metronome-toggle')) {
      this.#metronome = event.target.checked;
    } else if (event.target.matches('.tl-count-in-toggle')) {
      this.#countIn = event.target.checked;
    }
  };

  #setSelection(selStart, selEnd, wholeTuneSelected, endingOverride = null) {
    this.#selStart = selStart;
    this.#selEnd = selEnd;
    this.#wholeTuneSelected = wholeTuneSelected;
    this.#endingOverride = endingOverride;
  }

  #selectMeasure(measureIndex, endingRole) {
    const override = endingRole ? Number(endingRole) : null;
    if (this.#selStart === null || this.#selEnd !== null) {
      this.#setSelection(measureIndex, null, false, override);
    } else {
      let [start, end] = [this.#selStart, measureIndex];
      if (end < start) [start, end] = [end, start];
      this.#setSelection(start, end, false, override);
    }
    this.#render();
  }

  #selectPart(partIndex) {
    const part = this.#tune.parts[partIndex];
    this.#setSelection(
      part.startMeasure,
      part.startMeasure + partScoreBars(part) - 1,
      false,
    );
    this.#render();
  }

  #selectAll() {
    this.#setSelection(0, this.#tune.measures.length - 1, true);
    this.#render();
  }

  #isFullPartSelection() {
    if (this.#selStart === null || this.#selEnd === null) return null;
    for (const part of this.#tune.parts) {
      if (!part.endings) continue;
      const bars = partScoreBars(part);
      if (
        this.#selStart === part.startMeasure &&
        this.#selEnd === part.startMeasure + bars - 1
      ) {
        return part;
      }
    }
    return null;
  }

  #classifySelection() {
    if (this.#selStart === null || this.#selEnd === null) {
      return { kind: 'plain' };
    }

    const fullPart = this.#isFullPartSelection();
    if (fullPart) return { kind: 'full-part', part: fullPart };

    const endEnding = findEndingContaining(this.#tune, this.#selEnd);
    if (!endEnding) return { kind: 'plain' };

    const startEnding = findEndingContaining(this.#tune, this.#selStart);
    if (startEnding && startEnding.part === endEnding.part) {
      if (startEnding.endingIndex !== endEnding.endingIndex) {
        return { kind: 'endings-only', part: endEnding.part };
      }
      // Selection is already confined to a single ending — unambiguous.
      return { kind: 'plain' };
    }

    if (this.#endingOverride !== null) {
      return {
        kind: 'fragment-wrap',
        part: endEnding.part,
        endingIndex: this.#endingOverride - 1,
        override: true,
      };
    }

    const selStartPart = findOwningPart(this.#tune, this.#selStart);
    const wantsEnding1 = selStartPart === endEnding.part;
    return {
      kind: 'fragment-wrap',
      part: endEnding.part,
      endingIndex: wantsEnding1 ? 0 : 1,
      override: false,
    };
  }

  #cellClass(measureIndex) {
    if (this.#selStart === null) return '';
    if (this.#selEnd === null) {
      return measureIndex === this.#selStart ? 'tl-cell--anchored' : '';
    }
    if (measureIndex >= this.#selStart && measureIndex <= this.#selEnd) {
      return 'tl-cell--selected';
    }
    return '';
  }

  #render() {
    const tune = this.#tune;
    if (!tune) {
      this.innerHTML = '';
      return;
    }

    const totalBars = tune.parts.reduce((sum, part) => sum + partScoreBars(part), 0);
    const barCountLabel = this.#wholeTuneSelected
      ? `${tune.parts.reduce((sum, part) => sum + partScoreBars(part) * (part.repeats ?? 1), 0)} bars with repeats`
      : `${totalBars} bars`;
    const hasBarOnePickup = tune.downbeatTick > 0;
    const pickupCellHtml = hasBarOnePickup
      ? '<span class="tl-cell tl-cell--pickup" aria-hidden="true"></span>'
      : '';

    const partsHtml = tune.parts
      .map(
        (part, i) => `
          <button type="button" class="tl-part" data-part-index="${i}" style="${partLabelStyle(part)}">
            ${part.name}
          </button>`,
      )
      .join('');

    const renderCell = (measureIndex, label, opts = {}) => {
      const isCurrent = measureIndex === this.#currentMeasure ? 'tl-cell--current' : '';
      const firstClass = opts.isFirst ? 'tl-ending-cell--first' : '';
      const endingAttr = opts.endingRole ? ` data-ending-role="${opts.endingRole}"` : '';
      const bracket = opts.isFirst
        ? `<span class="tl-ending-label">${opts.endingRole === 1 ? '1st' : '2nd'}</span>`
        : '';
      return `
        <button type="button" class="tl-cell ${this.#cellClass(measureIndex)} ${isCurrent} ${firstClass}"
                data-measure-index="${measureIndex}"${endingAttr}>
          ${bracket}${label}
        </button>`;
    };

    const classification = this.#classifySelection();
    const liveEndingFor = (part) => {
      if (classification.kind !== 'fragment-wrap' || classification.part !== part)
        return null;
      return classification.endingIndex;
    };

    // As-played bar numbers run once, continuously, across the whole tune —
    // not the raw score index (which double-counts whichever ending isn't
    // showing) and not a per-ending-row-local count (which would restart at
    // 1 for every ending row). Both endings of a part share the same
    // number(s), since they're alternatives at the same as-played slot.
    let displayCounter = 1;

    const gridHtml = tune.parts
      .map((part) => {
        if (!part.endings) {
          const cells = [];
          for (let m = part.startMeasure; m < part.startMeasure + part.bars; m += 1) {
            cells.push(renderCell(m, displayCounter));
            displayCounter += 1;
          }
          return cells.join('');
        }

        const live = liveEndingFor(part);
        const rowClass = (idx) =>
          live === null
            ? ''
            : live === idx
              ? 'tl-ending-row--live'
              : 'tl-ending-row--dim';

        const bodyCellsHtml = part.bodyMeasures
          .map((m) => {
            const html = renderCell(m, displayCounter);
            displayCounter += 1;
            return html;
          })
          .join('');

        const endingsStartLabel = displayCounter;
        const endingsWidth = Math.max(...part.endings.map((e) => e.bars));
        const endingRowsHtml = part.endings
          .map((ending, endingIdx) => {
            const cellsHtml = ending.measures
              .map((m, i) =>
                renderCell(m, endingsStartLabel + i, {
                  endingRole: endingIdx + 1,
                  isFirst: i === 0,
                }),
              )
              .join('');
            return `
              <div class="tl-ending-row ${rowClass(endingIdx)}" style="flex: ${ending.bars} 1 0">
                ${cellsHtml}
              </div>`;
          })
          .join('');
        displayCounter = endingsStartLabel + endingsWidth;

        return `
          <div class="tl-part-frame" style="flex: ${partVisualWidth(part)} 1 0">
            <div class="tl-part-body" style="flex: ${part.bodyBars} 1 0">${bodyCellsHtml}</div>
            <div class="tl-part-endings" style="flex: ${endingsWidth} 1 0">${endingRowsHtml}</div>
          </div>`;
      })
      .join('');

    const hintsHtml = this.#hintsVisible
      ? `<div class="tl-hints">
           ${tune.hints.key ? `<span class="tl-hint-key">Key: ${tune.hints.key}</span>` : ''}
           ${tune.hints.startingNote ? `<span class="tl-hint-start">Starts on ${tune.hints.startingNote}</span>` : ''}
         </div>`
      : '';

    const attributionHtml = tune.attribution
      ? `<div class="tl-attribution">
           Contains information from <a href="${tune.attribution.sourceUrl}" target="_blank" rel="noopener">${tune.attribution.source}</a>,
           which is made available here under the Open Database License
           (<a href="${tune.attribution.licenseUrl}" target="_blank" rel="noopener">${tune.attribution.license}</a>).
           ${
             tune.attribution.contributor
               ? `Added by ${tune.attribution.contributor}${tune.attribution.contributedDate ? ` on ${tune.attribution.contributedDate}` : ''}.`
               : ''
           }
         </div>`
      : '';

    this.innerHTML = `
      <div class="tl-header">
        <span class="tl-title">${tune.title}</span>
        <span class="tl-type">${tune.type}</span>
        <span class="tl-timesig">${tune.tsNum}/${tune.tsDen}</span>
        <span class="tl-barcount">${barCountLabel}</span>
        <button type="button" class="tl-hint-toggle" aria-pressed="${this.#hintsVisible}">?</button>
        ${hintsHtml}
      </div>
      ${attributionHtml}
      <div class="tl-select-all-row">
        <button type="button" class="tl-select-all">Whole Tune</button>
      </div>
      <div class="tl-parts">
        ${pickupCellHtml}
        ${partsHtml}
      </div>
      <div class="tl-grid">
        ${pickupCellHtml}
        ${gridHtml}
      </div>
      <div class="tl-transport">
        <button type="button" class="tl-play-btn">${this.#playing ? 'Stop' : 'Play'}</button>
        <input type="range" class="tl-tempo-slider" min="${TEMPO_MIN}" max="${TEMPO_MAX}" value="${this.#bpm}" />
        <span class="tl-tempo-readout">${this.#bpm} bpm</span>
      </div>
      <div class="tl-toggles">
        <label><input type="checkbox" class="tl-rest-bar-toggle" ${this.#restBar ? 'checked' : ''} /> Rest bar</label>
        <label><input type="checkbox" class="tl-metronome-toggle" ${this.#metronome ? 'checked' : ''} /> Metronome</label>
        <label><input type="checkbox" class="tl-count-in-toggle" ${this.#countIn ? 'checked' : ''} /> Count-in</label>
      </div>
    `;
  }
}

customElements.define('tune-looper', TuneLooper);
