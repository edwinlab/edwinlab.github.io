importScripts('/tools/vendor/jsdiff/diff.js', '/tools/vendor/xml-formatter/xml-formatter.js');
self.onmessage = event => {
  const { id, kind, value } = event.data || {};
  try {
    if (kind === 'diff') {
      const result = Diff.diffArrays(value.left, value.right, {
        comparator: (a, b) => a.text === b.text && a.ending === b.ending,
        maxEditLength: 100,
        timeout: 1000
      });
      self.postMessage({ id, ok: true, changed: result.some(change => change.added || change.removed) });
    } else if (kind === 'xml') {
      self.postMessage({ id, ok: true, formatted: xmlFormatter(value, { indentation: '  ', lineSeparator: '\n', collapseContent: true, throwOnFailure: true }) });
    } else self.postMessage({ id, ok: false, error: 'UNKNOWN_TEST' });
  } catch (error) { self.postMessage({ id, ok: false, error: error.message || 'WORKER_ERROR' }); }
};
