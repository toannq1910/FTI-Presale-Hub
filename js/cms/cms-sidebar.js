/* v9.8.1 Sidebar CMS Alignment */
import { $, $$, esc, cloneData, saveCms, toast } from './cms-core.js';

export const SIDEBAR_TYPES = {
  product: 'Product',
  'product-center': 'Product Center',
  category: 'Category',
  'api-reference': 'API Reference',
  'knowledge-base': 'Knowledge Base',
  'asset-library': 'Asset Library',
  'static-page': 'Static Page',
  admin: 'Admin',
  document: 'Document'
};

export const CMS_STATUSES = {
  aligned: 'Aligned',
  partial: 'Partial',
  pending: 'Pending',
  deprecated: 'Deprecated'
};

export function typeLabel(type){
  return SIDEBAR_TYPES[type] || type || 'Unknown';
}

export function statusLabel(status){
  return CMS_STATUSES[status] || status || 'Pending';
}

function statusClass(status){
  return ({
    aligned: 'ok',
    partial: 'warn',
    pending: 'todo',
    deprecated: 'old'
  }[status] || 'todo');
}

export function defaultSidebarAlignment(){
  return [
    {id:'overview',label:'Tổng quan',route:'#overview',type:'static-page',cmsStatus:'aligned',ownerModule:'Product Catalog',target:'Landing page hiển thị Product Catalog.',recommendation:'Giữ làm trang tổng quan.'},
    {id:'oncallcx-product-center',label:'OnCallCX',route:'#oncallcx-product-center',type:'product-center',cmsStatus:'aligned',ownerModule:'Unified Product CMS',target:'Product Center đã gắn CMS.',recommendation:'Dùng làm mẫu chuẩn.'},
    {id:'cms',label:'CMS Data',route:'#cms',type:'admin',cmsStatus:'aligned',ownerModule:'CMS Framework',target:'Admin hub.',recommendation:'Giữ cho quản trị nội dung.'},
    {id:'api-reference',label:'API Reference',route:'#api-reference',type:'api-reference',cmsStatus:'partial',ownerModule:'Knowledge Graph',target:'API đọc từ product.apiLinks.',recommendation:'Đồng bộ dần vào Knowledge Graph.'},
    {id:'video',label:'Video',route:'#video',type:'asset-library',cmsStatus:'partial',ownerModule:'Asset Manager',target:'Video là asset gắn theo product.',recommendation:'Dùng Asset Manager type Demo Video.'}
  ];
}

export function ensureSidebarAlignment(data){
  data.sidebarAlignment = Array.isArray(data.sidebarAlignment) && data.sidebarAlignment.length
    ? data.sidebarAlignment
    : defaultSidebarAlignment();
  return data.sidebarAlignment;
}

function score(alignment){
  const total = alignment.length || 1;
  const ok = alignment.filter(x => x.cmsStatus === 'aligned').length;
  const partial = alignment.filter(x => x.cmsStatus === 'partial').length;
  const pending = alignment.filter(x => x.cmsStatus === 'pending').length;
  return {total, ok, partial, pending, percent: Math.round(((ok + partial * 0.5) / total) * 100)};
}

function renderRows(items){
  return items.map((item,i) => `<article class="sidebar-align-row" data-sidebar-row="${i}">
    <div class="sidebar-align-status ${statusClass(item.cmsStatus)}">${esc(statusLabel(item.cmsStatus))}</div>
    <div class="sidebar-align-main">
      <div class="sidebar-align-title">
        <b>${esc(item.label)}</b>
        <code>${esc(item.route)}</code>
      </div>
      <span>${esc(typeLabel(item.type))} · Owner: ${esc(item.ownerModule || 'N/A')}</span>
      <p>${esc(item.target || '')}</p>
      <em>${esc(item.recommendation || '')}</em>
    </div>
    <div class="sidebar-align-actions">
      ${item.route ? `<a class="btn btn-soft" href="${esc(item.route)}">Mở</a>` : ''}
      <button class="btn btn-soft" data-edit-sidebar="${i}">Sửa</button>
      <button class="btn btn-danger" data-remove-sidebar="${i}">Xóa</button>
    </div>
  </article>`).join('') || `<div class="cms-empty-state">Chưa có sidebar mapping.</div>`;
}

