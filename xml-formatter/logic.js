import { assertTextSize } from '../tools/shared/limits.js';

export const XML_INPUT_LIMIT = 1024 * 1024;
export const XML_OUTPUT_LIMIT = 2 * 1024 * 1024;
export const XML_MAX_NODES = 20000;
export const XML_MAX_DEPTH = 100;
const PARSER_ERROR_NS = 'http://www.mozilla.org/newlayout/xml/parsererror.xml';
const HTML_NS = 'http://www.w3.org/1999/xhtml';
const xmlParser = () => new DOMParser();

function fail(code, message) { return { ok: false, code, message }; }
function parseError(doc) {
  if (!doc?.documentElement) return true;
  const root=doc.documentElement;
  return root.namespaceURI===PARSER_ERROR_NS || [...doc.getElementsByTagNameNS(PARSER_ERROR_NS,'parsererror')].length>0 || (root.namespaceURI===null&&[...doc.getElementsByTagNameNS(HTML_NS,'parsererror')].length>0);
}

export function stripLeadingBom(text) { return text.startsWith('\uFEFF') ? text.slice(1) : text; }

/** Skips XML lexical regions without treating comment/CDATA/PI content as markup declarations. */
export function findDoctype(text) {
  let i=0;
  while(i<text.length){
    if(text.startsWith('<!--',i)){const end=text.indexOf('-->',i+4);if(end<0)return false;i=end+3;continue;}
    if(text.startsWith('<![CDATA[',i)){const end=text.indexOf(']]>',i+9);if(end<0)return false;i=end+3;continue;}
    if(text.startsWith('<?',i)){const end=text.indexOf('?>',i+2);if(end<0)return false;i=end+2;continue;}
    if(text.startsWith('<!DOCTYPE',i))return true;
    i++;
  }
  return false;
}

