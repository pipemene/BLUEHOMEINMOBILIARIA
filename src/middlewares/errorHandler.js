module.exports = function errorHandler(err, req, res, next) {
  console.error('🔥 Error no controlado:', err);

  const status = err.status || 500;

  res.status(status).json({
    ok: false,
    message: err.message || 'Error interno del servidor',
    // Solo en desarrollo podrías exponer el stack
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
