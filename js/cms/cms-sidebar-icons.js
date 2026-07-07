/* v2.0.0 Sidebar Icon Manager — emoji hoặc ảnh upload (PNG/JPG/SVG) */
import { $, $$, esc, toast, saveCms } from './cms-core.js';

// Fallback icons — must mirror the hardcoded defaults originally baked into
// index.html, so anything not yet customized still renders correctly.
export const DEFAULT_SIDEBAR_ICONS = {
  'overview': '🏠',
  'group-contact-center': '🎧',
  'oncallcx': '📞',
  'ccaas-vn': '🇻🇳',
  'ccaas-global': '☁️',
  'api-reference': '📗',
  'ucpbx-vn': '🏁',
  'group-video': '🎥',
  'video-conferencing': '📹',
  'vc-yealink': '🖥️',
  'vc-logitech': '📷',
  'vc-poly': '🎙️',
  'vc-cisco': '🗄️',
  'vc-jabra': '🎧',
  'vc-crestron': '🎛️',
  'vc-huddle-room': '👥',
  'vc-medium-large-room': '🏢',
  'group-integration': '🔌',
  'integration': '🔁',
  'crm': '🧩',
  'compliance': '🛡️',
  'group-demo': '🚀',
  'demo': '▶️',
  'compare': '📊',
  'resources': '📚',
  'cms': '🧩',
  'group-system': '🔐',
  'users': '👤',
  'permissions': '🛡️',
  'audit-log': '📜'
};

// Where uploaded icon files are expected to live once committed to the repo.
export const SIDEBAR_ICON_ASSET_DIR = 'assets/icons/sidebar';
const ACCEPTED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'svg'];
const FILE_ACCEPT = 'image/png,image/jpeg,image/svg+xml,.png,.jpg,.jpeg,.svg';

// Grouped purely for a readable admin UI — doesn't affect rendering logic.
const ICON_SECTIONS = [
  { title: 'Chung', items: [['overview', 'Tổng quan']] },
  { title: 'Contact Center', items: [
    ['group-contact-center', '(Icon nhóm) CONTACT CENTER'],
    ['oncallcx', 'OnCallCX'],
    ['ccaas-vn', 'CCaaS Việt Nam'],
    ['ccaas-global', 'CCaaS Global'],
    ['api-reference', 'API Reference'],
    ['ucpbx-vn', 'UC/PBX Việt Nam']
  ]},
  { title: 'Video Conference', items: [
    ['group-video', '(Icon nhóm) VIDEO CONFERENCE'],
    ['video-conferencing', 'Tổng quan Video Conference'],
    ['vc-yealink', 'Yealink Meeting Bar'],
    ['vc-logitech', 'Logitech Rally Bar'],
    ['vc-poly', 'HP Poly Studio X52'],
    ['vc-cisco', 'Cisco Webex Devices'],
    ['vc-jabra', 'Jabra PanaCast'],
    ['vc-crestron', 'Crestron Flex'],
    ['vc-huddle-room', 'Huddle Room'],
    ['vc-medium-large-room', 'Medium / Large Room']
  ]},
  { title: 'Integration', items: [
    ['group-integration', '(Icon nhóm) INTEGRATION'],
    ['integration', 'Integration Playbook'],
    ['crm', 'CRM/ERP Việt Nam'],
    ['compliance', 'Tuân thủ VN']
  ]},
  { title: 'Demo & Sales', items: [
    ['group-demo', '(Icon nhóm) DEMO & SALES'],
    ['demo', 'Demo sản phẩm'],
    ['compare', 'Bảng so sánh'],
    ['resources', 'Nguồn tài liệu'],
    ['cms', 'CMS Data']
  ]},
  { title: 'System & Security', items: [
    ['group-system', '(Icon nhóm) SYSTEM & SECURITY'],
    ['users', 'Quản lý User'],
    ['permissions', 'Phân quyền'],
    ['audit-log', 'Audit Log']
  ]}
];

// A value is treated as an "image icon" (path/URL) rather than emoji text if
// it points at a file — either a real path under assets/icons, or any
// http(s)/blob URL used for live preview before the file exists in the repo.
export function isImageIconValue(value = ''){
  return /\.(png|jpe?g|svg|webp|gif)$/i.test(value) || /^(https?:|blob:|data:image)/i.test(value);
}

