import { Midi } from '@tonejs/midi';
import './tune-looper.js';
import { loadTune } from './midi-loader.js';
import { initCoordinator } from './coordinator.js';

async function fetchTune(id) {
  const [metadata, midiBuffer] = await Promise.all([
    fetch(`tunes/${id}.json`).then((res) => res.json()),
    fetch(`tunes/${id}.mid`).then((res) => res.arrayBuffer()),
  ]);
  return loadTune(metadata, new Midi(midiBuffer));
}

async function main() {
  const manifest = await fetch('tunes/manifest.json').then((res) => res.json());

  document.querySelector('#session-title').textContent = manifest.session;

  const container = document.querySelector('#tunes');
  for (const id of manifest.tunes) {
    try {
      const tune = await fetchTune(id);
      const el = document.createElement('tune-looper');
      el.tune = tune;
      container.appendChild(el);
    } catch (err) {
      console.error(`Failed to load tune "${id}":`, err);
      const errorEl = document.createElement('div');
      errorEl.className = 'tune-load-error';
      errorEl.textContent = `Couldn't load "${id}": ${err.message}`;
      container.appendChild(errorEl);
    }
  }

  initCoordinator(document);
}

main();
