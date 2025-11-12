(function(){
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
      localStorage.removeItem('BH_TOKEN');
      localStorage.removeItem('BH_USER');
      window.location.href = '/';
      return null;
    }
    return { token, payload, user: getStoredUser() };
  }

  function requireRole (expected) {
    const auth = requireAuth();
    if (!auth) return null;

    const requiredRoles = (Array.isArray(expected) ? expected : [expected])
      .filter(Boolean)
      .map((r) => r.toString().toLowerCase());
    const role = (auth.user.role || auth.payload.role || '').toLowerCase();
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
})();
