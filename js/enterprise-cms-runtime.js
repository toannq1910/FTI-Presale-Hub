/* v10.8.2 Enterprise CMS Runtime
   Keeps the standalone #enterprise-cms dashboard only.
   It no longer injects an extra tab into #cms, so CMS Data remains the single editor surface.
*/
import { loadCms, esc } from './cms/cms-core.js';

function arr(data, key){ return Array.isArray(data?.[key]) ? data[key] : []; }
function countApis(data){ return arr(data,'products').reduce((s,p)=>s+(Array.isArray(p.apiLinks)?p.apiLinks.length:0),0); }
function countIntegrations(data){ return arr(data,'products').reduce((s,p)=>s+(Array.isArray(p.integrations)?p.integrations.length:0),0); }
function countKnowledge(data){ return arr(data,'products').reduce((s,p)=>s+(Array.isArray(p.knowledgeSections)?p.knowledgeSections.length:0),0); }

const modules = [
  ['📦','Products','Quản lý sản phẩm, vendor, category, feature, use case và product detail.','Product Manager','#cms','ready'],
  ['📝','Articles','Quản lý bài viết/card nội dung cho sidebar và customer-facing pages.','CMS Articles','#cms','ready'],
  ['📚','API Center','Quản lý API theo product: method, endpoint, description, API notes và API Spec asset.','Knowledge Graph','#cms','ready'],
  ['📂','Assets','Quản lý PDF, PPT, video, image, datasheet, case study và tài liệu gắn theo product.','Asset Manager','#cms','ready'],
  ['🎬','Demo Library','Chuẩn hóa demo flow, video demo, prompt, scenario và màn hình mô phỏng.','Asset Manager / Articles','#video','partial'],
  ['⬇️','Download Center','Tập trung presentation, datasheet, brochure, checklist, SOW template.','Assets','#cms','planned'],
  ['🔌','Integrations','Quản lý CRM/ERP, PBX/SBC/SIP, AI, API/Webhook và hệ thống liên quan.','Knowledge Graph','#integration-playbook','ready'],
  ['💬','Case Study','Quản lý use case, industry story, customer scenario và reference architecture.','Articles / Assets','#cms','planned'],
  ['🛡️','Compliance','Quản lý tuân thủ, bảo mật, dữ liệu cá nhân, recording và audit.','Articles / Knowledge Graph','#compliance','partial'],
  ['🏷️','Version Control','Theo dõi version, release note, backup và lịch sử thay đổi.','Backup / Restore','#cms','ready'],
  ['🚀','Publish Workflow','Local edit → Export JSON → Git commit → GitHub Pages deployment.','Operational Guide','#cms','ready'],
  ['🔎','Search Index','Chuẩn bị tìm kiếm toàn cục trên product, article, API, demo và asset.','Enterprise CMS','#cms','planned']
];

