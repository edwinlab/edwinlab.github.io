export function createSqlRunner({ workerFactory = () => new Worker(new URL('./worker.js', import.meta.url)), timeoutMs = 5000 } = {}) {
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 5000) throw new RangeError('SQL worker timeout must be from 1 to 5,000 ms.');
  let active = null, sequence = 0;
  function cancel() { if (active) active.finish(null, { code: 'CANCELLED', message: 'Formatting cancelled.' }); }
  function run(payload) {
    cancel();
    return new Promise((resolve, reject) => {
      let worker;
      try { worker = workerFactory(); }
      catch { reject(Object.assign(new Error('The SQL formatting worker could not start.'), { code: 'WORKER_ERROR' })); return; }
      const job = { id: ++sequence, worker, timer: null, finish: null };
      job.finish = (result, failure) => {
        if (active !== job) return;
        active = null; clearTimeout(job.timer); worker.terminate();
        if (failure) reject(Object.assign(new Error(failure.message), { code: failure.code })); else resolve(result);
      };
      active = job;
      worker.onmessage = ({ data }) => { if (data.id === job.id) job.finish(data.result, data.error); };
      worker.onerror = event => { event.preventDefault?.(); job.finish(null, { code: 'WORKER_ERROR', message: 'The local SQL formatter worker failed to load.' }); };
      job.timer = setTimeout(() => job.finish(null, { code: 'TIMEOUT', message: 'Formatting exceeded five seconds. Try a smaller query.' }), timeoutMs);
      try { worker.postMessage({ id: job.id, payload }); }
      catch { job.finish(null, { code: 'WORKER_ERROR', message: 'The query could not be sent to the local worker.' }); }
    });
  }
  return { run, cancel };
}
