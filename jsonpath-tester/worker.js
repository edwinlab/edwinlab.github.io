import {executeJSONPath} from './logic.js';
self.onmessage=event=>{
  const {id,jsonText,queryText}=event.data||{};
  try{const result=executeJSONPath(jsonText,queryText);self.postMessage({id,ok:true,...result});}
  catch(error){self.postMessage({id,ok:false,code:error.code||'PROCESSING_ERROR',message:error.message||'The JSONPath query could not be completed.',line:error.line,column:error.column,offset:error.offset});}
};
