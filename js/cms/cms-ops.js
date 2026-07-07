/* v9.8.3 Operational Guide Mode */
import { esc } from './cms-core.js';

function renderStepList(steps = []){
  return `<ol>${steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>`;
}

// CMS sub-tab switching is driven entirely by JS (data-cms-tab click handlers in
// cms-app.js), not by the URL hash. Every guide entry's "route" is just the outer
// "#cms" page, so a plain <a href="#cms"> can never select the right inner tab
// (and does nothing at all when you're already on #cms). This map translates the
// human-readable module name into the actual CMS tab key so the button can jump
// straight to the right module.
const MODULE_TAB_MAP = {
  'Product Manager': 'products',
  'Asset Manager': 'assets',
  'Knowledge Graph': 'graph',
  'CMS Articles': 'articles',
  'Backup / Restore': 'backup'
};

function moduleTab(moduleName = ''){
  return MODULE_TAB_MAP[moduleName] || '';
}

export function renderOperationalGuide(data){
  const items = data.operationalGuide || [];
  return `<section class="ops-hero">
    <div>
      <span class="eyebrow">🧭 Operational Guide</span>
      <h2>Cách vận hành CMS</h2>
      <p>Muốn sửa nội dung gì thì vào đúng module bên dưới. Đây là hướng dẫn vận hành ngắn gọn cho admin/presales.</p>
    </div>
  </section>

  <section class="ops-grid">
    ${items.map(item => `<article class="ops-card">
      <div class="ops-card-head">
        <div class="ops-icon">⚙️</div>
        <div>
          <h3>${esc(item.task)}</h3>
          <span>${esc(item.module)} · ${esc(item.route)}</span>
        </div>
      </div>
      ${renderStepList(item.steps)}
      <button type="button" class="btn btn-soft" data-ops-tab="${esc(moduleTab(item.module))}">Mở module</button>
    </article>`).join('')}
  </section>

  <section class="ops-decision">
    <h3>Quy tắc vận hành</h3>
    <div class="ops-rule-grid">
      <span><b>Product</b> → Product Manager</span>
      <span><b>PDF / Video / Image</b> → Asset Manager</span>
      <span><b>API / Integration / Competitor</b> → Knowledge Graph</span>
      <span><b>Sidebar cũ</b> → CMS Articles</span>
      <span><b>Backup</b> → Backup / Restore</span>
      <span><b>Publish GitHub</b> → Export JSON + Commit</span>
    </div>
  </section>`;
}

export function bindOperationalGuide(data, renderCms){
  document.querySelectorAll('[data-ops-tab]').forEach(btn => {
    btn.onclick = () => {
      const tab = btn.dataset.opsTab;
      if(tab) renderCms(data, tab);
    };
  });
}
