/* v10.8.2 Unified CMS App */
import { $, $$, loadCms, toast } from './cms-core.js';
import { downloadJson } from './cms-io.js';
import { renderPreview } from './cms-preview.js';
import { renderBackupPanel, bindBackupPanel } from './cms-backup.js';
import { renderAssetManager, bindAssetManager } from './cms-assets.js?v=20260701-4';
import { renderProductManager, bindProductManager } from './cms-products.js';
import { renderKnowledgeGraphManager, bindKnowledgeGraphManager } from './cms-graph.js?v=20260701-5';
import { renderCmsArticles, bindCmsArticles } from './cms-articles.js?v=20260701-5';
import { renderOperationalGuide, bindOperationalGuide } from './cms-ops.js?v=20260701-5';
import { renderSidebarIconManager, bindSidebarIconManager, applySidebarIcons } from './cms-sidebar-icons.js?v=20260701-5';

let currentCms = null;

const CMS_TABS = new Set(['preview','articles','products','graph','assets','icons','ops','backup']);
const MODULE_DESCRIPTIONS = {
  preview: 'Xem nhanh dữ liệu hiện có trong CMS để kiểm tra tổng quan trước khi chỉnh sửa. Module này không tạo, sửa hoặc xóa nội dung.',
  articles: 'Nơi quản lý tất cả bài viết và card hiển thị ngoài portal. Khi tạo bài viết mới, dùng Route hoặc URL card để quyết định nội dung sẽ mở ở trang nào.',
  products: 'Quản lý hồ sơ sản phẩm/đối thủ dạng có cấu trúc (Vendor, Category, Score, Highlights, Use case). Đây KHÔNG phải danh sách toàn bộ bài viết — bài viết và card ngoài portal được quản lý riêng ở tab CMS Articles.',
  graph: 'Quản lý các dữ liệu kỹ thuật gắn với sản phẩm như API link, integration note, competitor và knowledge section.',
  assets: 'Upload và gắn file theo sản phẩm: Presentation, User Guide, Datasheet, Demo Video, Image, API Spec (PDF/JSON/YAML), Case Study. Presentation và tài liệu hướng dẫn sử dụng đều upload tại đây.',
  icons: 'Đổi icon (emoji) hiển thị cho từng mục và từng nhóm trong menu bên trái (sidebar).',
  ops: 'Hướng dẫn vận hành CMS dành cho admin/presales — nên vào module nào để sửa nội dung gì.',
  backup: 'Xuất hoặc nhập lại file JSON CMS để sao lưu dữ liệu và chuyển dữ liệu giữa các máy/trình duyệt.'
};

function moduleDescription(tab){
  return MODULE_DESCRIPTIONS[tab] || '';
}

