export function createCronRunner({ workerFactory = () => new Worker(new URL('./worker.js', import.meta.url), { type: 'module' }), timeoutMs = 2000 } = {}) {
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 2000) throw new RangeError('Worker timeout must be between 1 and 2000 ms.');
  let active = null;
  let sequence = 0;
  function cancel() {
    if (active) active.finish(null, { code: 'CANCELLED', message: 'Calculation cancelled.' });
  }
  function run(payload) {
    cancel();
    return new Promise((resolve, reject) => {
      let worker;
      try { worker = workerFactory(); }
      catch { reject(Object.assign(new Error('Could not start the calculation worker. Please serve the page over HTTP(S).'), { code: 'WORKER_ERROR' })); return; }
      const job = { id: ++sequence, worker, timer: null, finish: null };
      job.finish = (result, error) => {
        if (active !== job) return;
        active = null;
        clearTimeout(job.timer);
        worker.terminate();
        if (error) reject(Object.assign(new Error(error.message), { code: error.code }));
        else resolve(result);
      };
      active = job;
      worker.onmessage = ({ data }) => {
        if (data.id !== job.id) return;
        job.finish(data.result, data.error);
      };
      worker.onerror = event => {
        event.preventDefault?.();
        job.finish(null, { code: 'WORKER_ERROR', message: 'The calculation worker failed to load or calculate.' });
      };
      job.timer = setTimeout(() => job.finish(null, { code: 'TIMEOUT', message: 'Calculation exceeded the two-second limit. Try a simpler expression or another reference.' }), timeoutMs);
      try { worker.postMessage({ id: job.id, payload }); }
      catch { job.finish(null, { code: 'WORKER_ERROR', message: 'Could not send the calculation to the worker.' }); }
    });
  }
  return { run, cancel };
}
