/* Browser regression for all original calculators + locale transitions.
   Run after starting a static server for public/ on port 8765. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright-core';
const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const routes={upgrade:'crafting',gaya:'gaya',pet:'pet',mount:'mount',costume:'costume',skills:'skills',passive:'passive',prices:'prices'};
try{
 for(const [route,viewId] of Object.entries(routes)){
  await page.goto('http://127.0.0.1:8765/#'+route,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(({route,viewId})=>{
   const f=document.querySelector('iframe.native-calculator-frame');
   return f?.dataset.nativeRoute===route &&
    f.contentDocument?.querySelector('main .view.on')?.id==='v-'+viewId &&
    !!f.contentWindow?.VERZUM_IT_WIKI_SKILL_FIX;
  },{route,viewId},{timeout:30000});
  await page.waitForTimeout(250);
  const result=await page.evaluate(()=>{
   const f=document.querySelector('iframe.native-calculator-frame');
   const w=f.contentWindow,t=f.contentDocument.querySelector('main .view.on').innerText;
   return {text:t,audit:w.VERZUM_IT_WIKI_SKILL_FIX.auditAll()?.slice(0,12)||[]};
  });
  assert.ok(result.text.length>80,route+' blank panel');
  console.log(route+' : '+result.text.length+' chars, audit: '+result.audit.length+' suspicious labels');
  if(route==='costume'){
   assert.match(result.text,/Forza contro i mostri\s*\+2%/);
   assert.match(result.text,/Forza contro i boss\s*\+2%/);
   assert.match(result.text,/Probabilità di ottenere lingotti extra\s*\+5%/);
   assert.match(result.text,/Attacco fisico e magico\s*\+3%/);
   assert.match(result.text,/Lord Scimmia/);
   assert.match(result.text,/Gnoll Guardia Suprema \(Dungeon\)/);
   assert.match(result.text,/Tritone \(Dungeon\)/);
   assert.doesNotMatch(result.text,/Sconfiggi\s+75\s+×\s+Pagina del Libro delle Abilità/);
  }
 }
 for(const language of ['en','ro','hu','it','fr']){
  await page.evaluate(lang=>window.VERZUM_LOCALE.change(lang),language);
  await page.waitForFunction(lang=>{
   const current=window.VERZUM_LOCALE?.lang;
   const native=document.querySelector('iframe.native-calculator-frame')?.contentWindow;
   return current===lang&&native?.eval('LANG')===(['it','en','ro','hu'].includes(lang)?lang:'en');
  },language,{timeout:10000});
  console.log('locale '+language+' correctly relayed to original calculator');
 }
}finally{await browser.close()}
