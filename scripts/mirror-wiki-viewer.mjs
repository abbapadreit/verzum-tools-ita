#!/usr/bin/env node
/* Bring original Wiki model turntable logic to our own static files.
 * Preserve official rendering behavior; external render API remains the source
 * for dynamic sprites and 3D frames until that media can be archived.
 */
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
const dest=resolve('public/wiki-render');
await mkdir(dest,{recursive:true});
const base='https://wiki.verzum.to/assets/5258621bfec0/js/';
const files=['turntable.js','wiki-model.js'];
for(const file of files){
 const r=await fetch(base+file,{headers:{'User-Agent':'Mozilla/5.0'}});
 if(!r.ok)throw new Error(file+' official source HTTP '+r.status);
 let js=await r.text();
 if(!js.includes('export{'))throw new Error(file+' is not an original ES module');
 if(file==='wiki-model.js'){
  if(!js.includes('from"./page.js"')||!js.includes('export{y as mountModel}'))throw new Error('Unexpected original model API; aborting modification');
  js=js.replace('from"./page.js"','from"./page-bridge.js"');
  js=js.replace('export{y as mountModel}','export{y as mountModel,M as scanWikiModels}');
 }
 await writeFile(join(dest,file),'/* Adapted only for internal lifecycle; sourced from the official VERZUM Wiki. */\n'+js+'\n','utf8');
 console.log('VERIFIED OFFICIAL MODULE',file,js.length);
}
await writeFile(join(dest,'page-bridge.js'),'/* Our tool manages page initialization via MutationObserver. */\nexport function registerPageInit(){};\nexport function registerPageTeardown(){};\n','utf8');
