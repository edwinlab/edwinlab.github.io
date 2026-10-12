importScripts('/tools/vendor/xml-formatter/xml-formatter.js');
self.onmessage=event=>{
  const {id,text,indentation,ignoredPaths=[]}=event.data||{};
  try{
    if(typeof text!=='string'||!['  ','    ','\t'].includes(indentation)||!Array.isArray(ignoredPaths)||ignoredPaths.length>20000||ignoredPaths.some(path=>typeof path!=='string'||path.length>4096||path[0]!=='/'))throw Object.assign(new Error('Invalid XML formatter request.'),{code:'INVALID_INPUT'});
    const output=self.xmlFormatter(text,{indentation,lineSeparator:'\n',collapseContent:true,throwOnFailure:true,ignoredPaths});
    self.postMessage({id,ok:true,output});
  }catch(error){self.postMessage({id,ok:false,code:error.code||'FORMAT_ERROR',message:error.message||'The XML formatter could not format this document.'});}
};
