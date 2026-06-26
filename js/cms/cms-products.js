/* v9.5.0 CMS Product Manager */
import { $, $$, esc, cloneData, toast, saveCms, csvToArray, linesToArray } from './cms-core.js';

export const PRODUCT_STATUSES = {
  active: 'Active',
  draft: 'Draft',
  reference: 'Reference',
  archived: 'Archived'
};

export function productStatusLabel(v){
  return PRODUCT_STATUSES[v] || v || 'Draft';
}

function productIcon(product){
  const text = String(product.title || product.vendor || '?').trim();
  return esc(text.slice(0,2).toUpperCase());
}

export function normalizeProducts(data){
  data.products = Array.isArray(data.products) ? data.products : [];
  return data;
}

export function renderProductManager(data){
  normalizeProducts(data);
  const products = data.products || [];
  const activeId = sessionStorage.getItem('fti_active_product_id') || products[0]?.id || '';
  const active = products.find(p => p.id === activeId) || products[0] || null;

  return `<section class="product-manager-hero">
    <div>
      <span class="eyebrow">🧭 Product Manager</span>
      <h2>Quản lý danh mục sản phẩm</h2>
      <p>Quản lý nhiều sản phẩm trong cùng Portal: OnCallCX, Webex, Zoom, Cisco UC, Teams, Genesys, NICE...</p>
    </div>
    <button class="btn btn-primary" id="pmAddProduct">+ Thêm sản phẩm</button>
  </section>

  <section class="product-manager-layout">
    <aside class="pm-sidebar">
      <div class="pm-search">
        <input id="pmSearch" placeholder="Tìm sản phẩm...">
      </div>
      <div class="pm-list" id="pmList">
        ${renderProductList(products, active?.id)}
      </div>
    </aside>

    <main class="pm-detail">
      ${active ? renderProductForm(active) : renderEmptyProduct()}
    </main>
  </section>`;
}

export function renderProductList(products, activeId){
  return products.map(p => `<button class="pm-list-item ${p.id === activeId ? 'active' : ''}" data-product-id="${esc(p.id)}">
    <div class="pm-avatar">${productIcon(p)}</div>
    <div>
      <b>${esc(p.title || 'Untitled')}</b>
      <span>${esc(p.category || p.vendor || 'No category')}</span>
    </div>
    <em>${esc(productStatusLabel(p.status))}</em>
  </button>`).join('') || `<div class="cms-empty-state">Chưa có sản phẩm nào.</div>`;
}

function renderEmptyProduct(){
  return `<div class="cms-empty-state">Chưa có sản phẩm. Bấm “Thêm sản phẩm” để bắt đầu.</div>`;
}

export function renderProductForm(p){
  return `<div class="pm-form-card">
    <div class="pm-form-head">
      <div>
        <h3>${esc(p.title || 'Sản phẩm')}</h3>
        <p>ID: <code>${esc(p.id || '')}</code></p>
      </div>
      <div class="pm-form-actions">
        <button class="btn btn-soft" id="pmDuplicateProduct">Nhân bản</button>
        <button class="btn btn-danger" id="pmDeleteProduct">Xóa</button>
        <button class="btn btn-primary" id="pmSaveProduct">Lưu sản phẩm</button>
      </div>
    </div>

    <div class="pm-form-grid">
      <label>Product ID</label><input id="pmId" value="${esc(p.id || '')}">
      <label>Title</label><input id="pmTitle" value="${esc(p.title || '')}">
      <label>Subtitle</label><input id="pmSubtitle" value="${esc(p.subtitle || '')}">
      <label>Vendor</label><input id="pmVendor" value="${esc(p.vendor || '')}">
      <label>Category</label><input id="pmCategory" value="${esc(p.category || '')}">
      <label>Status</label>
      <select id="pmStatus">
        ${Object.entries(PRODUCT_STATUSES).map(([k,v]) => `<option value="${k}" ${p.status===k?'selected':''}>${v}</option>`).join('')}
      </select>
      <label>Score</label><input id="pmScore" value="${esc(p.score || '')}" placeholder="VD: 9/10">
      <label>Website</label><input id="pmWebsite" value="${esc(p.website || '')}" placeholder="https://...">
      <label>Tags</label><input id="pmTags" value="${esc((p.tags || []).join(', '))}">
      <label>Summary</label><textarea id="pmSummary">${esc(p.summary || '')}</textarea>
      <label>Highlights</label><textarea id="pmHighlights">${esc((p.highlights || []).join('\n'))}</textarea>
      <label>Use cases</label><textarea id="pmUseCases">${esc((p.useCases || []).join('\n'))}</textarea>
    </div>
  </div>`;
}

