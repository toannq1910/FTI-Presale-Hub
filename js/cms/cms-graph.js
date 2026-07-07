/* v9.8.0 Product Knowledge Graph */
import { $, $$, esc, cloneData, saveCms, toast, linesToArray } from './cms-core.js';

export const RELATION_TYPES = {
  integrates_with: 'Integrates with',
  compatible_with: 'Compatible with',
  compare_with: 'Compare with',
  competitor_of: 'Competitor of',
  depends_on: 'Depends on',
  replaces: 'Replaces'
};

export function relationLabel(type){
  return RELATION_TYPES[type] || type || 'Relationship';
}

export function ensureGraphFields(product){
  product.relationships = Array.isArray(product.relationships) ? product.relationships : [];
  product.integrations = Array.isArray(product.integrations) ? product.integrations : [];
  product.competitors = Array.isArray(product.competitors) ? product.competitors : [];
  product.apiLinks = Array.isArray(product.apiLinks) ? product.apiLinks : [];
  product.knowledgeSections = Array.isArray(product.knowledgeSections) ? product.knowledgeSections : [];
  return product;
}

function activeProduct(data){
  const products = data.products || [];
  const activeId = sessionStorage.getItem('fti_active_product_id') || products[0]?.id || '';
  return products.find(p => p.id === activeId) || products[0] || null;
}

function productOptions(data, selected = ''){
  return (data.products || []).map(p => `<option value="${esc(p.id)}" ${p.id === selected ? 'selected' : ''}>${esc(p.title || p.id)}</option>`).join('');
}

function relationRows(product, data){
  return (product.relationships || []).map((r,i) => `<div class="kg-row" data-kg-rel="${i}">
    <select data-rel-type="${i}">
      ${Object.entries(RELATION_TYPES).map(([k,v]) => `<option value="${k}" ${r.type === k ? 'selected' : ''}>${v}</option>`).join('')}
    </select>
    <select data-rel-target="${i}">
      ${productOptions(data, r.target)}
    </select>
    <input data-rel-label="${i}" value="${esc(r.label || '')}" placeholder="Ghi chú quan hệ">
    <button class="btn btn-danger" data-remove-rel="${i}">Xóa</button>
  </div>`).join('') || `<div class="cms-empty-state">Chưa có relationship.</div>`;
}

function integrationRows(product){
  return (product.integrations || []).map((g,i) => `<div class="kg-card" data-kg-integration="${i}">
    <div class="kg-card-head">
      <input data-int-name="${i}" value="${esc(g.name || '')}" placeholder="Tên nhóm integration">
      <button class="btn btn-danger" data-remove-int="${i}">Xóa</button>
    </div>
    <textarea data-int-items="${i}" placeholder="Mỗi dòng 1 integration">${esc((g.items || []).join('\n'))}</textarea>
  </div>`).join('') || `<div class="cms-empty-state">Chưa có integration.</div>`;
}

function competitorRows(product){
  return (product.competitors || []).map((c,i) => `<div class="kg-card" data-kg-competitor="${i}">
    <div class="kg-card-head">
      <input data-comp-name="${i}" value="${esc(c.name || '')}" placeholder="Tên đối thủ">
      <button class="btn btn-danger" data-remove-comp="${i}">Xóa</button>
    </div>
    <input data-comp-position="${i}" value="${esc(c.position || '')}" placeholder="Định vị">
    <textarea data-comp-note="${i}" placeholder="Ghi chú">${esc(c.note || '')}</textarea>
  </div>`).join('') || `<div class="cms-empty-state">Chưa có competitor.</div>`;
}

function apiRows(product){
  return (product.apiLinks || []).map((a,i) => `<div class="kg-row api-row" data-kg-api="${i}">
    <input data-api-method="${i}" value="${esc(a.method || 'GET')}" placeholder="GET">
    <input data-api-path="${i}" value="${esc(a.path || '')}" placeholder="/api/path">
    <input data-api-name="${i}" value="${esc(a.name || '')}" placeholder="Tên API">
    <input data-api-desc="${i}" value="${esc(a.description || '')}" placeholder="Mô tả">
    <button class="btn btn-danger" data-remove-api="${i}">Xóa</button>
  </div>`).join('') || `<div class="cms-empty-state">Chưa có API link.</div>`;
}

