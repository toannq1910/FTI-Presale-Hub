/* v9.4.0 Unified Product CMS bridge */
import { loadCms, saveCms, toast, esc } from './cms/cms-core.js';
import { renderAssetManager, bindAssetManager } from './cms/cms-assets.js';

function isProductCenter(){ return location.hash === '#oncallcx-product-center'; }

async function injectUnifiedCms(){
  if(!isProductCenter()) return;
  const root = document.querySelector('#pageRoot');
  if(!root || document.querySelector('#unifiedProductCms')) return;
  const cms = await loadCms();
  const product = cms.products?.[0] || {};
  const zone = document.createElement('section');
  zone.id = 'unifiedProductCms';
  zone.className = 'unified-product-cms';
  zone.innerHTML = `<div class="unified-head">
    <div><span class="eyebrow">🧩 Unified Product CMS</span><h2>Quản trị OnCallCX ngay trong Product Center</h2><p>Admin có thể quản lý nội dung và asset mà không rời khỏi sidebar OnCallCX.</p></div>
    <a class="btn btn-soft" href="#cms">Mở CMS đầy đủ</a>
  </div>
  <div class="unified-tabs">
    <button class="active" data-unified-tab="content">Content</button>
    <button data-unified-tab="assets">Asset Manager</button>
  </div>
  <div class="unified-panel active" id="unified-content">
    <div class="cms-form-card">
      <h3>${esc(product.title || 'OncallCX')}</h3>
      <p>${esc(product.summary || '')}</p>
      <div class="cms-tags">${(product.tags||[]).map(t=>`<span>${esc(t)}</span>`).join('')}</div>
      <a class="btn btn-primary" href="#cms">Chỉnh sửa nội dung trong CMS</a>
    </div>
  </div>
  <div class="unified-panel" id="unified-assets">${renderAssetManager(cms)}</div>`;
  root.appendChild(zone);

  zone.querySelectorAll('[data-unified-tab]').forEach(btn=>{
    btn.onclick=()=>{
      zone.querySelectorAll('[data-unified-tab]').forEach(x=>x.classList.remove('active'));
      btn.classList.add('active');
      zone.querySelectorAll('.unified-panel').forEach(x=>x.classList.remove('active'));
      zone.querySelector(`#unified-${btn.dataset.unifiedTab}`).classList.add('active');
      if(btn.dataset.unifiedTab === 'assets') bindAssetManager(cms);
    };
  });
}
window.addEventListener('hashchange',()=>setTimeout(injectUnifiedCms,150));
window.addEventListener('DOMContentLoaded',()=>setTimeout(injectUnifiedCms,250));
