#!/usr/bin/env node
/**
 * Archive the actual VERZUM Wiki item tooltip API, exactly as returned.
 * No interpolation or invented stats. Files stay in the local repository.
 */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
const base=resolve('public'),out=join(base,'wiki-item-tooltips.generated.js'),stats=join(base,'wiki-item-tooltip-report.json');
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const idxraw=await readFile(join(base,'wiki-index.generated.js'),'utf8');
const currentIndex=JSON.parse(idxraw.slice(idxraw.indexOf('=')+1).trim().replace(/;\s*$/,''));
const ids=[...new Set((currentIndex.items||[]).map(x=>String(x.id)).filter(x=>/^\d{1,9}$/.test(x)))].slice(0,10000);
let saved={};try{const raw=await readFile(out,'utf8');saved=JSON.parse(raw.slice(raw.indexOf('=')+1).replace(/;\s*$/,''))}catch(e){}
const failures={},started=Date.now(),deadline=Date.now()+24*60*1000;
let coolingUntil=0;
let completed=0,images=0,bad=0;
async function request(url,asset=false){
 let error;
 for(let i=0;i<3;i++){
  try{
   const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),15000);
   if(coolingUntil>Date.now())await delay(coolingUntil-Date.now());
   let r;try{r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0','Accept':asset?'image/png,image/*;q=0.8':'application/json','X-Requested-With':'verzum'},signal:ctrl.signal})}finally{clearTimeout(timer)}
   if(r.status===429){const after=Number(r.headers.get('retry-after'));coolingUntil=Math.max(coolingUntil,Date.now()+Math.max(8000,Number.isFinite(after)&&after>0?Math.min(after*1000,70000):20000));}
   if(!r.ok)throw new Error('HTTP '+r.status);
   if(asset){
    const bytes=Buffer.from(await r.arrayBuffer());
    if(bytes.length>1_000_000||bytes.length<16||!bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))throw new Error('Not a verified PNG');
    return bytes;
   }
   const x=await r.json();
   if(!x?.ok||!x.tip||!Array.isArray(x.tip.lines)||!x.tip.lines.length)throw new Error('Missing verified tip');
   return x;
  }catch(e){error=e;if(i<2)await delay(String(error?.message||'').includes('429')?6000*(i+1):(i+1)*480)}
 }
 throw error;
}
async function fetchTip(id){
 if(saved[id])return;
 try{
  const response=await request('https://wiki.verzum.to/api/wiki/tip/'+id+'?lang=it');
  const tip=response.tip;
  if(String(tip.vnum)!==id)throw new Error('Mismatched item ID');
  saved[id]=tip;completed++;
  const src=response.icon;
  if(src==='https://images.verzum.to/item/'+id+'.png'){
    const dest=join(base,'wiki-original/items',id+'.png');
    if(!existsSync(dest)){
     try{
      const img=await request(src,true);
      await mkdir(dirname(dest),{recursive:true});
      await writeFile(dest,img);images++;
     }catch(e){failures['icon:'+id]=String(e.message||e)}
    }
  }
 }catch(e){bad++;failures[id]=String(e.message||e)}
}
let next=0;const workers=Array.from({length:3},async()=>{while(next<ids.length&&Date.now()<deadline){const id=ids[next++];await fetchTip(id);await delay(500)}});
await Promise.all(workers);
await writeFile(out,'/* Original item tooltip API responses, preserved with exact item ID. */\nwindow.VERZUM_WIKI_API_TIPS='+JSON.stringify(saved)+';\n','utf8');
const report={indexedItems:ids.length,completeTips:Object.keys(saved).length,newTips:completed,iconFilesAdded:images,failed:bad,errors:failures,generated:new Date().toISOString()};
await writeFile(stats,JSON.stringify(report,null,2)+'\n','utf8');
console.log('VERZUM WIKI TOOLTIP API RESULT',JSON.stringify({...report,errors:Object.entries(failures).slice(0,18)}));
