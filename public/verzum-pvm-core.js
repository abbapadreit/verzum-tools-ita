/* VERZUM PvM 2.0 — unit-testable calculations using only Wiki facts or player measurements. */
(function(global){
'use strict';
function number(value){
 const raw=String(value??'').trim().toLowerCase().replace(/\s/g,'');
 const match=raw.match(/^([+-]?(?:\d{1,3}(?:\.\d{3})+|\d+)(?:[,.]\d+)?)(kkk|kk|k)?$/);
 if(!match)return null;
 let part=match[1];
 if(/^[+-]?\d{1,3}(?:\.\d{3})+(?:,\d+)?$/.test(part))part=part.replace(/\./g,'');
 else if(/^[+-]?\d{1,3}(?:,\d{3})+(?:\.\d+)?$/.test(part))part=part.replace(/,/g,'');
 else if(part.includes(',')&&!part.includes('.'))part=part.replace(',','.');
 const val=Number(part),multiple=({k:1000,kk:1000000,kkk:1000000000})[match[2]]||1;
 return Number.isFinite(val)?val*multiple:null;
}
const safe=(value,min=0,max=1000000000000)=>{
 const val=typeof value==='number'?value:number(value);
 return val!==null&&Number.isFinite(val)?Math.max(min,Math.min(max,val)):null;
};
const compare=(got,target)=>target>0?Math.min(100,Math.round(1000*got/target)/10):0;
function goals(targets,bonuses){
 const rows=targets.map(t=>{
   const got=safe(bonuses?.[t.name],0)??0,goal=safe(t.target,0)??0;
   return {name:t.name,unit:t.unit||'',target:goal,actual:got,missing:Math.max(0,goal-got),percent:compare(got,goal),met:got>=goal};
 });
 return {rows,total:rows.length,met:rows.filter(x=>x.met).length};
}
function levelEligible(level,access){
 const match=String(access||'').match(/(\d+)\s*[-–]\s*(\d+)/);
 if(!match)return null;
 const lvl=safe(level,1,10000);
 if(lvl===null)return null;
 return lvl>=Number(match[1])&&lvl<=Number(match[2]);
}
/* Input is measured game hit data, not the game damage model.
   The rate is entered by the player (not an assumed chance from equipment). */
function observedDps({normal,critical,criticalRate,hitsPerSecond,uptime}){
 const a=safe(normal,0),b=safe(critical,0),c=safe(criticalRate,0,100),h=safe(hitsPerSecond,0,100),u=safe(uptime,0,100);
 if([a,b,c,h,u].some(x=>x===null)||h<=0)return null;
 return ((100-c)*a+c*b)/100*h*u/100;
}
function eta(hp,dps){
 const health=safe(hp,0),damage=safe(dps,0);
 return health!==null&&health>0&&damage!==null&&damage>0?health/damage:null;
}
function scenario(a,b,hp){
 const x=safe(a,0),y=safe(b,0);
 if(x===null||y===null||x<=0||y<=0)return null;
 return {baseDps:x,newDps:y,difference:y-x,percentChange:(y/x-1)*100,baseSeconds:eta(hp,x),newSeconds:eta(hp,y)};
}
function farming({runs,lootPerRun,expensesPerRun,ticketPerRun,minutesPerRun}){
 const n=safe(runs,0,10000),loot=safe(lootPerRun,0),spent=safe(expensesPerRun,0),ticket=safe(ticketPerRun,0),minutes=safe(minutesPerRun,0);
 if([n,loot,spent,ticket,minutes].some(x=>x===null))return null;
 const profit=(loot-spent-ticket)*n;
 return {runs:n,revenue:loot*n,costs:(spent+ticket)*n,profit,profitPerHour:minutes>0&&n>0?profit/(n*minutes/60):null};
}
global.VERZUM_PVM_CORE=Object.freeze({number,safe,compare,goals,levelEligible,observedDps,eta,scenario,farming});
})(window);