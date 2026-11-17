'use strict';
/* Illustrazioni SVG originali di riserva. Le icone autentiche autorizzate prevalgono. */
(function installArt(){
 const memo=new Map();
 const kindByCat={Arma:'weapon',Armatura:'armor',Elmo:'helm',Scudo:'shield',Orecchini:'earrings',Bracciale:'bracelet',Collana:'necklace',Scarpe:'boots',Cintura:'belt',Talismano:'talisman'};
 const types=new Map((window.VERZUM_RELEASE?.catalog||[]).map(o=>[String(o.id),o]));
 const palettes=[['#f2c891','#a5733c'],['#90d5db','#316d8c'],['#ed99b7','#a04973'],['#b1acef','#6855a0'],['#91ce96','#447f56'],['#d9bcf2','#795697'],['#f5ae7d','#b25730']];
 const forms={
 weapon:`<path d="M19 59L27 46 43 13 49 8 51 16 34 51 27 63Z" fill="url(#steel)" stroke="#f7f3e9" stroke-width="1.1"/><path d="M29 46L45 17" stroke="#fff" opacity=".7"/><path d="M17 46L35 56" stroke="url(#gold)" stroke-width="4" stroke-linecap="round"/><path d="M20 51L26 55 20 65 16 62Z" fill="#4d302b" stroke="#ddb985"/><circle cx="22" cy="53" r="3" fill="url(#gem)"/>`,
 bow:`<path d="M23 9Q51 37 23 64" fill="none" stroke="url(#gold)" stroke-width="5"/><path d="M23 9L23 64" fill="none" stroke="#e9e0d0" stroke-width="1"/><path d="M13 35H51M42 29L51 35 42 41" fill="none" stroke="#d9dde1" stroke-width="2.4"/>`,
 armor:`<path d="M20 14L27 10H37L44 14 51 31 43 36 42 62 22 62 21 36 13 31Z" fill="url(#steel)" stroke="#d8bc85" stroke-width="2"/><path d="M27 14L29 29 32 32 35 29 37 14M22 37H42M32 37V59" stroke="#f1d9a6" fill="none" stroke-width="1.5"/><path d="M26 44L32 38 38 44 32 53Z" fill="url(#gem)" stroke="#f6d995"/>`,
 helm:`<path d="M16 38Q12 12 32 10Q52 12 48 38L45 57 38 61 38 39H26V61L19 57Z" fill="url(#steel)" stroke="#dcbf89" stroke-width="2"/><path d="M16 34H48M25 21H39M32 11V34" stroke="#edd9aa" stroke-width="2"/><path d="M29 24H35L32 30Z" fill="url(#gem)"/>`,
 shield:`<path d="M32 7L52 18 49 45Q43 58 32 66Q21 58 15 45L12 18Z" fill="url(#steel)" stroke="#edd4a0" stroke-width="2"/><path d="M32 14L44 22 42 44 32 57 22 44 20 22Z" stroke="#ffebc1" fill="none"/><path d="M32 19L35 31 46 35 35 39 32 52 29 39 18 35 29 31Z" fill="url(#gem)"/>`,
 earrings:`<path d="M25 15Q6 38 24 54Q38 49 30 30M39 15Q58 38 40 54Q26 49 34 30" fill="none" stroke="url(#gold)" stroke-width="4.5"/><circle cx="23" cy="49" r="6" fill="url(#gem)" stroke="#f8dfa9"/><circle cx="41" cy="49" r="6" fill="url(#gem)" stroke="#f8dfa9"/>`,
 bracelet:`<ellipse cx="32" cy="36" rx="22" ry="21" fill="none" stroke="url(#gold)" stroke-width="8"/><ellipse cx="32" cy="36" rx="16" ry="15" fill="none" stroke="#f8e6b4"/><path d="M26 16L32 9 38 16 35 27H29Z" fill="url(#gem)" stroke="#ffe5b1"/>`,
 necklace:`<path d="M14 17Q10 45 32 56Q54 45 50 17" fill="none" stroke="url(#gold)" stroke-width="4" stroke-dasharray="3 2"/><path d="M32 40L43 52 32 65 21 52Z" fill="url(#gem)" stroke="#fae6b1" stroke-width="2"/>`,
 boots:`<path d="M14 13H28V41L37 49V59H10V50L15 42Z" fill="url(#steel)" stroke="#ddc18d" stroke-width="1.5"/><path d="M35 14H49V42L55 49V59H32V49L36 42Z" fill="url(#steel)" stroke="#ddc18d" stroke-width="1.5"/><path d="M13 53H37M35 53H53" stroke="#eed2a1" stroke-width="2"/>`,
 belt:`<path d="M8 24Q32 16 56 24V44Q32 52 8 44Z" fill="url(#steel)" stroke="#e1c38c" stroke-width="2"/><rect x="21" y="21" width="22" height="27" rx="2" fill="url(#gold)" stroke="#f8e5bc"/><path d="M28 27H36V43H28Z" fill="url(#gem)"/>`,
 talisman:`<path d="M32 6V19" stroke="#e9bf82" stroke-width="3"/><path d="M32 17L50 30 43 54 32 66 21 54 14 30Z" fill="url(#steel)" stroke="#eed7a0" stroke-width="2"/><circle cx="32" cy="40" r="11" fill="url(#gem)" stroke="#fff0be" stroke-width="1.5"/><path d="M32 30L35 40 32 51 29 40Z" fill="#fff8e4" opacity=".6"/>`,
 gem:`<path d="M18 23L30 10 46 18 54 37 34 61 14 46 10 31Z" fill="url(#gem)" stroke="#faf0cf" stroke-width="2"/><path d="M18 23L34 28 46 18M34 28L34 61M34 28L10 31M34 28L54 37" stroke="#fff" fill="none" opacity=".5"/>`,
 book:`<path d="M14 14L47 10 50 58 17 62Z" fill="url(#steel)" stroke="#e5c17a" stroke-width="2"/><path d="M19 17V58M25 22H40M25 49H40" fill="none" stroke="#f8e3b1" stroke-width="1.5"/><path d="M33 27L41 36 33 45 25 36Z" fill="url(#gem)" stroke="#ffe4b1"/>`,
 scroll:`<path d="M16 14Q10 15 11 24L11 54Q13 62 19 60L45 58Q52 56 51 49V17Q50 12 44 13Z" fill="#d8c49a" stroke="#946a3c" stroke-width="2"/><path d="M20 28H44M20 35H42M20 42H41" stroke="#916747" stroke-width="2"/><circle cx="33" cy="52" r="5" fill="#a44339" stroke="#f6d4a4"/>`,
 potion:`<path d="M27 8H39V19L45 29 46 56H20L21 29 27 19Z" fill="url(#gem)" stroke="#e8d5a5" stroke-width="2"/><path d="M25 11H41M24 32H43M24 45H43" stroke="#fff5e3" stroke-width="2"/><circle cx="33" cy="38" r="5" fill="#fff" opacity=".4"/>`
 };
 function hash(s){let n=2166136261;for(const c of String(s)){n^=c.charCodeAt(0);n=Math.imul(n,16777619)}return n>>>0}
 function render(id){
  const key=String(id),d=types.get(key),h=hash(key),colors=palettes[h%palettes.length];
  let kind=kindByCat[d?.cat]||'gem';
  const name=d?.name||'';
  if(kind==='weapon'&&/arco/i.test(name))kind='bow';
  if(kind==='weapon'&&/ventaglio|campana/i.test(name))kind='talisman';
  if(!d){if(/^(sk_|sb_|skill)/i.test(key))kind='book';else if(/^(50|70|71|1000|1001)/.test(key))kind='scroll';else if(/^(55|60)/.test(key))kind='potion'}
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 76"><defs>
<linearGradient id="bg" x2="1" y2="1"><stop stop-color="#342026"/><stop offset="1" stop-color="#0e090d"/></linearGradient>
<linearGradient id="steel" x2=".8" y2="1"><stop stop-color="#f6f1e4"/><stop offset=".5" stop-color="${colors[0]}"/><stop offset="1" stop-color="#485268"/></linearGradient>
<linearGradient id="gem" x2="1" y2=".8"><stop stop-color="${colors[0]}"/><stop offset=".55" stop-color="${colors[1]}"/><stop offset="1" stop-color="#2c233a"/></linearGradient>
<linearGradient id="gold" x2="1" y2="1"><stop stop-color="#fff0be"/><stop offset=".6" stop-color="#a67843"/><stop offset="1" stop-color="#633f33"/></linearGradient></defs>
<rect x="1" y="1" width="62" height="74" rx="7" fill="url(#bg)" stroke="#62413c"/>
<circle cx="45" cy="23" r="20" fill="${colors[1]}" opacity=".13"/>
<path d="M5 16V7H14M50 69H59V60" fill="none" stroke="#e2ba83" opacity=".35"/>
<g transform="rotate(${h%11-5} 32 37)">${forms[kind]||forms.gem}</g>
<path d="M10 69H29" stroke="${colors[0]}" opacity=".35"/></svg>`;
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
 }
 window.VERZUM_ART_ICON=function(id){
    const k=String(id);
    if(!memo.has(k))memo.set(k,render(k));
    return memo.get(k);
 };
})();
