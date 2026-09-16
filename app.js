(function(){
  'use strict';

  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const navItems = [
    ['index.html','Home'],
    ['fleet.html','Fleet'],
    ['services.html','Services'],
    ['tours.html','Tours'],
    ['contact.html','Contact']
  ];

  const initPageLoader = () => {
    const loader = document.getElementById('rb-page-loader');
    if (!loader) return;
    const start = performance.now();
    let finished = false;
    const hide = () => {
      if (finished) return;
      finished = true;
      const elapsed = performance.now() - start;
      // Keep the original homepage/first-entry intro untouched (~3.4s).
      // All secondary pages use a fast ~0.9s transition so navigation feels immediate.
      const isFirstEntry = document.body?.classList.contains('page-home');
      const target = isFirstEntry ? 3400 : 900;
      const wait = Math.max(0, target - elapsed);
      window.setTimeout(() => loader.classList.add('is-hidden'), wait);
      window.setTimeout(() => loader.remove(), wait + (isFirstEntry ? 900 : 300));
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => window.requestAnimationFrame(() => window.setTimeout(hide, 120)), {once:true});
    } else {
      window.requestAnimationFrame(() => window.setTimeout(hide, 120));
    }
    window.setTimeout(hide, 4800);
  };

  // Arm the loader immediately. It must never depend on DOMContentLoaded,
  // remote animation libraries, or any other enhancement script.
  initPageLoader();

  const initNavigation = () => {
    const navRoot = document.querySelector('.nav-links');
    const menuBtn = document.querySelector('.menu-btn');
    const navEl = document.querySelector('.nav');
    if (!navRoot || !navEl) return;

    navRoot.innerHTML = navItems.map(([href,label]) =>
      `<a href="${href}" class="${page === href ? 'active' : ''}">${label}</a>`
    ).join('') + '<a class="nav-cta" href="contact.html">Book Now</a>';

    // Build a mobile drawer from the same source of truth.
    const drawer = document.createElement('div');
    drawer.className = 'mobile-menu';
    drawer.setAttribute('aria-hidden', 'true');
    drawer.innerHTML = `<div class="mobile-menu-inner">
      ${navItems.map(([href,label]) => `<a href="${href}" class="${page === href ? 'active' : ''}">${label}</a>`).join('')}
      <a class="nav-cta" href="contact.html">Book Now</a>
      <div class="mobile-language"><span>Language</span><select class="rb-select" aria-label="Language"><option value="en">EN</option><option value="az">AZ</option><option value="ru">RU</option><option value="ur">UR</option></select></div>
    </div>`;
    document.body.appendChild(drawer);

    const setMenu = (open) => {
      document.body.classList.toggle('menu-open', open);
      drawer.setAttribute('aria-hidden', String(!open));
      if (menuBtn) menuBtn.setAttribute('aria-expanded', String(open));
    };

    if (menuBtn) {
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.setAttribute('aria-label', 'Toggle navigation');
      menuBtn.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
    }
    const mobileLanguage = drawer.querySelector('.mobile-language select');
    if (mobileLanguage) {
      mobileLanguage.value = localStorage.getItem('rb-lang') || 'en';
      mobileLanguage.addEventListener('change', () => {
        localStorage.setItem('rb-lang', mobileLanguage.value);
        if (typeof window.applyCommonLanguage === 'function') window.applyCommonLanguage();
      });
    }
    drawer.addEventListener('click', (e) => {
      if (e.target === drawer) setMenu(false);
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
    window.addEventListener('resize', () => { if (window.innerWidth > 980) setMenu(false); }, {passive:true});

    const syncNav = () => navEl.classList.toggle('scrolled', window.scrollY > 30);
    syncNav();
    window.addEventListener('scroll', syncNav, {passive:true});
  };

  const initMotion = () => {
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasGSAP = typeof window.gsap !== 'undefined';
    const hasST = hasGSAP && typeof window.ScrollTrigger !== 'undefined';

    // Never hide content if an animation CDN is unavailable.
    const motionReady = hasGSAP && hasST && !reduced;
    document.documentElement.classList.add(motionReady ? 'motion-ready' : 'motion-fallback');

    if (hasGSAP && hasST && !reduced) {
      gsap.registerPlugin(ScrollTrigger);

      if (typeof window.Lenis !== 'undefined') {
        const lenis = new Lenis({ smoothWheel:true, duration:1.15 });
        const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
        requestAnimationFrame(raf);
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.lagSmoothing(0);
      }

      document.querySelectorAll('.reveal').forEach((el) => {
        gsap.fromTo(el,
          {opacity:0, y:28},
          {opacity:1, y:0, duration:.85, ease:'power3.out', clearProps:'transform,opacity',
           scrollTrigger:{trigger:el, start:'top 88%', once:true}}
        );
      });

      gsap.utils.toArray('.parallax').forEach((el) => {
        gsap.to(el, {yPercent:-8, ease:'none', scrollTrigger:{trigger:el, start:'top bottom', end:'bottom top', scrub:1}});
      });

      const heroLogo = document.querySelector('.hero-logo-stage');
      if (heroLogo) gsap.to(heroLogo, {y:-32, rotation:1.5, scrollTrigger:{trigger:'.hero', start:'top top', end:'bottom top', scrub:1}});
    }
  };

  const initInteractions = () => {
    // 3D logo remains animated by CSS/scroll, but the cursor stays completely native.
    // Cards use CSS hover states only; no pointer-follow transforms.

    document.querySelectorAll('[data-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-filter]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const value = btn.dataset.filter;
        document.querySelectorAll('[data-type]').forEach((card) => {
          const show = value === 'all' || card.dataset.type === value;
          card.hidden = !show;
          if (!show) {
            card.classList.remove('is-open');
            card.setAttribute('aria-expanded', 'false');
          }
        });
      });
    });

    // Fleet cards behave like large interactive buttons: clicking anywhere
    // on the card/image reveals details. The booking link remains a normal
    // link and does not re-toggle the card.
    const fleetCards = document.querySelectorAll('.fleet-card');
    const toggleFleetCard = (card) => {
      const wasOpen = card.classList.contains('is-open');
      fleetCards.forEach((item) => {
        item.classList.remove('is-open');
        item.setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        card.classList.add('is-open');
        card.setAttribute('aria-expanded', 'true');
      }
    };

    fleetCards.forEach((card) => {
      card.addEventListener('click', (event) => {
        if (event.target.closest('a, button, input, select, textarea, label')) return;
        toggleFleetCard(card);
      });
      card.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        if (event.target !== card) return;
        event.preventDefault();
        toggleFleetCard(card);
      });
    });

    document.querySelectorAll('a[href="#book"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const target = document.querySelector('#book');
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth', block:'start'});
      });
    });

    // Tour cards: click anywhere to expand details, just like the fleet cards.
    const tourCards = document.querySelectorAll('.tour-card');
    const toggleTourCard = (card) => {
      const wasOpen = card.classList.contains('is-open');
      tourCards.forEach((item) => {
        item.classList.remove('is-open');
        item.setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        card.classList.add('is-open');
        card.setAttribute('aria-expanded', 'true');
      }
    };
    tourCards.forEach((card) => {
      card.addEventListener('click', (event) => {
        if (event.target.closest('a, button, input, select, textarea, label')) return;
        toggleTourCard(card);
      });
      card.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        if (event.target !== card) return;
        event.preventDefault();
        toggleTourCard(card);
      });
    });

    // Robust image fallback so a remote image outage never collapses the layout.
    document.querySelectorAll('img').forEach((img) => {
      const critical = img.classList.contains('brand-mark') || img.classList.contains('hero-logo-3d') || img.classList.contains('rb-loader-logo');
      if (!critical) img.loading = img.loading || 'lazy';
      img.decoding = 'async';
      img.addEventListener('error', () => {
        const parent = img.parentElement;
        img.classList.add('img-fallback');
        img.setAttribute('aria-hidden', 'true');
        img.removeAttribute('src');
        img.removeAttribute('srcset');
        if (parent) parent.classList.add('has-img-fallback');
      }, {once:true});
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initMotion();
    initInteractions();
  });
})();

