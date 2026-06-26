/* v10.1.0 API Center Runtime
   Structured API Center for FTI Collaboration Hub.
   Safe patch:
   - Does not change sidebar router.
   - Does not overwrite CMS data.
   - Reads product.apiLinks from CMS data/LocalStorage.
*/
import { loadCms, esc } from './cms/cms-core.js';

const FALLBACK_APIS = [
  {
    productId: 'oncallcx',
    productTitle: 'OnCallCX',
    name: 'CDR API',
    method: 'GET',
    path: '/api/cdr/list',
    auth: 'Bearer Token',
    description: 'Truy vấn lịch sử cuộc gọi, trạng thái, thời lượng, agent, số gọi/số nhận và metadata.',
    request: '{ "fromDate": "2026-01-01", "toDate": "2026-01-31", "agentId": "1001" }',
    response: '{ "items": [{ "callId": "abc", "duration": 120, "status": "answered" }] }',
    notes: ['Dùng cho báo cáo', 'Có thể tích hợp CRM/ERP', 'Cần phân quyền API key']
  },
  {
    productId: 'oncallcx',
    productTitle: 'OnCallCX',
    name: 'Outbound Call API',
    method: 'POST',
    path: '/api/call/outbound',
    auth: 'Bearer Token',
    description: 'Khởi tạo cuộc gọi outbound từ CRM hoặc hệ thống nghiệp vụ.',
    request: '{ "agent": "1001", "phoneNumber": "090xxxxxxx", "customerId": "C001" }',
    response: '{ "callId": "abc", "status": "ringing" }',
    notes: ['Dùng cho click-to-call', 'Cần kiểm soát rate limit', 'Log request để audit']
  },
  {
    productId: 'oncallcx',
    productTitle: 'OnCallCX',
    name: 'Webhook Incoming',
    method: 'POST',
    path: '/webhook/incoming',
    auth: 'Signature',
    description: 'Nhận sự kiện cuộc gọi realtime để tích hợp CRM/ERP, ticket hoặc workflow.',
    request: '{ "event": "call.answered", "callId": "abc", "agent": "1001" }',
    response: '{ "success": true }',
    notes: ['Realtime event', 'Nên verify signature', 'Retry khi endpoint lỗi']
  },
  {
    productId: 'oncallcx',
    productTitle: 'OnCallCX',
    name: 'Recording API',
    method: 'GET',
    path: '/api/recording/{id}',
    auth: 'Bearer Token',
    description: 'Truy xuất thông tin ghi âm phục vụ QA/QC và tra soát.',
    request: '{ "recordingId": "rec_001" }',
    response: '{ "url": "https://...", "expiredAt": "2026-01-31T00:00:00Z" }',
    notes: ['URL nên có thời hạn', 'Kiểm soát phân quyền nghe ghi âm', 'Không expose public link']
  }
];

function methodClass(method){
  return String(method || 'GET').toLowerCase();
}

function normalizeApis(data){
  const products = Array.isArray(data.products) ? data.products : [];
  const apis = [];

  products.forEach(product => {
    const links = Array.isArray(product.apiLinks) ? product.apiLinks : [];
    links.forEach(api => {
      apis.push({
        productId: product.id || 'unknown',
        productTitle: product.title || product.id || 'Product',
        name: api.name || api.path || 'API',
        method: api.method || 'GET',
        path: api.path || '',
        auth: api.auth || 'Bearer Token',
        description: api.description || '',
        request: api.request || api.requestExample || '',
        response: api.response || api.responseExample || '',
        notes: Array.isArray(api.notes) ? api.notes : []
      });
    });
  });

  return apis.length ? apis : FALLBACK_APIS;
}

function apiCard(api, index){
  const notes = (api.notes || []).map(n => `<li>${esc(n)}</li>`).join('');
  return `<article class="api-center-card" data-api-index="${index}">
    <div class="api-center-head">
      <span class="api-method ${methodClass(api.method)}">${esc(api.method || 'GET')}</span>
      <code>${esc(api.path || '')}</code>
      <small>${esc(api.productTitle || '')}</small>
    </div>
    <h3>${esc(api.name || 'API')}</h3>
    <p>${esc(api.description || '')}</p>
    <div class="api-center-actions">
      <button class="btn btn-soft" data-open-api="${index}">Xem chi tiết</button>
      <button class="btn btn-soft" data-copy-api="${index}">Copy endpoint</button>
    </div>
    ${notes ? `<ul>${notes}</ul>` : ''}
  </article>`;
}

