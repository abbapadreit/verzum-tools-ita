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
 const searchApi=window.VERZUM_WIKI_SEARCH;
 const main=path===''?reference.home:path===GUIDE?
    (guideHtml||'<div class="wiki-main"><p class="wk-p">'+(loadError?'La guida originale non è disponibile in questa versione.':'Caricamento della guida originale…')+'</p></div>'):
    path.startsWith('search/')||path==='search'?(searchApi?.renderPage(path)||missingPage(path)):
    path.startsWith('item/')?(searchApi?.renderItemPage(path.slice(5))||missingPage(path)):
    missingPage(path);
 return '<div class="vz-wiki wiki"><div class="wiki__grid"><button class="wk-drawer-btn" type="button" data-wk-drawer aria-expanded="false" aria-controls="wiki-side"><svg class="ic-line" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg><span>Categorie</span></button>'+sideFor(path)+main+'</div><div class="wk-backdrop" data-wk-drawer-close hidden></div></div>';
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
 const open=e.target.closest('[data-wk-drawer]');
 const close=e.target.closest('[data-wk-drawer-close]');
 if(open){e.preventDefault();inside.classList.add('is-drawer');open.setAttribute('aria-expanded','true');const bg=inside.querySelector('.wk-backdrop');if(bg)bg.hidden=false;return}
 if(close){e.preventDefault();inside.classList.remove('is-drawer');const bg=inside.querySelector('.wk-backdrop');if(bg)bg.hidden=true;inside.querySelector('[data-wk-drawer]')?.setAttribute('aria-expanded','false');return}
});
if(state.route==='wiki'||state.route==='guide')render();
window.VERZUM_WIKI_OFFICIAL={get loaded(){return !!guideHtml},guide:GUIDE,sidebarCategories:10};
})();
