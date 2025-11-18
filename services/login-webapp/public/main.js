(function () {
  const C = window.__CFG__ || {};
  const form = document.getElementById('login-form');
  const msg = document.getElementById('msg');
  const shortcut = document.getElementById('shortcut');
  const shortcutUser = document.getElementById('shortcut-user');
  const shortcutRole = document.getElementById('shortcut-role');
  const goPanelBtn = document.getElementById('go-panel');
  const AUTH_BASE = sanitizeBaseUrl(C.AUTH_URL) || 'http://localhost:4015';

  const ROLE_ALIASES = {
    superadmin: ['superadmin', 'admin', 'administrador'],
    arriendos: ['arriendos', 'arrendamiento', 'arriendo'],
    tecnico: ['tecnico', 'técnico', 'tecnicos', 'ordenes', 'órdenes', 'ordenes de trabajo'],
    contabilidad: ['contabilidad', 'contable', 'finanzas'],
    reparaciones: ['reparaciones', 'postventa', 'post venta']
  };

  const DEFAULT_ROUTES = {
    superadmin: '/admin',
    arriendos: '/arriendos',
    tecnico: '/tecnico',
    contabilidad: '/contabilidad',
    reparaciones: '/reparaciones'
  };

  hydrateShortcut();

  if (form) {
    form.addEventListener('submit', onSubmit);
  }

  async function onSubmit (event) {
    event.preventDefault();

    const usuarioInput = document.getElementById('usuario');
    const passwordInput = document.getElementById('password');

    const identity = sanitizeIdentity(usuarioInput?.value);
    const password = passwordInput ? passwordInput.value : '';

    if (!identity || !password) {
      updateStatus('Ingresa usuario y contraseña', 'error');
      return;
    }

    updateStatus('Validando credenciales…', 'info');

    try {
      const response = await fetch(`${AUTH_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: identity, password })
      });

      const data = await parseResponse(response);
      if (!response.ok || !data.ok) {
        throw new Error(data?.error || 'Credenciales inválidas');
      }

      localStorage.setItem('BH_TOKEN', data.token);
      localStorage.setItem('BH_USER', JSON.stringify(data.user));

      updateStatus('Ingreso exitoso, preparando tu panel…', 'success');

      const target = computeTarget(data.user?.role);
      setTimeout(() => { window.location.href = target; }, 400);
    } catch (err) {
      console.error(err);
      updateStatus(friendlyError(err), 'error');
    }
  }

  function hydrateShortcut () {
    if (!shortcut || !goPanelBtn) return;
    const token = localStorage.getItem('BH_TOKEN');
    const user = safeUser();
    if (!token || !user || !user.role) {
      shortcut.classList.remove('is-visible');
      return;
    }
    const target = computeTarget(user.role);
    shortcut.classList.add('is-visible');
    if (shortcutUser) shortcutUser.textContent = user.username || user.usuario || 'usuario';
    if (shortcutRole) shortcutRole.textContent = titleCase(canonicalRole(user.role));
    goPanelBtn.onclick = () => { window.location.href = target; };
  }

  function sanitizeIdentity (value) {
    return (value || '')
      .toString()
      .trim()
      .toLowerCase();
  }

  function updateStatus (message, variant) {
    if (!msg) return;
    msg.textContent = message;
    msg.classList.remove('is-error', 'is-success');
    if (variant === 'error') msg.classList.add('is-error');
    if (variant === 'success') msg.classList.add('is-success');
  }

  function sanitizeBaseUrl (value) {
    if (!value) return '';
    try {
      const trimmed = value.toString().trim();
      if (!trimmed) return '';
      return trimmed.replace(/\/+$/, '');
    } catch {
      return '';
    }
  }

  function normalizeText (value) {
    return (value || '')
      .toString()
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ');
  }

  function canonicalRole (role) {
    const clean = normalizeText(role);
    for (const key of Object.keys(ROLE_ALIASES)) {
      if (ROLE_ALIASES[key].includes(clean)) {
        return key;
      }
    }
    return clean;
  }

  function titleCase (value) {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function parseMap (rawMap) {
    const map = typeof rawMap === 'string' ? safeJson(rawMap) : rawMap || {};
    const result = { ...DEFAULT_ROUTES };
    Object.entries(map).forEach(([key, value]) => {
      const canonical = canonicalRole(key);
      if (!canonical || !value) return;
      result[canonical] = value;
    });
    return result;
  }

  function safeJson (value) {
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }

  function safeUser () {
    try {
      return JSON.parse(localStorage.getItem('BH_USER') || 'null');
    } catch {
      return null;
    }
  }

  function computeTarget (role) {
    const canonical = canonicalRole(role);
    const map = parseMap(C.REDIRECT_MAP);
    return map[canonical] || C.REDIRECT_URL || DEFAULT_ROUTES[canonical] || '/';
  }

  async function parseResponse (response) {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return response.json();
    }
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return { ok: false, error: text || 'Respuesta inesperada del servidor' };
    }
  }

  function friendlyError (err) {
    if (!err) return 'Error desconocido';
    if (typeof err === 'string') return err;
    if (err.message) return err.message;
    return 'No fue posible validar tus credenciales';
  }
})();
