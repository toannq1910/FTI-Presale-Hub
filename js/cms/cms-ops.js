/* v9.8.2 Operational Guide Mode */
import { esc } from './cms-core.js';

function renderStepList(steps = []){
  return `<ol>${steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>`;
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
      <a class="btn btn-soft" href="${esc(item.route || '#cms')}">Mở module</a>
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
