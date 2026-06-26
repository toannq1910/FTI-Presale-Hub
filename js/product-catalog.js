/* v9.5.1 Customer Product Catalog bridge - hotfix */
import { loadCms, esc } from './cms/cms-core.js';

function productCard(p){
  return `<article class="customer-product-card">
    <div class="customer-product-head">
      <div class="customer-product-avatar">${esc((p.title || '?').slice(0,2).toUpperCase())}</div>
      <div>
        <h3>${esc(p.title || 'Untitled')}</h3>
        <small>${esc(p.category || p.vendor || '')}</small>
      </div>
      ${p.score ? `<em>${esc(p.score)}</em>` : ''}
    </div>
    <p>${esc(p.summary || '')}</p>
    <div class="cms-tags">${(p.tags || []).slice(0,6).map(t => `<span>${esc(t)}</span>`).join('')}</div>
    <div class="customer-product-actions">
      <a class="btn btn-soft" href="#product-detail:${esc(p.id || '')}">Xem chi tiết</a>
      ${p.website ? `<a class="btn btn-soft" target="_blank" rel="noopener" href="${esc(p.website)}">Website</a>` : ''}
      <a class="btn btn-primary" href="#cms">Quản trị CMS</a>
    </div>
  </article>`;
}

async function injectCatalog(){
  const route = location.hash || '#overview';
  if(!['#overview','#oncallcx-product-center'].includes(route)) return;
  const root = document.querySelector('#pageRoot');
  if(!root || document.querySelector('#customerProductCatalog')) return;

  try{
    const cms = await loadCms();
    const products = cms.products || [];
    const zone = document.createElement('section');
    zone.id = 'customerProductCatalog';
    zone.className = 'customer-product-catalog';
    zone.innerHTML = `<div class="catalog-head">
      <div>
        <span class="eyebrow">🧭 Product Catalog</span>
        <h2>Danh mục sản phẩm từ CMS</h2>
        <p>Danh mục này được sinh từ dữ liệu trong Product Manager.</p>
      </div>
      <a class="btn btn-soft" href="#cms">Mở CMS</a>
    </div>
    <div class="customer-product-grid">${products.map(productCard).join('')}</div>`;
    root.appendChild(zone);
  }catch(err){
    console.warn('Product catalog load failed', err);
  }
}

window.addEventListener('hashchange', () => setTimeout(injectCatalog, 180));
window.addEventListener('DOMContentLoaded', () => setTimeout(injectCatalog, 350));
