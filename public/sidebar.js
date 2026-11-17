/* VERZUM sidebar: menu compatto desktop; menu espandibile mobile senza ri-render dei calcolatori. */
(function(){
'use strict';
const app=document.querySelector('.app'),side=document.querySelector('.sidebar'),nav=document.getElementById('navigation'),btn=document.getElementById('menu-toggle');
if(!app||!side||!nav||!btn)return;
const desktop=matchMedia('(min-width:781px)');
const KEY='verzum_sidebar_collapsed_v1';
function apply(){const collapsed=desktop.matches&&localStorage.getItem(KEY)==='yes';app.classList.toggle('sidebar-collapsed',collapsed);btn.textContent=desktop.matches?(collapsed?'»':'«'):(side.classList.contains('menu-open')?'✕':'☰');btn.setAttribute('aria-label',desktop.matches?(collapsed?'Apri la barra laterale':'Chiudi la barra laterale'):(side.classList.contains('menu-open')?'Chiudi menu':'Apri menu'));btn.setAttribute('aria-expanded',desktop.matches?String(!collapsed):String(side.classList.contains('menu-open')));btn.title=btn.getAttribute('aria-label');}
for(const el of nav.querySelectorAll('[data-nav]')){const title=el.textContent.trim().replace(/\d+$/,'').trim();el.title=title;el.setAttribute('aria-label',title)}
btn.addEventListener('click',()=>{
 if(desktop.matches){const collapsed=!app.classList.contains('sidebar-collapsed');localStorage.setItem(KEY,collapsed?'yes':'no');app.classList.toggle('sidebar-collapsed',collapsed);requestAnimationFrame(apply)}
 else requestAnimationFrame(apply);
});
desktop.addEventListener?.('change',apply);
window.addEventListener('resize',()=>{if(!desktop.matches)requestAnimationFrame(apply)},{passive:true});
apply();
})();
