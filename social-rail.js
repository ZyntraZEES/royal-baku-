(()=>{
  'use strict';
  const digits='994102357434';
  const wa=`https://wa.me/${digits}?text=${encodeURIComponent('Hello Royal Baku, I would like to ask about a booking.')}`;
  const tiktok='https://www.tiktok.com/@royalbaku';
  function mount(){
    document.querySelectorAll('.floating-wa').forEach(el=>el.remove());
    document.querySelectorAll('.hero-socials').forEach(el=>el.remove());
    document.querySelectorAll('.rb-social-rail').forEach((el,i)=>{if(i>0)el.remove();});
    if(document.querySelector('.rb-social-rail')) return;
    const wrap=document.createElement('div');
    wrap.className='rb-social-rail';
    wrap.setAttribute('aria-label','Royal Baku social links');
    wrap.innerHTML=`<a class="rb-social rb-social-whatsapp" href="${wa}" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp Royal Baku" title="WhatsApp Royal Baku"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i></a><a class="rb-social rb-social-tiktok" href="${tiktok}" target="_blank" rel="noopener noreferrer" aria-label="TikTok Royal Baku" title="TikTok Royal Baku"><i class="fa-brands fa-tiktok" aria-hidden="true"></i></a>`;
    document.body.appendChild(wrap);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount,{once:true}); else mount();
})();
