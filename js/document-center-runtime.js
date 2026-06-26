/* v10.2.0 Enterprise Document Center
   Structured document library for FTI Collaboration Hub.
   Safe patch:
   - Does not change sidebar router.
   - Does not overwrite CMS data.
   - Does not require Reset Local CMS.
   - Reads CMS products/articles + IndexedDB assets when available.
*/
import { loadCms, esc } from './cms/cms-core.js';

const DOC_TYPES = {
  presentation: 'Presentation',
  datasheet: 'Datasheet',
  brochure: 'Brochure',
  caseStudy: 'Case Study',
  architecture: 'Architecture',
  hld: 'HLD',
  lld: 'LLD',
  sow: 'SOW',
  checklist: 'Checklist',
  poc: 'POC',
  acceptance: 'Acceptance',
  training: 'Training',
  releaseNote: 'Release Note',
  apiSpec: 'API Spec',
  demoScript: 'Demo Script',
  video: 'Video',
  other: 'Other'
};

const FALLBACK_DOCS = [
  {
    id:'doc-oncallcx-presentation',
    title:'OnCallCX Product Presentation',
    type:'presentation',
    product:'OnCallCX',
    category:'Product',
    sidebar:'#oncallcx-product-center',
    version:'v1.0',
    owner:'Presales Collaboration',
    status:'ready',
    tags:['OnCallCX','CCaaS','Presentation'],
    description:'Tài liệu trình chiếu giới thiệu OnCallCX cho khách hàng.',
    route:'#product-detail:oncallcx'
  },
  {
    id:'doc-oncallcx-datasheet',
    title:'OnCallCX Datasheet',
    type:'datasheet',
    product:'OnCallCX',
    category:'Product',
    sidebar:'#oncallcx-product-center',
    version:'v1.0',
    owner:'Presales Collaboration',
    status:'draft',
    tags:['OnCallCX','Datasheet'],
    description:'Tóm tắt tính năng, use case, deployment và integration của OnCallCX.',
    route:'#product-detail:oncallcx'
  },
  {
    id:'doc-oncallcx-api',
    title:'OnCallCX API Reference',
    type:'apiSpec',
    product:'OnCallCX',
    category:'API',
    sidebar:'#api-center',
    version:'v1.0',
    owner:'Solution Architect',
    status:'ready',
    tags:['API','Webhook','CDR'],
    description:'Tài liệu API/Webhook phục vụ tích hợp CRM/ERP và hệ thống nghiệp vụ.',
    route:'#api-center'
  },
  {
    id:'doc-oncallcx-demo-script',
    title:'OnCallCX Demo Script',
    type:'demoScript',
    product:'OnCallCX',
    category:'Demo',
    sidebar:'#video',
    version:'v1.0',
    owner:'Presales Collaboration',
    status:'ready',
    tags:['Demo','Script','Portal'],
    description:'Kịch bản demo: login portal, tạo extension, assign phone, register extension, thực hiện cuộc gọi.',
    route:'#video'
  },
  {
    id:'doc-ccaas-vn-playbook',
    title:'CCaaS Việt Nam Presales Playbook',
    type:'checklist',
    product:'CCaaS Việt Nam',
    category:'Presales',
    sidebar:'#ccaas-vn',
    version:'v1.0',
    owner:'Presales Collaboration',
    status:'ready',
    tags:['CCaaS','Presales','Checklist'],
    description:'Checklist tư vấn CCaaS Việt Nam, đối tác, use case và tiêu chí đánh giá.',
    route:'#ccaas-vn'
  },
  {
    id:'doc-compliance-checklist',
    title:'Compliance Checklist',
    type:'checklist',
    product:'Enterprise Contact Center',
    category:'Compliance',
    sidebar:'#compliance',
    version:'v1.0',
    owner:'PM / Security',
    status:'draft',
    tags:['Compliance','Security','Recording'],
    description:'Checklist tuân thủ: ghi âm, bảo mật, dữ liệu cá nhân, audit và phân quyền.',
    route:'#compliance'
  },
  {
    id:'doc-sow-template',
    title:'SOW Template — Contact Center Integration',
    type:'sow',
    product:'Contact Center Integration',
    category:'Delivery',
    sidebar:'#integration-playbook',
    version:'v1.0',
    owner:'PM / Presales',
    status:'planned',
    tags:['SOW','Integration','Delivery'],
    description:'Template SOW cho dự án tích hợp Contact Center với CRM/ERP, SIP trunk và API.',
    route:'#integration-playbook'
  }
];