function ensureStyle(){
  if(document.getElementById('enterpriseCmsStyle')) return;
  const style = document.createElement('style');
  style.id = 'enterpriseCmsStyle';
  style.textContent = `
  .ecms-hero{display:flex;justify-content:space-between;gap:20px;align-items:flex-end;background:linear-gradient(135deg,rgba(249,115,22,.18),rgba(14,165,233,.10),rgba(16,185,129,.08));border:1px solid rgba(249,115,22,.30);border-radius:28px;padding:32px;margin-bottom:18px}
  .ecms-hero h2{font-size:38px;line-height:1.08;margin:10px 0 12px}.ecms-hero p{color:#c4d3ea;line-height:1.65;max-width:980px}.ecms-hero-actions{display:flex;gap:10px;flex-wrap:wrap}
  .ecms-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-bottom:18px}.ecms-metric{display:flex;gap:14px;align-items:center;background:var(--card,#111c31);border:1px solid var(--line,#263754);border-radius:20px;padding:18px}.ecms-metric-icon{width:52px;height:52px;display:grid;place-items:center;border-radius:18px;background:rgba(249,115,22,.14);font-size:25px}.ecms-metric b{display:block;font-size:28px;line-height:1}.ecms-metric span{display:block;color:#e2e8f0;font-weight:900;margin-top:4px}.ecms-metric small{color:#93a4bd}
  .ecms-panel{background:var(--card,#111c31);border:1px solid var(--line,#263754);border-radius:22px;padding:22px;margin-bottom:18px}.ecms-panel-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-end;border-bottom:1px solid var(--line,#263754);padding-bottom:14px;margin-bottom:18px}.ecms-panel-head h3{margin:0;font-size:22px}.ecms-panel-head span{color:#93a4bd}
  .ecms-module-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.ecms-module-card{background:rgba(255,255,255,.04);border:1px solid var(--line,#263754);border-radius:18px;padding:16px}.ecms-module-head{display:grid;grid-template-columns:48px minmax(0,1fr) auto;gap:12px;align-items:center}.ecms-module-icon{width:48px;height:48px;display:grid;place-items:center;border-radius:16px;background:rgba(59,130,246,.14);font-size:23px}.ecms-module-card h3{margin:0}.ecms-module-card span{color:#93c5fd;font-size:12px}.ecms-module-card p{color:#c4d3ea;line-height:1.55;min-height:72px}
  .ecms-status{border-radius:999px;padding:5px 8px;font-size:11px;font-weight:900}.ecms-status.ready{color:#86efac;background:rgba(16,185,129,.14);border:1px solid rgba(16,185,129,.32)}.ecms-status.partial{color:#fcd34d;background:rgba(245,158,11,.14);border:1px solid rgba(245,158,11,.32)}.ecms-status.planned{color:#93c5fd;background:rgba(59,130,246,.14);border:1px solid rgba(59,130,246,.32)}
  .ecms-table-wrap{overflow:auto}.ecms-table{width:100%;border-collapse:collapse}.ecms-table th,.ecms-table td{border-bottom:1px solid var(--line,#263754);padding:12px;text-align:left;color:#c4d3ea}.ecms-table th{color:#e2e8f0;background:rgba(255,255,255,.04)}.ecms-health{border-radius:999px;padding:5px 9px;font-weight:900;font-size:12px}.ecms-health.good{color:#86efac;background:rgba(16,185,129,.14)}.ecms-health.partial{color:#fcd34d;background:rgba(245,158,11,.14)}.ecms-health.local{color:#93c5fd;background:rgba(59,130,246,.14)}
  .ecms-flow,.ecms-roadmap{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.ecms-flow div,.ecms-roadmap article{background:rgba(255,255,255,.04);border:1px solid var(--line,#263754);border-radius:18px;padding:16px}.ecms-flow b{width:34px;height:34px;display:grid;place-items:center;border-radius:999px;background:linear-gradient(135deg,#f97316,#ef4444);margin-bottom:10px}.ecms-flow span{display:block;font-weight:900}.ecms-flow small{display:block;color:#93a4bd;margin-top:5px;line-height:1.45}.ecms-roadmap b{color:#fdba74}.ecms-roadmap h4{margin:8px 0}.ecms-roadmap p{color:#c4d3ea;line-height:1.55}
  @media(max-width:1200px){.ecms-module-grid,.ecms-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.ecms-flow,.ecms-roadmap{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:760px){.ecms-hero,.ecms-panel-head{flex-direction:column;align-items:flex-start}.ecms-module-grid,.ecms-metrics,.ecms-flow,.ecms-roadmap{grid-template-columns:1fr}.ecms-hero h2{font-size:30px}}
  `;
  document.head.appendChild(style);
}

function metric(icon,label,value,note){
  return `<article class="ecms-metric"><div class="ecms-metric-icon">${icon}</div><div><b>${esc(String(value))}</b><span>${esc(label)}</span><small>${esc(note)}</small></div></article>`;
}
function badge(status){
  const label = {ready:'Ready',partial:'Partial',planned:'Planned'}[status] || 'Planned';
  return `<span class="ecms-status ${esc(status)}">${esc(label)}</span>`;
}
function moduleCard(m){
  const [icon,title,desc,owner,route,status] = m;
  return `<article class="ecms-module-card"><div class="ecms-module-head"><div class="ecms-module-icon">${icon}</div><div><h3>${esc(title)}</h3><span>${esc(owner)}</span></div>${badge(status)}</div><p>${esc(desc)}</p><a class="btn btn-soft" href="${esc(route)}">Mở khu vực</a></article>`;
}
function healthRows(data){
  const products = arr(data,'products'), articles = arr(data,'articles');
  const pm = products.filter(p => !p.summary || !p.highlights?.length).length;
  const am = articles.filter(a => !a.cards?.length).length;
  const apim = products.filter(p => !p.apiLinks?.length).length;
  const rows = [
    ['Products', pm ? 'Partial':'Good', pm ? `${pm} product thiếu summary/highlights.`:'Product data đã có summary/highlights.'],
    ['Articles', am ? 'Partial':'Good', am ? `${am} article chưa có cards.`:'Article/card content đã sẵn sàng.'],
    ['API Center', apim ? 'Partial':'Good', apim ? `${apim} product chưa có apiLinks.`:'API links đã gắn trong Knowledge Graph.'],
    ['Assets', 'Local', 'IndexedDB local assets.']
  ];
  return rows.map(r=>`<tr><td>${esc(r[0])}</td><td><span class="ecms-health ${esc(r[1].toLowerCase())}">${esc(r[1])}</span></td><td>${esc(r[2])}</td></tr>`).join('');
}