function declarationIssue(text) {
  if(!text.startsWith('<?xml'))return null;
  const end=text.indexOf('?>'); if(end<0)return null;
  const declaration=text.slice(0,end+2);
  const version=declaration.match(/\bversion\s*=\s*(['"])(.*?)\1/i)?.[2];
  const encoding=declaration.match(/\bencoding\s*=\s*(['"])(.*?)\1/i)?.[2];
  if(version && version!=='1.0')return fail('UNSUPPORTED_DECLARATION','Only XML version 1.0 is supported.');
  if(encoding && !/^utf-8$/i.test(encoding))return fail('UNSUPPORTED_DECLARATION','The input and download use UTF-8; other declared encodings are not supported.');
  return null;
}

function expectedRootName(text){
  let i=0;
  while(i<text.length){
    const start=text.indexOf('<',i);if(start<0)return null;i=start;
    if(text.startsWith('<!--',i)){const end=text.indexOf('-->',i+4);if(end<0)return null;i=end+3;continue;}
    if(text.startsWith('<?',i)){const end=text.indexOf('?>',i+2);if(end<0)return null;i=end+2;continue;}
    if(text.startsWith('<!',i)){const end=text.indexOf('>',i+2);if(end<0)return null;i=end+1;continue;}
    const match=text.slice(i+1).match(/^([^\s/>]+)/);return match?.[1]||null;
  }
  return null;
}

function walkXml(root,whitespaceConsent=false) {
  let nodes=0;
  const stack=[{node:root,depth:1}];
  while(stack.length){
    const {node,depth}=stack.pop();
    if(node.nodeType===1){
      if(depth>XML_MAX_DEPTH)return fail('MAX_DEPTH',`XML nesting exceeds ${XML_MAX_DEPTH} elements.`);
      for(const attr of node.attributes){if(attr.namespaceURI==='http://www.w3.org/XML/1998/namespace'&&attr.localName==='space')return fail('UNSUPPORTED_CONTENT','The xml:space attribute changes whitespace handling and is outside the supported subset.');}
    }
    if(node.nodeType!==9&&node.nodeType!==10&&++nodes>XML_MAX_NODES)return fail('TOO_MANY_NODES',`XML exceeds ${XML_MAX_NODES.toLocaleString('en-US')} nodes.`);
    const children=[...node.childNodes];
    if(children.some(child=>child.nodeType===4))return fail('UNSUPPORTED_CONTENT','CDATA sections are well-formed XML but are not formatted by this tool.');
    if(children.some(child=>child.nodeType===7))return fail('UNSUPPORTED_CONTENT','Processing instructions other than an XML declaration are not supported.');
    const elements=children.filter(child=>child.nodeType===1);
    const comments=children.filter(child=>child.nodeType===8);
    const texts=children.filter(child=>child.nodeType===3);
    if(!elements.length&&texts.length&&texts.every(text=>text.nodeValue.trim()===''))return fail('UNSUPPORTED_CONTENT','The pinned formatter changes whitespace-only leaf text, so this document is kept unchanged.');
    if(comments.length&&texts.some(node=>whitespaceConsent?node.nodeValue.trim()!=='' : node.nodeValue.length>0))return fail('UNSUPPORTED_CONTENT','Mixed text and comments are not formatted because whitespace may be significant.');
    if(elements.length){
      if(texts.some(node=>node.nodeValue.trim()!==''))return fail('UNSUPPORTED_CONTENT','Mixed text and child elements are not formatted because whitespace may be significant.');
    }else if(texts.some(node=>/[\r\n]/.test(node.nodeValue)))return fail('UNSUPPORTED_CONTENT','Multiline text leaves are outside the supported subset.');
    for(let j=children.length-1;j>=0;j--)stack.push({node:children[j],depth:node.nodeType===1?depth+1:depth});
  }
  return null;
}

function whitespaceLeafPaths(doc){
  const paths=[];const stack=[];
  for(let i=doc.childNodes.length-1;i>=0;i--)if(doc.childNodes[i].nodeType===1)stack.push({node:doc.childNodes[i],path:`/${doc.childNodes[i].nodeName}`});
  while(stack.length){const {node,path}=stack.pop();const children=[...node.childNodes];
    const elements=children.filter(child=>child.nodeType===1);const texts=children.filter(child=>child.nodeType===3);
    // xml-formatter trims single-line leaf text unless its element path is ignored.
    // Preserve every text-only leaf, not just whitespace-only leaves.
    if(texts.length&&!elements.length)paths.push(path);
    for(let i=elements.length-1;i>=0;i--)stack.push({node:elements[i],path:`${path}/${elements[i].nodeName}`});
  }
  return [...new Set(paths)];
}

export function inspectXml(source,{whitespaceConsent=false,Parser=xmlParser()}={}){
  if(typeof source!=='string')return fail('INVALID_INPUT','Paste XML text to continue.');
  try{assertTextSize(source,XML_INPUT_LIMIT);}catch{return fail('INPUT_TOO_LARGE','XML input is limited to 1 MiB of UTF-8 text.');}
  const text=stripLeadingBom(source);
  const issue=declarationIssue(text);if(issue)return issue;
  if(findDoctype(text))return fail('DOCTYPE_UNSUPPORTED','DOCTYPE, DTDs, and entity declarations are not supported. They are rejected before XML parsing.');
  let doc;
  try{doc=Parser.parseFromString(text,'application/xml');}catch{return fail('INVALID_XML','The XML parser could not process this input.');}
  if(parseError(doc)||(doc.documentElement?.nodeName==='parsererror'&&expectedRootName(text)!=='parsererror'))return fail('INVALID_XML','The XML is not well-formed. Check tag names, attributes, entities, and namespaces.');
  if(doc.doctype)return fail('DOCTYPE_UNSUPPORTED','DOCTYPE and DTDs are not supported.');
  const issueFromTree=walkXml(doc,whitespaceConsent);
  if(issueFromTree)return issueFromTree;
  const requiresConsent=[...doc.getElementsByTagName('*')].some(element=>{
    const children=[...element.childNodes];
    return children.some(node=>node.nodeType===1)&&children.some(node=>node.nodeType===3&&node.nodeValue.trim()==='');
  });
  if(requiresConsent&&!whitespaceConsent)return fail('WHITESPACE_CONSENT_REQUIRED','Whitespace-only text between child elements may be changed for indentation. Review the policy and check the consent box before formatting.');
  return {ok:true,text,document:doc,bomRemoved:text!==source,requiresConsent,ignoredPaths:whitespaceLeafPaths(doc)};
}

function snapshotNode(node,consent=false){
  if(node.nodeType===1){
    const attrs=[...node.attributes].map(a=>[a.namespaceURI||'',a.name,a.value]).sort((a,b)=>a.join('\0').localeCompare(b.join('\0')));
    const children=[...node.childNodes].filter(child=>!(consent&&child.nodeType===3&&child.nodeValue.trim()===''&&[...node.childNodes].some(n=>n.nodeType===1))).map(child=>snapshotNode(child,consent));
    return ['element',node.nodeName,node.namespaceURI||'',attrs,children];
  }
  if(node.nodeType===3)return ['text',node.nodeValue];
  if(node.nodeType===8)return ['comment',node.nodeValue];
  if(node.nodeType===7)return ['pi',node.target,node.data];
  return ['node',node.nodeType,node.nodeName,node.nodeValue||''];
}
export function xmlSnapshot(doc,consent=false){return [...doc.childNodes].filter(node=>node.nodeType!==10).map(node=>snapshotNode(node,consent));}

export function verifyFormattedXml(source,output,{whitespaceConsent=false,Parser=xmlParser()}={}){
  try{assertTextSize(output,XML_OUTPUT_LIMIT);}catch{return fail('OUTPUT_TOO_LARGE','Formatted XML exceeds the 2 MiB output limit.');}
  const before=inspectXml(source,{whitespaceConsent,Parser});if(!before.ok)return before;
  const after=inspectXml(output,{whitespaceConsent:true,Parser});if(!after.ok)return fail('PRESERVATION_FAILED','The formatted result did not pass XML validation. Your input has been kept.');
  if(JSON.stringify(xmlSnapshot(before.document,whitespaceConsent))!==JSON.stringify(xmlSnapshot(after.document,whitespaceConsent)))return fail('PRESERVATION_FAILED','Formatting changed XML data outside the permitted indentation whitespace. Your input has been kept.');
  return {ok:true,output,bomRemoved:before.bomRemoved};
}
