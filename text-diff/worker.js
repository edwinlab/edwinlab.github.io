importScripts('/tools/vendor/jsdiff/diff.js');
const logicPromise = import('./logic.js');
self.onmessage = async event => {
  const { id, left, right } = event.data || {};
  try {
    const { compareText, formatDiffReport } = await logicPromise;
    const result = compareText(left, right, { diffArrays: self.Diff.diffArrays });
    self.postMessage({ id, ok: true, result, report: formatDiffReport(result) });
  } catch (error) { self.postMessage({ id, ok: false, code: error.code || 'PROCESSING_ERROR', message: error.message || 'Unable to compare these texts.' }); }
};
