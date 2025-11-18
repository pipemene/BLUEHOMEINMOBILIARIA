window.__CFG__ = Object.assign(
  {
    AUTH_URL: 'http://localhost:4015',
    REDIRECT_URL: '/admin',
    REDIRECT_MAP: {
      superadmin: '/admin',
      admin: '/admin',
      administrador: '/admin',
      arrendamiento: '/arriendos',
      arriendos: '/arriendos',
      tecnico: '/tecnico',
      técnico: '/tecnico',
      contabilidad: '/contabilidad',
      finanzas: '/contabilidad',
      reparaciones: '/reparaciones',
      postventa: '/reparaciones'
    }
  },
  window.__CFG__ || {}
);
