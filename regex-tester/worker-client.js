import { validateRequest } from './logic.js';
export function createRegexRunner({ workerFactory = () => new Worker(new URL('./worker.js', import.meta.url), { type: 'module' }), timeoutMs = 2000 } = {}) {
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 2000) throw new RangeError('Timeout must be between 1 and 2,000 ms.');
  let active = null, sequence = 0;
  function cancel() { active?.finish(null, { code: 'CANCELLED', message: 'Cancelled. Edit the pattern or run again.' }); }
  function run(payload) {
    cancel();
    return new Promise((resolve, reject) => {
      let worker, request;
      try { request = validateRequest(payload); worker = workerFactory(); }
      catch (cause) { reject(Object.assign(new Error(cause.code ? cause.message : 'Web Workers are unavailable. Regex cannot run in this browser.'), { code: cause.code || 'WORKER_UNAVAILABLE' })); return; }
      const job = { id: ++sequence, timer: null, finish: null };
      job.finish = (result, error) => {
        if (active !== job) return;
        active = null; clearTimeout(job.timer); worker.terminate();
        if (error) reject(Object.assign(new Error(error.message), { code: error.code })); else resolve(result);
      };
      active = job;
      worker.onmessage = ({ data }) => { if (data?.id === job.id) job.finish(data.result, data.error); };
      worker.onerror = event => { event.preventDefault?.(); job.finish(null, { code: 'WORKER_ERROR', message: 'Regex worker failed. Refresh the page and try again.' }); };
      job.timer = setTimeout(() => job.finish(null, { code: 'TIMEOUT', message: 'Timed out after two seconds. Worker stopped. Shorten the sample or simplify the pattern.' }), timeoutMs);
      try { worker.postMessage({ id: job.id, payload: request }); }
      catch { job.finish(null, { code: 'WORKER_ERROR', message: 'The regex request could not be sent to the worker.' }); }
    });
  }
  return { run, cancel };
}
