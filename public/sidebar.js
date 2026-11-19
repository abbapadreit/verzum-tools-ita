/* VERZUM — one desktop sidebar, reused as accessible slide-in mobile navigation. */
(function(){
'use strict';
const app=document.querySelector('.app'),side=document.getElementById('sidebar'),
  nav=document.getElementById('navigation'),mobileButton=document.getElementById('menu-toggle'),
  desktopButton=document.getElementById('desktop-toggle'),
  closeButton=document.getElementById('sidebar-close'),
  backdrop=document.getElementById('sidebar-backdrop'),
  mobileLogo=document.getElementById('mobile-brand-logo'),brandLogo=side?.querySelector('.brand-logo');
if(!app||!side||!nav||!mobileButton||!desktopButton||!backdrop)return;
if(mobileLogo&&brandLogo)mobileLogo.src=brandLogo.src;
const desktop=matchMedia('(min-width:781px)'),STORAGE='verzum_sidebar_collapsed_v1';
let lastFocus=null;
const items=()=>[...side.querySelectorAll('button:not([hidden]),a[href],select:not([disabled])')].filter(x=>x.getClientRects().length);
function isOpen(){return side.classList.contains('menu-open')&&!desktop.matches}
function sync(){
 const small=!desktop.matches;
 const collapsed=!small&&localStorage.getItem(STORAGE)==='yes';
 app.classList.toggle('sidebar-collapsed',collapsed);
 desktopButton.textContent=collapsed?'»':'«';
 desktopButton.setAttribute('aria-label',collapsed?'Espandi sidebar':'Riduci sidebar');
 desktopButton.setAttribute('aria-expanded',String(!collapsed));
 mobileButton.setAttribute('aria-expanded',String(isOpen()));
 mobileButton.setAttribute('aria-label',isOpen()?'Chiudi menu':'Apri menu');
 side.setAttribute('aria-hidden',small&&!isOpen()?'true':'false');
 backdrop.hidden=!isOpen();
 document.body.classList.toggle('vz-sidebar-open',isOpen());
 side.inert=small&&!isOpen();
}
function open(){
 if(desktop.matches)return;
 lastFocus=document.activeElement;
 side.inert=false;
 side.classList.add('menu-open');
 sync();
 closeButton?.focus();
}
function close(restoreFocus=true){
 side.classList.remove('menu-open');sync();
 if(restoreFocus&&(lastFocus||mobileButton)) (lastFocus?.isConnected?lastFocus:mobileButton).focus();
}
function toggle(){isOpen()?close():open()}
desktopButton.addEventListener('click',()=>{
 if(!desktop.matches)return;
 const collapsed=!app.classList.contains('sidebar-collapsed');
 try{localStorage.setItem(STORAGE,collapsed?'yes':'no')}catch(_){}
 sync();
});
mobileButton.addEventListener('click',toggle);
closeButton?.addEventListener('click',()=>close());
backdrop.addEventListener('click',()=>close());
side.addEventListener('click',event=>{
 if(event.target.closest('#navigation [data-nav]')&&!desktop.matches)close(false);
});
document.addEventListener('keydown',e=>{
 if(!isOpen())return;
 if(e.key==='Escape'){e.preventDefault();close();return}
 if(e.key!=='Tab')return;
 const els=items();if(!els.length)return;
 const first=els[0],last=els[els.length-1];
 if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
 else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
});
desktop.addEventListener?.('change',()=>{if(desktop.matches)side.classList.remove('menu-open');sync()});
for(const el of nav.querySelectorAll('[data-nav]')){
 const title=el.textContent.trim().replace(/\d+$/,'').trim();
 el.title=title;el.setAttribute('aria-label',title);
}
sync();
window.VERZUM_SIDEBAR={open,close,toggle,isOpen};
})();