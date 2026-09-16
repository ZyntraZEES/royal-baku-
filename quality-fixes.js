(function(){
  'use strict';
  const PAGE=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  const STORE='rb_bookings_v1';
  const INQ='rb_inquiries_v1';
  const safeJSON=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch{return f}};

  function validateCarDates(){
    if(PAGE!=='booking.html') return;
    const form=document.getElementById('bookingForm'); if(!form) return;
    const from=document.getElementById('pickupDate'), to=document.getElementById('dropoffDate'); if(!from||!to)return;
    const sync=()=>{ if(from.value) to.min=from.value; if(to.value && from.value && to.value<=from.value) to.setCustomValidity('Return date must be after pickup date.'); else to.setCustomValidity(''); };
    from.addEventListener('change',sync); to.addEventListener('change',sync); sync();
    form.addEventListener('submit',e=>{sync(); if(!form.checkValidity()){form.reportValidity();e.preventDefault();}}, true);
  }

  function validateTour(){
    if(PAGE!=='tour-booking.html') return;
    const form=document.getElementById('tourBookingForm'); if(!form) return;
    const date=document.getElementById('tourDate'); if(date) { const now=new Date(); const today=new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,10); date.min=today; }
    form.addEventListener('submit',e=>{if(!form.checkValidity()){form.reportValidity();e.preventDefault();}}, true);
  }

  function captureInquiry(){
    if(PAGE!=='contact.html')return;
    const form=document.querySelector('.contact-panel form'); if(!form || form.dataset.inquiryBound)return;
    form.dataset.inquiryBound='1';
    form.addEventListener('submit',()=>{
      const name=form.querySelector('#name')?.value?.trim()||'';
      const subject=form.querySelector('#subject')?.value?.trim()||'';
      const message=form.querySelector('#message')?.value?.trim()||'';
      const arr=safeJSON(INQ,[]);
      arr.push({id:'INQ-'+Date.now().toString().slice(-6),name,subject,message,status:'New',createdAt:new Date().toISOString()});
      localStorage.setItem(INQ,JSON.stringify(arr));
      try{const bc=new BroadcastChannel('royal-baku-inquiries');bc.postMessage({type:'inquiry-created'});bc.close()}catch{}
    }, true);
  }

  function adminOverlay(){
    if(PAGE!=='admin.html')return;
    const sidebar=document.getElementById('adminSidebar'), open=document.getElementById('openSidebar'); if(!sidebar||!open)return;
    let overlay=document.getElementById('adminMobileOverlay');
    if(!overlay){overlay=document.createElement('button');overlay.type='button';overlay.id='adminMobileOverlay';overlay.setAttribute('aria-label','Close menu');document.body.appendChild(overlay);}
    const close=()=>{sidebar.classList.remove('open');document.body.classList.remove('admin-mobile-open');overlay.classList.remove('show');};
    open.addEventListener('click',()=>{sidebar.classList.add('open');document.body.classList.add('admin-mobile-open');overlay.classList.add('show');});
    document.getElementById('closeSidebar')?.addEventListener('click',close);
    overlay.addEventListener('click',close);
    sidebar.querySelectorAll('[data-admin-tab]').forEach(x=>x.addEventListener('click',close));
  }

  function backForwardLoader(){
    const loader=document.getElementById('rb-page-loader'); if(!loader)return;
    window.addEventListener('pageshow',e=>{if(e.persisted) loader.classList.add('is-hidden');});
  }

  function notifyPublicRefresh(){
    if(!window.RoyalBakuData)return;
    window.addEventListener('storage',e=>{ if(e.key && ['rb_cars_v1','rb_tours_v1','rb_settings_v1','rb_reviews_v1','rb_faqs_v1'].includes(e.key) && PAGE!=='admin.html') { window.dispatchEvent(new Event('royal-baku-data-change')); }});
  }

  document.addEventListener('DOMContentLoaded',()=>{validateCarDates();validateTour();captureInquiry();adminOverlay();backForwardLoader();notifyPublicRefresh();},{once:true});
})();
