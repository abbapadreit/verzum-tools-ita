/* Build IT names from the verified VERZUM Wiki, not automatic translation. */
import{readdirSync,readFileSync,writeFileSync}from'node:fs';
import{join,resolve}from'node:path';
import{fileURLToPath}from'node:url';
const dir=resolve(fileURLToPath(new URL('../public/',import.meta.url)));
const read=p=>readFileSync(join(dir,p),'utf8');
const decode=s=>String(s||'').replace(/&#(x[0-9a-f]+|\d+);/gi,(_,v)=>String.fromCodePoint(v.toLowerCase().startsWith('x')?parseInt(v.slice(1),16):+v))
.replace(/&(amp|lt|gt|quot|apos|nbsp|egrave|Egrave|agrave|Agrave|ograve|igrave|ugrave|eacute|Eacute|rsquo|lsquo|ldquo|rdquo);/g,(_,k)=>({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' ',egrave:'è',Egrave:'È',agrave:'à',Agrave:'À',ograve:'ò',igrave:'ì',ugrave:'ù',eacute:'é',Eacute:'É',rsquo:'’',lsquo:'‘',ldquo:'“',rdquo:'”'})[k])
.replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
const items={};let readCount=0,skipped=0;
for(const filename of readdirSync(join(dir,'wiki-pages/item'))){
 if(!/^\d+\.html$/.test(filename))continue;
 readCount++;
 const html=read('wiki-pages/item/'+filename);
 const match=html.match(/<span\b[^>]*class="[^"]*\bwk-namebar__name\b[^"]*"[^>]*>([\s\S]*?)<\/span>/i);
 const name=match?decode(match[1]):'';
 if(!name||name.length>180){skipped++;continue}
 items[filename.slice(0,-5)]=name;
}
const skills={
 warrior:[...read('wiki-pages/systems/skills.html').matchAll(/<span class="wk-z-lb[^"]*">([^<]+)<\/span>/g)].map(m=>decode(m[1])),
 ninja:['Tranello','Attacco lampo','Vortice del pugnale','Camuffamento','Nuvola velenosa','Veleno insidioso','Tiro ripetuto','Pioggia di frecce','Freccia di fuoco','Passo piumato','Freccia avvelenata','Colpo sfavillante'],
 sura:['Schiocco di dita','Vortice del drago','Lama incantata','Paura','Armatura incantata','Annullamento magia','Colpo oscuro','Colpo di fiamma','Spirito della fiamma','Protezione oscura','Colpo degli spiriti','Pietra oscura'],
 shaman:['Talismano volante','Tiro del drago','Ruggito del drago','Benedizione','Riflessione','Aiuto del drago','Lancio di lampi','Evocare i lampi','Artiglio di lampo','Cura','Rapidità','Attacco+']
};
// Effect names use the exact Italian headings from VERZUM Wiki skills tables for each class.
const effects={"warrior":[["Cooldown","Valore totale dell'attacco"],["Cooldown","Valore di attacco"],["Durata","Cooldown","Velocità d'attacco","Forza vs mostri"],["Durata","Cooldown","Valore d'attacco"],["Cooldown","Velocità di movimento","Valore di attacco"],["Cooldown","Valore di attacco"],["Cooldown","Valore di attacco"],["Cooldown","Valore di attacco"],["Cooldown","Valore di attacco","Probabilità di svenimento"],["Durata","Cooldown","Difesa contro i mostri","Forza vs mostri","Valore d'attacco (PvM)"],["Cooldown","Valore di attacco"],["Cooldown","Valore di attacco"]],"ninja":[["Cooldown","Valore di attacco"],["Cooldown","Valore di attacco"],["Cooldown","Valore di attacco","Possibilità di veleno"],["Durata","Cooldown","Danni bonus da imboscata"],["Cooldown","Valore di attacco","Possibilità di veleno"],["Cooldown","Valore di attacco","Possibilità di veleno"],["Cooldown","Valore totale dell'attacco","Frecce scoccate"],["Cooldown","Valore di attacco","Numero massimo di bersagli"],["Cooldown","Valore di attacco","Possibilità di fuoco duraturo"],["Durata","Cooldown","Velocità di movimento","Forza vs mostri"],["Cooldown","Valore di attacco","Possibilità di veleno"],["Durata","Cooldown","Valore di attacco","Possibilità di veleno"]],"sura":[["Cooldown","Valore di attacco","Possibilità di colpire in modo penetrante"],["Cooldown","Valore di attacco","Possibilità di ignorare l'evasione dell'avversario"],["Durata","Cooldown","Valore d'attacco","Di danni assorbiti da HP"],["Durata","Cooldown","Forza vs mostri","Valore d'attacco avversario"],["Durata","Cooldown","Difesa","Possibilità di riflettere un attacco corporale"],["Cooldown","Valore dell'attacco magico","Possibilità di dissipare"],["Cooldown","Valore dell'attacco magico"],["Cooldown","Valore dell'attacco magico"],["Durata","Cooldown","Valore dell'attacco magico"],["Durata","Cooldown","Valore d'attacco (PvM)","Forza vs mostri","Difesa contro i mezz'uomini"],["Cooldown","Valore dell'attacco magico","Possibilità di lento"],["Cooldown","Valore dell'attacco magico"]],"shaman":[["Cooldown","Valore dell'attacco magico"],["Cooldown","Valore dell'attacco magico","Possibilità di fuoco duraturo"],["Cooldown","Valore dell'attacco magico","Possibilità di fuoco duraturo"],["Durata","Cooldown","Resistenza ai danni corporali"],["Durata","Cooldown","Forza vs mostri","Valore d'attacco"],["Durata","Cooldown","Probabilità di colpo critico"],["Cooldown","Valore dell'attacco magico"],["Cooldown","Valore dell'attacco magico","Probabilità di svenimento"],["Cooldown","Valore dell'attacco magico"],["Cooldown","Ripristinare i CV","Possibilità di curare gli effetti negativi"],["Durata","Cooldown","Forza vs mostri","Velocità della magia","Velocità di movimento"],["Durata","Cooldown","Valore d'attacco","Attacco magico/corpo a corpo (PvM)"]]};
const passive=[...read('wiki-pages/systems/passive_skills.html').matchAll(/<span class="wk-z-lb[^"]*">([^<]+)<\/span>/g)].map(m=>decode(m[1]));

const passiveHtml=read('wiki-pages/systems/passive_skills.html');
const passage=passiveHtml.slice(passiveHtml.indexOf('<h2 id="s3"'),passiveHtml.indexOf('<h2 id="s4"'));
const passiveHeadings=[...passage.matchAll(/<p class="wk-p wkmt-10"><img[^>]+>\s*<span class="wk-z-lb[^"]*">([^<]+)<\/span><\/p>/g)];
const passiveEffects=passiveHeadings.map((head,i)=>{
 const content=passage.slice(head.index+head[0].length,passiveHeadings[i+1]?.index);
 return [...content.matchAll(/<tbody>([\s\S]*?)<\/tbody>/g)].map(table=>
  [...table[1].matchAll(/<td[^>]+wk-al-left wk-frz[^>]*>[\s\S]*?(?:<span[^>]*>)?([^<]+)<\/span>/g)].map(row=>decode(row[1])));
});
if(passiveEffects.length!==4||passiveEffects[0].length!==2)throw Error('Passive effect tables missing');

if(readCount<400||Object.keys(items).length<400||Object.values(skills).some(x=>x.length!==12)||Object.values(effects).some(x=>x.length!==12)||passive.length!==4)throw Error('Wiki corpus incomplete');
for(const id of ['50301','50341','50342','50350','50351','50513','71001','71094'])if(!items[id])throw Error('Missing Wiki item '+id);
const corpus={items,skills,effects,passive,passiveEffects,source:'Italian VERZUM Wiki (mirror; Ninja/Sura/Shaman class pages verified 2026-11-19)',pagesIndexed:readCount};
writeFileSync(join(dir,'wiki-italian-lexicon.generated.js'),'/* Generated from official Italian VERZUM Wiki. Do not manually translate item names. */\nwindow.VERZUM_WIKI_ITALIAN_LEXICON='+JSON.stringify(corpus)+';\n');
console.log('Wiki IT names',Object.keys(items).length,'from',readCount,'pages; 48 class skills; 4 passives; skipped',skipped);
