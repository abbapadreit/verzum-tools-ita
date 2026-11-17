/* VERZUM TOOLS · Guida visuale 1–75.
 * Dati, immagini e pagine di approfondimento: Wiki Verzum ufficiale.
 * I contenuti sono riorganizzati in sintesi originali; la wiki resta la fonte completa.
 */
(function(){
'use strict';
const W='https://wiki.verzum.to/it/';
const IMG='https://images.verzum.to/item/';
const items={
'50187':'Baule Apprendista I','50188':'Baule Apprendista II','50203':'Baule Apprendista III','50189':'Baule Apprendista IV',
'28550':'Pietra del Mostro +5','28555':'Pietra dell’attacco +5',
'3219':'Lama di Ferro Rosso +9','11279':'Corazza d’Oro +9','12249':'Sallet Spirituale +9','13049':'Scudo Rotondo Nero +9','14149':'Bracciale di Platino +9','17109':'Orecchini d’Ebano +9','16029':'Collana di Rame +9','15049':'Scarpe in Legno +9','85003':'Stola Signore nobile',
'71143':'Anello della gioia','100138':'Anello di luna crescente','100142':'Amuleto Nazar','100131':'Collana dell’Amore','100130':'Bracciale dell’Armonia','100129':'Bracciale dell’Amore','100132':'Booster Arma (Bronzo)','100133':'Booster Acconciatura (Bronzo)','100134':'Booster Costume (Bronzo)',
'1179':'Pugnale Foglia Nera +9','11479':'Abito Vento Assassino +9','12389':'Cappuccio d’Acciaio +9','299':'Spada della Luna Piena +9','11679':'Corazza Maschera Spirituale +9','12529':'Elmo del Castello +9','5119':'Campana Antica +9','11879':'Vestito Gatto Arancione +9','12669':'Cappello Luce Solare +9',
'124040':'Rubino leggendario del drago +4','134040':'Giada leggendaria del drago +4','144040':'Zaffiro leggendario del drago +4','154040':'Granato leggendario del drago +4','114040':'Diamante leggendario del drago +4','164040':'Onice leggendaria del drago +4',
'50821':'Rugiada rossa','50823':'Rugiada gialla','50825':'Rugiada blu','50822':'Rugiada rosa',
'100105':'Vita Dio Drago (Bronzo)','100106':'Attacco Dio Drago (Bronzo)','100107':'Difesa Dio Drago (Bronzo)','100109':'Lotta Critica (Bronzo)','100110':'Lotta Trafiggente (Bronzo)','100111':'Pozione Verde (Bronzo)',
'27870':'Pesce della forza','27876':'Pesce dell’intelligenza','27872':'Pesce della destrezza','27878':'Pesce dell’attacco',
'2179':'Arco d’Acciaio Corvino +9','100102':'Guanti del Ladro',
'100021':'Cristallo Verzum (Invidia)','100022':'Cristallo Verzum (Anima)','100023':'Cristallo Verzum (Diavolo)','100136':'Biglietto cristallo Verzum'
};
const equipment={
Guerriero:['3219','11279','12249','13049','14149','17109','16029','15049','85003'],
Ninja:['1179','11479','12389','13049','14149','17109','16029','15049','85003'],
Sura:['299','11679','12529','13049','14149','17109','16029','15049','85003'],
Sciamano:['5119','11879','12669','13049','14149','17109','16029','15049','85003']
};
const boosters=['71143','100138','100142','100131','100130','100129','100132','100133','100134'];
const alchemy=['124040','134040','144040','154040','114040','164040'];
const dew=['50821','50823','50825','50822'];
const bronze=['100105','100106','100107','100109','100110','100111'];
const fish=['27870','27876','27872','27878'];
const gaya=[
 {id:'100129',p:35,b:'Danni contro mostri +2%'},
 {id:'100130',p:35,b:'Danni contro Metin +2%'},
 {id:'100131',p:35,b:'Danni contro boss +2%'},
 {id:'100138',p:75,b:'HP +1.000 e danni contro mostri +5%'},
 {id:'100142',p:75,b:'Danni contro mostri e Metin, possibilità lingotto extra'}
];
const levelSteps=[
 {id:'1-29',title:'Le basi del personaggio',p:'Completa i compiti iniziali, scopri il Battlepass e imposta la tua abilità PvM principale. Inizia lo sviluppo di pet, cavalcatura e Buffi.',chips:['Compiti 10','Abilità PvM','Pet e cavalcatura'],item:[],link:'systems/level_guide'},
 {id:'30-39',title:'Prima arma +9',p:'Prepara un’arma livello 30 a +9 con Danni medi indicativamente dal 30% e pietre +3. Avvia il dungeon delle Scimmie, le ricerche del biologo e la bacheca delle missioni.',chips:['Scimmie','Biologo 30','Pet tipo 2'],item:['50187'],link:'dungeons/monkey'},
 {id:'40-54',title:'I dungeon e l’alchimia',p:'Sblocca gli Orchi dal 40 e gli Esoterici dal 45. Migliora l’equipaggiamento, prosegui il biologo e prepara il primo set di alchimia leggendaria.',chips:['Orchi 40','Esoterico 45','Pet 40'],item:['50188'],link:'dungeons/orc'},
 {id:'55-64',title:'Costruisci il set per farming',p:'Concentrati sul dungeon dei Ragni, sui potenziamenti del set e sull’alchimia opaca. Porta avanti le missioni e avvicina il pet al livello 60.',chips:['Ragni','Biologo 60','Cavalcatura 10/10'],item:['50203'],link:'dungeons/spider'},
 {id:'65-74',title:'Verso Torre dei Demoni',p:'Prepara danni medi, resistenza all’oscurità, bonus contro Zombie e pietre +4. Porta l’abilità PvM principale a G, avvia le passive e continua il biologo.',chips:['Mietitore','Stola','Talismano oscuro'],item:[],link:'dungeons/demon_tower'},
 {id:'75',title:'Accesso ad Azrael',p:'Prepara un’arma livello 75 +9, almeno una abilità importante a P, armatura 66 +9 e l’alchimia per il dungeon. Verifica le pietre consigliate.',chips:['Azrael','Abilità P','Alchimia mitica'],item:['50189','28550','28555'],link:'dungeons/azrael'}
];
const metins=[
 ['Metin della Battaglia','15','8003'],
 ['Metin della Gelosia','35','8007'],
 ['Metin dell’ombra','45','8009'],
 ['Metin del Diavolo','55','8011'],
 ['Metin della Caduta','60','8012'],
 ['Metin dell’Assassino','70','8014'],
 ['Metin Jeon-Un','90','8027']
];
const escapeHtml=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const href=(path)=>W+path;
const wikiLink=(path,label)=>'<a class="guide-wiki-link" href="'+href(path)+'" target="_blank" rel="noopener noreferrer">'+escapeHtml(label)+'</a>';
function icon(id,compact=false){
 const label=items[id]||('Oggetto '+id);
 // Asset ufficiale via URL pubblico documentato dalla Wiki: non alterare ID, nome, né file.
 return '<a class="guide-item '+(compact?'compact':'')+'" href="'+href('item/'+id)+'" target="_blank" rel="noopener noreferrer" title="'+escapeHtml(label)+' · scheda Wiki" aria-label="'+escapeHtml(label)+'">'
 +'<span class="guide-item-thumb"><img src="'+IMG+id+'.png" width="40" height="40" alt="'+escapeHtml(label)+'" loading="lazy" decoding="async"></span>'
 +'<span class="guide-item-label">'+escapeHtml(label)+'</span>'
 +'</a>';
}
const grid=(ids)=>'<div class="guide-item-grid">'+ids.map(id=>icon(id)).join('')+'</div>';
const titleBlock=(heading,sub)=>'<div class="guide-block-title"><h3>'+heading+'</h3>'+(sub?'<p>'+sub+'</p>':'')+'</div>';
function guidePanels(){
 const active=levelSteps.find(x=>x.id===state.guideLevelRange)||levelSteps[0];
 const cls=equipment[state.guideClass]?state.guideClass:'Guerriero';
 const top='<div class="guide-source-line"><span class="guide-source-mark">VERZUM 1–75</span>'+wikiLink('guides/vz_level_1_75','Consulta la guida completa sulla Wiki ufficiale')+'</div>'
 +'<p class="guide-lede">Un percorso visivo per scegliere l’equipaggiamento, pianificare i potenziamenti e riconoscere gli oggetti da utilizzare. Seleziona la fascia di livello o la tua classe.</p>';
 const levels='<div class="guide-levels" role="group" aria-label="Fasce di livello">'+levelSteps.map(x=>'<button type="button" class="filter-chip '+(x.id===active.id?'active':'')+'" data-guide-level="'+x.id+'">'+x.id+'</button>').join('')+'</div>'
 +'<div class="guide-feature"><div><span class="pill">Livelli '+active.id+'</span><h3>'+escapeHtml(active.title)+'</h3><p>'+escapeHtml(active.p)+'</p><div class="guide-chips">'+active.chips.map(x=>'<span>'+escapeHtml(x)+'</span>').join('')+'</div>'+wikiLink(active.link,'Approfondisci sulla Wiki')+'</div>'+(active.item.length?grid(active.item):'')+'</div>';
 const allLevels=levelSteps.map(x=>'<details class="guide-disclosure" '+(x.id===active.id?'open':'')+'><summary><span>'+x.id+'</span> '+escapeHtml(x.title)+'</summary><div><p>'+escapeHtml(x.p)+'</p>'+ (x.item.length?grid(x.item):'')+wikiLink(x.link,'Vai al sistema o dungeon')+'</div></details>').join('');
 const metinTable=table(['#','Metin','Livello'],metins.map((a,i)=>'<tr><td>'+(i+1)+'</td><td>'+wikiLink('mob/'+a[2],a[0])+'</td><td>'+a[1]+'</td></tr>'));
 const metinContent='<p>Ordine indicativo per il farming: i numeri rappresentano il livello del Metin, non l’accesso minimo del personaggio.</p>'+metinTable;
 const classMenu='<div class="guide-classes" role="group" aria-label="Classe del personaggio">'+Object.keys(equipment).map(n=>'<button type="button" class="filter-chip '+(cls===n?'active':'')+'" data-guide-class="'+n+'">'+n+'</button>').join('')+'</div>';
 const equipContent='<p>Equipaggiamento PvM per il livello 55, in preparazione al dungeon dei Ragni. Seleziona la classe per vedere gli oggetti esatti.</p>'
 +classMenu+titleBlock('Set '+escapeHtml(cls),'Arma, corazza, elmo, scudo, accessori e stola per la classe selezionata')+grid(equipment[cls])
 +titleBlock('Accessori Gaya e booster','Oggetti complementari elencati nella guida ufficiale')+grid(boosters)
 +'<p class="guide-hint">Pietre +3 per i Ragni, +4 verso il Mietitore. Per Azrael sono consigliate Pietra del Mostro +5 nell’arma e Pietra dell’attacco +5 nell’armatura.</p>'+grid(['28550','28555']);
 const alchemyContent='<p>Profilo consigliato per l’equipaggiamento da dungeon: sei pietre del drago leggendarie opache potenziate a +4.</p>'+grid(alchemy)
 +'<p class="guide-hint">Controlla i bonus per rubino, giada, granato e gli altri pezzi in base alla classe e al dungeon.</p>'+wikiLink('systems/alchemy','Scheda ufficiale dell’alchimia');
 const upgradeContent=titleBlock('Rugiade','Potenziamenti temporanei che accompagnano il set da farming')+grid(dew)
 +titleBlock('Pozioni e booster Bronzo','Supporto a danni, difesa, colpi critici, perforanti e velocità')+grid(bronze)
 +titleBlock('Pesci per bonus di combattimento','Scegli quelli utili alle statistiche della tua classe')+grid(fish)
 +'<div class="guide-brief-grid"><div><b>Abilità e Buffi</b><p>Priorità all’abilità PvM principale e ai Buffi; valorizza Benedizione e Aiuto del drago.</p></div><div><b>Pet e cavalcatura</b><p>Pet verso il livello 40–60, cavalcatura evoluta e abilità contro i mostri da migliorare.</p></div><div><b>Biologo</b><p>Completa progressivamente le ricerche 30, 40 e 50, poi affronta quelle del 60.</p></div></div>'
 +titleBlock('Esempio arma alternativa','Arco per chi usa un personaggio Ninja a distanza')+grid(['2179']);
 const gayaContent='<p>Nel negozio Gaya fisso puoi investire in accessori utili già nella fase iniziale. I prezzi indicati sono quelli riportati nella guida ufficiale.</p>'
 +'<div class="guide-gaya-grid">'+gaya.map(x=>'<div class="guide-gaya-card">'+icon(x.id)+'<div><b>'+x.p+' Gaya</b><small>'+escapeHtml(x.b)+'</small></div></div>').join('')+'</div>'
 +wikiLink('systems/gaya_system','Funzionamento del sistema Gaya');
 const dailyContent=titleBlock('Bauli Apprendista','Apri i bauli al livello corrispondente')+grid(['50187','50188','50203','50189'])
 +titleBlock('Farming e consumabili','Verifica la durata dei Guanti del Ladro e conserva un ricambio')+grid(['100102'])
 +'<div class="guide-brief-grid"><div><b>Missioni</b><p>Segui la bacheca delle missioni e gli obiettivi della guida ai livelli.</p></div><div><b>Eventi</b><p>Controlla il calendario degli eventi e combina gli obiettivi con il farming.</p></div><div><b>Battlepass</b><p>Avanza nei compiti disponibili senza sprecare i materiali più difficili da trovare.</p></div></div>';
 const crystalContent='<p>Raccogli dieci frammenti uguali dai Metin idonei per ottenere un oggetto di evocazione. Il cristallo compare nella mappa e può essere danneggiato dal suo evocatore; verifica le limitazioni nella wiki.</p>'
 +grid(['100021','100022','100023','100136'])
 +table(['Cristallo','Livello','Scheda'],[
 ['Invidia','35','mob/22524'],['Anima','40','mob/22525'],['Diavolo','55','mob/22526']
 ].map(x=>'<tr><td>'+x[0]+'</td><td>'+x[1]+'</td><td>'+wikiLink(x[2],'Cristallo evocato')+'</td></tr>'))
 +wikiLink('systems/crystals','Sistema ufficiale dei cristalli');
 return [
 panel('guideOverview','Guida visuale livelli 1–75',top+levels,12,'PERCORSO'),
 panel('guideLevels','Progressi per fascia di livello',allLevels,12,'LIVELLI'),
 panel('guideFarming','Percorso farming dei Metin',metinContent,12,'METIN'),
 panel('guideEquipment','Equipaggiamento livello 55 per classe',equipContent,12,'EQUIPAGGIAMENTO'),
 panel('guideAlchemy','Alchimia leggendaria opaca +4',alchemyContent,12,'ALCHIMIA'),
 panel('guideUpgrade','Rugiade, pozioni e potenziamenti',upgradeContent,12,'POTENZIAMENTO'),
 panel('guideGaya','Oggetti del negozio Gaya',gayaContent,12,'GAYA'),
 panel('guideDaily','Bauli e attività quotidiane',dailyContent,12,'ATTIVITÀ'),
 panel('guideCrystal','Cristalli Verzum',crystalContent,12,'CRISTALLI')
 ];
}
TITLES.guide=['GUIDA 1–75','Guida visuale ai livelli 1–75','Oggetti, equipaggiamento e progressione con immagini e schede della wiki VERZUM.'];
sections.guide=guidePanels;
state.guideLevelRange=state.guideLevelRange||'1-29';
state.guideClass=state.guideClass||'Guerriero';
if(location.hash==='#guide'){state.route='guide';render()}
document.querySelector('#panels')?.addEventListener('click',e=>{
 const level=e.target.closest('[data-guide-level]'),cls=e.target.closest('[data-guide-class]');
 if(level){state.guideLevelRange=level.dataset.guideLevel;render();return}
 if(cls){state.guideClass=cls.dataset.guideClass;render()}
});
window.VERZUM_GUIDE_VISUAL={source:W+'guides/vz_level_1_75',imageCount:Object.keys(items).length,classes:Object.keys(equipment)};
})();