function apiDetail(api){
  return `<section class="api-detail">
    <div class="api-detail-head">
      <div>
        <span class="api-method ${methodClass(api.method)}">${esc(api.method || 'GET')}</span>
        <h2>${esc(api.name || 'API')}</h2>
        <code>${esc(api.path || '')}</code>
      </div>
      <small>${esc(api.productTitle || '')} · Auth: ${esc(api.auth || 'N/A')}</small>
    </div>

    <p>${esc(api.description || '')}</p>

    <div class="api-code-grid">
      <article>
        <h3>Request</h3>
        <pre><code>${esc(api.request || 'No request example')}</code></pre>
      </article>
      <article>
        <h3>Response</h3>
        <pre><code>${esc(api.response || 'No response example')}</code></pre>
      </article>
    </div>

    <div class="api-detail-actions">
      <button class="btn btn-primary" id="copyCurrentEndpoint">Copy endpoint</button>
      <a class="btn btn-soft" href="#cms">Quản trị API trong CMS</a>
    </div>
  </section>`;
}

function renderApiCenter(data){
  const apis = normalizeApis(data);
  const products = [...new Set(apis.map(a => a.productTitle || 'Product'))];

  return `<section class="api-center-hero">
    <div>
      <span class="eyebrow">📚 API Center v10.1</span>
      <h2>Structured API Reference</h2>
      <p>Trung tâm quản lý API theo product: method, endpoint, auth, request, response, notes và hướng tích hợp Presales.</p>
    </div>
    <a class="btn btn-primary" href="#cms">Quản trị trong CMS</a>
  </section>

  <section class="api-center-toolbar">
    <input id="apiSearch" placeholder="Tìm API, endpoint, product...">
    <select id="apiProductFilter">
      <option value="all">All products</option>
      ${products.map(p => `<option value="${esc(p)}">${esc(p)}</option>`).join('')}
    </select>
    <select id="apiMethodFilter">
      <option value="all">All methods</option>
      <option value="GET">GET</option>
      <option value="POST">POST</option>
      <option value="PUT">PUT</option>
      <option value="PATCH">PATCH</option>
      <option value="DELETE">DELETE</option>
    </select>
  </section>

  <section class="api-center-layout">
    <main>
      <div id="apiCenterList" class="api-center-grid">
        ${apis.map(apiCard).join('')}
      </div>
    </main>
    <aside id="apiCenterDetail" class="api-center-side">
      <div class="cms-empty-state">Chọn một API để xem request/response.</div>
    </aside>
  </section>`;
}

let currentApis = [];

function bindApiCenter(){
  const list = document.querySelector('#apiCenterList');
  if(!list) return;

  const filter = () => {
    const q = (document.querySelector('#apiSearch')?.value || '').toLowerCase();
    const product = document.querySelector('#apiProductFilter')?.value || 'all';
    const method = document.querySelector('#apiMethodFilter')?.value || 'all';

    const visible = currentApis
      .map((api, originalIndex) => ({api, originalIndex}))
      .filter(x => product === 'all' || x.api.productTitle === product)
      .filter(x => method === 'all' || String(x.api.method).toUpperCase() === method)
      .filter(x => !q || [x.api.name,x.api.path,x.api.productTitle,x.api.description].join(' ').toLowerCase().includes(q));

    list.innerHTML = visible.map(x => apiCard(x.api, x.originalIndex)).join('') || `<div class="cms-empty-state">Không tìm thấy API phù hợp.</div>`;
    bindCards();
  };

  const bindCards = () => {
    document.querySelectorAll('[data-open-api]').forEach(btn => {
      btn.onclick = () => {
        const api = currentApis[Number(btn.dataset.openApi)];
        const detail = document.querySelector('#apiCenterDetail');
        if(!api || !detail) return;
        detail.innerHTML = apiDetail(api);
        document.querySelector('#copyCurrentEndpoint')?.addEventListener('click', () => {
          navigator.clipboard?.writeText(`${api.method || 'GET'} ${api.path || ''}`);
        });
      };
    });

    document.querySelectorAll('[data-copy-api]').forEach(btn => {
      btn.onclick = () => {
        const api = currentApis[Number(btn.dataset.copyApi)];
        if(api) navigator.clipboard?.writeText(`${api.method || 'GET'} ${api.path || ''}`);
      };
    });
  };

  document.querySelector('#apiSearch')?.addEventListener('input', filter);
  document.querySelector('#apiProductFilter')?.addEventListener('change', filter);
  document.querySelector('#apiMethodFilter')?.addEventListener('change', filter);
  bindCards();
}


