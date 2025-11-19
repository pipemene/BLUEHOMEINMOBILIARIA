window.__CFG__ = Object.assign(
  {
    AUTH_URL: 'http://localhost:4015',
    REDIRECT_URL: '/dashboard',
    REDIRECT_MAP: {
      superadmin: '/dashboard',
      admin: '/dashboard',
      administrador: '/dashboard',
      arrendamiento: '/dashboard',
      arriendos: '/dashboard',
      tecnico: '/dashboard',
      técnico: '/dashboard',
      contabilidad: '/dashboard',
      finanzas: '/dashboard',
      reparaciones: '/dashboard',
      postventa: '/dashboard'
    }
  },
  window.__CFG__ || {}
);
