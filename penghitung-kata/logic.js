const MAX_CODE_POINTS = 100_000;
const MAX_UTF8_BYTES = 400_000;
const MAX_SUMMARY_BYTES = 2 * 1024;
const ASCII_TRIM = /^[\x09-\x0d\x20]+|[\x09-\x0d\x20]+$/g;
const WHITESPACE_GRAPHEME = /^\s+$/u;

function codedError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function utf8LengthOfCodePoint(point) {
  if (point <= 0x7f) return 1;
  if (point <= 0x7ff) return 2;
  if (point <= 0xffff) return 3;
  return 4;
}

function assertInputBounds(text) {
  if (typeof text !== 'string') throw new TypeError('Teks harus berupa string.');
  let codePoints = 0;
  let utf8Bytes = 0;
  for (const character of text) {
    codePoints += 1;
    utf8Bytes += utf8LengthOfCodePoint(character.codePointAt(0));
    if (codePoints > MAX_CODE_POINTS || utf8Bytes > MAX_UTF8_BYTES) {
      throw codedError('INPUT_TOO_LARGE', 'Teks melewati batas 100.000 code points atau 400.000 byte UTF-8.');
    }
  }
}

export function parseReadingRate(raw) {
  if (typeof raw !== 'string' || raw.length > 8) {
    throw codedError('INVALID_READING_RATE', 'Kecepatan baca harus berupa bilangan bulat 50–1.000 kata per menit.');
  }
  const value = raw.replace(ASCII_TRIM, '');
  if (!/^[0-9]+$/.test(value)) {
    throw codedError('INVALID_READING_RATE', 'Gunakan angka bulat tanpa tanda atau desimal untuk kecepatan baca.');
  }
  const rate = Number(value);
  if (!Number.isInteger(rate) || rate < 50 || rate > 1000) {
    throw codedError('INVALID_READING_RATE', 'Kecepatan baca harus antara 50 dan 1.000 kata per menit.');
  }
  return rate;
}

export function createSegmenters(intl = globalThis.Intl) {
  try {
    const Segmenter = intl?.Segmenter;
    if (typeof Segmenter !== 'function' || typeof Segmenter.supportedLocalesOf !== 'function' ||
        Segmenter.supportedLocalesOf(['id']).length === 0) {
      throw new Error('Locale Indonesia tidak didukung.');
    }
    return {
      word: new Segmenter('id', { granularity: 'word' }),
      grapheme: new Segmenter('id', { granularity: 'grapheme' }),
    };
  } catch {
    throw codedError('SEGMENTER_UNAVAILABLE', 'Browser belum mendukung segmentasi kata dan karakter untuk Bahasa Indonesia. Perbarui browser atau coba browser lain.');
  }
}

function ensureSegmenters(segmenters) {
  if (!segmenters || typeof segmenters.word?.segment !== 'function' || typeof segmenters.grapheme?.segment !== 'function') {
    throw codedError('SEGMENTER_UNAVAILABLE', 'Browser belum mendukung segmentasi kata dan karakter untuk Bahasa Indonesia. Perbarui browser atau coba browser lain.');
  }
}

function countParagraphs(text) {
  if (text.length === 0) return 0;
  let paragraphs = 0;
  let insideParagraph = false;
  let lineStart = 0;
  for (let index = 0; index <= text.length; index += 1) {
    if (index !== text.length && text[index] !== '\n') continue;
    const blank = text.slice(lineStart, index).trim() === '';
    if (blank) insideParagraph = false;
    else if (!insideParagraph) {
      paragraphs += 1;
      insideParagraph = true;
    }
    lineStart = index + 1;
  }
  return paragraphs;
}

export function countText(text, wordsPerMinute, segmenters) {
  assertInputBounds(text);
  if (!Number.isInteger(wordsPerMinute) || wordsPerMinute < 50 || wordsPerMinute > 1000) {
    throw codedError('INVALID_READING_RATE', 'Kecepatan baca harus antara 50 dan 1.000 kata per menit.');
  }
  ensureSegmenters(segmenters);
  const normalized = text.replace(/\r\n?/g, '\n');
  let words = 0;
  let characters = 0;
  let charactersWithoutWhitespace = 0;
  let newlines = 0;

  try {
    for (const part of segmenters.word.segment(normalized)) {
      if (part.isWordLike === true) words += 1;
    }
    for (const part of segmenters.grapheme.segment(normalized)) {
      characters += 1;
      if (!WHITESPACE_GRAPHEME.test(part.segment)) charactersWithoutWhitespace += 1;
    }
  } catch {
    throw codedError('SEGMENTER_UNAVAILABLE', 'Browser gagal menyegmentasi teks. Perbarui browser atau coba browser lain.');
  }

  for (let index = 0; index < normalized.length; index += 1) {
    if (normalized[index] === '\n') newlines += 1;
  }
  const lines = normalized.length === 0 ? 0 : newlines + 1;
  const readingSeconds = words === 0 ? 0 : Math.ceil(words * 60 / wordsPerMinute);
  return {
    words,
    characters,
    charactersWithoutWhitespace,
    lines,
    paragraphs: countParagraphs(normalized),
    readingSeconds,
  };
}

export function formatReadingTime(seconds) {
  if (!Number.isSafeInteger(seconds) || seconds < 0) throw new TypeError('Durasi harus berupa detik bilangan bulat nonnegatif.');
  if (seconds === 0) return '0 detik';
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (minutes === 0) return `${remainder} detik`;
  if (remainder === 0) return `${minutes} menit`;
  return `${minutes} menit ${remainder} detik`;
}

function utf8ByteLength(text) {
  let bytes = 0;
  for (const character of text) bytes += utf8LengthOfCodePoint(character.codePointAt(0));
  return bytes;
}

export function createSummary(result, wordsPerMinute) {
  if (!result || !Number.isInteger(wordsPerMinute) || wordsPerMinute < 50 || wordsPerMinute > 1000) {
    throw new TypeError('Ringkasan memerlukan hasil dan kecepatan baca yang valid.');
  }
  const summary = [
    'Ringkasan penghitung kata',
    `Kata: ${result.words}`,
    `Karakter: ${result.characters}`,
    `Karakter tanpa spasi, tab, dan baris baru: ${result.charactersWithoutWhitespace}`,
    `Baris: ${result.lines}`,
    `Paragraf: ${result.paragraphs}`,
    `Perkiraan waktu baca: ${formatReadingTime(result.readingSeconds)}`,
    `Kecepatan baca: ${wordsPerMinute} kata/menit`,
  ].join('\n');
  if (utf8ByteLength(summary) > MAX_SUMMARY_BYTES) {
    throw codedError('OUTPUT_TOO_LARGE', 'Ringkasan hasil melewati batas 2 KiB.');
  }
  return summary;
}