function knowledgeRows(product){
  return (product.knowledgeSections || []).map((s,i) => `<div class="kg-card" data-kg-section="${i}">
    <div class="kg-card-head">
      <input data-sec-title="${i}" value="${esc(s.title || '')}" placeholder="Tiêu đề section">
      <button class="btn btn-danger" data-remove-sec="${i}">Xóa</button>
    </div>
    <textarea data-sec-content="${i}" placeholder="Nội dung">${esc(s.content || '')}</textarea>
  </div>`).join('') || `<div class="cms-empty-state">Chưa có knowledge section.</div>`;
}

export function renderKnowledgeGraphManager(data, description = ''){
  const product = activeProduct(data);
  if(!product) return `<div class="cms-empty-state">Chưa có sản phẩm.</div>`;
  ensureGraphFields(product);

  return `<section class="kg-hero">
    <div>
      <span class="eyebrow">🕸️ Product Knowledge Graph</span>
      <h2>${esc(product.title || product.id)}</h2>
      <p>${esc(description || 'Quản lý các dữ liệu kỹ thuật gắn với sản phẩm như API link, integration note, competitor và knowledge section.')}</p>
    </div>
    <div class="kg-actions">
      <button class="btn btn-primary" id="kgSave">Lưu Knowledge Graph</button>
    </div>
  </section>

  <section class="kg-layout">
    <aside class="kg-nav">
      <button class="active" data-kg-tab="relationships">Relationships</button>
      <button data-kg-tab="integrations">Integrations</button>
      <button data-kg-tab="competitors">Competitors</button>
      <button data-kg-tab="api">API Links</button>
      <button data-kg-tab="knowledge">Knowledge</button>
    </aside>

    <main class="kg-main">
      <section class="kg-panel active" id="kg-relationships">
        <div class="kg-panel-head">
          <h3>Product Relationships</h3>
          <button class="btn btn-soft" id="addRelationship">+ Thêm relationship</button>
        </div>
        <div id="relationshipRows">${relationRows(product, data)}</div>
      </section>

      <section class="kg-panel" id="kg-integrations">
        <div class="kg-panel-head">
          <h3>Integrations</h3>
          <button class="btn btn-soft" id="addIntegration">+ Thêm integration group</button>
        </div>
        <div class="kg-card-list" id="integrationRows">${integrationRows(product)}</div>
      </section>

      <section class="kg-panel" id="kg-competitors">
        <div class="kg-panel-head">
          <h3>Competitors</h3>
          <button class="btn btn-soft" id="addCompetitor">+ Thêm competitor</button>
        </div>
        <div class="kg-card-list" id="competitorRows">${competitorRows(product)}</div>
      </section>

      <section class="kg-panel" id="kg-api">
        <div class="kg-panel-head">
          <h3>API Links</h3>
          <button class="btn btn-soft" id="addApi">+ Thêm API</button>
        </div>
        <div id="apiRows">${apiRows(product)}</div>
      </section>

      <section class="kg-panel" id="kg-knowledge">
        <div class="kg-panel-head">
          <h3>Knowledge Sections</h3>
          <button class="btn btn-soft" id="addKnowledge">+ Thêm section</button>
        </div>
        <div class="kg-card-list" id="knowledgeRows">${knowledgeRows(product)}</div>
      </section>
    </main>
  </section>`;
}

export function collectKnowledgeGraph(data){
  const next = cloneData(data);
  const product = activeProduct(next);
  if(!product) return next;
  ensureGraphFields(product);

  product.relationships = $$('[data-kg-rel]').map(row => {
    const i = row.dataset.kgRel;
    return {
      type: $(`[data-rel-type="${i}"]`)?.value || 'integrates_with',
      target: $(`[data-rel-target="${i}"]`)?.value || '',
      label: $(`[data-rel-label="${i}"]`)?.value || ''
    };
  }).filter(x => x.target);

  product.integrations = $$('[data-kg-integration]').map(row => {
    const i = row.dataset.kgIntegration;
    return {
      name: $(`[data-int-name="${i}"]`)?.value || '',
      items: linesToArray($(`[data-int-items="${i}"]`)?.value || '')
    };
  }).filter(x => x.name || x.items.length);

  product.competitors = $$('[data-kg-competitor]').map(row => {
    const i = row.dataset.kgCompetitor;
    return {
      name: $(`[data-comp-name="${i}"]`)?.value || '',
      position: $(`[data-comp-position="${i}"]`)?.value || '',
      note: $(`[data-comp-note="${i}"]`)?.value || ''
    };
  }).filter(x => x.name || x.position || x.note);

  product.apiLinks = $$('[data-kg-api]').map(row => {
    const i = row.dataset.kgApi;
    return {
      method: $(`[data-api-method="${i}"]`)?.value || 'GET',
      path: $(`[data-api-path="${i}"]`)?.value || '',
      name: $(`[data-api-name="${i}"]`)?.value || '',
      description: $(`[data-api-desc="${i}"]`)?.value || ''
    };
  }).filter(x => x.path || x.name);

  product.knowledgeSections = $$('[data-kg-section]').map(row => {
    const i = row.dataset.kgSection;
    return {
      title: $(`[data-sec-title="${i}"]`)?.value || '',
      content: $(`[data-sec-content="${i}"]`)?.value || ''
    };
  }).filter(x => x.title || x.content);

  next.meta = next.meta || {};
  next.meta.version = 'v9.8.0';
  next.meta.updatedAt = new Date().toISOString().slice(0,10);
  return next;
}

