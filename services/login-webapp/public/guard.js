(function () {
  const ROLE_ALIASES = {
    superadmin: ['superadmin', 'admin', 'administrador'],
    arriendos: ['arriendos', 'arrendamiento', 'arriendo'],
    tecnico: ['tecnico', 'técnico', 'tecnicos'],
    contabilidad: ['contabilidad', 'contable', 'finanzas'],
    reparaciones: ['reparaciones', 'postventa', 'post venta']
  };

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

  function decodeJwt (token) {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    } catch {
      return null;
    }
  }

  function getStoredUser () {
    try {
      return JSON.parse(localStorage.getItem('BH_USER') || '{}');
    } catch {
      return {};
    }
  }

  function requireAuth () {
    const token = localStorage.getItem('BH_TOKEN');
    if (!token) {
      window.location.href = '/';
      return null;
    }
    const payload = decodeJwt(token);
    if (!payload) {
      logout();
      return null;
    }
    return { token, payload, user: getStoredUser() };
  }

  function expandExpected (expected) {
    if (!expected) return [];
    if (typeof expected === 'string') {
      expected = expected.split(',').map((item) => item.trim()).filter(Boolean);
    }
    if (!Array.isArray(expected)) {
      expected = [expected];
    }
    return expected.map(canonicalRole).filter(Boolean);
  }

  function requireRole (expected) {
    const auth = requireAuth();
    if (!auth) return null;

    const requiredRoles = expandExpected(expected);
    if (!requiredRoles.length) return auth;

    const role = canonicalRole(auth.user.role || auth.payload.role);
    if (!requiredRoles.includes(role)) {
      window.location.href = '/';
      return null;
    }
    return auth;
  }

  function logout () {
    localStorage.removeItem('BH_TOKEN');
    localStorage.removeItem('BH_USER');
    window.location.href = '/';
  }

  window.requireAuth = requireAuth;
  window.requireRole = requireRole;
  window.logout = logout;
  window.canonicalRole = canonicalRole;
})();
