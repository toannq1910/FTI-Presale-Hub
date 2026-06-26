/* v10.3.0 Global Search Engine */
import { loadCms, esc } from './cms/cms-core.js';

const fallbackItems = [
  {type:'Product', title:'OnCallCX', desc:'Contact Center as a Service made by FPT.', route:'#product-detail:oncallcx', tags:['oncallcx','ccaas','fpt']},
  {type:'API', title:'OnCallCX CDR API', desc:'Truy vấn lịch sử cuộc gọi và metadata.', route:'#api-center', tags:['api','cdr','recording']},
  {type:'Document', title:'OnCallCX Product Presentation', desc:'Tài liệu trình chiếu giới thiệu OnCallCX.', route:'#document-center', tags:['presentation','document']},
  {type:'Article', title:'CRM/ERP Việt Nam', desc:'Danh mục CRM/ERP có thể tích hợp Contact Center.', route:'#crm', tags:['crm','erp','integration']},
  {type:'Compliance', title:'Compliance Checklist', desc:'Ghi âm, bảo mật, dữ liệu cá nhân và audit.', route:'#compliance', tags:['compliance','security']}
];

function ensureStyle(){
  if(document.getElementById('globalSearchStyle')) return;
  const style = document.createElement('style');
  style.id = 'globalSearchStyle';
  style.textContent = `
  .gsearch-hero{display:flex;justify-content:space-between;gap:18px;align-items:flex-end;background:linear-gradient(135deg,rgba(249,115,22,.16),rgba(59,130,246,.10));border:1px solid rgba(249,115,22,.28);border-radius:28px;padding:30px;margin-bottom:18px}
  .gsearch-hero h2{font-size:36px;margin:10px 0}.gsearch-hero p{color:#c4d3ea;line-height:1.65;max-width:980px}
  .gsearch-box{display:grid;grid-template-columns:minmax(0,1fr) 190px 170px;gap:10px;margin-bottom:18px}.gsearch-box input,.gsearch-box select{width:100%;border:1px solid var(--line,#263754);background:#050a18;color:#dbeafe;border-radius:14px;padding:13px 14px;outline:none}
  .gsearch-summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:18px}.gsearch-stat{background:var(--card,#111c31);border:1px solid var(--line,#263754);border-radius:18px;padding:16px}.gsearch-stat b{display:block;font-size:26px}.gsearch-stat span{color:#c4d3ea}
  .gsearch-results{display:grid;gap:12px}.gsearch-item{background:var(--card,#111c31);border:1px solid var(--line,#263754);border-radius:20px;padding:18px}.gsearch-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.gsearch-type{background:rgba(249,115,22,.14);border:1px solid rgba(249,115,22,.28);color:#fdba74;border-radius:999px;padding:5px 9px;font-weight:900;font-size:12px}.gsearch-item h3{margin:8px 0}.gsearch-item p{color:#c4d3ea;line-height:1.6}.gsearch-tags{display:flex;gap:6px;flex-wrap:wrap}.gsearch-tags span{background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.25);color:#93c5fd;border-radius:999px;padding:4px 8px;font-size:11px;font-weight:900}
  @media(max-width:900px){.gsearch-hero{flex-direction:column;align-items:flex-start}.gsearch-box,.gsearch-summary{grid-template-columns:1fr}.gsearch-hero h2{font-size:30px}}
  `;
  document.head.appendChild(style);
}

function buildIndex(data){
  const items = [];
  (data.products || []).forEach(p => {
    items.push({type:'Product', title:p.title || p.id, desc:p.summary || '', route:`#product-detail:${p.id}`, tags:[...(p.tags||[]), p.category, p.vendor].filter(Boolean)});
    (p.apiLinks || []).forEach(api => items.push({type:'API', title:api.name || api.path, desc:api.description || '', route:'#api-center', tags:['api', api.method, p.title].filter(Boolean)}));
    (p.integrations || []).forEach(g => items.push({type:'Integration', title:g.name || 'Integration', desc:(g.items||[]).join(', '), route:`#product-detail:${p.id}`, tags:['integration', p.title].filter(Boolean)}));
    (p.knowledgeSections || []).forEach(s => items.push({type:'Knowledge', title:s.title || 'Knowledge', desc:s.content || '', route:`#product-detail:${p.id}`, tags:['knowledge', p.title].filter(Boolean)}));
  });
  (data.articles || []).forEach(a => items.push({type:'Article', title:a.title || a.id, desc:a.summary || '', route:a.route || `#${a.sidebarId}`, tags:[a.type, a.sidebarId].filter(Boolean)}));
  return items.length ? items : fallbackItems;
}

