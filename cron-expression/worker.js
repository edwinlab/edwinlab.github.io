import { explainCron } from './logic.js';

self.onmessage = ({ data }) => {
  const { id, payload } = data;
  try {
    const result = explainCron(payload.expression, payload.reference, payload.timezone, payload.options);
    self.postMessage({ id, result });
  } catch (error) {
    self.postMessage({ id, error: { code: error.code || 'CALCULATION_ERROR', message: error.message } });
  }
};