function slugify(value){
  return String(value || 'product')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/^-+|-+$/g,'') || `product-${Date.now()}`;
}

export function collectProductForm(oldProduct = {}){
  const id = slugify($('#pmId')?.value || $('#pmTitle')?.value || oldProduct.id);
  return {
    ...oldProduct,
    id,
    title: $('#pmTitle')?.value || '',
    subtitle: $('#pmSubtitle')?.value || '',
    vendor: $('#pmVendor')?.value || '',
    category: $('#pmCategory')?.value || '',
    status: $('#pmStatus')?.value || 'draft',
    score: $('#pmScore')?.value || '',
    website: $('#pmWebsite')?.value || '',
    tags: csvToArray($('#pmTags')?.value || ''),
    summary: $('#pmSummary')?.value || '',
    highlights: linesToArray($('#pmHighlights')?.value || ''),
    useCases: linesToArray($('#pmUseCases')?.value || '')
  };
}

export function bindProductManager(data, renderCms){
  normalizeProducts(data);
  let products = data.products || [];
  let activeId = sessionStorage.getItem('fti_active_product_id') || products[0]?.id || '';

  const refreshList = () => {
    const q = ($('#pmSearch')?.value || '').toLowerCase().trim();
    const visible = products.filter(p => !q || [p.title,p.vendor,p.category,p.summary,(p.tags||[]).join(' ')].join(' ').toLowerCase().includes(q));
    $('#pmList').innerHTML = renderProductList(visible, activeId);
    bindListItems();
  };

  const bindListItems = () => {
    $$('[data-product-id]').forEach(btn => btn.onclick = () => {
      activeId = btn.dataset.productId;
      sessionStorage.setItem('fti_active_product_id', activeId);
      renderCms(data, 'products');
    });
  };

  bindListItems();
  $('#pmSearch')?.addEventListener('input', refreshList);

  $('#pmAddProduct')?.addEventListener('click', () => {
    const next = cloneData(data);
    next.products = Array.isArray(next.products) ? next.products : [];
    const newProduct = {
      id: `new-product-${Date.now()}`,
      title: 'Sản phẩm mới',
      subtitle: 'Nhóm giải pháp',
      vendor: '',
      category: '',
      status: 'draft',
      score: '',
      website: '',
      tags: ['New'],
      summary: 'Nhập mô tả sản phẩm tại đây.',
      highlights: ['Điểm nổi bật 1'],
      useCases: ['Use case 1']
    };
    next.products.unshift(newProduct);
    sessionStorage.setItem('fti_active_product_id', newProduct.id);
    toast('Đã tạo sản phẩm mới.');
    renderCms(next, 'products');
  });

  $('#pmSaveProduct')?.addEventListener('click', () => {
    const old = products.find(p => p.id === activeId) || products[0] || {};
    const updated = collectProductForm(old);
    const next = cloneData(data);
    next.products = next.products.map(p => p.id === activeId ? updated : p);
    next.meta = next.meta || {};
    next.meta.version = 'v9.5.0';
    next.meta.updatedAt = new Date().toISOString().slice(0,10);
    sessionStorage.setItem('fti_active_product_id', updated.id);
    saveCms(next);
    toast('Đã lưu sản phẩm vào LocalStorage.');
    renderCms(next, 'products');
  });

  $('#pmDeleteProduct')?.addEventListener('click', () => {
    if(!confirm('Xóa sản phẩm này khỏi CMS local?')) return;
    const next = cloneData(data);
    next.products = next.products.filter(p => p.id !== activeId);
    sessionStorage.setItem('fti_active_product_id', next.products[0]?.id || '');
    saveCms(next);
    toast('Đã xóa sản phẩm.');
    renderCms(next, 'products');
  });

  $('#pmDuplicateProduct')?.addEventListener('click', () => {
    const old = products.find(p => p.id === activeId) || products[0];
    if(!old) return;
    const next = cloneData(data);
    const clone = {
      ...old,
      id: `${old.id}-copy-${Date.now()}`,
      title: `${old.title} Copy`,
      status: 'draft'
    };
    next.products.unshift(clone);
    sessionStorage.setItem('fti_active_product_id', clone.id);
    saveCms(next);
    toast('Đã nhân bản sản phẩm.');
    renderCms(next, 'products');
  });
}
