/* VERZUM TOOLS — Biblioteca interna. Navigazione senza collegamenti esterni. */
(function(){
'use strict';
const E=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const g=window.VERZUM_GUIDE_VISUAL||{}, itemNames=g.items||{};
const imported=window.VERZUM_WIKI_DATA&&typeof window.VERZUM_WIKI_DATA==='object'?window.VERZUM_WIKI_DATA:{};
const pages={
 'guides/vz_level_1_75':{title:'Guida ai livelli 1–75',group:'Guide',body:'Un percorso per crescere dal livello 1 al 75, preparare l’equipaggiamento per classe, affrontare i dungeon e organizzare alchimia, Gaya e farming.',related:['systems/level_guide','dungeons/monkey','dungeons/orc','dungeons/spider','dungeons/demon_tower','dungeons/azrael']},
 'systems/level_guide':{title:'Guida al progresso',group:'Sistemi',body:'Segui gli obiettivi del personaggio per fasce di livello: abilità, missioni, biologo, pet, cavalcatura e potenziamento dell’equipaggiamento.',related:['guides/vz_level_1_75']},
 'dungeons/monkey':{title:'Dungeon delle Scimmie',group:'Dungeon',body:'Fase iniziale, indicata nella progressione dal livello 30. Affianca il dungeon all’equipaggiamento +9, alla preparazione del pet e agli obiettivi del biologo.',related:['guides/vz_level_1_75']},
 'dungeons/orc':{title:'Dungeon degli Orchi',group:'Dungeon',body:'Una delle tappe della fascia 40–54: prosegui le missioni e prepara l’equipaggiamento per i dungeon successivi.',related:['dungeons/spider','guides/vz_level_1_75']},
 'dungeons/spider':{title:'Dungeon dei Ragni',group:'Dungeon',body:'Dalla fascia 55, l’obiettivo è consolidare un set PvM adatto alla classe, le pietre e l’alchimia leggendaria opaca.',related:['systems/alchemy','guides/vz_level_1_75']},
 'dungeons/demon_tower':{title:'Torre dei Demoni',group:'Dungeon',body:'Prima del livello 75, prepara bonus contro Zombie, resistenza all’oscurità, pietre +4 e abilità PvM.',related:['dungeons/azrael','guides/vz_level_1_75']},
 'dungeons/azrael':{title:'Azrael',group:'Dungeon',body:'Tappa della progressione dal livello 75: servono un’arma e un’armatura adeguate, abilità sviluppate e un set alchemico preparato.',related:['systems/alchemy','guides/vz_level_1_75']},
 'systems/alchemy':{title:'Alchimia del drago',group:'Sistemi',body:'La guida 1–75 propone un set di sei pietre del drago leggendarie opache +4 per proseguire nei dungeon. Controlla i bonus necessari alla tua classe.',related:['guides/vz_level_1_75']},
 'systems/gaya_system':{title:'Sistema Gaya',group:'Sistemi',body:'Gli accessori del negozio Gaya possono migliorare il farming e la progressione. Pianifica i costi con il calcolatore Gaya già presente negli strumenti.',related:['guides/vz_level_1_75']},
 'systems/crystals':{title:'Cristalli VERZUM',group:'Sistemi',body:'La guida descrive cristalli evocabili con frammenti raccolti dai Metin idonei e relativi oggetti di evocazione.',related:['guides/vz_level_1_75']}
};
const mobMap={
 '8003':['Metin della Battaglia','15'],'8007':['Metin della Gelosia','35'],
 '8009':['Metin dell’ombra','45'],'8011':['Metin del Diavolo','55'],
 '8012':['Metin della Caduta','60'],'8014':['Metin dell’Assassino','70'],
 '8027':['Metin Jeon-Un','90'],
 '22524':['Cristallo Invidia','35'],'22525':['Cristallo Anima','40'],'22526':['Cristallo Diavolo','55']
};
for(const [id,[title,level]] of Object.entries(mobMap)){
 pages['mob/'+id]={title,group:'Metin e cristalli',body:'Livello indicato: '+level+'. Consulta la guida per collocare questo bersaglio nel percorso di farming.',related:['guides/vz_level_1_75','systems/crystals']};
}
function normalize(p){try{return decodeURI(p).replace(/^#?\/?/,'').replace(/\/{2,}/g,'/').replace(/\/$/,'')}catch(e){return ''}}
function path(){const raw=location.hash.replace(/^#wiki\/?/,'');return normalize(raw);}
function link(p,title,cls='wiki-entry'){return '<a class="'+cls+'" href="#wiki/'+encodeURI(p)+'">'+E(title)+'</a>'}
function localIcon(id){
 const src=(window.VERZUM_PNG_ICONS||{})[id]||(/^\d+$/.test(id)?(window.VERZUM_PNG_ICONS||{})[String(Number(id)-Number(id)%10)]:'');
 return src?'<img src="'+src+'" width="46" height="46" loading="lazy" decoding="async" alt="">':'<span aria-hidden="true">◆</span>';
}
function importedPage(p){
 if(!Object.prototype.hasOwnProperty.call(imported,p))return null;
 const a=imported[p];
 return a&&typeof a==='object'&&!Array.isArray(a)?a:null;
}
function itemPage(p){
 const id=p.slice(5),name=itemNames[id],known=!!name;
 if(!/^[a-z0-9_-]{1,48}$/i.test(id))return null;
 const base=/^\d+$/.test(id)?String(Number(id)-Number(id)%10):id;
 const object=(RELEASE.catalog||[]).find(o=>String(o.id)===id||String(o.id)===base);
 const title=name||object?.name||('Oggetto '+id);
 let body='<div class="wiki-item-main"><div class="wiki-item-icon">'+localIcon(id)+'</div><div><span class="wiki-kicker">SCHEDA OGGETTO</span><h3>'+E(title)+'</h3><p>Identificativo: '+E(id)+'</p></div></div>';
 if(object){
  body+='<dl class="wiki-details"><div><dt>Categoria</dt><dd>'+E(object.cat||'—')+'</dd></div><div><dt>Livelli di potenziamento</dt><dd>'+E((object.steps||[]).length)+'</dd></div></dl>';
  body+='<p>Per materiali, probabilità e costo del potenziamento usa la sezione Potenziamenti: i valori sono gestiti nel catalogo del progetto.</p>';
 }
 if(known){
  body+='<p>Questo oggetto è presente nel percorso visuale 1–75. Consulta la guida per vederlo nel contesto dell’equipaggiamento e del farming.</p>';
 }else if(!object){
  body+='<p>La scheda dettagliata non è ancora disponibile nell’archivio locale; puoi continuare a navigare nella nostra guida senza lasciare il sito.</p>';
 }
 body+='<div class="wiki-inline-links">'+link('guides/vz_level_1_75','Guida 1–75')+'<a href="#upgrade" class="wiki-entry">Potenziamenti</a></div>';
 return {title,body,group:'Oggetti',isHTML:true};
}
function sourcePage(p){
 if(importedPage(p)){
  const x=importedPage(p);
  return {title:String(x.title||p),group:String(x.group||'Wiki importata'),body:String(x.html||''),isHTML:true,imported:true,related:Array.isArray(x.related)?x.related:[]};
 }
 if(p.startsWith('item/'))return itemPage(p);
 return pages[p]||null;
}
function cards(list){
 return '<div class="wiki-cards">'+list.map(([p,n])=>'<a href="#wiki/'+encodeURI(p)+'" class="wiki-card"><span>'+E(n)+'</span><span aria-hidden="true">›</span></a>').join('')+'</div>';
}
function home(){
 const all={...pages};
 for(const [p,data] of Object.entries(imported))if(!all[p]&&data&&data.title)all[p]={title:String(data.title),group:String(data.group||'Wiki importata')};
 const groups={};
 for(const [p,v] of Object.entries(all)){const key=v.group||'Altri contenuti';(groups[key]??=[]).push([p,v.title])}
 let out='<div class="wiki-intro"><span class="wiki-kicker">BIBLIOTECA VERZUM</span><h2>La Wiki, dentro i nostri strumenti</h2><p>Schede e approfondimenti raggiungibili senza aprire siti esterni. Le pagine disponibili sono organizzate per argomento.</p><input class="wiki-search" type="search" data-wiki-search placeholder="Cerca dungeon, oggetti o sistemi…" aria-label="Cerca nelle schede Wiki"></div>';
 for(const [grp,entries] of Object.entries(groups)){
  out+='<section class="wiki-section"><h3>'+E(grp)+'</h3>'+cards(entries)+'</section>';
 }
 const entries=Object.entries(itemNames);
 if(entries.length)out+='<section class="wiki-section"><h3>Oggetti della guida ('+entries.length+')</h3>'+cards(entries.map(([id,n])=>['item/'+id,n]))+'</section>';
 return out;
}
function article(p,d){
 let out='<div class="wiki-crumb"><a href="#wiki">Biblioteca</a><span>›</span>'+E(d.group||'Scheda')+'</div><div class="wiki-article"><span class="wiki-kicker">'+E(d.group||'WIKI VERZUM')+'</span><h2>'+E(d.title)+'</h2>';
 out+=d.isHTML?d.body:'<p>'+E(d.body||'')+'</p>';
 if(p==='guides/vz_level_1_75'&&g.levelSteps){
  out+='<h3>Percorso per livelli</h3><div class="wiki-stage-grid">'+g.levelSteps.map(s=>'<div class="wiki-stage"><b>Livelli '+E(s.id)+'</b><h4>'+E(s.title)+'</h4><p>'+E(s.p)+'</p></div>').join('')+'</div>';
 }
 if(p==='systems/alchemy')out+='<div class="wiki-inline-links">'+['124040','134040','144040','154040','114040','164040'].map(id=>link('item/'+id,itemNames[id]||id)).join('')+'</div>';
 if(p==='systems/gaya_system')out+='<div class="wiki-inline-links">'+['100129','100130','100131','100138','100142'].map(id=>link('item/'+id,itemNames[id]||id)).join('')+'</div>';
 if(Array.isArray(d.related)&&d.related.length)out+='<section class="wiki-related"><h3>Altri approfondimenti</h3>'+cards(d.related.filter(p=>p!==path()).map(p=>[p,(pages[p]||importedPage(p)||{}).title||p]))+'</section>';
 out+='<div class="wiki-article-bottom"><a href="#wiki">Torna alla biblioteca</a><a href="#guide">Guida visuale 1–75</a></div></div>';
 return out;
}
function renderWiki(){
 const p=path(),doc=p?sourcePage(p):null;
 const content=!p?home():doc?article(p,doc):'<div class="wiki-article"><h2>Scheda non ancora disponibile</h2><p>Questa pagina non è presente nell’archivio locale. Puoi esplorare le altre schede senza uscire dal sito.</p><a href="#wiki">Biblioteca VERZUM</a></div>';
 return [panel('wikiArchive','Biblioteca VERZUM',content,12,'WIKI')];
}
TITLES.wiki=['WIKI INTERNA','Biblioteca VERZUM','Guide, sistemi, dungeon, Metin e oggetti consultabili senza lasciare il progetto.'];
sections.wiki=renderWiki;
function hashRoute(){
 const h=location.hash.slice(1);
 if(h==='wiki'||h.startsWith('wiki/')){
  state.route='wiki';state.edit=false;render();
 }
}
window.addEventListener('hashchange',hashRoute);
document.getElementById('panels')?.addEventListener('input',e=>{
 if(!e.target.matches('[data-wiki-search]'))return;
 const q=e.target.value.toLocaleLowerCase().trim();
 document.querySelectorAll('.wiki-card').forEach(n=>{n.hidden=!n.textContent.toLocaleLowerCase().includes(q)});
 document.querySelectorAll('.wiki-section').forEach(n=>{n.hidden=!Array.from(n.querySelectorAll('.wiki-card')).some(c=>!c.hidden)});
});
if(location.hash==='#wiki'||location.hash.startsWith('#wiki/'))hashRoute();
window.VERZUM_WIKI_INTERNAL={availablePages:Object.keys(pages).length,items:Object.keys(itemNames).length,importedPages:Object.keys(imported).length};
})();