export function bindKnowledgeGraphManager(data, renderCms){
  const product = activeProduct(data);
  if(!product) return;

  $$('[data-kg-tab]').forEach(btn => {
    btn.onclick = () => {
      $$('[data-kg-tab]').forEach(x => x.classList.remove('active'));
      btn.classList.add('active');
      $$('.kg-panel').forEach(x => x.classList.remove('active'));
      $(`#kg-${btn.dataset.kgTab}`)?.classList.add('active');
    };
  });

  $('#kgSave')?.addEventListener('click', () => {
    const next = collectKnowledgeGraph(data);
    saveCms(next);
    toast('Đã lưu Product Knowledge Graph.');
    renderCms(next, 'graph');
  });

  $('#addRelationship')?.addEventListener('click', () => {
    const next = collectKnowledgeGraph(data);
    activeProduct(next).relationships.push({type:'integrates_with',target:(next.products || [])[0]?.id || '',label:''});
    renderCms(next, 'graph');
  });

  $('#addIntegration')?.addEventListener('click', () => {
    const next = collectKnowledgeGraph(data);
    activeProduct(next).integrations.push({name:'Nhóm integration mới',items:['Integration 1']});
    renderCms(next, 'graph');
  });

  $('#addCompetitor')?.addEventListener('click', () => {
    const next = collectKnowledgeGraph(data);
    activeProduct(next).competitors.push({name:'Competitor mới',position:'Định vị',note:'Ghi chú'});
    renderCms(next, 'graph');
  });

  $('#addApi')?.addEventListener('click', () => {
    const next = collectKnowledgeGraph(data);
    activeProduct(next).apiLinks.push({method:'GET',path:'/api/new',name:'API mới',description:'Mô tả'});
    renderCms(next, 'graph');
  });

  $('#addKnowledge')?.addEventListener('click', () => {
    const next = collectKnowledgeGraph(data);
    activeProduct(next).knowledgeSections.push({title:'Section mới',content:'Nội dung'});
    renderCms(next, 'graph');
  });

  $$('[data-remove-rel]').forEach(btn => btn.onclick = () => {
    const next = collectKnowledgeGraph(data);
    activeProduct(next).relationships.splice(Number(btn.dataset.removeRel),1);
    renderCms(next, 'graph');
  });

  $$('[data-remove-int]').forEach(btn => btn.onclick = () => {
    const next = collectKnowledgeGraph(data);
    activeProduct(next).integrations.splice(Number(btn.dataset.removeInt),1);
    renderCms(next, 'graph');
  });

  $$('[data-remove-comp]').forEach(btn => btn.onclick = () => {
    const next = collectKnowledgeGraph(data);
    activeProduct(next).competitors.splice(Number(btn.dataset.removeComp),1);
    renderCms(next, 'graph');
  });

  $$('[data-remove-api]').forEach(btn => btn.onclick = () => {
    const next = collectKnowledgeGraph(data);
    activeProduct(next).apiLinks.splice(Number(btn.dataset.removeApi),1);
    renderCms(next, 'graph');
  });

  $$('[data-remove-sec]').forEach(btn => btn.onclick = () => {
    const next = collectKnowledgeGraph(data);
    activeProduct(next).knowledgeSections.splice(Number(btn.dataset.removeSec),1);
    renderCms(next, 'graph');
  });
}
