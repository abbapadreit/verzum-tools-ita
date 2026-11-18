/* Confronto preciso tra due livelli della matrice Wiki: nessun valore inferito. */
(function(){
'use strict';
if(window.__verzumUpgradeCompare)return;window.__verzumUpgradeCompare=true;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let previous='',busy=false,from=0,to=3;
function formatDifference(a,b){
 const p=/^([+-]?\d+(?:[.,]\d+)?)\s*(%)?$/;
 const av=a.trim().match(p),bv=b.trim().match(p);
 if(!av||!bv||(av[2]||'')!==(bv[2]||''))return '—';
 const x=Number(av[1].replace(',','.')),y=Number(bv[1].replace(',','.'));
 if(!Number.isFinite(x)||!Number.isFinite(y))return '—';
 const diff=Math.round((y-x)*100)/100;
 if(diff===0)return 'Nessuna variazione';
 return (diff>0?'+':'')+diff.toLocaleString('it-IT')+(av[2]||'');
}
function renderResult(){
 const matrix=document.querySelector('#v-crafting .vz-upgrade-matrix'),box=matrix?.querySelector('.vzw-upgrade-compare');
 if(!matrix||!box)return;
 const rows=[...matrix.querySelectorAll('.vz-upgrade-matrix-table tbody tr:not(.vz-matrix-cost)')];
 const body=rows.map(tr=>{
  const name=tr.querySelector('th')?.textContent.trim()||'';
  const values=[...tr.querySelectorAll('td')];
  const a=values[from]?.textContent.trim()||'—',b=values[to]?.textContent.trim()||'—';
  if(a==='—'&&b==='—')return '';
  return '<tr><th scope="row">'+esc(name)+'</th><td>'+esc(a)+'</td><td>'+esc(b)+'</td><td class="vzw-change">'+esc(a==='—'||b==='—'?'Dati incompleti':formatDifference(a,b))+'</td></tr>';
 }).filter(Boolean).join('');
 box.querySelector('tbody').innerHTML=body||'<tr><td colspan="4">Statistiche non presenti nella Wiki per entrambi i livelli.</td></tr>';
 box.querySelector('[data-vzw-description]').textContent='Differenze tra +'+from+' e +'+to+' · solo dati presenti nella Wiki';
 matrix.querySelectorAll('.vz-upgrade-matrix-table tr').forEach(tr=>{
  [...tr.children].forEach((td,index)=>{td.classList.toggle('vzw-comparing',index===from+1||index===to+1)})
 });
}
function enhance(){
 const matrix=document.querySelector('#v-crafting .vz-upgrade-matrix');
 if(!matrix||matrix.querySelector('.vzw-upgrade-compare'))return;
 const levels=matrix.querySelectorAll('thead th.vz-matrix-level').length;if(levels<2)return;
 const itemId=typeof S!=='undefined'?String(S.sel):'';
 if(previous!==itemId){from=0;to=Math.min(3,levels-1);previous=itemId}
 from=Math.min(from,levels-1);to=Math.min(to,levels-1);
 const select=(key,val)=>'<label>'+({from:'Da',to:'A'}[key])+'<select data-vzw-compare="'+key+'">'+Array.from({length:levels},(_,i)=>'<option value="'+i+'"'+(i===val?' selected':'')+'>+'+i+'</option>').join('')+'</select></label>';
 const panel=document.createElement('section');panel.className='vzw-upgrade-compare';
 panel.innerHTML='<div class="vzw-compare-top"><div><strong>Confronta i potenziamenti</strong><small data-vzw-description></small></div><div class="vzw-compare-selects">'+select('from',from)+select('to',to)+'</div></div>'
  +'<div class="vzw-compare-scroll"><table><thead><tr><th>Statistica</th><th>Da</th><th>A</th><th>Variazione</th></tr></thead><tbody></tbody></table></div>'
  +'<p>La differenza compare soltanto quando entrambi i valori sono numerici e confrontabili. Intervalli, bonus assenti e valori non omogenei non vengono stimati.</p>';
 matrix.append(panel);renderResult();
}
document.addEventListener('change',e=>{
 const el=e.target.closest('[data-vzw-compare]');if(!el)return;
 const n=Number(el.value);if(!Number.isInteger(n)||n<0)return;
 if(el.dataset.vzwCompare==='from')from=n;else to=n;
 renderResult();
});
const root=document.getElementById('v-crafting')||document.body;
const observer=new MutationObserver(()=>{if(busy)return;busy=true;try{enhance()}finally{busy=false}});
observer.observe(root,{childList:true,subtree:true});
enhance();
})();