function ensureStyle(){
  if(document.getElementById('documentCenterStyle')) return;
  const style = document.createElement('style');
  style.id = 'documentCenterStyle';
  style.textContent = `
  .doc-center-hero{display:flex;justify-content:space-between;gap:18px;align-items:flex-end;background:linear-gradient(135deg,rgba(249,115,22,.16),rgba(16,185,129,.10));border:1px solid rgba(249,115,22,.28);border-radius:28px;padding:30px;margin-bottom:18px}
  .doc-center-hero h2{font-size:36px;margin:10px 0}.doc-center-hero p{color:#c4d3ea;line-height:1.65;max-width:980px}.doc-center-actions{display:flex;gap:10px;flex-wrap:wrap}
  .doc-center-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:18px}.doc-stat{background:var(--card,#111c31);border:1px solid var(--line,#263754);border-radius:18px;padding:16px}.doc-stat b{display:block;font-size:26px}.doc-stat span{color:#c4d3ea}
  .doc-center-toolbar{display:grid;grid-template-columns:minmax(0,1fr) 190px 190px 190px;gap:10px;margin-bottom:18px}.doc-center-toolbar input,.doc-center-toolbar select{width:100%;border:1px solid var(--line,#263754);background:#050a18;color:#dbeafe;border-radius:12px;padding:11px 12px;outline:none}
  .doc-center-layout{display:grid;grid-template-columns:minmax(0,1fr) 380px;gap:18px;align-items:start}.doc-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
  .doc-card,.doc-side,.doc-map,.doc-upload-note{background:var(--card,#111c31);border:1px solid var(--line,#263754);border-radius:20px;padding:18px}.doc-card h3{margin:10px 0 8px}.doc-card p,.doc-side p,.doc-map p,.doc-upload-note p{color:#c4d3ea;line-height:1.6}
  .doc-card-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.doc-type{display:inline-flex;align-items:center;border-radius:999px;padding:5px 9px;font-weight:900;font-size:12px;background:rgba(249,115,22,.14);border:1px solid rgba(249,115,22,.28);color:#fdba74}.doc-status{border-radius:999px;padding:5px 9px;font-weight:900;font-size:12px}.doc-status.ready{color:#86efac;background:rgba(16,185,129,.14)}.doc-status.draft{color:#fcd34d;background:rgba(245,158,11,.14)}.doc-status.planned{color:#93c5fd;background:rgba(59,130,246,.14)}
  .doc-meta{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:12px 0}.doc-meta span{background:rgba(255,255,255,.04);border:1px solid var(--line,#263754);border-radius:10px;padding:8px;color:#c4d3ea;font-size:12px}.doc-tags{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0}.doc-tags span{background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.25);color:#93c5fd;border-radius:999px;padding:4px 8px;font-size:11px;font-weight:900}
  .doc-card-actions,.doc-side-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.doc-side{position:sticky;top:78px}.doc-side h2{margin-top:0}.doc-side code{display:block;background:#050a18;border:1px solid var(--line,#263754);border-radius:10px;padding:9px;color:#dbeafe;margin:8px 0}
  .doc-map-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}.doc-map-grid div{background:rgba(255,255,255,.04);border:1px solid var(--line,#263754);border-radius:14px;padding:12px}.doc-map-grid b{display:block;color:#fdba74}.doc-map-grid span{color:#c4d3ea;font-size:12px}
  .doc-upload-note{margin-top:18px}.doc-upload-note ul{color:#c4d3ea;line-height:1.8}
  @media(max-width:1200px){.doc-center-layout,.doc-grid{grid-template-columns:1fr}.doc-side{position:relative;top:0}.doc-map-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:760px){.doc-center-hero{flex-direction:column;align-items:flex-start}.doc-center-toolbar,.doc-center-stats,.doc-map-grid{grid-template-columns:1fr}.doc-center-hero h2{font-size:30px}}
  `;
  document.head.appendChild(style);
}

async function readIndexedDbAssets(){
  if(!('indexedDB' in window)) return [];
  return new Promise(resolve => {
    const req = indexedDB.open('fti_unified_asset_manager_v1');
    req.onerror = () => resolve([]);
    req.onupgradeneeded = () => resolve([]);
    req.onsuccess = () => {
      const db = req.result;
      if(!db.objectStoreNames.contains('assets')){ resolve([]); return; }
      const tx = db.transaction('assets','readonly');
      const store = tx.objectStore('assets');
      const getAll = store.getAll();
      getAll.onsuccess = () => resolve(getAll.result || []);
      getAll.onerror = () => resolve([]);
    };
  });
}

function assetToDoc(asset){
  return {
    id: asset.id,
    title: asset.title || asset.fileName || 'Asset',
    type: asset.type || 'other',
    product: asset.product || 'oncallcx',
    category: 'Asset',
    sidebar: '#cms',
    version: 'local',
    owner: 'Asset Manager',
    status: 'ready',
    tags: [asset.type || 'asset', asset.product || 'product'],
    description: asset.description || asset.fileName || '',
    route: '#cms',
    source: 'IndexedDB',
    fileName: asset.fileName,
    size: asset.size
  };
}

