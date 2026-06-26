/* v9.5.1 CMS App Orchestrator - hotfix */
import { $, $$, esc, loadCms, saveCms, resetCms, toast } from './cms-core.js';
import { downloadJson } from './cms-io.js';
import { renderPreview } from './cms-preview.js';
import { visualEditor, bindVisualEditor } from './cms-editor.js';
import { renderBackupPanel, bindBackupPanel } from './cms-backup.js';
import { renderAssetManager, bindAssetManager } from './cms-assets.js';
import { renderProductManager, bindProductManager } from './cms-products.js';
import { renderKnowledgeGraphManager, bindKnowledgeGraphManager } from './cms-graph.js';
import { renderSidebarAlignment, bindSidebarAlignment } from './cms-sidebar.js';
import { renderOperationalGuide } from './cms-ops.js';
import { renderCmsArticles, bindCmsArticles } from './cms-articles.js';
import { renderPageBuilder, bindPageBuilder } from './cms-page-builder.js';

let currentCms = null;

function renderJsonEditor(data){
  return `<div class="cms-editor-layout">
    <aside class="cms-info">
      <h3>Thông tin</h3>
      <p><b>Version:</b> ${esc(data.meta?.version || 'N/A')}</p>
      <p><b>Updated:</b> ${esc(data.meta?.updatedAt || 'N/A')}</p>
      <small>Sau khi chỉnh JSON: bấm <b>Lưu Local</b> để test. Khi muốn đưa lên GitHub: bấm <b>Export JSON</b>.</small>
    </aside>
    <main class="cms-json-wrap">
      <textarea id="cmsJson">${JSON.stringify(data, null, 2)}</textarea>
    </main>
  </div>`;
}

function renderGuide(){
  return `<div class="cms-guide">
    <h3>Quy trình cập nhật CMS</h3>
    <ol>
      <li>Sửa nội dung trong Visual Editor, Product Manager hoặc JSON Editor.</li>
      <li>Bấm Lưu Local để test.</li>
      <li>Export JSON hoặc Backup.</li>
      <li>Thay file <code>data/cms-content.json</code>.</li>
      <li>Commit và push GitHub.</li>
    </ol>
    <pre>git checkout develop
git add .
git commit -m "Update CMS"
git push origin develop</pre>
  </div>`;
}

export function renderCms(data, activeTab = 'preview'){
  currentCms = data;
  const root = $('#pageRoot');
  if(!root) return;

  const title = $('#pageTitle');
  const subtitle = $('#pageSubtitle');
  if(title) title.textContent = 'CMS Data';
  if(subtitle) subtitle.textContent = 'Page Builder Runtime · v9.9.1';

  root.innerHTML = `<section class="cms-hero">
    <div>
      <span class="eyebrow">🧩 Unified Product CMS v9.9.1</span>
      <h2>CMS dữ liệu Portal</h2>
      <p>CMS quản trị nội dung, bài viết, sản phẩm, tài liệu, knowledge graph và Page Builder.</p>
    </div>
    <div class="cms-actions">
      <button class="btn btn-primary" id="cmsSave">Lưu Local</button>
      <button class="btn btn-soft" id="cmsExport">Export JSON</button>
      <button class="btn btn-danger" id="cmsReset">Reset</button>
    </div>
  </section>

  <section class="cms-tabs">
    <button class="${activeTab === 'preview' ? 'active' : ''}" data-cms-tab="preview">Preview</button>
    <button class="${activeTab === 'ops' ? 'active' : ''}" data-cms-tab="ops">Operational Guide</button>
    <button class="${activeTab === 'builder' ? 'active' : ''}" data-cms-tab="builder">Page Builder</button>
    <button class="${activeTab === 'visual' ? 'active' : ''}" data-cms-tab="visual">Visual Editor</button>
    <button class="${activeTab === 'products' ? 'active' : ''}" data-cms-tab="products">Product Manager</button>
    <button class="${activeTab === 'graph' ? 'active' : ''}" data-cms-tab="graph">Knowledge Graph</button>
    <button class="${activeTab === 'sidebar' ? 'active' : ''}" data-cms-tab="sidebar">Sidebar Alignment</button>
    <button class="${activeTab === 'articles' ? 'active' : ''}" data-cms-tab="articles">CMS Articles</button>
    <button class="${activeTab === 'editor' ? 'active' : ''}" data-cms-tab="editor">JSON Editor</button>
    <button class="${activeTab === 'backup' ? 'active' : ''}" data-cms-tab="backup">Backup / Restore</button>
    <button class="${activeTab === 'assets' ? 'active' : ''}" data-cms-tab="assets">Asset Manager</button>
    <button class="${activeTab === 'guide' ? 'active' : ''}" data-cms-tab="guide">Hướng dẫn</button>
  </section>

  <section class="cms-panel ${activeTab === 'preview' ? 'active' : ''}" id="cms-preview">${renderPreview(data)}</section>
  <section class="cms-panel ${activeTab === 'ops' ? 'active' : ''}" id="cms-ops">${renderOperationalGuide(data)}</section>
  <section class="cms-panel ${activeTab === 'builder' ? 'active' : ''}" id="cms-builder">${renderPageBuilder(data)}</section>
  <section class="cms-panel ${activeTab === 'visual' ? 'active' : ''}" id="cms-visual">${visualEditor(data)}</section>
  <section class="cms-panel ${activeTab === 'products' ? 'active' : ''}" id="cms-products">${renderProductManager(data)}</section>
  <section class="cms-panel ${activeTab === 'graph' ? 'active' : ''}" id="cms-graph">${renderKnowledgeGraphManager(data)}</section>
  <section class="cms-panel ${activeTab === 'sidebar' ? 'active' : ''}" id="cms-sidebar">${renderSidebarAlignment(data)}</section>
  <section class="cms-panel ${activeTab === 'articles' ? 'active' : ''}" id="cms-articles">${renderCmsArticles(data)}</section>
  <section class="cms-panel ${activeTab === 'editor' ? 'active' : ''}" id="cms-editor">${renderJsonEditor(data)}</section>
  <section class="cms-panel ${activeTab === 'backup' ? 'active' : ''}" id="cms-backup">${renderBackupPanel()}</section>
  <section class="cms-panel ${activeTab === 'assets' ? 'active' : ''}" id="cms-assets">${renderAssetManager(data)}</section>
  <section class="cms-panel ${activeTab === 'guide' ? 'active' : ''}" id="cms-guide">${renderGuide()}</section>`;

  bindCms();
}

