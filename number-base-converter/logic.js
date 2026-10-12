import { assertTextSize } from '../tools/shared/limits.js';
const DIGITS = '0123456789abcdef';
export function parseInteger(input, base) {
  if (![2,8,10,16].includes(base)) throw new RangeError('Choose base 2, 8, 10, or 16.');
  if (typeof input !== 'string') throw Object.assign(new Error('Enter a whole number.'), { code: 'INVALID_INTEGER' });
  assertTextSize(input,8192);
  let value = input.trim(); const match = value.match(/^([+-]?)(.*)$/); const sign = match[1], body = match[2];
  const prefixes = {2:'0b',8:'0o',16:'0x'}, seenPrefix=/^0[box]/i.test(body);
  if(seenPrefix){if(!prefixes[base]||body.slice(0,2).toLowerCase()!==prefixes[base])throw Object.assign(new Error('The number prefix does not match the selected input base.'),{code:'INVALID_INTEGER'});value=sign+body.slice(2);}else value=sign+body;
  const digits = value.replace(/^[+-]/,''); if (!digits || ![...digits].every(ch => DIGITS.indexOf(ch.toLowerCase()) >= 0 && DIGITS.indexOf(ch.toLowerCase()) < base)) throw Object.assign(new Error(`Enter a whole number using base-${base} digits${prefixes[base] ? `; ${prefixes[base]} prefix is optional` : ''}.`), { code: 'INVALID_INTEGER' });
  if (digits.length > 4096) throw Object.assign(new Error('Magnitude limit: 4,096 digits.'), { code: 'INPUT_TOO_LARGE' });
  let n = 0n; for (const ch of digits.toLowerCase()) n = n * BigInt(base) + BigInt(DIGITS.indexOf(ch));
  return sign === '-' && n !== 0n ? -n : n;
}
export function convertBases(input, base) { const n = parseInteger(input, base); const values=Object.fromEntries([2,8,10,16].map(radix => [radix, n.toString(radix)])); formatReport(values); return values; }
export function formatReport(values) { const out = [2,8,10,16].map(base => `Base ${base}: ${values[base]}`).join('\n'); if (new TextEncoder().encode(out).length > 65536) throw Object.assign(new Error('Output exceeds 64 KiB.'), {code:'OUTPUT_TOO_LARGE'}); return out; }
