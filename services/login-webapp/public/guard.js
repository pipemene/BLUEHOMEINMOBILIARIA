// Simple JWT payload decode
function decodeJwt (t){ try{ const p=t.split('.')[1]; return JSON.parse(atob(p.replace(/-/g,'+').replace(/_/g,'/')));}catch{return null;} }
function requireAuth(){
  const token = localStorage.getItem('BH_TOKEN');
  if(!token){ window.location.href = '/'; return null; }
  const payload = decodeJwt(token);
  if(!payload){ localStorage.removeItem('BH_TOKEN'); window.location.href = '/'; return null; }
  return { token, payload };
}
function logout(){ localStorage.removeItem('BH_TOKEN'); localStorage.removeItem('BH_USER'); window.location.href = '/'; }
