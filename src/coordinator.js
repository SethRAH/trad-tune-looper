/**
 * Enforces solo playback: <tune-looper> instances never know about each
 * other. This is the only piece that's aware of the instance set, which is
 * what makes sharing Tone.js's single global Transport across instances
 * safe (see PRD §3).
 */
export function initCoordinator(root = document) {
  root.addEventListener('tune-play', (event) => {
    root.querySelectorAll('tune-looper').forEach((instance) => {
      if (instance !== event.target) instance.stop();
    });
  });
}
