export const GROUPS = Object.freeze({ lower: 'abcdefghijklmnopqrstuvwxyz', upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', digits: '0123456789', symbols: '!@#$%^&*()-_=+[]{};:,.?/' });
const SIMILAR = new Set('0O1Il');
export function buildAlphabet(selected, excludeSimilar = false) {
  const keys = Object.keys(GROUPS).filter(key => selected?.[key]);
  if (!keys.length) throw Object.assign(new Error('Select at least one character group.'), { code: 'NO_GROUPS' });
  let chars = [...new Set(keys.flatMap(key => [...GROUPS[key]]))];
  if (excludeSimilar) chars = chars.filter(ch => !SIMILAR.has(ch));
  if (!chars.length) throw Object.assign(new Error('The selected groups leave no usable characters.'), { code: 'EMPTY_ALPHABET' });
  return chars.join('');
}
export function parseBoundedInteger(raw, min, max, label) {
  const text=String(raw); if(new TextEncoder().encode(text).length>32 || !/^\s*[0-9]+\s*$/.test(text)) throw Object.assign(new Error(`${label} must contain decimal digits only.`),{code:'INVALID_INTEGER'});
  const value=Number(text.trim()); if(!Number.isSafeInteger(value)||value<min||value>max)throw Object.assign(new Error(`${label} must be ${min}–${max}.`),{code:label==='Length'?'INVALID_LENGTH':'INVALID_COUNT'}); return value;
}
export function validateOptions(options) { return {length:parseBoundedInteger(options.length,8,128,'Length'),count:parseBoundedInteger(options.count??1,1,100,'Count'),alphabet:buildAlphabet(options.selected,options.excludeSimilar)}; }
export function serializePasswords(passwords) { if(!Array.isArray(passwords)||passwords.some(p=>typeof p!=='string'))throw new TypeError('Passwords must be strings.'); const value=passwords.join('\n'); if(new TextEncoder().encode(value).length>12899)throw Object.assign(new Error('Password output exceeds its limit.'),{code:'OUTPUT_TOO_LARGE'}); return value; }
export function sampleIndex(randomUint32, size) {
  if (!Number.isSafeInteger(size) || size < 1 || size > 0x100000000) throw new RangeError('Invalid alphabet size.');
  const range = 0x100000000, cutoff = Math.floor(range / size) * size;
  for (let draws = 0; draws < 65536; draws++) {
    const value = randomUint32();
    if (!Number.isInteger(value) || value < 0 || value >= range) throw new TypeError('Random source must return a uint32.');
    if (value < cutoff) return value % size;
  }
  throw Object.assign(new Error('Secure random generation could not complete.'), { code: 'RANDOM_LIMIT' });
}
export function generatePasswords({ length, count = 1, selected, excludeSimilar = false, randomUint32 = () => { const n = new Uint32Array(1); crypto.getRandomValues(n); return n[0]; } }) {
  const options=validateOptions({length,count,selected,excludeSimilar}); length=options.length; count=options.count;
  const keys = Object.keys(GROUPS).filter(key => selected?.[key]);
  const alphabet = options.alphabet, groups = keys.map(key => [...GROUPS[key]].filter(ch => !excludeSimilar || !SIMILAR.has(ch)));
  const output = [];
  let draws = 0;
  const boundedRandom=()=>{if(++draws>65536)throw Object.assign(new Error('Secure random draw limit reached.'),{code:'RNG_LIMIT'});return randomUint32();};
  while (output.length < count) {
    let candidates=0, accepted=false;
    while(candidates<256){
      candidates++;
      const chars = Array.from({ length }, () => alphabet[sampleIndex(boundedRandom, alphabet.length)]);
      if (groups.every(group => chars.some(ch => group.includes(ch)))) { output.push(chars.join('')); accepted=true; break; }
    }
    if(!accepted)throw Object.assign(new Error('Unable to satisfy selected groups within the candidate limit.'),{code:'POLICY_LIMIT'});
  }
  serializePasswords(output);
  return output;
}
