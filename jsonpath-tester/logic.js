import {JSONPath} from '../tools/vendor/jsonpath-plus/index-browser-esm.js';
import {parseSafeJSON} from '../tools/shared/json.js';
import {assertTextSize,MAX_TEXT_BYTES} from '../tools/shared/limits.js';

export const JSONPATH_QUERY_LIMIT=4096,JSONPATH_MAX_SEGMENTS=64,JSONPATH_MAX_UNION=128,JSONPATH_MAX_MATCHES=2000,JSONPATH_MAX_OUTPUT=2*1024*1024;
const encoder=new TextEncoder();
function issue(code,message){throw Object.assign(new Error(message),{code});}
function unsupported(message='This selector is outside the supported JSONPath subset.'){issue('UNSUPPORTED_SELECTOR',message);}
function invalid(message='The JSONPath selector is malformed.'){issue('INVALID_QUERY',message);}
function byteLength(value){return encoder.encode(value).byteLength;}
function parseIndex(s){if(!/^(?:0|[1-9][0-9]*)$/.test(s))return null;const n=Number(s);return Number.isSafeInteger(n)?n:null;}
function parseQuotedProperty(raw){const s=raw.trim();if(s.length<2||!['"',"'"].includes(s[0])||s.at(-1)!==s[0])return null;const key=s.slice(1,-1);if(!/^[A-Za-z0-9_$ .-]+$/.test(key))unsupported('Quoted property names support ASCII letters, digits, spaces, underscores, dollar signs, dots, and hyphens; escapes and Unicode keys are not supported.');return {type:'property',key};}
function splitMembers(value){const list=[];let start=0,quote='';for(let i=0;i<value.length;i++){const c=value[i];if(quote){if(c===quote)quote='';else if(c==='\\')unsupported('Escaped property names are not supported.');continue;}if(c==='"'||c==="'"){quote=c;continue;}if(c===','){list.push(value.slice(start,i).trim());start=i+1;}}if(quote)invalid('A quoted property name is not closed.');list.push(value.slice(start).trim());return list;}
function validateBracket(content){
  const value=content.trim();if(!value)invalid('Empty bracket selectors are not supported.');
  if(value==='*')return {type:'wildcard'};
  if(/[?@`^~;=(){}]/.test(value))unsupported('Filters, scripts, computed selectors, and parent/property operators are not supported.');
  if(value.includes(':')){
    const fields=value.split(':');if(fields.length<2||fields.length>3)invalid('A slice can contain two or three fields.');
    for(const field of fields){const s=field.trim();if(!s)continue;if(!/^(?:0|[1-9][0-9]*)$/.test(s)||!Number.isSafeInteger(Number(s)))unsupported('Slices support only nonnegative safe-integer bounds.');}
    if(fields.length===3){const step=fields[2].trim();if(step&&Number(step)<=0)unsupported('A slice step must be a positive integer.');}
    return {type:'slice'};
  }
  const members=splitMembers(value);if(members.length>1){
    if(members.some(x=>!x))invalid('Union selectors cannot contain empty members or a trailing comma.');
    const parsed=members.map(m=>parseQuotedProperty(m)??(parseIndex(m)!==null?{type:'index'}:null));
    if(parsed.some(x=>!x))unsupported('A union must contain only safe integer indexes or quoted property names.');
    if(parsed.some(x=>x.type!==parsed[0].type))unsupported('A union cannot mix property names and indexes.');
    return {type:'union',count:members.length,memberType:parsed[0].type};
  }
  const property=parseQuotedProperty(value);if(property)return property;
  const index=parseIndex(value);if(index!==null)return {type:'index'};
  if(/^['"]/.test(value))invalid('A quoted property name is malformed.');
  if(/[\\\u0080-\uffff]/.test(value))unsupported('Escaped and Unicode selector syntax is outside the supported subset.');
  if(/^-/.test(value))unsupported('Negative indexes and slice bounds are not supported.');
  unsupported('Bracket selectors support indexes, quoted property names, homogeneous unions, and nonnegative slices.');
}

export function validateSelector(raw){
  if(typeof raw!=='string')invalid('Enter a JSONPath selector.');
  if(byteLength(raw)>JSONPATH_QUERY_LIMIT)issue('QUERY_TOO_LARGE','JSONPath query is limited to 4 KiB UTF-8.');
  const query=raw.trim();if(!query)invalid('Enter a JSONPath selector.');if(!query.startsWith('$'))invalid('A selector must start with $.');
  if(query==='$')return {query,segments:0,unionMembers:0};
  let i=1,segments=0,unionMembers=0;
  while(i<query.length){
    const ch=query[i];
    if(ch==='.' ){
      let recursive=false;i++;if(query[i]==='.'){recursive=true;i++;}
      if(recursive&&query[i]==='@')unsupported('Script expressions and type selectors are not supported.');
      const start=i;if(query[i]==='*')i++;else{while(i<query.length&&/[A-Za-z0-9_$]/.test(query[i]))i++;if(start===i||!/[A-Za-z_$]/.test(query[start]))invalid('Use an ASCII identifier after a dot selector.');}
      if(recursive&&query.slice(start,i).includes('['))invalid();
      segments++;
    }else if(ch==='['){
      let start=++i,quote='',closed=false;
      for(;i<query.length;i++){
        const c=query[i];if(quote){if(c==='\\')unsupported('Escaped property names are not supported.');if(c===quote)quote='';continue;}
        if(c==='"'||c==="'"){quote=c;continue;}if(c==='[')unsupported('Nested selectors are not supported.');if(c===']'){closed=true;break;}
      }
      if(!closed||quote)invalid('A bracket selector is not closed.');
      const parsed=validateBracket(query.slice(start,i));if(parsed.type==='union')unionMembers+=parsed.count;segments++;i++;
    }else if(/\s/.test(ch))invalid('Whitespace is allowed only around selectors inside brackets.');
    else if(/[?@`^~;=(){}]/.test(ch))unsupported();
    else invalid('Unexpected characters remain after the JSONPath selector.');
    if(segments>JSONPATH_MAX_SEGMENTS)issue('QUERY_TOO_COMPLEX',`Selectors are limited to ${JSONPATH_MAX_SEGMENTS} segments.`);
    if(unionMembers>JSONPATH_MAX_UNION)issue('QUERY_TOO_COMPLEX',`Unions are limited to ${JSONPATH_MAX_UNION} members.`);
  }
  return {query,segments,unionMembers};
}