let searchItems = [];
function render(items){
  const types = ['all', ...new Set(items.map(i => i.type))];
  return `<section class="gsearch-hero"><div><span class="eyebrow">🔎 Global Search v10.3</span><h2>Global Search Engine</h2><p>Tìm kiếm trên Product, Article, API, Integration, Compliance, Demo và Document trong một nơi.</p></div><a class="btn btn-primary" href="#enterprise-cms">Enterprise CMS</a></section>
  <section class="gsearch-summary">
    <article class="gsearch-stat"><b>${items.length}</b><span>Indexed items</span></article>
    <article class="gsearch-stat"><b>${new Set(items.map(i=>i.type)).size}</b><span>Content types</span></article>
    <article class="gsearch-stat"><b>${items.filter(i=>i.type==='API').length}</b><span>APIs</span></article>
    <article class="gsearch-stat"><b>${items.filter(i=>i.type==='Product').length}</b><span>Products</span></article>
  </section>
  <section class="gsearch-box"><input id="globalSearchInput" placeholder="Tìm OnCallCX, API, CRM, compliance..."><select id="globalSearchType">${types.map(t=>`<option value="${esc(t)}">${esc(t==='all'?'All types':t)}</option>`).join('')}</select><select id="globalSearchLimit"><option value="20">Top 20</option><option value="50">Top 50</option><option value="999">All</option></select></section>
  <section id="globalSearchResults" class="gsearch-results"></section>`;
}
function itemHtml(item){
  return `<article class="gsearch-item"><div class="gsearch-head"><span class="gsearch-type">${esc(item.type)}</span><a class="btn btn-soft" href="${esc(item.route || '#overview')}">Mở</a></div><h3>${esc(item.title || '')}</h3><p>${esc(item.desc || '')}</p><div class="gsearch-tags">${(item.tags||[]).filter(Boolean).slice(0,8).map(t=>`<span>${esc(t)}</span>`).join('')}</div></article>`;
}
function bind(){
  const input = document.querySelector('#globalSearchInput');
  const type = document.querySelector('#globalSearchType');
  const limit = document.querySelector('#globalSearchLimit');
  const results = document.querySelector('#globalSearchResults');
  const doFilter = () => {
    const q = (input?.value || '').toLowerCase();
    const t = type?.value || 'all';
    const l = Number(limit?.value || 20);
    const visible = searchItems
      .filter(i => t === 'all' || i.type === t)
      .filter(i => !q || [i.title,i.desc,i.type,(i.tags||[]).join(' ')].join(' ').toLowerCase().includes(q))
      .slice(0,l);
    results.innerHTML = visible.map(itemHtml).join('') || `<div class="cms-empty-state">Không tìm thấy kết quả.</div>`;
  };
  input?.addEventListener('input', doFilter); type?.addEventListener('change', doFilter); limit?.addEventListener('change', doFilter);
  doFilter();
}
async function openGlobalSearch(){
  if(location.hash !== '#global-search') return;
  ensureStyle();
  const root = document.querySelector('#pageRoot'); if(!root) return;
  const data = await loadCms().catch(()=>({}));
  searchItems = buildIndex(data);
  document.querySelector('#pageTitle').textContent = 'Global Search';
  document.querySelector('#pageSubtitle').textContent = 'Search across CMS content';
  root.innerHTML = render(searchItems);
  bind();
}
window.addEventListener('hashchange', () => setTimeout(openGlobalSearch, 80));
window.addEventListener('DOMContentLoaded', () => setTimeout(openGlobalSearch, 150));
