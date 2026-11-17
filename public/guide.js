/* VERZUM — guida consultabile livelli 1–75, strutturata dalle schermate wiki inviate. */
(function(){
'use strict';
const groups=[
 {id:'1-29',label:'1–29',title:'Primi livelli',html:'<p>Segui i compiti di livello 10 della guida ai livelli, il Battlepass e i primi potenziamenti. Inizia a migliorare il famiglio e la cavalcatura e scegli una abilità PvM principale.</p><p>Obiettivo: impostare la crescita del personaggio senza disperdere le risorse.</p>'},
 {id:'30-39',label:'30–39',title:'Equipaggiamento iniziale',html:'<p>Porta un’arma di livello 30 a +9. Come obiettivo, cerca almeno <b>Danni medi +30%</b> e <b>Pietre +3</b>. Inizia il dungeon delle Scimmie e i compiti del biologo di livello 30 e 35. Per il famiglio, punta al livello 20 e al tipo 2.</p>'},
 {id:'40-54',label:'40–54',title:'Accesso ai dungeon',html:'<p>Dal livello 40 è disponibile il dungeon degli Orchi; dal livello 45 il dungeon Esoterico. Prepara il primo set di alchimia leggendaria opaca. Prosegui il biologo di livello 40 e 50, il famiglio verso il livello 40 e la cavalcatura verso le evoluzioni indicate dalla guida.</p>'},
 {id:'55-64',label:'55–64',title:'Pausa farming al 55',html:'<p>Prima di avanzare, dedicati ai dungeon disponibili, raccogli materiali di miglioramento e potenzia il personaggio. Apri lo scrigno di livello 55, prosegui con i compiti e il biologo di livello 60 e prepara il famiglio verso il livello 60.</p>'},
 {id:'65-74',label:'65–74',title:'Torre dei Demoni e Mietitore',html:'<p>Obiettivo: Torre dei Demoni / Mietitore. La guida indica <b>Danni medi 40%</b>, Pietre +4, Resistenza oscurità +70%, Forte contro Zombie +80% e Probabilità di colpo critico +100% come riferimenti consigliati. Inizia a rafforzare le abilità passive e continua il biologo di livello 70.</p>'},
 {id:'75',label:'75',title:'Preparazione di Azrael',html:'<p>Prepara il dungeon di Azrael. La guida suggerisce arma livello 75 +9 con Danni medi 40–45%, una abilità importante al grado P, sei pietre di alchimia mitiche opache e l’armatura adeguata. Apri lo scrigno di livello 75 e completa i compiti disponibili.</p><p>Per l’arma: spadone a due mani per Guerriero, spada per Sura, campana per Sciamano e pugnale per Ninja.</p>'}
];
const metins=[['Metin della Battaglia','15'],['Metin della Gelosia','35'],["Metin dell’ombra",'45'],['Metin del Diavolo','55'],['Metin della Caduta','60'],["Metin dell’Assassino",'70'],['Metin Jeon-Un','90']];
const esc2=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
function guidePanels(){
 const active=groups.find(x=>x.id===state.guideLevelRange)||groups[0];
 const select='<div class="guide-levels" role="group" aria-label="Fasce livello">'+groups.map(g=>'<button type="button" data-guide-level="'+g.id+'" class="filter-chip '+(g.id===active.id?'active':'')+'">'+g.label+'</button>').join('')+'</div>';
 const intro='<p class="guide-lede">Percorso di crescita da livello 1 a 75, con obiettivi per fascia e riferimenti per farming, equipaggiamento, alchimia e Gaya.</p>'+select+'<div class="guide-feature"><span class="pill">Livelli '+active.label+'</span><h3>'+active.title+'</h3>'+active.html+'</div>';
 const steps=groups.map(g=>'<details class="guide-disclosure"><summary><span>'+g.label+'</span> '+g.title+'</summary><div>'+g.html+'</div></details>').join('');
 const metinTable=table(['#','Metin','Livello'],metins.map((m,i)=>'<tr><td>'+(i+1)+'</td><td>'+esc2(m[0])+'</td><td>'+esc2(m[1])+'</td></tr>'));
 const farm='<p>Le schermate indicano come momenti consigliati per fermarsi a raccogliere materiali <b>il livello 55</b> e <b>il livello 75</b>. La sequenza è un riferimento di progressione, non un obbligo.</p>'+metinTable;
 const equip='<div class="guide-brief-grid"><div><b>Abilità PvM</b><p>Porta l’abilità principale verso G1 e migliora gradualmente le secondarie.</p></div><div><b>Equipaggiamento</b><p>Pietre +3 fino al dungeon dei Ragni e +4 verso il Mietitore; per Azrael si consigliano Pietre +5 mirate.</p></div><div><b>Bonus-obiettivo al 55</b><p>HP 16.000 · Resistenza fuoco 70% · Forte contro Animali 80% · Critico 80–90%.</p></div></div>';
 const upgrade55='<div class="guide-brief-grid"><div><b>Abilità e Buff</b><p>Abilità PvM principale intorno a G1. Per i Buff: Benedizione G1, Aiuto del Drago G1, Attacco+ M5 e Rapidità M1 dove disponibili.</p></div><div><b>Famiglio</b><p>Almeno livello 40, preferibilmente tipo 3, abilità contro i mostri 5/10; poi verso livello 60 e abilità contro i Metin.</p></div><div><b>Cavalcatura e biologo</b><p>Prima evoluzione e livello 11 della cavalcatura; abilità contro mostri 10/10. Completa il biologo 30, 40 e 50 e prosegui al 60.</p></div></div>';
 const alchemy='<p>Per la fase dei dungeon la guida propone un <b>set di alchimia leggendaria opaca +4</b>. Affina i bonus in funzione del dungeon e della classe. Dal 75, prepara gradualmente il set mitico opaco indicato dalla wiki.</p>';
 const gaya='<p>Gli oggetti del negozio Gaya fisso sono utili per i potenziamenti iniziali. Tra quelli mostrati nella guida:</p>'+table(['Oggetto','Prezzo Gaya','Bonus'],[['Bracciale dell’Amore',35,'Forte contro mostri +2%'],['Bracciale dell’Armonia',35,'Forte contro Pietre Metin +2%'],['Collana dell’Amore',35,'Forte contro boss +2%']].map(x=>'<tr><td>'+x[0]+'</td><td>'+x[1]+'</td><td>'+x[2]+'</td></tr>'))+'<p class="hint">Il prezzo di mercato in Yang va inserito nel calcolatore Gaya.</p>';
 const daily='<p>Durante il farming controlla i <b>Guanti del Ladro</b>, la durata residua e gli oggetti di ricambio. Usa il pesce appropriato alla classe (forza, intelligenza o destrezza). Dal livello 45, la guida suggerisce anche le rugiade.</p><p><b>Scorciatoie:</b> Wiki con H o W · Inventario speciale con U · Famiglio/cavalcatura con P · Lettura automatica abilità con Ctrl + clic.</p>';
 const crystal='<p>Dai Metin compatibili si raccolgono i frammenti di cristallo. La guida descrive la creazione di un oggetto di evocazione combinando dieci frammenti dello stesso tipo. Segui le indicazioni del client quando lo utilizzi.</p>';
 return [
  panel('guideOverview','Guida ai livelli 1–75',intro,12,'PROGRESSIONE'),
  panel('guideLevels','Progressi per livello',steps,12,'FASCE'),
  panel('guideFarming','Ordine di farming dei Metin',farm,12,'METIN'),
  panel('guideEquipment','Equipaggiamento per livello 55',equip,12,'EQUIPAGGIAMENTO'),
  panel('guideAlchemy','Alchimia leggendaria opaca +4',alchemy,6,'ALCHIMIA'),
  panel('guideUpgrade','Potenziamenti per livello 55',upgrade55,6,'POTENZIAMENTO'),
  panel('guideGaya','Negozio Gaya fisso',gaya,12,'GAYA'),
  panel('guideDaily','Sistemi e attività quotidiane',daily,6,'ATTIVITÀ'),
  panel('guideCrystal','Evocazione dei cristalli Verzum',crystal,6,'CRISTALLI')
 ];
}
TITLES.guide=['GUIDA 1–75','Guida ai livelli 1–75','Progressione, Metin, equipaggiamento, alchimia e attività da livello 1 a 75.'];
sections.guide=guidePanels;
state.guideLevelRange=state.guideLevelRange||'1-29';
document.querySelector('#panels')?.addEventListener('click',e=>{const btn=e.target.closest('[data-guide-level]');if(!btn)return;state.guideLevelRange=btn.dataset.guideLevel;render();});
})();
