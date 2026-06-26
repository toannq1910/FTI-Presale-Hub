/* v9.8.2 CMS Articles */
import { $, $$, esc, cloneData, saveCms, toast } from './cms-core.js';

export const DIRECT_ARTICLE_ROUTES = {
  'article-crm-erp-vietnam': '#crm',
  'article-uc-pbx-vietnam': '#uc-pbx',
  'article-ccaas-vietnam': '#ccaas-vn',
  'article-ccaas-international': '#ccaas-global',
  'article-api-reference': '#api-reference',
  'article-video': '#video',
  'article-compliance': '#compliance',
  'article-integration-playbook': '#integration-playbook'
};

export const ARTICLE_TYPES = {
  'category-article': 'Category Article',
  'api-reference': 'API Reference',
  'asset-library': 'Asset Library',
  'knowledge-base': 'Knowledge Base',
  'static-page': 'Static Page'
};


function normalizeArticleRoute(article){
  if(!article) return article;
  const direct = DIRECT_ARTICLE_ROUTES[article.id];
  if(direct) article.route = direct;
  return article;
}

function normalizeArticleRoutes(data){
  data.articles = Array.isArray(data.articles) ? data.articles : [];
  data.articles.forEach(normalizeArticleRoute);
  return data;
}

function activeArticle(data){
  const articles = Array.isArray(data.articles) ? data.articles : [];
  const activeId = sessionStorage.getItem('fti_active_article_id') || articles[0]?.id || '';
  return articles.find(a => a.id === activeId) || articles[0] || null;
}

function articleList(articles, activeId){
  return articles.map(a => `<button class="article-list-item ${a.id === activeId ? 'active' : ''}" data-article-id="${esc(a.id)}">
    <b>${esc(a.title || 'Untitled')}</b>
    <span>${esc(a.sidebarId || a.type || '')}</span>
    <em>${esc(a.status || 'draft')}</em>
  </button>`).join('') || `<div class="cms-empty-state">Chưa có bài viết CMS.</div>`;
}

function cardRows(article){
  const cards = Array.isArray(article.cards) ? article.cards : [];
  return cards.map((c,i) => `<div class="article-card-row" data-article-card="${i}">
    <input data-card-title="${i}" value="${esc(c.title || '')}" placeholder="Tiêu đề card">
    <input data-card-summary="${i}" value="${esc(c.summary || '')}" placeholder="Mô tả card">
    <input data-card-url="${i}" value="${esc(c.url || '')}" placeholder="URL hoặc #route">
    <button class="btn btn-danger" data-remove-card="${i}">Xóa</button>
  </div>`).join('') || `<div class="cms-empty-state">Chưa có card nội dung.</div>`;
}