function bindCms(){
  $$('[data-cms-tab]').forEach(btn => {
    btn.onclick = () => {
      $$('[data-cms-tab]').forEach(x => x.classList.remove('active'));
      btn.classList.add('active');
      $$('.cms-panel').forEach(x => x.classList.remove('active'));
      const panel = $(`#cms-${btn.dataset.cmsTab}`);
      if(panel) panel.classList.add('active');
      if(btn.dataset.cmsTab === 'assets') bindAssetManager(currentCms);
      if(btn.dataset.cmsTab === 'products') bindProductManager(currentCms, renderCms);
  bindKnowledgeGraphManager(currentCms, renderCms);
  bindSidebarAlignment(currentCms, renderCms);
  bindCmsArticles(currentCms, renderCms);
  bindPageBuilder(currentCms, renderCms);
    };
  });

  const saveBtn = $('#cmsSave');
  if(saveBtn){
    saveBtn.onclick = () => {
      const editor = $('#cmsJson');
      try{
        const next = editor ? JSON.parse(editor.value) : currentCms;
        saveCms(next);
        toast('Đã lưu CMS vào LocalStorage.');
        renderCms(next, 'preview');
      }catch(err){
        toast('JSON không hợp lệ.');
      }
    };
  }

  const exportBtn = $('#cmsExport');
  if(exportBtn){
    exportBtn.onclick = () => {
      const editor = $('#cmsJson');
      try{
        downloadJson(editor ? JSON.parse(editor.value) : currentCms);
      }catch(err){
        toast('JSON không hợp lệ.');
      }
    };
  }

  const resetBtn = $('#cmsReset');
  if(resetBtn){
    resetBtn.onclick = () => {
      if(confirm('Reset dữ liệu CMS local?')){
        resetCms();
        location.reload();
      }
    };
  }

  bindVisualEditor(currentCms, renderCms);
  bindProductManager(currentCms, renderCms);
  bindKnowledgeGraphManager(currentCms, renderCms);
  bindSidebarAlignment(currentCms, renderCms);
  bindCmsArticles(currentCms, renderCms);
  bindPageBuilder(currentCms, renderCms);
  bindBackupPanel(currentCms, renderCms);
  if($('#cms-assets')?.classList.contains('active')) bindAssetManager(currentCms);
}

export async function openCms(){
  try{
    const data = await loadCms();
    renderCms(data);
  }catch(err){
    console.error(err);
    toast('Không tải được CMS data.');
  }
}

export function ensureCmsMenu(){
  if(document.querySelector('[data-go-cms]')) return;
  const nav = document.querySelector('.sidebar-nav') || document.querySelector('nav');
  if(!nav) return;
  const a = document.createElement('a');
  a.href = '#cms';
  a.className = 'nav-item';
  a.dataset.goCms = 'true';
  a.innerHTML = '<b>🧩 CMS Data</b><em>CMS</em>';
  nav.appendChild(a);
}
