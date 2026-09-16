(function(){
  'use strict';
  const D=window.RoyalBakuData;if(!D)return;
  const esc=v=>String(v??'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));
  const money=v=>`${D.getSettings().currency||'AZN'} ${Number(v||0).toLocaleString()}`;
  const waDigits=()=>String(D.getSettings().whatsapp||D.getSettings().phone||'994102357434').replace(/\D/g,'');
  const imageOr='assets/royal-baku-logo.png';
  function renderFleet(){
    if(!location.pathname.toLowerCase().endsWith('fleet.html'))return;
    const grid=document.querySelector('.fleet-grid');if(!grid)return;
    const cars=D.getCars().filter(c=>c.available!==false);
    grid.innerHTML=cars.map(c=>`<article class="fleet-card reveal" tabindex="0" role="button" aria-expanded="false" data-type="${esc(c.type||'sedan')}" data-vehicle="${esc(c.name)}" data-slug="${esc(c.id)}" data-price="${Number(c.price)||0}" data-airport="${Number(c.airport)||0}" data-chauffeur="${Number(c.chauffeur)||0}" data-seats="${Number(c.seats)||0}" data-transmission="${esc(c.transmission||'Automatic')}" data-fuel="${esc(c.fuel||'Petrol')}"><div class="fleet-image"><img alt="${esc(c.name)}" src="${esc(c.image||imageOr)}"></div><div class="fleet-info"><div class="fleet-card-top"><div><span class="eyebrow">${esc(c.category||'Premium vehicle')}</span><h3>${esc(c.name)}</h3></div><span class="price-badge">From ${money(c.price)}/day</span></div><div class="chips">${(c.features||[c.color,c.type,'Premium']).filter(Boolean).slice(0,3).map(x=>`<span class="chip">${esc(x)}</span>`).join('')}</div><div class="vehicle-details"><div class="vehicle-specs"><div><small>Transmission</small><b>${esc(c.transmission||'Automatic')}</b></div><div><small>Seats</small><b>${esc(c.seats||'—')}</b></div><div><small>Fuel</small><b>${esc(c.fuel||'—')}</b></div><div><small>Service</small><b>${esc(c.drive||'Self drive / chauffeur')}</b></div></div><p>${esc(c.description||'Premium mobility around Baku and Azerbaijan.')}</p><a class="btn btn-primary" href="booking.html?car=${encodeURIComponent(c.id)}">Book this car <span>→</span></a></div></div></article>`).join('') || '<div class="admin-empty"><h3>No vehicles available</h3><p>Please add a vehicle from the admin panel.</p></div>';
    document.querySelector('.rb-fleet-tools')?.remove();document.querySelector('.rb-pricing-band')?.remove();document.querySelector('#rbFleetNote')?.remove();document.querySelector('#rbNoResults')?.remove();
    // Re-run interaction binding for the newly rendered cards.
    window.dispatchEvent(new Event('royal-baku-content-rendered'));
  }
  function renderTours(){
    if(!location.pathname.toLowerCase().endsWith('tours.html'))return;
    const section=document.querySelector('.section .container .tour-feature')?.closest('.section');if(!section)return;
    const tours=D.getTours().filter(t=>t.available!==false);
    const container=section.querySelector('.container');if(!container)return;
    container.querySelectorAll('.tour-feature,.tour-grid-small').forEach(n=>n.remove());
    const feature=tours[0];
    if(feature)container.insertAdjacentHTML('beforeend',tourHtml(feature,true));
    if(tours.length>1)container.insertAdjacentHTML('beforeend',`<div class="tour-grid-small">${tours.slice(1).map(t=>tourHtml(t,false)).join('')}</div>`);
    window.dispatchEvent(new Event('royal-baku-content-rendered'));
  }
  function tourHtml(t,featured){
    const itinerary=(t.itinerary||[]).slice(0,4).map((s,i)=>`<div class="rb-tour-stop"><small>0${i+1}</small><b>${esc(s)}</b></div>`).join('');
    return `<article class="${featured?'tour-feature':'card'} tour-card reveal" tabindex="0" role="button" aria-expanded="false" data-tour="${esc(t.id)}"><div class="${featured?'tour-feature-media':'card-img'}"><img alt="${esc(t.name)}" src="${esc(t.image||imageOr)}"></div><div class="${featured?'tour-feature-copy':'card-body'}"><div class="eyebrow">${esc(t.category||'Azerbaijan')}</div><div class="tour-head"><h3>${esc(t.name)}</h3><span class="tour-price-badge">${money(t.price)}${featured?' / person':''}</span></div><p>${esc(t.description||'Discover Azerbaijan with Royal Baku.')}</p><div class="tour-details"><div class="tour-specs"><div><small>Price</small><b>${money(t.price)} / person</b></div><div><small>Duration</small><b>${esc(t.duration||'Full day')}</b></div><div><small>Minimum</small><b>${esc(t.minimum||2)} people</b></div><div><small>Focus</small><b>${esc(t.focus||'Travel')}</b></div></div><p>${esc((t.itinerary||[]).join(' · ')||'Exact route can be confirmed on WhatsApp.')}</p><div class="rb-tour-itinerary">${itinerary}</div><a class="btn btn-primary" href="tour-booking.html?tour=${encodeURIComponent(t.id)}">Book this tour <span>→</span></a></div><div class="tour-tap">Tap / click to explore</div></div></article>`;
  }
  function updateBookingData(){
    if(!location.pathname.toLowerCase().endsWith('booking.html'))return;
    const key=new URLSearchParams(location.search).get('car')||D.getCars()[0]?.id;const car=D.getCars().find(c=>c.id===key)||D.getCars()[0];
    if(!car)return;
    const set=(id,text)=>{const el=document.getElementById(id);if(el)el.textContent=text};const img=document.getElementById('bookCarImage');if(img)img.src=car.image||imageOr;
    set('bookCarName',car.name);set('bookCarCategory',car.category||'Premium vehicle');set('bookCarPrice',`${money(car.price)} / day`);
    const spec=document.getElementById('bookSpecs');if(spec)spec.innerHTML=`<div><small>Transmission</small><b>${esc(car.transmission||'Automatic')}</b></div><div><small>Seats</small><b>${esc(car.seats||'—')}</b></div><div><small>Fuel</small><b>${esc(car.fuel||'—')}</b></div><div><small>Service</small><b>${esc(car.drive||'Self drive / chauffeur')}</b></div>`;
    window.RoyalBakuSelectedCar=car;
  }
  function updateTourBooking(){
    if(!location.pathname.toLowerCase().endsWith('tour-booking.html'))return;
    const key=new URLSearchParams(location.search).get('tour')||D.getTours()[0]?.id;const tour=D.getTours().find(t=>t.id===key)||D.getTours()[0];if(!tour)return;
    const set=(id,text)=>{const el=document.getElementById(id);if(el)el.textContent=text};const img=document.getElementById('tourBookImage');if(img)img.src=tour.image||imageOr;
    set('tourBookName',tour.name);set('tourBookCategory',tour.category||'Azerbaijan tour');set('tourBookPrice',`${money(tour.price)} / person`);set('tTourName',tour.name);const spec=document.getElementById('tourBookSpecs');if(spec)spec.innerHTML=`<div><small>Price</small><b>${money(tour.price)} / person</b></div><div><small>Duration</small><b>${esc(tour.duration||'Full day')}</b></div><div><small>Minimum</small><b>${esc(tour.minimum||2)} people</b></div><div><small>Focus</small><b>${esc(tour.focus||'Travel')}</b></div>`;
    window.RoyalBakuSelectedTour=tour;
  }
  function updateSiteBasics(){
    const s=D.getSettings();const phoneDigits=String(s.phone||'').replace(/\D/g,'');document.querySelectorAll('[data-rb-phone]').forEach(el=>{el.textContent=s.phone; if(el.tagName==='A')el.href=`tel:${phoneDigits}`});
    document.querySelectorAll('[data-rb-whatsapp]').forEach(el=>{el.textContent='WhatsApp'; if(el.tagName==='A')el.href=`https://wa.me/${waDigits()}`});document.querySelectorAll('[data-rb-address]').forEach(el=>el.textContent=s.address);document.querySelectorAll('[data-rb-hours]').forEach(el=>el.textContent=s.hours);document.querySelectorAll('[data-rb-business]').forEach(el=>el.textContent=s.businessName);
  }

  function renderHome(){
    if(!location.pathname.toLowerCase().endsWith('index.html') && location.pathname!=='/' )return;
    const main=document.querySelector('main');if(!main)return;
    const cars=D.getCars().filter(c=>c.available!==false&&c.featured).slice(0,3);
    const cardHost=main.querySelector('.cards');
    if(cardHost&&cars.length){cardHost.innerHTML=cars.map(c=>`<article class="card reveal"><div class="card-img"><img alt="${esc(c.name)}" src="${esc(c.image||imageOr)}"></div><div class="card-body"><div class="card-meta"><span>${esc(c.category||'Premium')}</span><span class="price">${money(c.price)}/day</span></div><h3>${esc(c.name)}</h3><p>${esc(c.description||'Premium mobility around Baku.')}</p><a class="btn btn-secondary" href="fleet.html">View vehicle</a></div></article>`).join('');}
    const reviewId='rb-managed-reviews', faqId='rb-managed-faqs'; document.getElementById(reviewId)?.remove(); document.getElementById(faqId)?.remove();
    const reviews=D.getReviews().filter(r=>r.active!==false);
    const faqs=D.getFaqs().filter(f=>f.active!==false);
    if(reviews.length){main.insertAdjacentHTML('beforeend',`<section class="section" id="${reviewId}"><div class="container"><div class="eyebrow">Guest feedback</div><h2 class="section-title">What guests say.</h2><div class="cards rb-review-grid">${reviews.slice(0,6).map(r=>`<article class="card"><div class="card-body"><div class="rating">${'★'.repeat(Number(r.rating||5))}</div><h3>${esc(r.name)}</h3><p>${esc(r.text)}</p></div></article>`).join('')}</div></div></section>`);}
    if(faqs.length){main.insertAdjacentHTML('beforeend',`<section class="section" id="${faqId}"><div class="container"><div class="eyebrow">Need to know</div><h2 class="section-title">Questions, answered.</h2><div class="faq-list">${faqs.slice(0,8).map(f=>`<div class="faq-item"><button class="faq-q" type="button" aria-expanded="false"><span>${esc(f.q)}</span><span>+</span></button><div class="faq-a"><p>${esc(f.a)}</p></div></div>`).join('')}</div></div></section>`);}
  }
  function boot(){renderFleet();renderTours();renderHome();updateBookingData();updateTourBooking();updateSiteBasics();}
  document.addEventListener('DOMContentLoaded',boot,{once:true});window.addEventListener('royal-baku-data-change',boot);window.addEventListener('storage',e=>{if(Object.values(D.keys).includes(e.key))location.reload();});
})();
