/* VERZUM Wiki turntable rendering, sourced from official Wiki runtime. */
import {scanWikiModels} from './wiki-model.js';
const host=document.getElementById('panels');
let scheduled=false;
function scan(){
 if(scheduled)return;
 scheduled=true;
 requestAnimationFrame(()=>{
  scheduled=false;
  if(host)scanWikiModels(host);
 });
}
if(host){
 const observer=new MutationObserver(scan);
 observer.observe(host,{childList:true,subtree:true});
}
scan();
