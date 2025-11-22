const config = require('../config/config');

module.exports = function authApiKey(req, res, next) {
  const headerKey = req.headers['x-api-key'] || req.headers['x-internal-key'];

  if (!config.internalApiKey) {
    console.warn('[authApiKey] INTERNAL_API_KEY no configurada. Saltando validación.');
    return next();
  }

  if (!headerKey || headerKey !== config.internalApiKey) {
    return res.status(401).json({
      ok: false,
      message: 'No autorizado: API key inválida o ausente'
    });
  }

  next();
};
