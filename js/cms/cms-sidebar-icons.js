/* v3.0.0 Sidebar Icon Manager — emoji hoặc ảnh upload (nhúng base64 trực tiếp) */
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

const ACCEPTED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'svg', 'webp'];
const FILE_ACCEPT = 'image/png,image/jpeg,image/svg+xml,image/webp,.png,.jpg,.jpeg,.svg,.webp';
// Soft ceiling so admins get a heads-up before cms-content.json bloats — not
// a hard block, just a warning toast.
const SIZE_WARNING_BYTES = 150 * 1024;

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

// A value counts as an "image icon" (rendered as <img>) rather than emoji
// text if it's a data URI (uploaded image, embedded directly) or any
// http(s) URL (in case an admin pastes an external image link manually).
// Legacy '.png/.svg/...' relative paths from the old file-based approach are
// still recognized too, so anything saved before this version keeps working.
export function isImageIconValue(value = ''){
  return /^(https?:|data:image)/i.test(value) || /\.(png|jpe?g|svg|webp|gif)$/i.test(value);
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

function readFileAsDataUrl(file){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function renderSidebarIconManager(data, description = ''){
  const icons = currentSidebarIcons(data);
  return `<div class="cms-module-intro">${esc(description)}</div>
  <div class="ops-hero" style="margin-bottom:16px">
    <div>
      <h3 style="margin:0 0 6px">Icon Sidebar</h3>
      <p style="margin:0">Đổi icon cho từng mục menu bên trái bằng <b>emoji</b> hoặc <b>upload ảnh</b> (PNG/JPG/SVG/WebP). Ảnh được nhúng thẳng vào dữ liệu — upload xong bấm <b>Lưu icon</b> là áp dụng ngay, không cần tải file hay copy vào thư mục nào cả. Sau đó bấm <b>Export JSON</b> ở tab Backup rồi commit/push như bình thường để publish cho mọi người.</p>
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
      const preview = document.querySelector(`[data-icon-preview="${input.dataset.iconInput}"]`);
      if(preview) preview.innerHTML = iconMarkup(input.value.trim());
    };
  });

  $$('[data-icon-file]').forEach(fileInput => {
    fileInput.onchange = async () => {
      const key = fileInput.dataset.iconFile;
      const file = fileInput.files?.[0];
      if(!file) return;

      const ext = (file.name.split('.').pop() || '').toLowerCase();
      if(!ACCEPTED_EXTENSIONS.includes(ext)){
        toast('Chỉ chấp nhận file PNG, JPG, SVG hoặc WebP.');
        fileInput.value = '';
        return;
      }

      let dataUrl;
      try {
        dataUrl = await readFileAsDataUrl(file);
      } catch {
        toast('Không đọc được file ảnh, thử lại nhé.');
        return;
      }

      // Directly replace the row's value with the embedded image — no
      // separate download/copy-into-repo step needed anymore.
      const input = document.querySelector(`[data-icon-input="${key}"]`);
      if(input) input.value = dataUrl;

      const preview = document.querySelector(`[data-icon-preview="${key}"]`);
      if(preview) preview.innerHTML = `<img src="${dataUrl}" alt="">`;

      if(file.size > SIZE_WARNING_BYTES){
        toast(`Ảnh cho "${key}" khá nặng (${Math.round(file.size / 1024)}KB) — nên dùng ảnh nhỏ hơn để dữ liệu CMS không bị phình to.`);
      } else {
        toast(`Đã cập nhật ảnh cho "${key}". Bấm "Lưu icon" để áp dụng.`);
      }
    };
  });

  const resetBtn = $('#sidebarIconReset');
  if(resetBtn){
    resetBtn.onclick = () => {
      $$('[data-icon-input]').forEach(input => {
        const key = input.dataset.iconInput;
        input.value = DEFAULT_SIDEBAR_ICONS[key] || '';
        const preview = document.querySelector(`[data-icon-preview="${key}"]`);
        if(preview) preview.innerHTML = iconMarkup(input.value);
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
      applySidebarIcons(icons);
      toast('Đã lưu icon sidebar. Export JSON + commit để publish cho mọi người.');
      renderCms(data, 'icons');
    };
  }
}
