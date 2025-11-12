const C = window.__CFG__||{};
const form = document.getElementById('f');
const msg = document.getElementById('msg');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.textContent = 'Validando…';
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  try{
    const r = await fetch((C.AUTH_URL||'') + '/auth/login', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ email, password })
    });
    const data = await r.json();
    if(!r.ok || !data.ok) throw new Error(data.error || 'Error de autenticación');
    localStorage.setItem('BH_TOKEN', data.token);
    localStorage.setItem('BH_USER', JSON.stringify(data.user));
    msg.style.color = '#22c55e'; msg.textContent = 'Ingreso exitoso…';
    setTimeout(()=>{ window.location.href = C.REDIRECT_URL || '/'; }, 600);
  }catch(err){
    msg.style.color = '#ef4444'; msg.textContent = err.message || 'Error';
  }
});
