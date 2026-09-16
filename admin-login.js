(function(){
  'use strict';
  const AUTH='rb_admin_session_v2', REMEMBER='rb_admin_remember_v2';
  const CREDS={username:'admin',password:'RB2026'};
  const qs=s=>document.querySelector(s);
  const go=()=>location.href='admin.html';
  const already=()=>sessionStorage.getItem(AUTH)==='1'||localStorage.getItem(AUTH)==='1';
  if(already()) go();

  const form=qs('#loginForm');
  const submit=qs('#loginSubmit');
  const label=qs('.submit-label');
  const icon=qs('.submit-icon');
  const toggle=qs('#togglePassword');
  const passwordIcon=toggle?.querySelector('i');
  const toggleText=toggle?.querySelector('.toggle-text');

  form.addEventListener('submit',e=>{
    e.preventDefault();
    const u=qs('#adminUsername').value.trim(), p=qs('#adminPassword').value, err=qs('#adminLoginError');
    err.classList.remove('show');

    if(u!==CREDS.username||p!==CREDS.password){
      err.classList.add('show');
      qs('#adminPassword').select();
      return;
    }

    const keep=qs('#rememberAdmin').checked;
    sessionStorage.removeItem(AUTH); localStorage.removeItem(AUTH);
    (keep?localStorage:sessionStorage).setItem(AUTH,'1');
    if(keep) localStorage.setItem(REMEMBER,'1');

    submit.disabled=true;
    submit.classList.add('is-loading');
    label.textContent='Verifying access...';
    document.body.classList.add('login-success');

    setTimeout(()=>{
      submit.classList.remove('is-loading');
      submit.classList.add('is-success');
      label.textContent='Access granted';
      if(icon) icon.textContent='✓';
      setTimeout(go,260);
    },420);
  });

  toggle.addEventListener('click',()=>{
    const i=qs('#adminPassword');
    const show=i.type==='password';
    i.type=show?'text':'password';
    toggle.setAttribute('aria-label',show?'Hide password':'Show password');
    toggleText.textContent=show?'Hide':'Show';
    passwordIcon.className=show?'fa-regular fa-eye-slash':'fa-regular fa-eye';
  });
})();