function ensureApiStyle(){
  if(document.getElementById('apiCenterStyle')) return;
  const style = document.createElement('style');
  style.id = 'apiCenterStyle';
  style.textContent = `
  .api-center-hero{display:flex;justify-content:space-between;gap:18px;align-items:flex-end;background:linear-gradient(135deg,rgba(249,115,22,.16),rgba(59,130,246,.10));border:1px solid rgba(249,115,22,.28);border-radius:28px;padding:30px;margin-bottom:18px}
  .api-center-hero h2{font-size:36px;margin:10px 0}.api-center-hero p{color:#c4d3ea;line-height:1.65;max-width:900px}
  .api-center-toolbar{display:grid;grid-template-columns:minmax(0,1fr) 220px 180px;gap:10px;margin-bottom:18px}
  .api-center-toolbar input,.api-center-toolbar select{width:100%;border:1px solid var(--line,#263754);background:#050a18;color:#dbeafe;border-radius:12px;padding:11px 12px;outline:none}
  .api-center-layout{display:grid;grid-template-columns:minmax(0,1fr) 420px;gap:18px;align-items:start}
  .api-center-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
  .api-center-card,.api-center-side,.api-detail{background:var(--card,#111c31);border:1px solid var(--line,#263754);border-radius:20px;padding:18px}
  .api-center-card h3{margin:12px 0 8px}.api-center-card p,.api-detail p{color:#c4d3ea;line-height:1.6}.api-center-card ul{color:#93a4bd}
  .api-center-head{display:grid;grid-template-columns:auto minmax(0,1fr);gap:8px;align-items:center}.api-center-head small{grid-column:1 / -1;color:#93c5fd}
  .api-method{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:5px 9px;font-weight:900;font-size:12px;color:#fff}.api-method.get{background:#16a34a}.api-method.post{background:#2563eb}.api-method.put,.api-method.patch{background:#f59e0b}.api-method.delete{background:#dc2626}
  .api-center-head code,.api-detail code{background:#050a18;border:1px solid var(--line,#263754);border-radius:8px;padding:6px 8px;color:#dbeafe}
  .api-center-actions,.api-detail-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.api-center-side{position:sticky;top:78px}
  .api-detail-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;border-bottom:1px solid var(--line,#263754);padding-bottom:14px;margin-bottom:14px}.api-detail-head h2{margin:10px 0}.api-detail-head small{color:#93a4bd}
  .api-code-grid{display:grid;grid-template-columns:1fr;gap:12px}.api-code-grid article{background:rgba(255,255,255,.04);border:1px solid var(--line,#263754);border-radius:16px;padding:14px}.api-code-grid pre{overflow:auto;background:#020817;border-radius:12px;padding:12px;color:#dbeafe}
  @media(max-width:1200px){.api-center-layout,.api-center-grid{grid-template-columns:1fr}.api-center-side{position:relative;top:0}}@media(max-width:760px){.api-center-hero{flex-direction:column;align-items:flex-start}.api-center-toolbar{grid-template-columns:1fr}.api-center-hero h2{font-size:30px}}
  `;
  document.head.appendChild(style);
}

async function openApiCenter(){
  ensureApiStyle();
  const hash = location.hash || '';
  if(hash !== '#api-center') return;

  const root = document.querySelector('#pageRoot');
  if(!root) return;

  try{
    const data = await loadCms().catch(() => ({}));
    currentApis = normalizeApis(data);

    const title = document.querySelector('#pageTitle');
    const subtitle = document.querySelector('#pageSubtitle');
    if(title) title.textContent = 'API Center';
    if(subtitle) subtitle.textContent = 'Structured API Reference';

    root.innerHTML = renderApiCenter(data);
    bindApiCenter();
  }catch(err){
    console.warn('[v10.1] Cannot render API Center', err);
  }
}

function injectEnterpriseLink(){
  if(location.hash !== '#enterprise-cms') return;
  setTimeout(() => {
    document.querySelectorAll('.ecms-module-card').forEach(card => {
      const title = card.querySelector('h3')?.textContent || '';
      if(title === 'API Center'){
        const a = card.querySelector('a');
        if(a) a.href = '#api-center';
      }
    });
  }, 800);
}

window.addEventListener('hashchange', () => {
  setTimeout(openApiCenter, 80);
  injectEnterpriseLink();
});
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(openApiCenter, 150);
  injectEnterpriseLink();
});
