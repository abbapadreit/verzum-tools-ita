/* I calcolatori utilizzano le schermate e la logica VERZUM di riferimento.
   Il contenuto e gli asset sono locali (calculator-reference.html), isolati
   dalla nostra Wiki e dall'interfaccia esterna. */
(function(){
'use strict';
if(typeof sections==='undefined'||typeof state==='undefined'||typeof render!=='function')return;
const nativeRoutes={upgrade:'crafting',gaya:'gaya',pet:'pet',mount:'mount',costume:'costume',skills:'skills',passive:'passive',prices:'prices'};
const validRoutes=new Set(Object.keys(nativeRoutes));
/* Prima apertura: conserva i prezzi già inseriti nel precedente listino.
   Solo associazioni item-ID verificabili, mai numeri stimati o sostituiti.
   Se esiste già un listino originale dt_prices non lo sovrascriviamo. */
try{
 if(localStorage.getItem('dt_prices')===null){
  const imported={};
  for(const [name,value] of Object.entries(state.prices||{})){
   const id=state.materialIds?.[name];
   const cost=Number(value);
   if(/^\\d+$/.test(String(id||''))&&Number.isFinite(cost)&&cost>0)imported[id]=cost;
  }
  if(Object.keys(imported).length)localStorage.setItem('dt_prices',JSON.stringify(imported));
 }
}catch(e){}

const iframeContent=route=>'<iframe class="native-calculator-frame" title="Calcolatore VERZUM · '+route+'" loading="eager" src="calculator-reference.html#'+nativeRoutes[route]+'" data-native-route="'+route+'" allow="clipboard-write"></iframe>';
for(const route of validRoutes){
 sections[route]=()=>[{key:'native-reference',span:12,title:'Calcolatore originale',tag:'VERZUM',content:iframeContent(route)}];
}
function activeFrame(){return document.querySelector('iframe.native-calculator-frame')}
/* L'iframe è same-origin. Disattiviamo il suo scroll interno, non quello della pagina.
   La dimensione del frame viene già sincronizzata da verzum-reference-height. */
function fixEmbeddedScroll(frame){
 if(!frame)return;
 try{
  const doc=frame.contentDocument;
  if(!doc?.head||!doc.body)return;
  if(!doc.getElementById('verzum-no-nested-scroll')){
   const style=doc.createElement('style');
   style.id='verzum-no-nested-scroll';
   style.textContent='html{overflow-y:hidden!important;scrollbar-width:none!important;-ms-overflow-style:none!important}body{scrollbar-width:none!important}html::-webkit-scrollbar,body::-webkit-scrollbar{display:none!important;width:0!important;height:0!important}';
   doc.head.appendChild(style);
  }
  if(!doc.getElementById('verzum-accordion-style')){
   const link=doc.createElement('link');
   link.id='verzum-accordion-style';link.rel='stylesheet';link.href='calculator-accordion-it.css';
   doc.head.appendChild(link);
  }
  if(!doc.getElementById('verzum-plan-bridge-script')){
   const plan=document.createElement('script');
   plan.id='verzum-plan-bridge-script';plan.src='calculator-plan-bridge.js';
   doc.body.appendChild(plan);
  }
  if(!doc.getElementById('verzum-accordion-script')){
   const script=doc.createElement('script');
   script.id='verzum-accordion-script';script.src='calculator-accordion-it.js';script.defer=true;
   doc.body.appendChild(script);
  }
 }catch(_){/* Il frame va modificato soltanto se ospitato dalla stessa origine. */}
}
document.addEventListener('load',event=>{
 if(event.target?.matches?.('iframe.native-calculator-frame'))fixEmbeddedScroll(event.target);
},true);
const initialFrame=activeFrame();
if(initialFrame&&initialFrame.contentDocument?.readyState==='complete')fixEmbeddedScroll(initialFrame);

let lastFrame=null;
window.addEventListener('message',event=>{
 if(event.origin!==location.origin)return;
 const iframe=activeFrame();
 if(!iframe||event.source!==iframe.contentWindow)return;
 const data=event.data||{};
 if(data.type==='verzum-reference-height'){
  const height=Number(data.height);
  if(Number.isFinite(height)&&height>=300&&height<=80000)iframe.style.height=Math.ceil(height)+'px';
 }else if(data.type==='verzum-reference-change-language'){
  if(['it','en','ro','hu'].includes(data.language))window.VERZUM_LOCALE?.change(data.language);
  }else if(data.type==='verzum-reference-add-plan'){
  const raw=data.plan;
  if(!raw||typeof raw!=='object'||typeof raw.name!=='string'||raw.name.length>160)return;
  const materials={};
  if(raw.materials&&typeof raw.materials==='object'&&!Array.isArray(raw.materials))
   for(const [name,q] of Object.entries(raw.materials))
    if(name.length<100&&Number.isFinite(Number(q))&&Number(q)>0)materials[name]=Math.min(Number(q),1e9);
  state.planner.push({name:raw.name,source:String(raw.source||'Calcolatore').slice(0,100),
   materials,yang:Number.isFinite(Number(raw.yang))?Math.max(0,Number(raw.yang)):0,
   notes:String(raw.notes||'').slice(0,1000),created:new Date().toLocaleDateString('it-IT')});
  state.route='planner';history.pushState({route:'planner'},'',location.pathname+location.search+'#planner');render();
 }else if(data.type==='verzum-reference-route'){
  const target=data.route==='planner'?'planner':Object.entries(nativeRoutes).find(([route,id])=>id===data.route)?.[0];
  if(!target||(target!=='planner'&&!validRoutes.has(target))||target===state.route)return;
  state.route=target;
  history.pushState({route:target},'',location.pathname+location.search+'#'+target);
  render();
 }
});
/* Il pulsante Personalizza dell'header deve agire sulle finestre originali. */
document.addEventListener('click',event=>{
 const target=event.target?.closest?.('#customize');
 if(!target)return;
 const iframe=activeFrame();
 if(!iframe||!validRoutes.has(state.route))return;
 event.preventDefault();
 event.stopImmediatePropagation();
 iframe.contentWindow?.postMessage({type:'verzum-parent-edit'},location.origin);
},true);
window.addEventListener('resize',()=>{
 const frame=activeFrame();
 if(frame&&frame!==lastFrame){lastFrame=frame}
},{passive:true});
/* Non alteriamo la Wiki o le pagine di riferimento degli item. */
if(validRoutes.has(state.route))render();
window.VERZUM_NATIVE_CALCULATORS={routes:nativeRoutes,source:'local original self-contained interface',getFrame:activeFrame};
})();