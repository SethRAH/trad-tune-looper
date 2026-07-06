import * as Tone from 'tone';

const TEMPO_MIN = 40;
const TEMPO_MAX = 180;

function partLabelStyle(part) {
  return `flex: ${part.bars} 1 0`;
}

export class TuneLooper extends HTMLElement {
  #tune = null;
  #selStart = null;
  #selEnd = null;
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
    this.#selStart = null;
    this.#selEnd = null;
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

    let cursor = 0;
    if (this.#countIn) {
      cursor = this.#scheduleMetronomeForMeasure(cursor, /* alwaysClick */ true);
    }
    this.#runLoop(cursor, selStart, selEnd, true);

    transport.start();
  }

  #runLoop(cursor, selStart, selEnd, suppressEntryPickup) {
    const loopEnd = this.#buildLoopIteration(
      cursor,
      selStart,
      selEnd,
      suppressEntryPickup,
    );

    let nextCursor = loopEnd;
    if (this.#restBar) {
      nextCursor = this.#scheduleMetronomeForMeasure(loopEnd, /* alwaysClick */ false);
    }
    const suppressNext = this.#restBar;

    const transport = Tone.getTransport();
    // Trigger one tick before nextCursor, never on it: this callback
    // schedules new events *for* nextCursor, and Tone's Timeline snapshots
    // the event list for a tick before invoking it, so anything scheduled
    // for the same tick as this callback is silently dropped.
    transport.scheduleOnce(
      () => {
        if (this.#stopped) return;
        this.#runLoop(nextCursor, selStart, selEnd, suppressNext);
      },
      `${nextCursor - 1}i`,
    );
  }

  #buildLoopIteration(cursor, selStart, selEnd, suppressEntryPickup) {
    const tune = this.#tune;
    const transport = Tone.getTransport();

    for (let m = selStart; m <= selEnd; m += 1) {
      const measure = tune.measures[m];
      const isEntryMeasure = m === selStart;

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
    }

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
      bpm: this.#bpm,
      restBar: this.#restBar,
      metronome: this.#metronome,
      countIn: this.#countIn,
    };
  }

  #onClick = (event) => {
    const cell = event.target.closest('[data-measure-index]');
    const part = event.target.closest('[data-part-index]');
    const playBtn = event.target.closest('.tl-play-btn');
    const hintToggle = event.target.closest('.tl-hint-toggle');

    if (cell) {
      this.#selectMeasure(Number(cell.dataset.measureIndex));
    } else if (part) {
      this.#selectPart(Number(part.dataset.partIndex));
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

  #selectMeasure(measureIndex) {
    if (this.#selStart === null || this.#selEnd !== null) {
      this.#selStart = measureIndex;
      this.#selEnd = null;
    } else {
      this.#selEnd = measureIndex;
      if (this.#selEnd < this.#selStart) {
        [this.#selStart, this.#selEnd] = [this.#selEnd, this.#selStart];
      }
    }
    this.#render();
  }

  #selectPart(partIndex) {
    const part = this.#tune.parts[partIndex];
    this.#selStart = part.startMeasure;
    this.#selEnd = part.startMeasure + part.bars - 1;
    this.#render();
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

    const totalBars = tune.parts.reduce((sum, part) => sum + part.bars, 0);
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

    const gridHtml = tune.measures
      .map((measure) => {
        const isCurrent =
          measure.index === this.#currentMeasure ? 'tl-cell--current' : '';
        return `
          <button type="button" class="tl-cell ${this.#cellClass(measure.index)} ${isCurrent}"
                  data-measure-index="${measure.index}">
            ${measure.index + 1}
          </button>`;
      })
      .join('');

    const hintsHtml = this.#hintsVisible
      ? `<div class="tl-hints">
           ${tune.hints.key ? `<span class="tl-hint-key">Key: ${tune.hints.key}</span>` : ''}
           ${tune.hints.startingNote ? `<span class="tl-hint-start">Starts on ${tune.hints.startingNote}</span>` : ''}
         </div>`
      : '';

    this.innerHTML = `
      <div class="tl-header">
        <span class="tl-title">${tune.title}</span>
        <span class="tl-type">${tune.type}</span>
        <span class="tl-timesig">${tune.tsNum}/${tune.tsDen}</span>
        <span class="tl-barcount">${totalBars} bars</span>
        <button type="button" class="tl-hint-toggle" aria-pressed="${this.#hintsVisible}">?</button>
        ${hintsHtml}
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
