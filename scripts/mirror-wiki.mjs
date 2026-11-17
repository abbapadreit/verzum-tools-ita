#!/usr/bin/env node
/**
 * VERZUM Wiki archival importer.
 * Copies only real HTML, metadata and original image bytes from the official Wiki.
 * No fabricated pages, tooltips, icons or bonus values.
 * Usage:
 *    node scripts/mirror-wiki.mjs --scope=primary
 *    node scripts/mirror-wiki.mjs --scope=all
 *
 * Pages and media are stored as deterministic local files under public/wiki-pages/
 * and public/wiki-original/. If a request fails, no placeholder is created.
 */
import {readFile, writeFile, mkdir, readdir, stat} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {join, dirname, resolve} from 'node:path';
const root=resolve('public'),pageRoot=join(root,'wiki-pages');
const assetRoot=join(root,'wiki-original');
const urlBase='https://wiki.verzum.to/it/';
const args=process.argv.slice(2);
const scope=(args.find(x=>x.startsWith('--scope='))||'--scope=primary').split('=')[1];
const maxPages=Number((args.find(x=>x.startsWith('--max-pages='))||'--max-pages=3500').split('=')[1]);
const maxAssets=Number((args.find(x=>x.startsWith('--max-assets='))||'--max-assets=12000').split('=')[1]);
const maxMinutes=Number((args.find(x=>x.startsWith('--max-minutes='))||'--max-minutes=28').split('=')[1]);
const started=Date.now(),deadline=started+maxMinutes*60000;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const esc=x=>String(x||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeSlug=x=>/^[a-z0-9_/-]+$/i.test(String(x||''))&&!String(x).includes('..')&&x.length<=220;
const manifestPath=join(root,'wiki-mirror-manifest.json');
let manifest={version:2,generated:'',pages:{},assets:{},failures:{},primary:[],counts:{}};
try{manifest=JSON.parse(await readFile(manifestPath,'utf8'))}catch(_){}
manifest.pages??={};manifest.assets??={};manifest.failures??={};manifest.primary??=[];
const acquired=new Map(),assets=new Map(),tips=new Map(),ambiguousTips=new Set();
const indexItems=new Map(),indexPages=new Map();
let processed=0,updated=0,imagesWritten=0,errors=0,seedCount=0;
function pageFile(path){return join(pageRoot,...path.split('/'))+'.html'}
function hrefToSlug(raw){
 if(!raw||raw.startsWith('#wiki/')){
  const value=raw?.startsWith('#wiki/')?decodeURIComponent(raw.slice(6)):null;
  return value&&safeSlug(value)?value:null;
 }
 try{
  const u=new URL(raw,urlBase);
  if(u.origin!=='https://wiki.verzum.to'||!u.pathname.startsWith('/it/'))return null;
  let path=decodeURIComponent(u.pathname.slice(4)).replace(/\/+$/,'');
  if(path.endsWith('.html'))path=path.slice(0,-5);
  if(!path||!safeSlug(path))return null;
  return path;
 }catch(e){return null}
}
function extractMain(html){
 const begin=html.search(/<div\b[^>]*class=["'][^"']*\bwiki-main\b/i);
 if(begin<0)return '';
 const tag=/<\/?div\b[^>]*>/gi;
 tag.lastIndex=begin;let level=0,found=false,match;
 while((match=tag.exec(html))){
  if(!found&&match.index!==begin)continue;
  found=true;
  if(match[0].startsWith('</'))level--;else level++;
  if(level===0)return html.slice(begin,tag.lastIndex);
 }
 return '';
}
function mimeExt(url){
 const p=new URL(url).pathname;
 return p.match(/\.(png|gif|jpg|jpeg|webp|svg)$/i)?.[1]?.toLowerCase()||'';
}
function assetPath(url){
 try{
  const u=new URL(url,'https://wiki.verzum.to');
  const ext=mimeExt(u.href);
  if(!ext||u.search||!['https://wiki.verzum.to','https://images.verzum.to'].includes(u.origin))return null;
  if(u.hostname==='images.verzum.to'){
   const id=u.pathname.match(/^\/item\/(\d+)\.(png|webp)$/i);
   return id?'wiki-original/items/'+id[1]+'.'+id[2].toLowerCase():null;
  }
  if(!u.pathname.startsWith('/img/')&&!u.pathname.startsWith('/assets/'))return null;
  if(decodeURIComponent(u.pathname).split('/').includes('..'))return null;
  const path=u.pathname.slice(1);
  if(!/^[a-z0-9_\-./]+$/i.test(path))return null;
  return 'wiki-original/'+path;
 }catch(e){return null}
}
function recordAsset(url){
 const full=new URL(url,'https://wiki.verzum.to').href;
 const local=assetPath(full);
 if(local)assets.set(local,full);
 return local;
}
function rewriteLinks(html){
 html=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'')
  .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi,'')
  .replace(/<object\b[^>]*>[\s\S]*?<\/object>/gi,'')
  .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*')/gi,'')
  .replace(/\s+srcdoc\s*=\s*(?:"[^"]*"|'[^']*')/gi,'');
 // Convert wiki links without rewriting anchor-only links to sections.
 html=html.replace(/\bhref=(["'])(.*?)\1/gi,(all,quote,raw)=>{
   const slug=hrefToSlug(raw);
   if(slug)return 'href='+quote+'#wiki/'+encodeURI(slug)+quote;
   if(/^https:\/\/wiki\.verzum\.to\/it\/?(?:[#?].*)?$/i.test(raw)||raw==='/it/'||raw==='/it')return 'href='+quote+'#wiki'+quote;
   if(raw.startsWith('javascript:'))return 'href='+quote+'#wiki'+quote;
   return all;
 });
 // Rewrite known image references, preserving their exact paths and bytes.
 html=html.replace(/\b(src|data-src|poster)=(["'])(.*?)\2/gi,(all,attr,quote,raw)=>{
  const local=recordAsset(raw);
  return local?attr+'='+quote+local+quote:all;
 });
 // Original inline CSS can refer to images too.
 html=html.replace(/url\(\s*(["']?)([^)'"]+\.(?:png|webp|jpg|jpeg|svg|gif))\1\s*\)/gi,(all,q,raw)=>{
  const local=recordAsset(raw);
  return local?'url("'+local+'")':all;
 });
 // Remove target when internal: never open another browser tab for wiki links.
 html=html.replace(/<a\b[^>]*>/gi,tag=>tag.includes('href="#wiki')?tag.replace(/\s+target=(?:"[^"]*"|'[^']*')/gi,''):tag);
 return html;
}
function getLinks(html){
 const found=[];
 for(const m of html.matchAll(/\bhref=(["'])#wiki\/([^"']+)\1/gi)){
  try{const p=decodeURI(m[2]);if(safeSlug(p)&&!p.startsWith('search/'))found.push(p)}catch(_){}
 }
 return [...new Set(found)];
}
function addFoundAssets(html){
 for(const m of html.matchAll(/\b(?:src|data-src|poster)=(["'])(wiki-original\/[^"']+)\1/gi)){
  const local=m[2];
  if(!assets.has(local)){
   const asset=local.startsWith('wiki-original/items/')?
     'https://images.verzum.to/item/'+local.slice('wiki-original/items/'.length):
     'https://wiki.verzum.to/'+local.slice('wiki-original/'.length);
   assets.set(local,asset);
  }
 }
}
function cleanText(s){return s.replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/\s+/g,' ').trim()}
function findTitle(html,path){
 const m=html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
 return m?cleanText(m[1]):path.split('/').at(-1);
}
function kindFor(path){return path.split('/')[0]}
function enrichIndex(path,html){
 const title=findTitle(html,path);
 indexPages.set(path,{path,title,group:kindFor(path)});
 for(const m of html.matchAll(/<a\b([^>]*\bhref=(["'])#wiki\/item\/(\d+)\2[^>]*)>([\s\S]*?)<\/a>/gi)){
  const [_,attrs,q,id,body]=m;
  if(!/^\d+$/.test(id))continue;
  const titleRaw=cleanText(body)||attrs.match(/\btitle=(["'])(.*?)\1/)?.[2]||attrs.match(/\bdata-name=(["'])(.*?)\1/)?.[2]||'';
  const name=titleRaw||body.match(/\balt=(["'])(.*?)\1/)?.[2]||'';
  if(name&&name.length<=190&&name!=='›'&&!/^\d+$/.test(name)){
   const prev=indexItems.get(id)||{id,name,aliases:[]};
   if(prev.name===prev.id||prev.name.length<=3)prev.name=name;
   if(!prev.aliases.includes(name))prev.aliases.push(name);
   indexItems.set(id,prev);
  }
 }
 // Preserve the exact original hover JSON when present.
 for(const m of html.matchAll(/<a\b([^>]*\bdata-tip=(["'])(\d+)\2[^>]*)>/gi)){
  const attrs=m[1],id=m[3],tip=attrs.match(/\bdata-tip-full=(["'])(.*?)\1/i)?.[2];
  if(!tip||ambiguousTips.has(id))continue;
  if(!tips.has(id))tips.set(id,tip);
  else if(tips.get(id)!==tip){tips.delete(id);ambiguousTips.add(id)}
 }
}
async function request(url,{binary=false}={}){
 let lastError;
 for(let attempt=0;attempt<3;attempt++){
  try{
   const ctl=new AbortController(),timeout=setTimeout(()=>ctl.abort(),20000);
   let res;
   try{res=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (compatible; VERZUM-Wiki-Archive/1.0)','Accept':binary?'image/avif,image/webp,image/png,image/*;q=0.8,*/*;q=0.1':'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8'},signal:ctl.signal,redirect:'follow'})}
   finally{clearTimeout(timeout)}
   if(!res.ok)throw new Error('HTTP '+res.status);
   const contentType=res.headers.get('content-type')||'';
   if(binary){
    if(!/^image\//i.test(contentType))throw new Error('Not an image: '+contentType);
    const body=Buffer.from(await res.arrayBuffer());
    if(body.length>8*1024*1024)throw new Error('Image too large');
    return body;
   }
   if(!contentType.includes('text/html'))throw new Error('Not HTML: '+contentType);
   const html=await res.text();
   if(html.length>5*1024*1024)throw new Error('Page too large');
   return html;
  }catch(e){lastError=e;if(attempt<2)await wait(450*(attempt+1)**2)}
 }
 throw lastError;
}
async function walkPrimary(){
 const raw=await readFile(join(root,'wiki-official-home.js'),'utf8');
 const obj=JSON.parse(raw.slice(raw.indexOf('=')+1).replace(/;\s*$/,''));
 const paths=[...new Set([...obj.sidebar.matchAll(/href="#wiki\/([^"]+)"/g)].map(x=>x[1]))];
 manifest.primary=paths;
 return paths;
}
async function doConcurrent(list,fn,workers=6){
 let i=0;
 await Promise.all(Array.from({length:Math.min(workers,list.length)},async()=>{
  while(i<list.length&&Date.now()<deadline){
   const current=list[i++];
   try{await fn(current)}catch(e){errors++;console.error('FAILED',current,String(e).slice(0,140))}
  }
 }));
}
const primary=await walkPrimary();
const seen=new Set(Object.keys(manifest.pages));
const remaining=new Set();
function addPage(path){
 if(!path||!safeSlug(path)||path.startsWith('search/'))return;
 if(!seen.has(path))remaining.add(path);
}
if(scope==='primary')for(const p of primary)addPage(p);
else{
 for(const p of primary)addPage(p);
 for(const path of Object.keys(manifest.pages)){
  const file=pageFile(path);
  if(existsSync(file)){
   const html=await readFile(file,'utf8');
   enrichIndex(path,html);
   addFoundAssets(html);
   for(const id of getLinks(html))addPage(id);
  }
 }
}
// Always rebuild all existing tooltip/id metadata from the full saved pages in both scopes.
if(scope==='primary'){
 for(const path of Object.keys(manifest.pages)){
  const file=pageFile(path);
  if(existsSync(file)){const html=await readFile(file,'utf8');enrichIndex(path,html);addFoundAssets(html)}
 }
}
seedCount=remaining.size;
async function visit(path){
 if(seen.has(path)||Date.now()>deadline)return;
 seen.add(path);
 const url=urlBase+path;
 try{
  const raw=await request(url);
  const main=extractMain(raw);
  if(!main||!/\bwiki-main\b/i.test(main)||main.length<130)throw new Error('Missing original wiki-main');
  const html=rewriteLinks(main);
  const file=pageFile(path);await mkdir(dirname(file),{recursive:true});await writeFile(file,html,'utf8');
  manifest.pages[path]={bytes:Buffer.byteLength(html),title:findTitle(html,path),at:new Date().toISOString()};
  delete manifest.failures[path];
  updated++;enrichIndex(path,html);
  if(scope==='all')for(const link of getLinks(html))addPage(link);
  processed++;
 }catch(e){
  seen.delete(path);
  manifest.failures[path]=String(e.message||e).slice(0,180);
  errors++;
  if(errors<25)console.error('PAGE ERROR',path,manifest.failures[path]);
 }
}
console.log('MIRROR',scope,'known pages',Object.keys(manifest.pages).length,'primary',primary.length,'first queue',seedCount);
while(remaining.size&&Object.keys(manifest.pages).length<maxPages&&Date.now()<deadline){
 const batch=[...remaining].slice(0,scope==='primary'?100:150);
 batch.forEach(x=>remaining.delete(x));
 await doConcurrent(batch,visit,scope==='primary'?6:5);
 if(scope==='primary')break;
 if(Object.keys(manifest.pages).length%300<batch.length)console.log('PROGRESS',Object.keys(manifest.pages).length,'pages; pending',remaining.size,'errors',errors);
}
for(const path of Object.keys(manifest.pages)){
 if(!indexPages.has(path)){
  const file=pageFile(path);
  if(existsSync(file)){const html=await readFile(file,'utf8');enrichIndex(path,html);addFoundAssets(html)}
 }
}
// Only load URLs actually sourced from saved genuine HTML.
const assetList=[...assets.entries()].filter(([local])=>!manifest.assets[local]&&!existsSync(join(root,local))).slice(0,maxAssets);
const downloaded=[];
await doConcurrent(assetList,async([local,url])=>{
 try{
  const bytes=await request(url,{binary:true});
  const file=join(root,local);await mkdir(dirname(file),{recursive:true});
  await writeFile(file,bytes);
  manifest.assets[local]={bytes:bytes.length};
  imagesWritten++;
 }catch(e){if(errors<25)console.error('IMAGE ERROR',local,String(e.message||e));errors++}
},8);
for(const [key,entry] of Object.entries(manifest.assets))if(!existsSync(join(root,key)))delete manifest.assets[key];
// Generate deterministic utility positioning rules from original classes
const css=new Set();
for(const path of Object.keys(manifest.pages)){
 const file=pageFile(path);
 if(!existsSync(file))continue;
 const html=await readFile(file,'utf8');
 for(const match of html.matchAll(/class=["']([^"']+)["']/g)){
  for(const token of match[1].split(/\s+/)){
   let m;
   if((m=/^wkpos-(\d+)-(\d+)$/.exec(token)))css.add('.vz-wiki .wk-panel__cell.'+token+'{left:'+m[1]+'px;top:'+m[2]+'px}');
   else if((m=/^wkbox-(\d+)-(\d+)$/.exec(token)))css.add('.vz-wiki .wk-panel__cell.'+token+'{width:'+m[1]+'px;height:'+m[2]+'px}');
   else if((m=/^wkw-(\d+)_(\d+)$/.exec(token)))css.add('.vz-wiki .'+token+'{width:'+m[1]+'.'+m[2]+'%}');
   else if((m=/^wkw-(\d+)$/.exec(token)))css.add('.vz-wiki .'+token+'{width:'+m[1]+'%}');
   else if((m=/^wkmnw-(\d+)$/.exec(token)))css.add('.vz-wiki .'+token+'{min-width:'+m[1]+'px}');
   else if((m=/^wkc-([a-f0-9]{6})$/i.exec(token)))css.add('.vz-wiki .'+token+'{color:#'+m[1]+'}');
   else if((m=/^wkmt-(\d+)$/.exec(token)))css.add('.vz-wiki .'+token+'{margin-top:'+m[1]+'px}');
  }
 }
}
await writeFile(join(root,'wiki-mirror-utilities.css'),'/* Original Wiki classes extracted from imported HTML. */\n'+[...css].sort().join('\n')+'\n','utf8');
// Keep ambiguously bonusable items scoped to their exact HTML element rather than
// mistakenly applying class-specific bonuses to other items of the same ID.
const tooltipObj=Object.fromEntries([...tips.entries()].filter(([id])=>!ambiguousTips.has(id)));
await writeFile(join(root,'wiki-tooltips.generated.js'),'window.VERZUM_WIKI_CRAWLED_TOOLTIPS='+JSON.stringify(tooltipObj)+';\n','utf8');
const itemIds=[...indexItems.values()].sort((a,b)=>a.id.localeCompare(b.id));
const docs=[...indexPages.values()].sort((a,b)=>a.path.localeCompare(b.path));
await writeFile(join(root,'wiki-index.generated.js'),'window.VERZUM_WIKI_CRAWLED_INDEX='+JSON.stringify({items:itemIds,pages:docs})+';\n','utf8');
manifest.generated=new Date().toISOString();manifest.counts={pages:Object.keys(manifest.pages).length,primaryCompleted:primary.filter(p=>manifest.pages[p]).length,primaryTotal:primary.length,images:Object.keys(manifest.assets).length,tooltipIds:Object.keys(tooltipObj).length,indexedItems:itemIds.length,indexedPages:docs.length,errors:errors,unfinished:remaining.size,scope};
await writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n','utf8');
console.log('MIRROR RESULT',JSON.stringify(manifest.counts),'updated',updated,'downloaded images',imagesWritten);
if(scope==='primary'&&manifest.counts.primaryCompleted!==primary.length){console.error('WARNING: some primary links unavailable; all unavailable pages remain uncreated.')}