function allowedMember(full){
  if(!full||typeof full!=='object'||typeof full.path!=='string'||!Object.hasOwn(full,'value'))return false;
  const parent=full.parent,prop=full.parentProperty;
  if(parent===null||parent===undefined)return false;
  if(Array.isArray(parent)){const index=typeof prop==='number'?prop:typeof prop==='string'&&/^(?:0|[1-9][0-9]*)$/.test(prop)?Number(prop):-1;return Number.isSafeInteger(index)&&index>=0&&index<parent.length&&Object.hasOwn(parent,index);}
  return typeof parent==='object'&&Object.hasOwn(parent,prop);
}

export function executeJSONPath(jsonText,queryText){
  assertTextSize(jsonText,MAX_TEXT_BYTES);
  const validated=validateSelector(queryText);
  const root=parseSafeJSON(jsonText);
  const chunks=[];let outputBytes=0,candidates=0;
  const append=(record)=>{const part=JSON.stringify(record,null,2);const increment=byteLength(part)+(chunks.length?2:4);if(outputBytes+increment>JSONPATH_MAX_OUTPUT)issue('OUTPUT_TOO_LARGE','JSONPath results exceed 2 MiB of UTF-8 JSON. Narrow the selector and try again.');outputBytes+=increment;chunks.push(part);};
  if(validated.query==='$'){append({path:'$',value:root});return {output:`[\n${chunks[0]}\n]`,count:1};}
  const limit=Object.assign(new Error('The selector produced more than 2,000 candidates. Narrow it and try again.'),{code:'MATCH_LIMIT'});
  const callback=(_value,_type,full)=>{
    if(++candidates>JSONPATH_MAX_MATCHES)throw limit;
    if(!allowedMember(full))return;
    // Check the actual serialized UTF-8 record before retaining it or allowing traversal to continue.
    append({path:full.path,value:full.value});
  };
  try{
    JSONPath({path:validated.query,json:root,resultType:'all',wrap:true,flatten:false,eval:false,ignoreEvalErrors:false,callback});
  }catch(error){if(error===limit||error?.code==='OUTPUT_TOO_LARGE')throw error;throw Object.assign(new Error(error.message||'The selector could not be evaluated.'),{code:'UNSUPPORTED_SELECTOR'});}
  return {output:chunks.length?`[\n${chunks.join(',\n')}\n]`:'[]',count:chunks.length};
}
