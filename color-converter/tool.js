import { copyText, setStatus } from '../tools/shared/ui.js';
import { assertColorInputs, parseHex, parseRGB, parseHslText, rgbToHex, rgbToHsl, contrastResults } from './logic.js';
const $ = s => document.querySelector(s), status = $('#status');
let values=null, summary='';
function clearOutputs(){values=null;summary='';for(const id of ['hex-result','rgb-result','hsl-result'])$(`#${id}`).value='';$('#contrast').textContent='';$('#color-swatch').style.backgroundColor='';$('#copy-contrast').disabled=true;document.querySelectorAll('[data-copy]').forEach(button=>button.disabled=true);}
function convert() { clearOutputs(); try { assertColorInputs({input:$('#color-input').value,foreground:$('#foreground').value,background:$('#background').value});let rgb, source = $('#color-input').value.trim(); if (source.startsWith('#')) rgb = parseHex(source); else if (/^hsl/i.test(source)) rgb = parseHslText(source); else rgb = parseRGB(source);
  const hex=rgbToHex(rgb), [h,s,l]=rgbToHsl(rgb); values={hex,rgb:`rgb(${rgb.join(', ')})`,hsl:`hsl(${h.toFixed(2)}, ${s.toFixed(2)}%, ${l.toFixed(2)}%)`};
  $('#hex-result').value=values.hex;$('#rgb-result').value=values.rgb;$('#hsl-result').value=values.hsl;$('#color-swatch').style.backgroundColor=values.hex;$('#color-swatch').setAttribute('aria-label',`Color preview ${values.hex}`);
  const result=contrastResults(parseHex($('#foreground').value),parseHex($('#background').value));
  $('#contrast').textContent=`${result.ratio.toFixed(2)}:1 — AA normal ${result.aaNormal?'pass':'fail'}, AA large ${result.aaLarge?'pass':'fail'}, AAA normal ${result.aaaNormal?'pass':'fail'}, AAA large ${result.aaaLarge?'pass':'fail'}`;
  summary=`Contrast ${result.ratio.toFixed(2)} to 1. AA normal ${result.aaNormal?'pass':'fail'}; AA large ${result.aaLarge?'pass':'fail'}; AAA normal ${result.aaaNormal?'pass':'fail'}; AAA large ${result.aaaLarge?'pass':'fail'}.`;
  document.querySelectorAll('[data-copy]').forEach(button=>button.disabled=false);$('#copy-contrast').disabled=false;
  setStatus(status, { kind: 'success', message: 'Color converted. Contrast thresholds use the unrounded ratio.' });
 } catch(error) { setStatus(status, { kind: 'error', message: error.message }); } }
$('#convert').addEventListener('click', convert);
for (const field of [$('#color-input'),$('#foreground'),$('#background')]) field.addEventListener('input', () => {clearOutputs();setStatus(status,{kind:'idle',message:'Input changed. Convert again.'});});
document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',()=>{if(values)void copyText(values[button.dataset.copy],status);}));
$('#copy-contrast').addEventListener('click',()=>{if(summary)void copyText(summary,status);});
$('#example').addEventListener('click', () => { $('#color-input').value='#777'; $('#foreground').value='#777777'; $('#background').value='#ffffff'; convert(); });
$('#clear').addEventListener('click', () => { $('#color-input').value=''; $('#foreground').value='#000000'; $('#background').value='#ffffff'; clearOutputs(); setStatus(status,{kind:'idle',message:'Cleared.'}); });
convert();
