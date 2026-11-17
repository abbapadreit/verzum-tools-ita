/* VERZUM Wiki — fedele all'originale, link interni e icone autentiche. */
(function(){
'use strict';
const reference=window.VERZUM_WIKI_MARKUP;
if(!reference||!reference.sidebar||!reference.home)return;
const GUIDE='guides/vz_level_1_75';
let guideHtml='',loadingGuide=false,loadError='';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const getPath=()=>{
 const hash=location.hash;
 if(hash==='#guide')return GUIDE;
 if(hash==='#wiki'||hash==='#wiki/')return '';
 if(hash.startsWith('#wiki/')){try{return decodeURI(hash.slice(6)).split('?')[0].replace(/\/+$/,'')}catch(e){return ''}}
 return '';
};
function sideFor(path){
 let markup=reference.sidebar;
 if(path)markup=markup.replace(/<details class="wk-cat">[\s\S]*?<\/details>/g,m=>m.includes('href="#wiki/'+path+'"')?m.replace('<details class="wk-cat">','<details class="wk-cat" open>'):m);
 return markup;
}
function missingPage(path){
 const safe=path.replace(/[^a-zA-Z0-9/_-]/g,'');
 const matcher=new RegExp('href="#wiki/'+safe+'">([^<]+)</a>');
 const link=reference.sidebar.match(matcher);
 const title=link?.[1]||'Pagina non ancora acquisita';
 return '<div class="wiki-main" id="wiki-main"><header class="wk-head"><nav class="wk-crumbs"><ol><li><a href="#wiki">Verzum Wiki</a></li></ol></nav><div class="wk-head__row"><h1 class="wk-head__title">'+esc(title)+'</h1></div></header><article class="wk-doc wk-page"><p class="wk-p">Questa pagina deve ancora essere trasferita nell’archivio locale. Non sono stati inventati testi o immagini sostitutive.</p></article></div>';
}
function output(){
 const path=getPath();
 const main=path===''?reference.home:path===GUIDE?
    (guideHtml||'<div class="wiki-main"><p class="wk-p">'+(loadError?'La guida originale non è disponibile in questa versione.':'Caricamento della guida originale…')+'</p></div>'):
    missingPage(path);
 return '<div class="vz-wiki wiki"><div class="wiki__grid">'+sideFor(path)+main+'</div></div>';
}
function officialPanels(){return [panel('wikiOfficial','Verzum Wiki',output(),12,'WIKI')]}
sections.wiki=officialPanels;
sections.guide=officialPanels;
TITLES.wiki=['WIKI','Verzum Wiki',''];
TITLES.guide=['GUIDA 1–75','Guida ai livelli 1–75',''];
async function loadGuide(){
 if(guideHtml||loadingGuide)return;
 loadingGuide=true;
 try{
  const r=await fetch('wiki-official-guide.html',{cache:'force-cache'});
  if(!r.ok)throw new Error('HTTP '+r.status);
  const html=await r.text();
  if(!html.includes('class="wk-hero ')||!html.includes('id="s9"'))throw new Error('Guida incompleta');
  guideHtml=html;
 }catch(e){loadError=String(e.message||e)}
 finally{
  loadingGuide=false;
  if(state.route==='guide'||(state.route==='wiki'&&getPath()===GUIDE))render();
 }
}
loadGuide();
const host=document.getElementById('panels');
host?.addEventListener('click',e=>{
 const inside=e.target.closest('.vz-wiki');
 if(!inside)return;
 const anchor=e.target.closest('a[href^="#s"]');
 if(anchor){
  const section=inside.querySelector(anchor.getAttribute('href'));
  if(section){e.preventDefault();section.scrollIntoView({behavior:'smooth',block:'start'});}
  return;
 }
 const btn=e.target.closest('[data-wk-copy]');
 if(btn){
  e.preventDefault();
  const url=new URL(location.pathname+location.search+'#wiki/'+GUIDE,location.origin).href;
  navigator.clipboard?.writeText(url).then(()=>{const node=btn.querySelector('span');if(node)node.textContent='Link copiato'}).catch(()=>{});
  return;
 }
 const searchButton=e.target.closest('.wk-search button[type="submit"]');
 if(searchButton){e.preventDefault();searchWiki(inside);}
});
host?.addEventListener('submit',e=>{
 if(!e.target.matches('.vz-wiki .wk-search'))return;
 e.preventDefault();
 searchWiki(e.target.closest('.vz-wiki'));
});
host?.addEventListener('input',e=>{
 if(!e.target.matches('.vz-wiki .wk-search__input'))return;
 const input=e.target,kw=input.value.trim().toLocaleLowerCase('it');
 const side=input.closest('.wiki-side');
 if(!side)return;
 side.querySelectorAll('.wk-subs a').forEach(a=>{a.hidden=!!kw&&!a.textContent.toLocaleLowerCase('it').includes(kw)});
 side.querySelectorAll('.wk-cat').forEach(d=>{
  const found=Array.from(d.querySelectorAll('.wk-subs a')).some(a=>!a.hidden);
  d.hidden=!!kw&&!found;
  if(kw&&found)d.open=true;
 });
});
function searchWiki(scope){
 const input=scope.querySelector('.wk-search__input');
 const q=input?.value.trim();
 if(!q){input?.focus();return}
 const anchors=Array.from(scope.querySelectorAll('.wk-subs a'));
 const exact=anchors.find(a=>a.textContent.toLocaleLowerCase('it')===q.toLocaleLowerCase('it'));
 if(exact){location.hash=exact.getAttribute('href');return}
 const first=anchors.find(a=>!a.hidden);
 if(first)location.hash=first.getAttribute('href');
}
if(state.route==='wiki'||state.route==='guide')render();
window.VERZUM_WIKI_OFFICIAL={get loaded(){return !!guideHtml},guide:GUIDE,sidebarCategories:10};
})();
