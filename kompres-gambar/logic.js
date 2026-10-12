function compressionError(code, message) {
  const error = new Error(message);
  error.code = code;
  throw error;
}

export function summarizeBytes(originalBytes, resultBytes) {
  if (!Number.isSafeInteger(originalBytes) || originalBytes <= 0 ||
      !Number.isSafeInteger(resultBytes) || resultBytes <= 0) {
    compressionError('INVALID_SIZE', 'Ukuran file harus berupa bilangan bulat positif.');
  }
  const deltaBytes = originalBytes - resultBytes;
  return { deltaBytes, savedPercent: (100 * deltaBytes) / originalBytes, isSmaller: resultBytes < originalBytes };
}

export function validateQuality(value) {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 60 || value > 95) {
    compressionError('INVALID_QUALITY', 'Kualitas harus berupa bilangan bulat dari 60 sampai 95.');
  }
  return value;
}

export function formatByteSize(bytes) {
  if (!Number.isSafeInteger(bytes) || bytes < 0) compressionError('INVALID_SIZE', 'Ukuran byte tidak valid.');
  if (bytes < 1024 * 1024) return `${bytes} byte (${(bytes / 1024).toFixed(1).replace('.', ',')} KiB)`;
  return `${bytes} byte (${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MiB)`;
}