function normalizeDocs(cms, assets){
  const docs = [...FALLBACK_DOCS];

  const products = Array.isArray(cms.products) ? cms.products : [];
  products.forEach(product => {
    (product.apiLinks || []).forEach((api, idx) => {
      docs.push({
        id:`doc-api-${product.id}-${idx}`,
        title: api.name || api.path || 'API Document',
        type:'apiSpec',
        product: product.title || product.id || 'Product',
        category:'API',
        sidebar:'#api-center',
        version:'cms',
        owner:'Knowledge Graph',
        status:'ready',
        tags:['API', api.method || 'GET', product.title || product.id || 'Product'],
        description: api.description || '',
        route:'#api-center'
      });
    });
  });

  return [...docs, ...assets.map(assetToDoc)];
}

function typeLabel(type){ return DOC_TYPES[type] || type || 'Document'; }
function typeOptions(docs){
  const types = [...new Set(docs.map(d => d.type || 'other'))];
  return types.map(t => `<option value="${esc(t)}">${esc(typeLabel(t))}</option>`).join('');
}
function productOptions(docs){
  const products = [...new Set(docs.map(d => d.product || 'Unknown'))];
  return products.map(p => `<option value="${esc(p)}">${esc(p)}</option>`).join('');
}
function stat(label, value){
  return `<article class="doc-stat"><b>${esc(String(value))}</b><span>${esc(label)}</span></article>`;
}
function docCard(doc, index){
  return `<article class="doc-card">
    <div class="doc-card-head">
      <span class="doc-type">${esc(typeLabel(doc.type))}</span>
      <span class="doc-status ${esc(doc.status || 'planned')}">${esc(doc.status || 'planned')}</span>
    </div>
    <h3>${esc(doc.title || 'Document')}</h3>
    <p>${esc(doc.description || '')}</p>
    <div class="doc-meta">
      <span><b>Product</b><br>${esc(doc.product || 'N/A')}</span>
      <span><b>Version</b><br>${esc(doc.version || 'N/A')}</span>
      <span><b>Owner</b><br>${esc(doc.owner || 'N/A')}</span>
      <span><b>Category</b><br>${esc(doc.category || 'N/A')}</span>
    </div>
    <div class="doc-tags">${(doc.tags || []).map(t => `<span>${esc(t)}</span>`).join('')}</div>
    <div class="doc-card-actions">
      <button class="btn btn-soft" data-open-doc="${index}">Xem metadata</button>
      <a class="btn btn-soft" href="${esc(doc.route || '#cms')}">Mở liên kết</a>
    </div>
  </article>`;
}
function detail(doc){
  return `<section class="doc-side-detail">
    <h2>${esc(doc.title || 'Document')}</h2>
    <p>${esc(doc.description || '')}</p>
    <code>ID: ${esc(doc.id || '')}</code>
    <code>Type: ${esc(typeLabel(doc.type))}</code>
    <code>Product: ${esc(doc.product || '')}</code>
    <code>Sidebar: ${esc(doc.sidebar || '')}</code>
    <code>Version: ${esc(doc.version || '')}</code>
    <code>Owner: ${esc(doc.owner || '')}</code>
    ${doc.fileName ? `<code>File: ${esc(doc.fileName)}</code>` : ''}
    <div class="doc-side-actions">
      <a class="btn btn-primary" href="${esc(doc.route || '#cms')}">Mở liên kết</a>
      <a class="btn btn-soft" href="#cms">Quản trị CMS</a>
    </div>
  </section>`;
}

let currentDocs = [];

