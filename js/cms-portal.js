/* v9.2.0 CMS Data Foundation
   This module is intentionally independent from js/main.js.
   It adds a CMS page at #cms and stores browser edits in LocalStorage.
*/
const CMS_URL = 'data/cms-content.json';
const CMS_KEY = 'fti_collaboration_hub_cms_v920';

const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

async function loadCms(){
  const local = localStorage.getItem(CMS_KEY);
  if(local){
    try { return JSON.parse(local); } catch(e) { console.warn('Invalid local CMS', e); }
  }
  const res = await fetch(CMS_URL, {cache:'no-store'});
  if(!res.ok) throw new Error('Cannot load CMS content');
  return await res.json();
}
function saveCms(data){ localStorage.setItem(CMS_KEY, JSON.stringify(data, null, 2)); }
function resetCms(){ localStorage.removeItem(CMS_KEY); }
function downloadJson(data){
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cms-content-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
function toast(msg){
  const root = $('#toastRoot') || document.body;
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  root.appendChild(el);
  setTimeout(()=>el.remove(), 3000);
}
function productCards(data){
  return (data.products||[]).map(p=>`<article class="cms-card">
    <div class="cms-card-head">
      <div class="cms-icon">☎️</div>
      <div><h3>${p.title}</h3><small>${p.subtitle||p.category||''}</small></div>
    </div>
    <p>${p.summary||''}</p>
    <div class="cms-tags">${(p.tags||[]).map(t=>`<span>${t}</span>`).join('')}</div>
    <div class="cms-grid">${(p.highlights||[]).map(x=>`<span>✓ ${x}</span>`).join('')}</div>
  </article>`).join('');
}
function faqList(data){
  return (data.faqs||[]).map((f,i)=>`<details ${i===0?'open':''}><summary>${f.question}</summary><p>${f.answer}</p></details>`).join('');
}
function pricingCards(data){
  return (data.pricingPlans||[]).map(p=>`<div class="cms-price ${p.featured?'featured':''}">
    <h3>${p.name}</h3><p>${p.summary}</p><ul>${(p.features||[]).map(x=>`<li>${x}</li>`).join('')}</ul>
  </div>`).join('');
}
function checklist(data){
  return (data.presalesChecklist||[]).map(x=>`<label><input type="checkbox"> ${x}</label>`).join('');
}
function renderCms(data){
  const root = $('#pageRoot');
  if(!root) return;

  $('#pageTitle').textContent = 'CMS Data';
  $('#pageSubtitle').textContent = 'Quản lý nội dung JSON cho Product Portal';

  root.innerHTML = `<section class="cms-hero">
    <div>
      <span class="eyebrow">🧩 CMS Data v9.2.0</span>
      <h2>CMS dữ liệu Portal</h2>
      <p>Quản lý nội dung bằng JSON để giảm sửa trực tiếp trong JavaScript. Hoạt động 100% frontend và tương thích GitHub Pages.</p>
    </div>
    <div class="cms-actions">
      <button class="btn btn-primary" id="cmsSave">Lưu Local</button>
      <button class="btn btn-soft" id="cmsExport">Export JSON</button>
      <button class="btn btn-danger" id="cmsReset">Reset</button>
    </div>
  </section>

  <section class="cms-tabs">
    <button class="active" data-cms-tab="preview">Preview</button>
    <button data-cms-tab="editor">JSON Editor</button>
    <button data-cms-tab="guide">Hướng dẫn</button>
  </section>

  <section class="cms-panel active" id="cms-preview">
    <div class="cms-summary">
      <span><b>${data.products?.length||0}</b><small>Products</small></span>
      <span><b>${data.faqs?.length||0}</b><small>FAQ</small></span>
      <span><b>${data.pricingPlans?.length||0}</b><small>Pricing</small></span>
      <span><b>${data.presalesChecklist?.length||0}</b><small>Checklist</small></span>
    </div>
    <h3>Sản phẩm</h3>
    <div class="cms-card-grid">${productCards(data)}</div>
    <h3>Pricing</h3>
    <div class="cms-price-grid">${pricingCards(data)}</div>
    <h3>FAQ</h3>
    <div class="cms-faq">${faqList(data)}</div>
    <h3>Presales Checklist</h3>
    <div class="cms-checklist">${checklist(data)}</div>
  </section>

  <section class="cms-panel" id="cms-editor">
    <div class="cms-editor-layout">
      <aside class="cms-info">
        <h3>Thông tin</h3>
        <p><b>Version:</b> ${data.meta?.version||'N/A'}</p>
        <p><b>Updated:</b> ${data.meta?.updatedAt||'N/A'}</p>
        <small>Sau khi chỉnh JSON: bấm <b>Lưu Local</b> để test trên trình duyệt. Khi muốn đưa lên GitHub: bấm <b>Export JSON</b> rồi thay file <code>data/cms-content.json</code>.</small>
      </aside>
      <main class="cms-json-wrap">
        <textarea id="cmsJson">${JSON.stringify(data,null,2)}</textarea>
      </main>
    </div>
  </section>

  <section class="cms-panel" id="cms-guide">
    <div class="cms-guide">
      <h3>Quy trình cập nhật CMS</h3>
      <ol>
        <li>Vào <code>#cms</code>.</li>
        <li>Sửa nội dung trong tab <b>JSON Editor</b>.</li>
        <li>Bấm <b>Lưu Local</b> để xem thử.</li>
        <li>Bấm <b>Export JSON</b>.</li>
        <li>Thay file <code>data/cms-content.json</code> trong project.</li>
        <li>Commit và push lên GitHub.</li>
      </ol>
      <pre>git checkout develop
git add data/cms-content.json
git commit -m "Update CMS content"
git push origin develop</pre>
    </div>
  </section>`;

  bindCms(data);
}
function bindCms(data){
  $$('[data-cms-tab]').forEach(btn=>{
    btn.onclick=()=>{
      $$('[data-cms-tab]').forEach(x=>x.classList.remove('active'));
      btn.classList.add('active');
      $$('.cms-panel').forEach(x=>x.classList.remove('active'));
      $(`#cms-${btn.dataset.cmsTab}`).classList.add('active');
    };
  });
  $('#cmsSave').onclick=()=>{
    const editor = $('#cmsJson');
    try{
      const next = editor ? JSON.parse(editor.value) : data;
      saveCms(next);
      toast('Đã lưu CMS vào LocalStorage.');
      renderCms(next);
    }catch(e){ toast('JSON không hợp lệ.'); }
  };
  $('#cmsExport').onclick=()=>{
    const editor = $('#cmsJson');
    try{ downloadJson(editor ? JSON.parse(editor.value) : data); }
    catch(e){ toast('JSON không hợp lệ.'); }
  };
  $('#cmsReset').onclick=()=>{
    if(!confirm('Reset dữ liệu CMS local và quay về file data/cms-content.json?')) return;
    resetCms();
    location.reload();
  };
}
async function openCms(){
  try{
    const data = await loadCms();
    renderCms(data);
  }catch(e){
    console.error(e);
    toast('Không tải được CMS data.');
  }
}
function ensureCmsMenu(){
  if(document.querySelector('[data-go-cms]')) return;
  const nav = document.querySelector('.sidebar-nav') || document.querySelector('nav');
  if(!nav) return;
  const a = document.createElement('a');
  a.href = '#cms';
  a.className = 'nav-item';
  a.dataset.goCms = 'true';
  a.innerHTML = '<b>🧩 CMS Data</b><em>New</em>';
  nav.appendChild(a);
}
window.addEventListener('hashchange', ()=>{
  if(location.hash === '#cms') openCms();
});
window.addEventListener('DOMContentLoaded', ()=>{
  ensureCmsMenu();
  if(location.hash === '#cms') setTimeout(openCms, 80);
});
