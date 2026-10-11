importScripts('/tools/vendor/sql-formatter/sql-formatter.min.js');
const formatModule = import('./logic.js');
self.onmessage = async ({ data }) => {
  const { id, payload } = data || {};
  try {
    const { formatSql } = await formatModule;
    const result = formatSql(payload.text, payload.options, self.sqlFormatter);
    self.postMessage({ id, result });
  } catch (cause) {
    self.postMessage({ id, error: { code: cause.code || 'FORMAT_FAILED', message: cause.message || 'Formatting failed.' } });
  }
};
