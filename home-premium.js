(function(){
  'use strict';
  if((location.pathname.split('/').pop()||'index.html').toLowerCase()!=='index.html') return;
  const hero=document.querySelector('#home-hero');
  const car=document.querySelector('.hero-car');
  const bg=document.querySelector('.hero-bg-city');
  const road=document.querySelector('.hero-road-glow');
  if(!hero) return;
  const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduced && window.matchMedia && window.matchMedia('(pointer:fine)').matches){
    let tx=0,ty=0,cx=0,cy=0;
    hero.addEventListener('pointermove',function(e){
      const r=hero.getBoundingClientRect();
      tx=(e.clientX-r.left)/r.width-.5; ty=(e.clientY-r.top)/r.height-.5;
    },{passive:true});
    hero.addEventListener('pointerleave',function(){tx=0;ty=0},{passive:true});
    const frame=function(){
      cx+=(tx-cx)*.055; cy+=(ty-cy)*.055;
      if(car) car.style.transform='translate3d('+(-cx*17)+'px,'+(-cy*10)+'px,70px) rotateY('+(cx*2.1)+'deg) rotateX('+(cy*-1.2)+'deg)';
      if(bg) bg.style.transform='scale('+(1.09+Math.abs(cx)*.035)+') translate3d('+(-cx*13)+'px,'+(-cy*9)+'px,0)';
      if(road) road.style.transform='translate3d('+(cx*8)+'px,'+(cy*3)+'px,0) skewX(-7deg)';
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }
  if(window.gsap && window.ScrollTrigger && !reduced){
    try{
      window.gsap.registerPlugin(window.ScrollTrigger);
      const tl=window.gsap.timeline({scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:1.05}});
      if(bg) tl.to(bg,{scale:1.16,xPercent:-2,yPercent:-1,ease:'none'},0);
      if(car) tl.to(car,{xPercent:13,yPercent:-8,scale:.72,rotation:-2,ease:'none'},0);
      const info=document.querySelector('.hero-info-panel');
      if(info) tl.to(info,{y:36,opacity:.25,ease:'none'},.1);
      const copy=document.querySelector('.hero-premium-copy');
      if(copy) tl.to(copy,{xPercent:-5,opacity:.72,ease:'none'},0);
      const light=document.querySelector('.hero-light-sweep');
      if(light) tl.to(light,{xPercent:30,opacity:0,ease:'none'},0);
    }catch(_e){}
  }
})();
