(()=>{
 const button=document.querySelector('#like-button'),label=document.querySelector('#like-label'),count=document.querySelector('#like-count'),toast=document.querySelector('#like-toast'),burst=document.querySelector('.like-burst');
 if(!button)return;
 const mascot=document.createElement('img');
 mascot.className='like-mascot';mascot.src=button.closest('.homepage-like').dataset.mascot;mascot.alt='';mascot.setAttribute('aria-hidden','true');mascot.hidden=true;mascot.width=144;mascot.height=144;
 const wrapper=button.closest('.homepage-like');wrapper.append(mascot);
 const config={url:wrapper.dataset.supabaseUrl,publishableKey:wrapper.dataset.supabaseKey};
 const identityKey='jingqi-homepage-like-browser';
 let state=null,busy=false,timer,browserId,loading=false;
 try{
  browserId=localStorage.getItem(identityKey);
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(browserId||'')){
   browserId=crypto.randomUUID();localStorage.setItem(identityKey,browserId);
  }
 }catch{toast.textContent='Allow browser storage to enable likes.';count.textContent='--';return;}
 function paint(data){
  if(!Number.isSafeInteger(data.count)||data.count<0||typeof data.liked!=='boolean')throw Error('Invalid response');
  state=data;count.textContent=new Intl.NumberFormat('en').format(data.count);label.textContent=data.liked?'Liked':'Like';button.setAttribute('aria-pressed',String(data.liked));button.setAttribute('aria-label',(data.liked?'You liked this homepage. ':'Like this homepage. ')+data.count+' likes');button.disabled=busy;
 }
 async function request(add=false){
  const endpoint=add?'homepage_add_like':'homepage_like_state';
  const headers={'Content-Type':'application/json',apikey:config.publishableKey};
  // Legacy anon keys are JWTs; the new publishable keys use the apikey header.
  if(config.publishableKey.startsWith('eyJ'))headers.Authorization='Bearer '+config.publishableKey;
  const res=await fetch(config.url.replace(/\/$/,'')+'/rest/v1/rpc/'+endpoint,{method:'POST',headers,body:JSON.stringify({p_browser_id:browserId}),cache:'no-store',signal:AbortSignal.timeout(10000)});
  if(!res.ok)throw Error('Cloud request failed');return res.json();
 }
 function clearCelebration(){
  clearTimeout(timer);burst.replaceChildren();button.classList.remove('celebrate');wrapper.classList.remove('is-celebrating');
  mascot.getAnimations().forEach(animation=>animation.cancel());mascot.hidden=true;toast.textContent='';
 }
 function celebrate(){
  clearCelebration();button.classList.add('celebrate');wrapper.classList.add('is-celebrating');mascot.hidden=false;toast.textContent='Thank you!';
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
   mascot.animate([
    {opacity:0,transform:'translateY(16px) scale(.75)',offset:0},
    {opacity:1,transform:'translateY(-5px) scale(1.04)',offset:.13},
    {opacity:1,transform:'translateY(0) scale(1)',offset:.23},
    {opacity:1,transform:'translateY(0) scale(1)',offset:.86},
    {opacity:0,transform:'translateY(8px) scale(.95)',offset:1}
   ],{duration:2200,easing:'ease-out'});
   for(let i=0;i<7;i++){const p=document.createElement('i');p.textContent='\u2665';p.style.setProperty('--x',(-52+i*17)+'px');p.style.setProperty('--y',(-42-Math.sin(i/6*Math.PI)*32)+'px');p.style.setProperty('--r',(-30+i*10)+'deg');burst.append(p);}
  }
  timer=setTimeout(clearCelebration,2200);
 }
 async function refresh(){if(loading||busy)return;loading=true;try{paint(await request());toast.textContent='';}catch{toast.textContent='Connection unavailable. Click to retry.';if(!state)count.textContent='--';button.disabled=false;}finally{loading=false;}}
 button.addEventListener('click',async()=>{
  if(busy)return;
  if(state?.liked){celebrate();return;}
  if(!state){await refresh();return;}
  busy=true;button.disabled=true;
  try{paint(await request(true));celebrate();}
  catch{toast.textContent='Could not save. Please try again.';}
  finally{busy=false;button.disabled=false;}
 });
 if(!config?.url||!config?.publishableKey){count.textContent='--';toast.textContent='Likes are temporarily unavailable.';return;}
 window.addEventListener('pageshow',event=>{if(event.persisted)refresh();});
 window.addEventListener('storage',event=>{if(event.key===identityKey)location.reload();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)clearCelebration();else refresh();});
 window.addEventListener('pagehide',clearCelebration);
 refresh();
})();