function renderArticleForm(article){
  if(!article) return `<div class="cms-empty-state">Chưa có bài viết.</div>`;
  return `<div class="article-editor-card">
    <div class="article-editor-head">
      <div>
        <h3>${esc(article.title || 'Bài viết')}</h3>
        <p>ID: <code>${esc(article.id || '')}</code></p>
      </div>
      <div class="article-actions">
        <button class="btn btn-soft" id="duplicateArticle">Nhân bản</button>
        <button class="btn btn-danger" id="deleteArticle">Xóa</button>
        <button class="btn btn-primary" id="saveArticle">Lưu bài viết</button>
      </div>
    </div>

    <div class="pm-form-grid">
      <label>ID</label><input id="articleId" value="${esc(article.id || '')}">
      <label>Title</label><input id="articleTitle" value="${esc(article.title || '')}">
      <label>Sidebar ID</label><input id="articleSidebarId" value="${esc(article.sidebarId || '')}">
      <label>Route</label><input id="articleRoute" value="${esc(article.route || '')}">
      <label>Type</label>
      <select id="articleType">${Object.entries(ARTICLE_TYPES).map(([k,v]) => `<option value="${k}" ${article.type === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
      <label>Status</label>
      <select id="articleStatus">
        <option value="active" ${article.status === 'active' ? 'selected' : ''}>Active</option>
        <option value="draft" ${article.status === 'draft' ? 'selected' : ''}>Draft</option>
        <option value="archived" ${article.status === 'archived' ? 'selected' : ''}>Archived</option>
      </select>
      <label>Summary</label><textarea id="articleSummary">${esc(article.summary || '')}</textarea>
    </div>

    <div class="article-card-editor">
      <div class="article-editor-head">
        <h3>Cards nội dung</h3>
        <button class="btn btn-soft" id="addArticleCard">+ Thêm card</button>
      </div>
      <div id="articleCardRows">${cardRows(article)}</div>
    </div>
  </div>`;
}

function collectArticle(old = {}){
  const cards = $$('[data-article-card]').map(row => {
    const i = row.dataset.articleCard;
    return {
      title: $(`[data-card-title="${i}"]`)?.value || '',
      summary: $(`[data-card-summary="${i}"]`)?.value || '',
      url: $(`[data-card-url="${i}"]`)?.value || ''
    };
  }).filter(c => c.title || c.summary || c.url);

  return {
    ...old,
    id: $('#articleId')?.value || old.id || `article-${Date.now()}`,
    title: $('#articleTitle')?.value || '',
    sidebarId: $('#articleSidebarId')?.value || '',
    route: DIRECT_ARTICLE_ROUTES[$('#articleId')?.value || old.id] || $('#articleRoute')?.value || '',
    type: $('#articleType')?.value || 'category-article',
    status: $('#articleStatus')?.value || 'draft',
    summary: $('#articleSummary')?.value || '',
    cards
  };
}

export function renderCmsArticles(data){
  normalizeArticleRoutes(data);
  const active = activeArticle(data);
  return `<section class="article-hero">
    <div>
      <span class="eyebrow">📝 CMS Articles</span>
      <h2>Tích hợp bài viết/sidebar vào CMS</h2>
      <p>Thay thế khu vực “Chỉnh sửa bài viết / card nội dung” cũ. Tất cả bài viết/sidebar được quản lý tại đây.</p>
    </div>
    <button class="btn btn-primary" id="addArticle">+ Thêm bài viết</button>
  </section>

  <section class="article-layout">
    <aside class="article-sidebar">
      <input id="articleSearch" placeholder="Tìm bài viết...">
      <div id="articleList">${articleList(data.articles, active?.id)}</div>
    </aside>
    <main class="article-main">
      ${renderArticleForm(active)}
    </main>
  </section>`;
}

export function bindCmsArticles(data, renderCms){
  normalizeArticleRoutes(data);
  let articles = data.articles;
  let active = activeArticle(data);

  const bindList = () => {
    $$('[data-article-id]').forEach(btn => btn.onclick = () => {
      sessionStorage.setItem('fti_active_article_id', btn.dataset.articleId);
      renderCms(data, 'articles');
    });
  };
  bindList();

  $('#articleSearch')?.addEventListener('input', () => {
    const q = ($('#articleSearch')?.value || '').toLowerCase();
    const visible = articles.filter(a => !q || [a.title,a.sidebarId,a.summary,a.type].join(' ').toLowerCase().includes(q));
    $('#articleList').innerHTML = articleList(visible, active?.id);
    bindList();
  });

  $('#addArticle')?.addEventListener('click', () => {
    const next = cloneData(data);
    next.articles = Array.isArray(next.articles) ? next.articles : [];
    const article = {
      id: `article-${Date.now()}`,
      title: 'Bài viết mới',
      sidebarId: '',
      route: '',
      type: 'category-article',
      status: 'draft',
      summary: 'Nhập mô tả bài viết.',
      cards: []
    };
    next.articles.unshift(article);
    sessionStorage.setItem('fti_active_article_id', article.id);
    saveCms(next);
    toast('Đã tạo bài viết mới.');
    renderCms(next, 'articles');
  });

  $('#saveArticle')?.addEventListener('click', () => {
    if(!active) return;
    const updated = collectArticle(active);
    const next = cloneData(data);
    next.articles = next.articles.map(a => a.id === active.id ? updated : a);
    next.meta = next.meta || {};
    next.meta.version = 'v9.8.2';
    next.meta.updatedAt = new Date().toISOString().slice(0,10);
    sessionStorage.setItem('fti_active_article_id', updated.id);
    saveCms(next);
    toast('Đã lưu bài viết.');
    renderCms(next, 'articles');
  });

  $('#deleteArticle')?.addEventListener('click', () => {
    if(!active || !confirm('Xóa bài viết này?')) return;
    const next = cloneData(data);
    next.articles = next.articles.filter(a => a.id !== active.id);
    sessionStorage.setItem('fti_active_article_id', next.articles[0]?.id || '');
    saveCms(next);
    toast('Đã xóa bài viết.');
    renderCms(next, 'articles');
  });

  $('#duplicateArticle')?.addEventListener('click', () => {
    if(!active) return;
    const next = cloneData(data);
    const clone = {...collectArticle(active), id: `${active.id}-copy-${Date.now()}`, title: `${active.title} Copy`, status:'draft'};
    next.articles.unshift(clone);
    sessionStorage.setItem('fti_active_article_id', clone.id);
    saveCms(next);
    toast('Đã nhân bản bài viết.');
    renderCms(next, 'articles');
  });

  $('#addArticleCard')?.addEventListener('click', () => {
    if(!active) return;
    const next = cloneData(data);
    const idx = next.articles.findIndex(a => a.id === active.id);
    const current = collectArticle(active);
    current.cards.push({title:'Card mới',summary:'Mô tả',url:''});
    next.articles[idx] = current;
    renderCms(next, 'articles');
  });

  $$('[data-remove-card]').forEach(btn => btn.onclick = () => {
    if(!active) return;
    const next = cloneData(data);
    const idx = next.articles.findIndex(a => a.id === active.id);
    const current = collectArticle(active);
    current.cards.splice(Number(btn.dataset.removeCard),1);
    next.articles[idx] = current;
    renderCms(next, 'articles');
  });
}