(function(){
'use strict';
const STORE='rb_bookings_v1';
const wa='https://wa.me/994102357434';
const getBookings=()=>JSON.parse(localStorage.getItem(STORE)||'[]');
const saveBookings=v=>localStorage.setItem(STORE,JSON.stringify(v));
const carNames={c300:'Mercedes C300',cla250:'Mercedes CLA 250',vito:'Mercedes Vito',carnival:'Kia Carnival',optima:'Kia Optima','range-rover-sport':'Range Rover Sport'};
const tourNames={baku:'Baku City Tour',sheki:'Sheki City Tour',shahdag:'Shahdag Tour',gabala:'Gabala Tour'};

function injectChrome(){
  if(!document.querySelector('.rb-scroll-progress')){const bar=document.createElement('div');bar.className='rb-scroll-progress';document.body.appendChild(bar);window.addEventListener('scroll',()=>{const h=document.documentElement.scrollHeight-innerHeight;bar.style.width=(h>0?(scrollY/h)*100:0)+'%';},{passive:true});}
  // Universal social rail is handled by social-rail.js on every page.
  if(!document.querySelector('.admin-quick-link')){const a=document.createElement('a');a.className='admin-quick-link';a.href='admin.html';a.textContent='Admin';a.style.cssText='position:fixed;left:14px;bottom:14px;z-index:1100;color:#777;text-decoration:none;font-size:10px;letter-spacing:.12em;text-transform:uppercase;opacity:.45;transition:opacity .2s';a.addEventListener('mouseenter',()=>a.style.opacity='.9');a.addEventListener('mouseleave',()=>a.style.opacity='.45');document.body.appendChild(a);}
}

function enhanceFaq(){
 const data=[
  ['Do I need to pay online to send a request?','No. The website prepares a booking request and sends it to Royal Baku on WhatsApp. Final availability, terms and payment details are confirmed directly.'],
  ['Can I request airport pickup?','Yes. Airport pickup can be selected in the car booking flow, with an estimated transfer fee shown before you send the request.'],
  ['Can I book with a driver?','Yes. Selected cars support self-drive or chauffeur service. The booking summary shows the chauffeur add-on estimate.'],
  ['Are the displayed prices final?','They are sample starting prices used for the website experience. Royal Baku should confirm the final quote and availability before the rental is accepted.']
 ];
 const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
 if(!['index.html','services.html','contact.html'].includes(page)) return;
 const main=document.querySelector('main'); if(!main || document.querySelector('.faq-enhanced')) return;
 const sec=document.createElement('section'); sec.className='section faq-enhanced';
 sec.innerHTML='<div class="container"><div class="eyebrow">Questions, answered</div><h2 class="section-title">The details matter.</h2><div class="faq-grid">'+data.map((x,i)=>`<div class="faq-item"><button class="faq-q" aria-expanded="false">${x[0]}<span>+</span></button><div class="faq-a"><p>${x[1]}</p></div></div>`).join('')+'</div></div>';
 main.appendChild(sec);
 sec.querySelectorAll('.faq-q').forEach(btn=>btn.addEventListener('click',()=>{const item=btn.parentElement;const open=item.classList.toggle('open');btn.setAttribute('aria-expanded',String(open));btn.querySelector('span').textContent=open?'−':'+';}));
}

function enhanceTestimonials(){
 const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
 if(!['index.html','services.html','contact.html'].includes(page)) return;
 const main=document.querySelector('main'); if(!main || document.querySelector('.testimonial-enhanced')) return;
 const sec=document.createElement('section');sec.className='section testimonial-enhanced';sec.innerHTML=`<div class="container"><div class="eyebrow">The Royal standard</div><h2 class="section-title">Designed around confidence.</h2><div class="testimonial-grid"><article class="testimonial"><p>“A polished, easy-to-understand way to choose a car and send the request directly to the rental team.”</p><b>Guest experience</b><small>Car rental request</small></article><article class="testimonial"><p>“The tour flow makes the important things clear — route, people, pickup and price.”</p><b>Traveller experience</b><small>Azerbaijan tour request</small></article><article class="testimonial"><p>“Premium presentation without hiding the practical details: contact, location, hours and booking steps.”</p><b>Service experience</b><small>Royal Baku website</small></article></div></div>`;main.appendChild(sec);
}

function enhanceTrust(){
 const page=(location.pathname.split('/').pop()||'index.html').toLowerCase(); if(page!=='index.html') return;
 const hero=document.querySelector('.hero'); if(!hero||document.querySelector('.trust-strip')) return;
 const wrap=document.createElement('div');wrap.className='container';wrap.innerHTML='<div class="trust-strip"><div class="trust-item"><b>Premium Fleet</b><span>Executive sedans, SUVs & group vehicles</span></div><div class="trust-item"><b>Airport Pickup</b><span>Easy arrival coordination in Baku</span></div><div class="trust-item"><b>With Driver</b><span>Chauffeur option on selected vehicles</span></div><div class="trust-item"><b>09:00–21:00</b><span>Daily contact window</span></div></div>';hero.insertAdjacentElement('afterend',wrap);
}

function enhanceFleetCompare(){
 if(!(location.pathname.split('/').pop()||'index.html').toLowerCase().includes('fleet')) return;
 const cards=[...document.querySelectorAll('.fleet-card')]; if(!cards.length||document.querySelector('.compare-dock')) return;
 cards.forEach(card=>{if(card.querySelector('.compare-toggle')) return; const b=document.createElement('button'); b.type='button'; b.className='compare-toggle btn btn-secondary'; b.textContent='＋ Compare'; b.style.cssText='margin-top:12px;font-size:12px;padding:9px 12px;'; card.appendChild(b); b.addEventListener('click',e=>{e.stopPropagation();card.classList.toggle('compare-selected');b.textContent=card.classList.contains('compare-selected')?'✓ Added':'＋ Compare';renderCompare();});});
 function renderCompare(){let chosen=cards.filter(c=>c.classList.contains('compare-selected')).slice(0,3);let dock=document.querySelector('.compare-dock');if(!dock){dock=document.createElement('div');dock.className='compare-dock';dock.style.cssText='position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:1100;width:min(920px,calc(100% - 24px));padding:14px 16px;border:1px solid rgba(212,175,90,.22);border-radius:20px;background:rgba(7,7,7,.94);backdrop-filter:blur(16px);box-shadow:0 18px 50px rgba(0,0,0,.45);';document.body.appendChild(dock)}
  if(!chosen.length){dock.style.display='none';return} dock.style.display='block';dock.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap"><div><b>Compare vehicles</b><span style="display:block;color:#999;font-size:12px">Select up to 3 cars</span></div><button class="btn btn-primary" id="compareGo" style="padding:10px 14px">Compare now</button></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px;margin-top:10px">'+chosen.map(c=>`<div style="padding:10px 12px;border:1px solid rgba(212,175,90,.12);border-radius:12px"><b>${c.dataset.vehicle}</b><span style="display:block;color:#aaa;font-size:12px">AZN ${c.dataset.price}/day · ${c.dataset.seats} seats</span></div>`).join('')+'</div>';
  if(chosen.length>3){chosen.slice(3).forEach(c=>c.classList.remove('compare-selected'));} dock.querySelector('#compareGo').onclick=()=>{const rows=chosen.map(c=>`<tr><td>${c.dataset.vehicle}</td><td>AZN ${c.dataset.price}</td><td>${c.dataset.seats}</td><td>${c.dataset.transmission}</td><td>${c.dataset.fuel}</td></tr>`).join(''); const w=window.open('','_blank','noopener'); if(w){w.document.write(`<html><head><title>Royal Baku Vehicle Comparison</title><style>body{font-family:Arial;background:#070707;color:#eee;padding:32px}h1{color:#d4af5a}table{width:100%;border-collapse:collapse}td,th{padding:14px;border-bottom:1px solid #333;text-align:left}</style></head><body><h1>Royal Baku — Vehicle Comparison</h1><table><thead><tr><th>Vehicle</th><th>Price</th><th>Seats</th><th>Transmission</th><th>Fuel</th></tr></thead><tbody>${rows}</tbody></table></body></html>`);w.document.close();}};
 }
}

function bookingCapture(){
 document.addEventListener('submit',e=>{
  const form=e.target;
  if(form.id==='bookingForm'){
   const car=new URLSearchParams(location.search).get('car')||'c300'; const pickup=form.querySelector('#pickupDate')?.value; const drop=form.querySelector('#dropoffDate')?.value;
   const arr=getBookings(); const overlap=arr.some(b=>b.type==='Car'&&b.slug===car&&['Pending','Confirmed'].includes(b.status)&&pickup&&drop&&b.pickupDate&&b.dropoffDate&&pickup<=b.dropoffDate&&drop>=b.pickupDate);
   if(overlap){e.preventDefault();e.stopImmediatePropagation();alert('This vehicle already has a pending/confirmed request across the selected dates. Please choose different dates or another car.');return false;}
   const id='RB-'+Date.now().toString().slice(-6); const row={id,type:'Car',slug:car,item:carNames[car]||car,customer:form.querySelector('#name')?.value||'',phone:form.querySelector('#phone')?.value||'',pickupDate:pickup,dropoffDate:drop,total:Number((document.querySelector('#qTotal')?.textContent||'0').replace(/[^0-9.]/g,''))||0,status:'Pending',createdAt:new Date().toISOString()}; arr.push(row); saveBookings(arr); setTimeout(()=>{localStorage.setItem('rb_last_booking_id',id); const box=document.querySelector('#bookingSuccess'); if(box){box.classList.add('show'); box.innerHTML=`Request <b>${id}</b> saved. WhatsApp is opening with your booking request. Review the message and send it to Royal Baku to confirm availability.`;}},50);
  }
  if(form.id==='tourBookingForm'){
   const tour=new URLSearchParams(location.search).get('tour')||'baku'; const date=form.querySelector('#tourDate')?.value; const guests=Math.max(2,Number(form.querySelector('#tourGuests')?.value||2));
   const id='RB-T-'+Date.now().toString().slice(-6); const arr=getBookings(); arr.push({id,type:'Tour',slug:tour,item:tourNames[tour]||tour,customer:form.querySelector('#tourName')?.value||'',phone:form.querySelector('#tourPhone')?.value||'',date,guests,total:Number((document.querySelector('#tTotal')?.textContent||'0').replace(/[^0-9.]/g,''))||0,status:'Pending',createdAt:new Date().toISOString()}); saveBookings(arr); setTimeout(()=>{localStorage.setItem('rb_last_tour_booking_id',id); const box=document.querySelector('#tourBookingSuccess'); if(box){box.classList.add('show'); box.innerHTML=`Request <b>${id}</b> saved. WhatsApp is opening with your tour request. Review the message and send it to Royal Baku to confirm availability.`;}},50);
  }
 },true);
}

function enhanceBooking(){
 const page=(location.pathname.split('/').pop()||'index.html').toLowerCase(); if(!['booking.html','tour-booking.html'].includes(page)) return;
 const form=document.querySelector('form'); if(!form) return;
 const title=document.createElement('div');title.className='booking-side-note';title.innerHTML='<b>Booking flow</b><br>Choose your dates and options → review the live estimate → send the request to WhatsApp. No payment is taken here.';form.insertBefore(title,form.firstChild);
}

function enhanceContactMap(){
 const page=(location.pathname.split('/').pop()||'index.html').toLowerCase(); if(page!=='contact.html') return;
 const maps=document.querySelectorAll('.map-card'); if(!maps.length) return;
 maps.forEach(m=>{if(m.querySelector('iframe'))return;const iframe=document.createElement('iframe');iframe.loading='lazy';iframe.title='Royal Baku location';iframe.style.cssText='width:100%;height:280px;border:0;border-radius:18px;margin-top:18px;filter:grayscale(.85) contrast(1.05) brightness(.7);';iframe.src='https://www.google.com/maps?q=Khagani+Mall,+Nizami+Street,+Baku,+Azerbaijan&output=embed';m.appendChild(iframe);});
}

document.addEventListener('DOMContentLoaded',()=>{injectChrome();enhanceTrust();enhanceFaq();enhanceTestimonials();enhanceFleetCompare();enhanceBooking();enhanceContactMap();bookingCapture();},{once:true});
})();
