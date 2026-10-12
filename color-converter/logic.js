const encoder=new TextEncoder();
export function assertColorInputs(inputs){const values=[inputs.input,inputs.foreground,inputs.background];if(values.some(value=>typeof value!=='string'||encoder.encode(value).length>64))throw Object.assign(new Error('Each color field is limited to 64 UTF-8 bytes.'),{code:'FIELD_TOO_LARGE'});if(encoder.encode(values.join('')).length>2048)throw Object.assign(new Error('Combined color input is limited to 2 KiB.'),{code:'INPUT_TOO_LARGE'});}
export function parseHex(value) {
  if (typeof value !== 'string' || !/^#(?:[\da-fA-F]{3}|[\da-fA-F]{6})$/.test(value)) throw Object.assign(new Error('Use a 3- or 6-digit hexadecimal color such as #2A7.'), { code: 'INVALID_COLOR' });
  let hex = value.slice(1); if (hex.length === 3) hex = [...hex].map(ch => ch + ch).join('');
  return [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16));
}
export function parseRGB(value) {
  const parts = typeof value === 'string' ? value.trim().split(/[ ,]+/).map(token=>/^\d+$/.test(token)?Number(token):NaN) : value;
  if (!Array.isArray(parts) || parts.length !== 3 || parts.some(x => !Number.isInteger(x) || x < 0 || x > 255)) throw Object.assign(new Error('Enter three integer RGB channels from 0 to 255.'), { code: 'INVALID_COLOR' });
  return parts;
}
export function rgbToHex(rgb) { return `#${parseRGB(rgb).map(n => n.toString(16).padStart(2, '0')).join('')}`; }
export function rgbToHsl(rgb) {
  const [r0,g0,b0] = parseRGB(rgb).map(n => n / 255), max = Math.max(r0,g0,b0), min = Math.min(r0,g0,b0), d = max - min;
  let h = 0, s = 0, l = (max + min) / 2;
  if (d) { s = d / (1 - Math.abs(2 * l - 1)); if (max === r0) h = 60 * (((g0 - b0) / d) % 6); else if (max === g0) h = 60 * ((b0 - r0) / d + 2); else h = 60 * ((r0 - g0) / d + 4); }
  return [((h + 360) % 360), s * 100, l * 100];
}
export function hslToRgb(hsl) {
  if (!Array.isArray(hsl) || hsl.length !== 3 || hsl.some(x => !Number.isFinite(x)) || hsl[0] < 0 || hsl[0] > 360 || hsl[1] < 0 || hsl[1] > 100 || hsl[2] < 0 || hsl[2] > 100) throw Object.assign(new Error('HSL requires hue 0–360 and saturation/lightness 0–100.'), { code: 'INVALID_COLOR' });
  const [h0,s0,l0] = hsl, h = h0 === 360 ? 0 : h0, s = s0 / 100, l = l0 / 100, c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
  const groups = [[c,x,0],[x,c,0],[0,c,x],[0,x,c],[x,0,c],[c,0,x]], rgb = groups[Math.floor(h / 60) % 6];
  return rgb.map(n => Math.round((n + m) * 255));
}
export function contrastRatio(foreground, background) {
  const lum = rgb => { const c = parseRGB(rgb).map(n => n / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4); return 0.2126*c[0] + 0.7152*c[1] + 0.0722*c[2]; };
  const a = lum(foreground), b = lum(background); return (Math.max(a,b) + 0.05) / (Math.min(a,b) + 0.05);
}
export function contrastResults(foreground, background) { const ratio=contrastRatio(foreground,background); return {ratio,aaNormal:ratio>=4.5,aaLarge:ratio>=3,aaaNormal:ratio>=7,aaaLarge:ratio>=4.5}; }
export function parseHslText(value) { const m=typeof value==='string'&&value.match(/^\s*hsl\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%\s*,\s*(\d+(?:\.\d+)?)%\s*\)\s*$/i); if(!m)throw Object.assign(new Error('Use HSL like hsl(210, 50%, 40%) with finite decimal values.'),{code:'INVALID_COLOR'}); const hsl=m.slice(1).map(Number); return hslToRgb(hsl); }
