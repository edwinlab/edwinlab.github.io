export const MAX_INPUT_CODE_POINTS = 100_000;
export const MAX_INPUT_UTF8_BYTES = 400_000;
export const MAX_OUTPUT_UTF8_BYTES = 800_000;

function codedError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function utf8Width(point) {
  if (point <= 0x7f) return 1;
  if (point <= 0x7ff) return 2;
  if (point <= 0xffff) return 3;
  return 4;
}

export function utf8ByteLength(text, limit = Infinity) {
  let bytes = 0;
  for (const character of text) {
    bytes += utf8Width(character.codePointAt(0));
    if (bytes > limit) return bytes;
  }
  return bytes;
}

export function assertInputBounds(text) {
  if (typeof text !== 'string') throw new TypeError('Teks awal harus berupa string.');
  let codePoints = 0;
  let bytes = 0;
  for (const character of text) {
    codePoints += 1;
    bytes += utf8Width(character.codePointAt(0));
    if (codePoints > MAX_INPUT_CODE_POINTS || bytes > MAX_INPUT_UTF8_BYTES) {
      throw codedError('INPUT_TOO_LARGE', 'Teks melewati batas 100.000 code points atau 400.000 byte UTF-8.');
    }
  }
}

export function assertOutputSize(text) {
  if (typeof text !== 'string') throw new TypeError('Hasil harus berupa string.');
  if (utf8ByteLength(text, MAX_OUTPUT_UTF8_BYTES) > MAX_OUTPUT_UTF8_BYTES) {
    throw codedError('OUTPUT_TOO_LARGE', 'Hasil melewati batas 800.000 byte UTF-8. Tidak ada teks yang dipotong.');
  }
  return text;
}

export function createTitlePattern(RegExpConstructor = RegExp) {
  try {
    return new RegExpConstructor('\\p{L}[\\p{L}\\p{M}]*', 'gu');
  } catch {
    throw codedError('CASE_UNSUPPORTED', 'Browser tidak mendukung pola huruf Unicode untuk kapital awal kata. Perbarui browser atau pilih huruf besar/kecil.');
  }
}

function titleCase(text) {
  const lowered = text.toLocaleLowerCase('id');
  const pattern = createTitlePattern();
  return lowered.replace(pattern, token => {
    const firstPoint = String.fromCodePoint(token.codePointAt(0));
    return firstPoint.toLocaleUpperCase('id') + token.slice(firstPoint.length);
  });
}

export function changeCase(text, mode) {
  if (!['upper', 'lower', 'title'].includes(mode)) {
    throw codedError('INVALID_MODE', 'Pilih salah satu bentuk huruf yang tersedia.');
  }
  assertInputBounds(text);

  let result;
  if (mode === 'upper') result = text.toLocaleUpperCase('id');
  else if (mode === 'lower') result = text.toLocaleLowerCase('id');
  else result = titleCase(text);

  return assertOutputSize(result);
}