export function renderCms(data, activeTab = 'preview'){
  if(!CMS_TABS.has(activeTab)) activeTab = 'preview';
  currentCms = data;
  // Keep the real (left-hand) sidebar in sync with whatever's saved every
  // time the CMS renders — not just when the Sidebar Icons tab itself is
  // opened/saved — so a stray failure in the page-load-time apply call
  // elsewhere can't leave the real sidebar out of sync while the CMS admin
  // view itself still shows the correct data.
  applySidebarIcons(data.sidebarIcons);
  const root = $('#pageRoot');
  if(!root) return;

  const title = $('#pageTitle');
  const subtitle = $('#pageSubtitle');
  if(title) title.textContent = 'CMS Data';
  if(subtitle) subtitle.textContent = 'Unified CMS Data · Products · Articles · Assets';

  root.innerHTML = `<section class="cms-hero">
    <div>
      <span class="eyebrow">🧩 Unified CMS v10.8.2</span>
      <h2>CMS dữ liệu Portal</h2>
      <p>Một nơi quản trị dữ liệu thật. Bài viết và card hiển thị ngoài portal được quản lý tại CMS Articles.</p>
    </div>
    <div class="cms-actions">
      <button class="btn btn-soft" id="cmsExport">Export JSON</button>
    </div>
  </section>

  <section class="cms-tabs">
    <button class="${activeTab === 'preview' ? 'active' : ''}" data-cms-tab="preview">Preview</button>
    <button class="${activeTab === 'articles' ? 'active' : ''}" data-cms-tab="articles">CMS Articles</button>
    <button class="${activeTab === 'products' ? 'active' : ''}" data-cms-tab="products">Product Data</button>
    <button class="${activeTab === 'graph' ? 'active' : ''}" data-cms-tab="graph">API / Knowledge</button>
    <button class="${activeTab === 'assets' ? 'active' : ''}" data-cms-tab="assets">Asset Manager</button>
    <button class="${activeTab === 'icons' ? 'active' : ''}" data-cms-tab="icons">Sidebar Icons</button>
    <button class="${activeTab === 'ops' ? 'active' : ''}" data-cms-tab="ops">Operational Guide</button>
    <button class="${activeTab === 'backup' ? 'active' : ''}" data-cms-tab="backup">Backup / Restore</button>
  </section>

  <section class="cms-panel ${activeTab === 'preview' ? 'active' : ''}" id="cms-preview">${renderPreview(data, moduleDescription('preview'))}</section>
  <section class="cms-panel ${activeTab === 'articles' ? 'active' : ''}" id="cms-articles">${renderCmsArticles(data, moduleDescription('articles'))}</section>
  <section class="cms-panel ${activeTab === 'products' ? 'active' : ''}" id="cms-products">${renderProductManager(data, moduleDescription('products'))}</section>
  <section class="cms-panel ${activeTab === 'graph' ? 'active' : ''}" id="cms-graph">${renderKnowledgeGraphManager(data, moduleDescription('graph'))}</section>
  <section class="cms-panel ${activeTab === 'assets' ? 'active' : ''}" id="cms-assets">${renderAssetManager(data, moduleDescription('assets'))}</section>
  <section class="cms-panel ${activeTab === 'icons' ? 'active' : ''}" id="cms-icons">${renderSidebarIconManager(data, moduleDescription('icons'))}</section>
  <section class="cms-panel ${activeTab === 'ops' ? 'active' : ''}" id="cms-ops">${renderOperationalGuide(data)}</section>
  <section class="cms-panel ${activeTab === 'backup' ? 'active' : ''}" id="cms-backup">${renderBackupPanel(moduleDescription('backup'))}</section>`;

  bindCms();
}

function bindCms(){
  $$('[data-cms-tab]').forEach(btn => {
    btn.onclick = () => {
      renderCms(currentCms, btn.dataset.cmsTab);
    };
  });

  const exportBtn = $('#cmsExport');
  if(exportBtn){
    exportBtn.onclick = () => {
      downloadJson(currentCms);
    };
  }

  bindActiveCmsPanel($('.cms-tabs .active')?.dataset.cmsTab || 'preview');
}

function bindActiveCmsPanel(activeTab){
  if(activeTab === 'products') bindProductManager(currentCms, renderCms);
  if(activeTab === 'articles') bindCmsArticles(currentCms, renderCms);
  if(activeTab === 'graph') bindKnowledgeGraphManager(currentCms, renderCms);
  if(activeTab === 'assets') bindAssetManager(currentCms);
  if(activeTab === 'icons') bindSidebarIconManager(currentCms, renderCms);
  if(activeTab === 'backup') bindBackupPanel(currentCms, renderCms);
  if(activeTab === 'ops') bindOperationalGuide(currentCms, renderCms);
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
  if(document.querySelector('[data-go-cms]') || document.querySelector('a[href="#cms"]')) return;
  const nav = document.querySelector('.sidebar-nav') || document.querySelector('nav');
  if(!nav) return;
  const a = document.createElement('a');
  a.href = '#cms';
  a.className = 'nav-item';
  a.dataset.goCms = 'true';
  a.innerHTML = '<b>🧩 CMS Data</b><em>CMS</em>';
  nav.appendChild(a);
}