function renderEditor(item = {}, i = ''){
  return `<div class="sidebar-map-editor" id="sidebarMapEditor" data-edit-index="${esc(i)}">
    <h3>${i === '' ? 'Thêm sidebar mapping' : 'Sửa sidebar mapping'}</h3>
    <div class="pm-form-grid">
      <label>ID</label><input id="sideId" value="${esc(item.id || '')}" placeholder="vd: ccaaas-vietnam">
      <label>Label</label><input id="sideLabel" value="${esc(item.label || '')}" placeholder="Tên hiển thị">
      <label>Route</label><input id="sideRoute" value="${esc(item.route || '')}" placeholder="#route">
      <label>Type</label>
      <select id="sideType">${Object.entries(SIDEBAR_TYPES).map(([k,v]) => `<option value="${k}" ${item.type === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
      <label>CMS Status</label>
      <select id="sideStatus">${Object.entries(CMS_STATUSES).map(([k,v]) => `<option value="${k}" ${item.cmsStatus === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
      <label>Owner module</label><input id="sideOwner" value="${esc(item.ownerModule || '')}" placeholder="Product Manager / Asset Manager / Knowledge Graph">
      <label>Target</label><textarea id="sideTarget">${esc(item.target || '')}</textarea>
      <label>Recommendation</label><textarea id="sideRecommendation">${esc(item.recommendation || '')}</textarea>
    </div>
    <div class="cms-save-row">
      <button class="btn btn-primary" id="saveSidebarMap">Lưu mapping</button>
      <button class="btn btn-soft" id="cancelSidebarMap">Hủy</button>
    </div>
  </div>`;
}

function collectEditor(){
  return {
    id: $('#sideId')?.value || '',
    label: $('#sideLabel')?.value || '',
    route: $('#sideRoute')?.value || '',
    type: $('#sideType')?.value || 'static-page',
    cmsStatus: $('#sideStatus')?.value || 'pending',
    ownerModule: $('#sideOwner')?.value || '',
    target: $('#sideTarget')?.value || '',
    recommendation: $('#sideRecommendation')?.value || ''
  };
}

export function renderSidebarAlignment(data){
  const alignment = ensureSidebarAlignment(data);
  const s = score(alignment);
  const filter = sessionStorage.getItem('fti_sidebar_filter') || 'all';
  const visible = filter === 'all' ? alignment : alignment.filter(x => x.cmsStatus === filter);

  return `<section class="sidebar-align-hero">
    <div>
      <span class="eyebrow">🧭 Sidebar CMS Alignment</span>
      <h2>Đồng bộ sidebar với CMS</h2>
      <p>Kiểm tra các sidebar/page hiện tại đang thuộc Product, Category, Asset, API hay Knowledge Base để đưa về cùng CMS framework.</p>
    </div>
    <div class="sidebar-score">
      <b>${s.percent}%</b>
      <span>CMS aligned</span>
    </div>
  </section>

  <section class="sidebar-align-stats">
    <button data-sidebar-filter="all" class="${filter === 'all' ? 'active' : ''}"><b>${s.total}</b><span>Total</span></button>
    <button data-sidebar-filter="aligned" class="${filter === 'aligned' ? 'active' : ''}"><b>${s.ok}</b><span>Aligned</span></button>
    <button data-sidebar-filter="partial" class="${filter === 'partial' ? 'active' : ''}"><b>${s.partial}</b><span>Partial</span></button>
    <button data-sidebar-filter="pending" class="${filter === 'pending' ? 'active' : ''}"><b>${s.pending}</b><span>Pending</span></button>
  </section>

  <section class="sidebar-align-toolbar">
    <button class="btn btn-primary" id="addSidebarMap">+ Thêm mapping</button>
    <button class="btn btn-soft" id="resetSidebarMap">Reset mapping mẫu</button>
  </section>

  <section id="sidebarEditorWrap"></section>

  <section class="sidebar-align-list">
    ${renderRows(visible)}
  </section>`;
}

export function bindSidebarAlignment(data, renderCms){
  ensureSidebarAlignment(data);

  $$('[data-sidebar-filter]').forEach(btn => {
    btn.onclick = () => {
      sessionStorage.setItem('fti_sidebar_filter', btn.dataset.sidebarFilter);
      renderCms(data, 'sidebar');
    };
  });

  $('#addSidebarMap')?.addEventListener('click', () => {
    $('#sidebarEditorWrap').innerHTML = renderEditor({}, '');
    bindEditor(data, renderCms);
  });

  $('#resetSidebarMap')?.addEventListener('click', () => {
    if(!confirm('Reset sidebar alignment về mapping mẫu?')) return;
    const next = cloneData(data);
    next.sidebarAlignment = defaultSidebarAlignment();
    saveCms(next);
    toast('Đã reset sidebar mapping.');
    renderCms(next, 'sidebar');
  });

  $$('[data-edit-sidebar]').forEach(btn => {
    btn.onclick = () => {
      const i = Number(btn.dataset.editSidebar);
      $('#sidebarEditorWrap').innerHTML = renderEditor(data.sidebarAlignment[i], i);
      $('#sidebarEditorWrap').scrollIntoView({behavior:'smooth', block:'start'});
      bindEditor(data, renderCms);
    };
  });

  $$('[data-remove-sidebar]').forEach(btn => {
    btn.onclick = () => {
      if(!confirm('Xóa mapping này?')) return;
      const next = cloneData(data);
      next.sidebarAlignment.splice(Number(btn.dataset.removeSidebar), 1);
      saveCms(next);
      toast('Đã xóa mapping.');
      renderCms(next, 'sidebar');
    };
  });
}

function bindEditor(data, renderCms){
  $('#cancelSidebarMap')?.addEventListener('click', () => {
    $('#sidebarEditorWrap').innerHTML = '';
  });

  $('#saveSidebarMap')?.addEventListener('click', () => {
    const next = cloneData(data);
    ensureSidebarAlignment(next);
    const editor = $('#sidebarMapEditor');
    const idx = editor?.dataset.editIndex;
    const item = collectEditor();

    if(!item.id || !item.label){
      toast('Vui lòng nhập ID và Label.');
      return;
    }

    if(idx === ''){
      next.sidebarAlignment.push(item);
    }else{
      next.sidebarAlignment[Number(idx)] = item;
    }

    next.meta = next.meta || {};
    next.meta.version = 'v9.8.1';
    next.meta.updatedAt = new Date().toISOString().slice(0,10);
    saveCms(next);
    toast('Đã lưu sidebar mapping.');
    renderCms(next, 'sidebar');
  });
}
