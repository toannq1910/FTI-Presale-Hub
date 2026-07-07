/* v1.0.0 Sidebar Icon Manager */
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

export function currentSidebarIcons(data){
  return { ...DEFAULT_SIDEBAR_ICONS, ...(data.sidebarIcons || {}) };
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
    if(el) el.textContent = icon;
  });
}

export function renderSidebarIconManager(data, description = ''){
  const icons = currentSidebarIcons(data);
  return `<div class="cms-module-intro">${esc(description)}</div>
  <div class="ops-hero" style="margin-bottom:16px">
    <div>
      <h3 style="margin:0 0 6px">Icon Sidebar</h3>
      <p style="margin:0">Đổi emoji hiển thị cho từng mục menu bên trái. Xem trước ngay khi gõ, bấm <b>Lưu icon</b> để áp dụng vào sidebar và ghi vào dữ liệu CMS. Nhớ bấm <b>Export JSON</b> ở trên nếu muốn publish lên GitHub.</p>
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
          <span class="sidebar-icon-preview" data-icon-preview="${esc(key)}">${esc(icons[key] || '❔')}</span>
          <div class="sidebar-icon-meta">
            <b>${esc(label)}</b>
            <small>${esc(key)}</small>
          </div>
          <input type="text" maxlength="8" class="sidebar-icon-input" data-icon-input="${esc(key)}" value="${esc(icons[key] || '')}" placeholder="Dán emoji, ví dụ 🚀">
        </div>`).join('')}
      </div>
    </section>`).join('')}
  </div>`;
}

export function bindSidebarIconManager(data, renderCms){
  $$('[data-icon-input]').forEach(input => {
    input.oninput = () => {
      const key = input.dataset.iconInput;
      const preview = document.querySelector(`[data-icon-preview="${key}"]`);
      if(preview) preview.textContent = input.value.trim() || '❔';
    };
  });

  const resetBtn = $('#sidebarIconReset');
  if(resetBtn){
    resetBtn.onclick = () => {
      $$('[data-icon-input]').forEach(input => {
        const key = input.dataset.iconInput;
        input.value = DEFAULT_SIDEBAR_ICONS[key] || '';
        const preview = document.querySelector(`[data-icon-preview="${key}"]`);
        if(preview) preview.textContent = input.value || '❔';
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
      toast('Đã lưu icon sidebar.');
      renderCms(data, 'icons');
    };
  }
}
