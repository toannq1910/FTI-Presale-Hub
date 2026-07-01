/* v9.4.0 CMS Preview */
import { esc } from './cms-core.js';

export function renderPreview(data, description = ''){
  const product = (data.products || [])[0] || {};
  return `<section class="cms-module-intro">
      <span class="eyebrow">Preview</span>
      <h2>Kiểm tra nhanh dữ liệu CMS</h2>
      <p>${esc(description || 'Xem nhanh dữ liệu hiện có trong CMS để kiểm tra tổng quan trước khi chỉnh sửa.')}</p>
    </section>
    <div class="cms-summary">
      <span><b>${data.products?.length||0}</b><small>Products</small></span>
      <span><b>${data.assets?.length||0}</b><small>CMS Assets</small></span>
      <span><b>${data.faqs?.length||0}</b><small>FAQ</small></span>
      <span><b>${data.pricingPlans?.length||0}</b><small>Pricing</small></span>
    </div>
    <h3>Sản phẩm</h3>
    <article class="cms-card">
      <div class="cms-card-head"><div class="cms-icon">☎️</div><div><h3>${esc(product.title)}</h3><small>${esc(product.subtitle||product.category||'')}</small></div></div>
      <p>${esc(product.summary||'')}</p>
      <div class="cms-tags">${(product.tags||[]).map(t=>`<span>${esc(t)}</span>`).join('')}</div>
      <div class="cms-grid">${(product.highlights||[]).map(x=>`<span>✓ ${esc(x)}</span>`).join('')}</div>
    </article>
    <h3>FAQ</h3>
    <div class="cms-faq">${(data.faqs||[]).map((f,i)=>`<details ${i===0?'open':''}><summary>${esc(f.question)}</summary><p>${esc(f.answer)}</p></details>`).join('')}</div>`;
}
