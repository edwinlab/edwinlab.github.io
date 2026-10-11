import { executeRegex } from './logic.js';
self.onmessage = ({ data }) => {
  const { id, payload } = data || {};
  try { self.postMessage({ id, result: executeRegex(payload) }); }
  catch (cause) { self.postMessage({ id, error: { code: cause.code || 'WORKER_ERROR', message: cause.message || 'Regex worker failed.' } }); }
};