export function currentSidebarIcons(data){
  return { ...DEFAULT_SIDEBAR_ICONS, ...(data.sidebarIcons || {}) };
}

function iconMarkup(value){
  if(!value) return '❔';
  return isImageIconValue(value) ? `<img src="${esc(value)}" alt="">` : esc(value);
}

// Writes icons straight into the live sidebar DOM. Nav items are matched via
// their existing [data-page] attribute; group headers via [data-icon-key]
// (added specifically so group headers — which have no data-page — stay
// targetable too).
export function applySidebarIcons(icons){
  const merged = { ...DEFAULT_SIDEBAR_ICONS, ...(icons || {}) };
  Object.entries(merged).forEach(([key, icon]) => {
    if(!icon) return;
    const el = key.startsWith('group-')
      ? document.querySelector(`.sidebar-nav [data-icon-key="${key}"] > span`)
      : document.querySelector(`.sidebar-nav [data-page="${key}"] > span`);
    if(!el) return;
    if(isImageIconValue(icon)){
      el.innerHTML = `<img src="${esc(icon)}" alt="" onerror="this.replaceWith(document.createTextNode('❔'))">`;
    } else {
      el.textContent = icon;
    }
  });
}

// Files chosen this session, keyed by icon key, kept only in memory so the
// "Tải file" button can hand the admin the exact bytes + suggested filename.
// Never sent anywhere — nothing here is persisted except the resulting path
// string once the admin clicks Lưu icon.
const pendingUploads = new Map();

function suggestedFileName(key, file){
  const ext = (file.name.split('.').pop() || 'png').toLowerCase();
  return `${key}.${ext}`;
}

function rowExtraMarkup(key){
  const pending = pendingUploads.get(key);
  if(!pending) return '';
  return `<div class="sidebar-icon-pending" data-icon-pending="${esc(key)}">
    <span>📁 ${esc(pending.fileName)}</span>
    <a href="${pending.objectUrl}" download="${esc(pending.fileName)}" class="btn btn-soft btn-xs">Tải file</a>
  </div>`;
}

export function renderSidebarIconManager(data, description = ''){
  const icons = currentSidebarIcons(data);
  return `<div class="cms-module-intro">${esc(description)}</div>
  <div class="ops-hero" style="margin-bottom:16px">
    <div>
      <h3 style="margin:0 0 6px">Icon Sidebar</h3>
      <p style="margin:0">Đổi icon cho từng mục menu bên trái bằng <b>emoji</b> hoặc <b>upload ảnh</b> (PNG/JPG/SVG). Sau khi upload, icon sẽ hiện ngay để xem trước. Bấm <b>Lưu icon</b> để ghi vào dữ liệu CMS, sau đó bấm nút <b>Tải file</b> ở mỗi icon vừa upload và copy các file đó vào thư mục <code>${esc(SIDEBAR_ICON_ASSET_DIR)}/</code> trong repo <u>trước khi</u> Export JSON &amp; commit — nếu không icon sẽ không hiện cho người khác.</p>
    </div>
    <div class="cms-actions">
      <button class="btn btn-soft" id="sidebarIconReset" type="button">Khôi phục mặc định</button>
      <button class="btn btn-primary" id="sidebarIconSave" type="button">Lưu icon</button>
    </div>
  </div>
  <div class="sidebar-icon-groups">
    ${ICON_SECTIONS.map(section => `<section class="sidebar-icon-section">
      <h4>${esc(section.title)}</h4>
      <div class="sidebar-icon-rows">
        ${section.items.map(([key, label]) => `<div class="sidebar-icon-row" data-icon-row="${esc(key)}">
          <span class="sidebar-icon-preview" data-icon-preview="${esc(key)}">${iconMarkup(icons[key])}</span>
          <div class="sidebar-icon-meta">
            <b>${esc(label)}</b>
            <small>${esc(key)}</small>
            <div data-icon-extra="${esc(key)}">${rowExtraMarkup(key)}</div>
          </div>
          <div class="sidebar-icon-controls">
            <input type="text" class="sidebar-icon-input" data-icon-input="${esc(key)}" value="${esc(icons[key] || '')}" placeholder="Emoji, vd 🚀">
            <label class="btn btn-soft btn-xs sidebar-icon-upload-btn">
              Upload ảnh
              <input type="file" hidden accept="${FILE_ACCEPT}" data-icon-file="${esc(key)}">
            </label>
          </div>
        </div>`).join('')}
      </div>
    </section>`).join('')}
  </div>`;
}

