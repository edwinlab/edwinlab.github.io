const encoder = new TextEncoder();
export function validateQueryEncoding(search) {
  for (let i=0;i<search.length;i++) if(search[i]==='%'){ if(!/^[\da-fA-F]{2}$/.test(search.slice(i+1,i+3))) throw Object.assign(new Error('Query contains an incomplete percent escape.'),{code:'INVALID_QUERY_ENCODING'}); i+=2; }
  try { decodeURIComponent(search.replace(/\+/g,' ')); } catch { throw Object.assign(new Error('Query contains invalid UTF-8 percent encoding.'),{code:'INVALID_QUERY_ENCODING'}); }
}
export function parseWebURL(input) {
  if(typeof input!=='string'||input.length>16384||encoder.encode(input).length>16384)throw Object.assign(new Error('URL limit: 16 KiB.'),{code:'INPUT_TOO_LARGE'});
  let url; try{url=new URL(input);}catch{throw Object.assign(new Error('Enter a valid absolute HTTP or HTTPS URL.'),{code:'INVALID_URL'});}
  if(!['http:','https:'].includes(url.protocol))throw Object.assign(new Error('Only absolute HTTP and HTTPS URLs are supported.'),{code:'UNSUPPORTED_PROTOCOL'});
  if(url.username||url.password)throw Object.assign(new Error('URLs containing username or password are not supported.'),{code:'USERINFO_NOT_ALLOWED'});
  validateQueryEncoding(url.search);
  return {href:url.href,normalized:url.href,origin:url.origin,protocol:url.protocol,hostname:url.hostname,port:url.port,path:url.pathname,query:[...url.searchParams.entries()],hash:url.hash};
}
export function rebuildURL(parts, rows) {
  if(rows.length>256)throw Object.assign(new Error('Query limit: 256 rows.'),{code:'TOO_MANY_ROWS'});
  const url=new URL(parts.href); url.search=''; let size=0;
  for(const row of rows){const key=String(Array.isArray(row)?row[0]:row.key),value=String(Array.isArray(row)?row[1]:row.value);if(encoder.encode(key).length>512||[...key].length>512||[...value].length>4096)throw Object.assign(new Error('Query key or value exceeds its limit.'),{code:'QUERY_VALUE_TOO_LARGE'}); size+=encoder.encode(key+value).length;url.searchParams.append(key,value);}
  if(size>65536||encoder.encode(url.href).length>65536)throw Object.assign(new Error('Rebuilt URL exceeds 64 KiB.'),{code:'OUTPUT_TOO_LARGE'});
  return url.href;
}
export function formatURLReport(url,rows) { return [`Normalized URL: ${url}`, 'Query parameters:', ...rows.map(([key,value],i)=>`${i+1}. ${JSON.stringify(key)} = ${JSON.stringify(value)}`)].join('\n'); }