function renderDocumentCenter(docs){
  const typeCount = new Set(docs.map(d=>d.type)).size;
  const productCount = new Set(docs.map(d=>d.product)).size;
  const readyCount = docs.filter(d=>d.status === 'ready').length;
  return `<section class="doc-center-hero">
    <div>
      <span class="eyebrow">📄 Enterprise Document Center v10.2</span>
      <h2>Document Center</h2>
      <p>Quản lý tài liệu theo Product, Type, Category, Sidebar, Tag, Version và Owner. Một tài liệu upload một lần có thể xuất hiện ở nhiều khu vực.</p>
    </div>
    <div class="doc-center-actions">
      <a class="btn btn-primary" href="#cms">Upload / Quản trị Assets</a>
      <a class="btn btn-soft" href="#enterprise-cms">Enterprise CMS</a>
    </div>
  </section>

  <section class="doc-center-stats">
    ${stat('Documents', docs.length)}
    ${stat('Products', productCount)}
    ${stat('Document types', typeCount)}
    ${stat('Ready', readyCount)}
  </section>

  <section class="doc-map">
    <h3>Document Taxonomy</h3>
    <p>Một document không nằm ở một chỗ cố định. Nó được gắn metadata để tự xuất hiện đúng khu vực.</p>
    <div class="doc-map-grid">
      <div><b>Product</b><span>OnCallCX / CCaaS / UCaaS</span></div>
      <div><b>Type</b><span>Presentation / HLD / SOW / API</span></div>
      <div><b>Category</b><span>Product / Demo / Compliance</span></div>
      <div><b>Sidebar</b><span>#crm / #api-center / #video</span></div>
      <div><b>Search Index</b><span>Tags / Summary / Owner</span></div>
    </div>
  </section>

  <section class="doc-center-toolbar">
    <input id="docSearch" placeholder="Tìm document, product, tag, owner...">
    <select id="docTypeFilter"><option value="all">All types</option>${typeOptions(docs)}</select>
    <select id="docProductFilter"><option value="all">All products</option>${productOptions(docs)}</select>
    <select id="docStatusFilter"><option value="all">All status</option><option value="ready">Ready</option><option value="draft">Draft</option><option value="planned">Planned</option></select>
  </section>

  <section class="doc-center-layout">
    <main><div id="docList" class="doc-grid">${docs.map(docCard).join('')}</div></main>
    <aside id="docDetail" class="doc-side"><div class="cms-empty-state">Chọn một document để xem metadata.</div></aside>
  </section>

  <section class="doc-upload-note">
    <h3>Quy trình vận hành đề xuất</h3>
    <ul>
      <li>Upload file trong <b>Asset Manager</b>.</li>
      <li>Gắn Product / Type / Description / Tag.</li>
      <li>Document Center sẽ tự gom theo metadata.</li>
      <li>Version sau sẽ bổ sung version history, preview và download center.</li>
    </ul>
  </section>`;
}

function bindDocs(){
  const list = document.querySelector('#docList');
  if(!list) return;

  const filter = () => {
    const q = (document.querySelector('#docSearch')?.value || '').toLowerCase();
    const type = document.querySelector('#docTypeFilter')?.value || 'all';
    const product = document.querySelector('#docProductFilter')?.value || 'all';
    const status = document.querySelector('#docStatusFilter')?.value || 'all';

    const visible = currentDocs
      .map((doc, originalIndex) => ({doc, originalIndex}))
      .filter(x => type === 'all' || x.doc.type === type)
      .filter(x => product === 'all' || x.doc.product === product)
      .filter(x => status === 'all' || x.doc.status === status)
      .filter(x => !q || [x.doc.title,x.doc.description,x.doc.product,x.doc.category,x.doc.owner,(x.doc.tags||[]).join(' ')].join(' ').toLowerCase().includes(q));

    list.innerHTML = visible.map(x => docCard(x.doc, x.originalIndex)).join('') || `<div class="cms-empty-state">Không tìm thấy document phù hợp.</div>`;
    bindCards();
  };

  const bindCards = () => {
    document.querySelectorAll('[data-open-doc]').forEach(btn => {
      btn.onclick = () => {
        const doc = currentDocs[Number(btn.dataset.openDoc)];
        const root = document.querySelector('#docDetail');
        if(root && doc) root.innerHTML = detail(doc);
      };
    });
  };

  document.querySelector('#docSearch')?.addEventListener('input', filter);
  document.querySelector('#docTypeFilter')?.addEventListener('change', filter);
  document.querySelector('#docProductFilter')?.addEventListener('change', filter);
  document.querySelector('#docStatusFilter')?.addEventListener('change', filter);
  bindCards();
}

async function openDocumentCenter(){
  if(location.hash !== '#document-center') return;
  ensureStyle();

  const root = document.querySelector('#pageRoot');
  if(!root) return;

  const cms = await loadCms().catch(() => ({}));
  const assets = await readIndexedDbAssets();
  currentDocs = normalizeDocs(cms, assets);

  const title = document.querySelector('#pageTitle');
  const subtitle = document.querySelector('#pageSubtitle');
  if(title) title.textContent = 'Document Center';
  if(subtitle) subtitle.textContent = 'Enterprise document library';

  root.innerHTML = renderDocumentCenter(currentDocs);
  bindDocs();
}

function patchEnterpriseCard(){
  if(location.hash !== '#enterprise-cms') return;
  setTimeout(() => {
    document.querySelectorAll('.ecms-module-card').forEach(card => {
      const title = card.querySelector('h3')?.textContent || '';
      if(title === 'Download Center' || title === 'Assets'){
        const a = card.querySelector('a');
        if(a) a.href = '#document-center';
      }
    });
  }, 900);
}

window.addEventListener('hashchange', () => {
  setTimeout(openDocumentCenter, 80);
  patchEnterpriseCard();
});
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(openDocumentCenter, 150);
  patchEnterpriseCard();
});
