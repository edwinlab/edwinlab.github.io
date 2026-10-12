import { JSONPath } from '/tools/vendor/jsonpath-plus/index-browser-esm.js';
import { marked } from '/tools/vendor/marked/marked.esm.js';
self.onmessage = event => {
  const { id, kind, value } = event.data || {};
  try {
    if (kind === 'jsonpath') {
      const results = JSONPath({ path: value.path, json: value.json, resultType: 'all', wrap: true, flatten: false, eval: false, ignoreEvalErrors: false });
      self.postMessage({ id, ok: true, results: results.map(({ path, value: resultValue }) => ({ path, value: resultValue })) });
    } else if (kind === 'markdown') {
      self.postMessage({ id, ok: true, html: marked.parse(value, { gfm: true, breaks: false, async: false }) });
    } else self.postMessage({ id, ok: false, error: 'UNKNOWN_TEST' });
  } catch (error) { self.postMessage({ id, ok: false, error: error.message || 'WORKER_ERROR' }); }
};
