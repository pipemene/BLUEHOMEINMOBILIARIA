const cfg = window.__CONFIG__||{};
const GATEWAY = (cfg.GATEWAY_BASE_URL||'').replace(/\/+$/,'');
const PDF_SVC = (cfg.PDF_URL||'').replace(/\/+$/,'');
const UPLOADS = (cfg.UPLOADS_URL||'').replace(/\/+$/,'');

const $ = (s,r=document)=>r.querySelector(s);
const $all = (s,r=document)=>Array.from(r.querySelectorAll(s));

async function fetchJSON(url, opts){ const r = await fetch(url, opts); if(!r.ok) throw new Error(await r.text()); return r.json(); }

function allowedTransitions(status){
  return { OPEN:['ASSIGNED','CANCELED'], ASSIGNED:['IN_PROGRESS','CANCELED'], IN_PROGRESS:['DONE','CANCELED'], DONE:[], CANCELED:[] }[status]||[];
}

async function load(){ $('#btn-search').onclick = applyFilters; $('#filter-q').addEventListener('keydown', e=>{ if(e.key==='Enter') applyFilters(); }); applyFilters(); }

async function applyFilters(){
  const s = $('#filter-status').value; const q = $('#filter-q').value.trim();
  const url = GATEWAY + '/api/orders' + (s||q ? ('?'+new URLSearchParams({status:s,q}).toString()):'');
  const data = await fetchJSON(url);
  const tbody = $('#tbody'); tbody.innerHTML='';
  if(!data.length){ tbody.innerHTML = '<tr><td colspan="6" class="muted">Sin resultados</td></tr>'; return; }
  data.forEach(o=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${o.code||'-'}</td><td>${o.title||'-'}</td><td><span class="badge ${o.status}">${o.status}</span></td><td>${o.priority||'-'}</td><td>${o.clientName||'-'}</td><td><button class="btn" data-open="${o.id}">Abrir</button></td>`;
    tbody.appendChild(tr);
  });
  $all('[data-open]').forEach(b=> b.onclick = ()=> openOrder(b.getAttribute('data-open')) );
}

let CURR=null, pads={};
async function openOrder(id){
  const o = await fetchJSON(GATEWAY + '/api/orders/' + id);
  CURR = o;
  $('#m-code').textContent = o.code||'';
  $('#m-status').textContent = o.status||'';
  $('#m-title').value = o.title||'';
  $('#m-desc').value = o.description||'';
  $('#m-client').value = o.clientName||'';
  $('#m-phone').value = o.clientPhone||'';
  $('#m-prop').value = o.propertyCode||'';
  $('#m-prio').value = o.priority||'MEDIUM';
  const select = $('#m-status-next'); select.innerHTML = '<option value="">— Cambiar estado —</option>' + allowedTransitions(o.status).map(s=>`<option>${s}</option>`).join('');
  const g = $('#m-photos'); g.innerHTML=''; (o.photos||[]).forEach(u=>{ const div=document.createElement('div'); div.innerHTML=`<a href="${u}" target="_blank"><img src="${u}"></a>`; g.appendChild(div); });
  $('#modal').classList.add('show');
  $('#m-close').onclick = ()=> $('#modal').classList.remove('show');
  $('#m-save').onclick = saveOrder;
  $('#m-status-next').onchange = changeStatus;
  pads = {}; ['customer','tech','billing'].forEach(role=>{ const c=document.getElementById('sign-'+role); pads[role]=new SignaturePad(c,{backgroundColor:'rgb(255,255,255)'}); });
  $all('[data-clear]').forEach(b=> b.onclick = ()=> pads[b.dataset.clear].clear() );
  $all('[data-save]').forEach(b=> b.onclick = ()=> saveSignature(b.dataset.save) );
  $('#m-photo').onchange = uploadPhoto;
  $('#m-invoice').onchange = uploadInvoice;
  $('#m-pdf-maint').onclick = ()=> genPdf('MANTENIMIENTO');
  $('#m-pdf-bill').onclick = ()=> genPdf('FACTURACION');
}

async function saveOrder(){
  const payload = { title:$('#m-title').value, description:$('#m-desc').value, clientName:$('#m-client').value, clientPhone:$('#m-phone').value, propertyCode:$('#m-prop').value, priority:$('#m-prio').value };
  await fetchJSON(GATEWAY + '/api/orders/' + CURR.id, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
  await applyFilters(); await openOrder(CURR.id);
}

async function changeStatus(){
  const status = $('#m-status-next').value; if(!status) return;
  await fetchJSON(GATEWAY + '/api/orders/' + CURR.id, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status }) });
  await applyFilters(); await openOrder(CURR.id);
}

async function uploadTo(dataUrl, folder){
  const r = await fetchJSON((window.__CONFIG__.UPLOADS_URL||'') + '/upload', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ dataUrl, folder }) });
  return r.url;
}

async function uploadPhoto(e){
  const file = e.target.files[0]; if(!file) return;
  const dataUrl = await new Promise(ok=>{ const r=new FileReader(); r.onload=()=>ok(r.result); r.readAsDataURL(file); });
  const url = await uploadTo(dataUrl, 'bluehome/gestor/photos');
  const photos = (CURR.photos||[]).concat([url]);
  await fetchJSON(GATEWAY + '/api/orders/' + CURR.id, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ photos }) });
  await openOrder(CURR.id);
}

async function saveSignature(role){
  const pad = pads[role]; if(!pad || pad.isEmpty()) return;
  const dataUrl = pad.toDataURL('image/png');
  const url = await uploadTo(dataUrl, 'bluehome/gestor/signs');
  const patch = {}; patch[role+'SignatureUrl'] = url;
  await fetchJSON(GATEWAY + '/api/orders/' + CURR.id, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify(patch) });
}

async function uploadInvoice(e){
  const file = e.target.files[0]; if(!file) return;
  const dataUrl = await new Promise(ok=>{ const r=new FileReader(); r.onload=()=>ok(r.result); r.readAsDataURL(file); });
  const url = await uploadTo(dataUrl, 'bluehome/gestor/invoices');
  const discount = prompt('Descuento al propietario (porcentaje o valor). Deja vacío si no aplica:','') || '';
  await fetchJSON(GATEWAY + '/api/orders/' + CURR.id, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ invoiceUrl: url, ownerDiscount: discount }) });
}

async function genPdf(stage){
  const r = await fetchJSON((window.__CONFIG__.PDF_URL||'') + '/orders/' + CURR.id + '/pdf', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ stage }) });
  const blob = b64toBlob(r.base64, 'application/pdf'); const url = URL.createObjectURL(blob); window.open(url,'_blank');
}

function b64toBlob(b64, type){ const bin = atob(b64); const len=bin.length; const bytes=new Uint8Array(len); for(let i=0;i<len;i++) bytes[i]=bin.charCodeAt(i); return new Blob([bytes], {type}); }

window.addEventListener('load', load);