export function bindSidebarIconManager(data, renderCms){
  $$('[data-icon-input]').forEach(input => {
    input.oninput = () => {
      const key = input.dataset.iconInput;
      pendingUploads.delete(key); // manual emoji edit overrides any pending upload for this row
      const extra = document.querySelector(`[data-icon-extra="${key}"]`);
      if(extra) extra.innerHTML = '';
      const preview = document.querySelector(`[data-icon-preview="${key}"]`);
      if(preview) preview.innerHTML = iconMarkup(input.value.trim());
    };
  });

  $$('[data-icon-file]').forEach(fileInput => {
    fileInput.onchange = () => {
      const key = fileInput.dataset.iconFile;
      const file = fileInput.files?.[0];
      if(!file) return;

      const ext = (file.name.split('.').pop() || '').toLowerCase();
      if(!ACCEPTED_EXTENSIONS.includes(ext)){
        toast('Chỉ chấp nhận file PNG, JPG hoặc SVG.');
        fileInput.value = '';
        return;
      }

      const fileName = suggestedFileName(key, file);
      const path = `${SIDEBAR_ICON_ASSET_DIR}/${fileName}`;
      const objectUrl = URL.createObjectURL(file);
      pendingUploads.set(key, { file, fileName, path, objectUrl });

      const input = document.querySelector(`[data-icon-input="${key}"]`);
      if(input) input.value = path;

      const preview = document.querySelector(`[data-icon-preview="${key}"]`);
      if(preview) preview.innerHTML = `<img src="${objectUrl}" alt="">`;

      const extra = document.querySelector(`[data-icon-extra="${key}"]`);
      if(extra) extra.innerHTML = rowExtraMarkup(key);

      toast(`Đã chọn ảnh cho "${key}". Icon sẽ hiển thị ngay khi xem trước; nhớ tải file và thêm vào repo trước khi publish.`);
    };
  });

  const resetBtn = $('#sidebarIconReset');
  if(resetBtn){
    resetBtn.onclick = () => {
      pendingUploads.clear();
      $$('[data-icon-input]').forEach(input => {
        const key = input.dataset.iconInput;
        input.value = DEFAULT_SIDEBAR_ICONS[key] || '';
        const preview = document.querySelector(`[data-icon-preview="${key}"]`);
        if(preview) preview.innerHTML = iconMarkup(input.value);
        const extra = document.querySelector(`[data-icon-extra="${key}"]`);
        if(extra) extra.innerHTML = '';
      });
      toast('Đã khôi phục icon mặc định (chưa lưu).');
    };
  }

  const saveBtn = $('#sidebarIconSave');
  if(saveBtn){
    saveBtn.onclick = () => {
      const icons = {};
      $$('[data-icon-input]').forEach(input => {
        const value = input.value.trim();
        if(value) icons[input.dataset.iconInput] = value;
      });
      data.sidebarIcons = icons;
      saveCms(data);

      // Live-apply: emoji values apply immediately everywhere; image paths
      // that were just uploaded apply immediately too (via their in-memory
      // object URL) so the admin sees the real result right away, even
      // though the saved path won't resolve for other visitors until the
      // file is actually added to the repo.
      const liveIcons = { ...icons };
      pendingUploads.forEach((upload, key) => { liveIcons[key] = upload.objectUrl; });
      applySidebarIcons(liveIcons);

      const uploadCount = pendingUploads.size;
      toast(uploadCount
        ? `Đã lưu icon. Còn ${uploadCount} file ảnh cần tải về và thêm vào ${SIDEBAR_ICON_ASSET_DIR}/ trước khi publish.`
        : 'Đã lưu icon sidebar.');
      renderCms(data, 'icons');
    };
  }
}
