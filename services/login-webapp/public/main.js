(function(){
  const C = window.__CFG__ || {};
  const form = document.getElementById('f');
  if (!form) return;

  const msg = document.getElementById('msg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (msg) {
      msg.style.color = '#e5e7eb';
      msg.textContent = 'Validando…';
    }

    const usuarioInput = document.getElementById('usuario');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    const identity = (usuarioInput?.value || emailInput?.value || '').trim();
    const password = passwordInput ? passwordInput.value : '';

    if (!identity || !password) {
      if (msg) {
        msg.style.color = '#ef4444';
        msg.textContent = 'Ingresa usuario y contraseña';
      }
      return;
    }

    try {
      const r = await fetch((C.AUTH_URL || '') + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: identity, password })
      });
      const data = await r.json();
      if (!r.ok || !data.ok) {
        throw new Error(data.error || 'Error de autenticación');
      }

      localStorage.setItem('BH_TOKEN', data.token);
      localStorage.setItem('BH_USER', JSON.stringify(data.user));

      if (msg) {
        msg.style.color = '#22c55e';
        msg.textContent = 'Ingreso exitoso…';
      }

      const role = (data.user?.role || '').toLowerCase();
      const map = C.REDIRECT_MAP || {};
      const target = map[role] || C.REDIRECT_URL || '/';
      setTimeout(() => { window.location.href = target; }, 400);
    } catch (err) {
      if (msg) {
        msg.style.color = '#ef4444';
        msg.textContent = err.message || 'Error';
      }
    }
  });
})();
