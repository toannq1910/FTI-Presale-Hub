/* v9.6.0 Product Detail Pages */
import { loadCms, esc } from './cms/cms-core.js';
import { getProductAssets, assetObjectUrl, assetTypeLabel, formatBytes, assetIcon } from './cms/cms-assets.js?v=20260701-4';

function parseDetailRoute(){
  const hash = location.hash || '';
  if(!hash.startsWith('#product-detail')) return null;

  const raw = hash.replace('#product-detail', '').replace(/^[:/?#]+/, '');
  if(!raw) return 'oncallcx';

  const params = new URLSearchParams(raw.includes('=') ? raw : `id=${raw}`);
  return params.get('id') || params.get('product') || raw || 'oncallcx';
}

function getProduct(data, id){
  const products = data.products || [];
  return products.find(p => p.id === id) || products.find(p => p.id === 'oncallcx') || products[0] || null;
}

function tagList(tags = []){
  return tags.map(t => `<span>${esc(t)}</span>`).join('');
}

function bulletGrid(items = []){
  return items.map(x => `<span>✓ ${esc(x)}</span>`).join('');
}

function sectionBlocks(product){
  const sections = product.sections || [];
  return sections.map(s => `<article class="product-detail-section">
    <h3>${esc(s.title || 'Section')}</h3>
    <p>${esc(s.content || '')}</p>
  </article>`).join('');
}

function relatedLinks(product){
  const links = [];
  if(product.website){
    links.push(`<a class="btn btn-soft" target="_blank" rel="noopener" href="${esc(product.website)}">Website chính thức</a>`);
  }
  links.push(`<a class="btn btn-primary" href="#cms">Quản trị trong CMS</a>`);
  links.push(`<a class="btn btn-soft" href="#overview">← Quay lại tổng quan</a>`);
  return links.join('');
}


function integrationBlocks(product){
  const groups = product.integrations || [];
  if(!groups.length) return `<div class="cms-empty-state">Chưa có integration.</div>`;
  return groups.map(g => `<article class="kg-display-card">
    <h3>${esc(g.name || 'Integration')}</h3>
    <div class="cms-tags">${(g.items || []).map(x => `<span>${esc(x)}</span>`).join('')}</div>
  </article>`).join('');
}

function competitorBlocks(product){
  const competitors = product.competitors || [];
  if(!competitors.length) return `<div class="cms-empty-state">Chưa có competitor.</div>`;
  return competitors.map(c => `<article class="kg-display-card">
    <h3>${esc(c.name || 'Competitor')}</h3>
    <p><b>${esc(c.position || '')}</b></p>
    <p>${esc(c.note || '')}</p>
  </article>`).join('');
}

function apiBlocks(product){
  const apis = product.apiLinks || [];
  if(!apis.length) return `<div class="cms-empty-state">Chưa có API link.</div>`;
  return apis.map(a => `<article class="kg-api-card">
    <span>${esc(a.method || 'GET')}</span>
    <code>${esc(a.path || '')}</code>
    <b>${esc(a.name || '')}</b>
    <small>${esc(a.description || '')}</small>
  </article>`).join('');
}

function relationshipBlocks(product, data){
  const relationships = product.relationships || [];
  if(!relationships.length) return `<div class="cms-empty-state">Chưa có relationship.</div>`;
  return relationships.map(r => {
    const target = (data.products || []).find(p => p.id === r.target);
    return `<a class="kg-relation-card" href="#product-detail:${esc(r.target || '')}">
      <span>${esc(r.type || '')}</span>
      <b>${esc(target?.title || r.target || '')}</b>
      <small>${esc(r.label || '')}</small>
    </a>`;
  }).join('');
}

function knowledgeBlocks(product){
  const sections = product.knowledgeSections || [];
  if(!sections.length) return '';
  return sections.map(s => `<article class="product-detail-section">
    <h3>${esc(s.title || 'Knowledge')}</h3>
    <p>${esc(s.content || '')}</p>
  </article>`).join('');
}

function renderDetail(product, data){
  const root = document.querySelector('#pageRoot');
  if(!root || !product) return;

  const title = document.querySelector('#pageTitle');
  const subtitle = document.querySelector('#pageSubtitle');
  if(title) title.textContent = product.title || 'Product Detail';
  if(subtitle) subtitle.textContent = product.subtitle || product.category || 'Chi tiết sản phẩm';

  root.innerHTML = `<section class="product-detail-hero">
    <div>
      <span class="eyebrow">🧭 Product Detail</span>
      <h1>${esc(product.title || 'Untitled')}</h1>
      <p>${esc(product.summary || '')}</p>
      <div class="cms-tags">${tagList(product.tags || [])}</div>
      <div class="product-detail-actions">${relatedLinks(product)}</div>
    </div>
    <aside class="product-detail-score">
      <span>${esc(product.score || 'N/A')}</span>
      <small>${esc(product.status || 'draft')}</small>
    </aside>
  </section>

  <section class="product-detail-layout">
    <main class="product-detail-main">
      <section class="product-detail-card">
        <h2>Tính năng nổi bật</h2>
        <div class="cms-grid">${bulletGrid(product.highlights || [])}</div>
      </section>

      <section class="product-detail-card">
        <h2>Giá trị tư vấn</h2>
        <div class="cms-grid">${bulletGrid(product.businessValue || [])}</div>
      </section>

      <section class="product-detail-card">
        <h2>Phù hợp cho</h2>
        <div class="cms-tags large">${tagList(product.targetCustomers || product.useCases || [])}</div>
      </section>

      ${sectionBlocks(product)}
      ${knowledgeBlocks(product)}

      <section class="product-detail-card">
        <h2>Product Relationships</h2>
        <div class="kg-display-grid">${relationshipBlocks(product, data)}</div>
      </section>

      <section class="product-detail-card">
        <h2>Integration</h2>
        <div class="kg-display-grid">${integrationBlocks(product)}</div>
      </section>

      <section class="product-detail-card">
        <h2>API Links</h2>
        <div class="kg-api-list">${apiBlocks(product)}</div>
      </section>

      <section class="product-detail-card">
        <h2>Competitor</h2>
        <div class="kg-display-grid">${competitorBlocks(product)}</div>
      </section>

      <section class="product-detail-card">
        <h2>Tài liệu liên quan</h2>
        <div id="productRelatedAssets" class="product-related-assets">
          <div class="cms-empty-state">Đang tải tài liệu...</div>
        </div>
      </section>
    </main>

    <aside class="product-detail-aside">
      <div class="product-detail-mini">
        <h3>Thông tin nhanh</h3>
        <p><b>Vendor:</b> ${esc(product.vendor || 'N/A')}</p>
        <p><b>Category:</b> ${esc(product.category || 'N/A')}</p>
        <p><b>Status:</b> ${esc(product.status || 'N/A')}</p>
        <p><b>ID:</b> <code>${esc(product.id || '')}</code></p>
      </div>
      <div class="product-detail-mini">
        <h3>Liên kết</h3>
        <div class="product-detail-side-actions">${relatedLinks(product)}</div>
      </div>
    </aside>
  </section>`;
}


async function renderProductAssets(product){
  const root = document.querySelector('#productRelatedAssets');
  if(!root || !product?.id) return;

  try{
    const assets = await getProductAssets(product.id);
    if(!assets.length){
      root.innerHTML = `<div class="cms-empty-state">Chưa có tài liệu gắn với sản phẩm này.</div>`;
      return;
    }

    root.innerHTML = assets.map(a => `<article class="product-asset-card">
      <div class="asset-icon">${assetIcon(a.type)}</div>
      <div>
        <b>${esc(a.title || a.fileName)}</b>
        <span>${esc(assetTypeLabel(a.type))} · ${esc(a.fileName)} · ${formatBytes(a.size)}</span>
        ${a.description ? `<em>${esc(a.description)}</em>` : ''}
      </div>
      <div class="asset-actions">
        <button class="btn btn-soft" data-detail-asset-open="${a.id}">Xem</button>
        <button class="btn btn-soft" data-detail-asset-download="${a.id}">Tải</button>
      </div>
    </article>`).join('');

    document.querySelectorAll('[data-detail-asset-open]').forEach(btn => btn.onclick = async () => {
      const assets = await getProductAssets(product.id);
      const rec = assets.find(x => x.id === btn.dataset.detailAssetOpen);
      if(!rec) return;
      window.open(assetObjectUrl(rec), '_blank');
    });

    document.querySelectorAll('[data-detail-asset-download]').forEach(btn => btn.onclick = async () => {
      const assets = await getProductAssets(product.id);
      const rec = assets.find(x => x.id === btn.dataset.detailAssetDownload);
      if(!rec) return;
      const a = document.createElement('a');
      a.href = assetObjectUrl(rec);
      a.download = rec.fileName || rec.title || 'asset';
      a.click();
    });
  }catch(err){
    console.warn('Cannot load related assets', err);
    root.innerHTML = `<div class="cms-empty-state">Không tải được tài liệu liên quan.</div>`;
  }
}

export async function openProductDetail(){
  const id = parseDetailRoute();
  if(!id) return;
  try{
    const data = await loadCms();
    const product = getProduct(data, id);
    renderDetail(product, data);
    renderProductAssets(product);
  }catch(err){
    console.error('Cannot render product detail', err);
  }
}

window.addEventListener('hashchange', () => {
  if((location.hash || '').startsWith('#product-detail')) setTimeout(openProductDetail, 50);
});

window.addEventListener('DOMContentLoaded', () => {
  if((location.hash || '').startsWith('#product-detail')) setTimeout(openProductDetail, 120);
});
