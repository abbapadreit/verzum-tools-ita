/* Run with: node --test tests/pvm-core.test.cjs */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../public/verzum-pvm-core.js'),'utf8');
const sandbox={window:{}};
vm.runInNewContext(source,sandbox);
const p=sandbox.window.VERZUM_PVM_CORE;
test('reads Italian grouped integers and game abbreviations without fabricating values',()=>{
 assert.equal(p.number('65.000'),65000);
 assert.equal(p.number('2.000.000'),2000000);
 assert.equal(p.number('2kk'),2000000);
 assert.equal(p.number('1,5kk'),1500000);
 assert.equal(p.number('not-a-number'),null);
});
test('PvM compares only verified player and Wiki numbers',()=>{
 const report=p.goals([{name:'Zombie',target:80,unit:'%'},{name:'Boss',target:20,unit:'%'}],{Zombie:60,Boss:20});
 assert.equal(report.met,1);
 assert.equal(report.rows[0].missing,20);
 assert.equal(report.rows[1].missing,0);
 assert.equal(p.levelEligible(75,'75 - 89'),true);
 assert.equal(p.levelEligible(90,'75 - 89'),false);
});
test('damage engine uses measured hits and does not synthesize game bonuses',()=>{
 const measured=p.observedDps({normal:1000,critical:2000,criticalRate:25,hitsPerSecond:2,uptime:80});
 assert.equal(measured,2000);
 assert.equal(p.eta(2000000,65000),2000000/65000);
 assert.equal(p.observedDps({normal:1000,critical:2000,criticalRate:25,hitsPerSecond:0,uptime:100}),null);
});
test('scenario comparison uses measured PvM outputs',()=>{
 const comparison=p.scenario(10000,12500,1000000);
 assert.equal(comparison.percentChange,25);
 assert.equal(comparison.baseSeconds,100);
 assert.equal(comparison.newSeconds,80);
});
test('farming accounting separates self-reported income from expenses',()=>{
 const result=p.farming({runs:3,lootPerRun:1000000,expensesPerRun:200000,ticketPerRun:100000,minutesPerRun:20});
 assert.equal(result.profit,2100000);
 assert.equal(result.profitPerHour,2100000);
 assert.equal(p.farming({runs:0,lootPerRun:1,expensesPerRun:0,ticketPerRun:0,minutesPerRun:30}).profitPerHour,null);
});
test('Azrael Wiki figures are source-grounded',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../public/wiki-pages/dungeons/azrael.html'),'utf8');
 assert.match(html,/DPS consigliato/);
 assert.match(html,/65\.000/);
 assert.match(html,/2\.000\.000/);
 assert.match(html,/Bonus totali consigliati/);
});
