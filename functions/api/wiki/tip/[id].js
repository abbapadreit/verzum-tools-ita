/* Same-origin fallback for verified VERZUM Wiki item bonuses.
 * All requests target one fixed, official upstream host and a numeric item ID.
 * Static snapshots in public/wiki-item-tooltips.generated.js are used first.
 */
export async function onRequestGet({request,params}){
 const id=String(params.id||'');
 if(!/^\d{1,9}$/.test(id))return new Response(JSON.stringify({ok:false,message:'ID non valido'}),{status:400,headers:{'content-type':'application/json;charset=utf-8'}});
 const cacheKey=new Request('https://wiki-cache.verzum.internal/tip/'+id);
 const cache=caches.default;
 const cached=await cache.match(cacheKey);
 if(cached)return cached;
 try{
  const upstream=await fetch('https://wiki.verzum.to/api/wiki/tip/'+id+'?lang=it',{
   method:'GET',
   headers:{'Accept':'application/json','X-Requested-With':'verzum','User-Agent':'VERZUM-Tools-Wiki-Archive/1.0'},
   signal:AbortSignal.timeout(8500)
  });
  if(!upstream.ok)return new Response(JSON.stringify({ok:false,message:'Scheda originale momentaneamente non disponibile'}),{
   status:upstream.status===404?404:503,
   headers:{'content-type':'application/json;charset=utf-8','retry-after':'60','cache-control':'no-store'}
  });
  const data=await upstream.json();
  if(!data||data.ok!==true||!data.tip||String(data.tip.vnum)!==id||!Array.isArray(data.tip.lines))throw new Error('Risposta originale non verificabile');
  const response=new Response(JSON.stringify(data),{
   status:200,
   headers:{'content-type':'application/json;charset=utf-8','cache-control':'public, max-age=600, s-maxage=86400','x-content-type-options':'nosniff'}
  });
  await cache.put(cacheKey,response.clone());
  return response;
 }catch(e){
  return new Response(JSON.stringify({ok:false,message:'Servizio originale momentaneamente non disponibile'}),{
   status:503,headers:{'content-type':'application/json;charset=utf-8','retry-after':'60','cache-control':'no-store'}
  });
 }
}
