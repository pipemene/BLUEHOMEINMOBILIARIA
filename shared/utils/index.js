export function ok(payload={}, meta={}) {
  return { ok: true, data: payload, meta };
}
export function fail(message='Error', code='ERR', status=400, extra={}) {
  return { ok: false, error: { message, code, status, ...extra } };
}