function enterpriseHtml(data){
  const metrics = [
    metric('📦','Products',arr(data,'products').length,'Product Manager'),
    metric('📝','Articles',arr(data,'articles').length,'CMS Articles'),
    metric('📚','API Links',countApis(data),'Knowledge Graph'),
    metric('🔌','Integration Groups',countIntegrations(data),'Knowledge Graph'),
    metric('🧠','Knowledge Sections',countKnowledge(data),'Product Detail'),
    metric('📂','Assets','IndexedDB','Local browser storage')
  ];
  return `<section class="ecms-hero"><div><span class="eyebrow">🏢 Enterprise CMS v10.0</span><h2>FTI Collaboration Enterprise CMS</h2><p>Trung tâm quản trị nội dung theo cấu trúc dữ liệu: Products, Articles, API, Assets, Demo, Compliance, Integrations, Versions và Publish Workflow.</p></div><div class="ecms-hero-actions"><a class="btn btn-primary" href="#cms">Mở CMS</a><a class="btn btn-soft" href="#overview">Xem Portal</a></div></section>
  <section class="ecms-metrics">${metrics.join('')}</section>
  <section class="ecms-panel"><div class="ecms-panel-head"><h3>Enterprise CMS Modules</h3><span>Phân quyền sở hữu nội dung theo module, tránh chỉnh sửa rời rạc.</span></div><div class="ecms-module-grid">${modules.map(moduleCard).join('')}</div></section>
  <section class="ecms-panel"><div class="ecms-panel-head"><h3>Content Health</h3><span>Kiểm tra nhanh dữ liệu trước khi publish.</span></div><div class="ecms-table-wrap"><table class="ecms-table"><thead><tr><th>Khu vực</th><th>Trạng thái</th><th>Ghi chú</th></tr></thead><tbody>${healthRows(data)}</tbody></table></div></section>
  <section class="ecms-panel"><div class="ecms-panel-head"><h3>Operating Model</h3><span>Quy trình vận hành CMS đề xuất</span></div><div class="ecms-flow"><div><b>1</b><span>Nhập dữ liệu</span><small>Products / Articles / API / Assets</small></div><div><b>2</b><span>Chuẩn hóa</span><small>Tags / Category / Relationship / Owner</small></div><div><b>3</b><span>Review</span><small>Preview / Content Health / Backup</small></div><div><b>4</b><span>Publish</span><small>Export JSON / Git commit / GitHub Pages</small></div></div></section>
  <section class="ecms-panel"><div class="ecms-panel-head"><h3>Roadmap sau v10</h3><span>Tập trung CMS dữ liệu thật, không đi theo hướng Page Builder</span></div><div class="ecms-roadmap"><article><b>v10.1</b><h4>API Center Refactor</h4><p>Chuẩn hóa API method, headers, request, response, auth và render dạng API docs.</p></article><article><b>v10.2</b><h4>Document Center</h4><p>Quản lý presentation, datasheet, PDF, video, case study, checklist và download.</p></article><article><b>v10.3</b><h4>Global Search</h4><p>Tìm kiếm trên Product, Article, API, Compliance, Demo và Assets.</p></article><article><b>v10.4</b><h4>Publish Workflow</h4><p>Draft/Review/Approved/Published, export package và release checklist.</p></article></div></section>`;
}

async function showEnterprise(){
  ensureStyle();
  const root = document.querySelector('#pageRoot');
  if(!root) return;
  const data = await loadCms().catch(()=>({}));
  const title = document.querySelector('#pageTitle');
  const subtitle = document.querySelector('#pageSubtitle');
  if(title) title.textContent = 'Enterprise CMS';
  if(subtitle) subtitle.textContent = 'Structured CMS for Products · Articles · API · Assets';
  root.innerHTML = enterpriseHtml(data);
}

function injectCmsTab(){
  return;
}

async function route(){
  if(location.hash === '#enterprise-cms'){
    await showEnterprise();
    return;
  }
  if(location.hash === '#cms'){
    setTimeout(injectCmsTab, 500);
  }
}

window.addEventListener('hashchange', route);
window.addEventListener('DOMContentLoaded', route);
setTimeout(route, 900);
