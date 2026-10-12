import { encodeHashText, validateAlgorithm, digestBytes } from './logic.js';
self.onmessage = async ({ data }) => {
  const { id, algorithm, mode, text, file } = data;
  try {
    validateAlgorithm(algorithm);
    let input;
    if (mode === 'text') input = encodeHashText(text);
    else if (mode === 'file' && file instanceof Blob && file.size <= 20 * 1024 * 1024) input = new Uint8Array(await file.arrayBuffer());
    else throw Object.assign(new Error('File input exceeds 20 MiB or is unavailable.'), { code: 'INPUT_TOO_LARGE' });
    const digest = await digestBytes(input, algorithm, (name, data) => crypto.subtle.digest(name, data));
    self.postMessage({ id, digest });
  } catch (error) { self.postMessage({ id, error: { code: error.code || 'DIGEST_FAILED', message: error.message || 'Hashing failed.' } }); }
};
