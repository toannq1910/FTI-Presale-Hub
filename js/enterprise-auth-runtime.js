/* v10.8.0 Enterprise Authentication
   Client-side RBAC for static GitHub Pages/local portal.
   Note: this is UI-level authentication for a static portal, not server-side security.
*/
import { loadCms, saveCms, esc } from './cms/cms-core.js';

const AUTH_VERSION = 'v10.8.0';
const USERS_KEY = 'fti_auth_users';
const SESSION_KEY = 'fti_auth_session';
const AUDIT_KEY = 'fti_auth_audit';
const GROUPS_KEY = 'fti_auth_groups';
const CUSTOM_PERMISSIONS_KEY = 'fti_auth_custom_permissions';

const DEFAULT_PASSWORD = 'Admin!@#$%2020';

const ROLE_PERMISSIONS = {
  admin: {
    label: 'Admin',
    permissions: ['*'],
    description: 'Toàn quyền: user, role, CMS, product, document, API, audit, publish.'
  },
  editor: {
    label: 'Editor',
    permissions: [
      'cms.view','articles.view','articles.create','articles.update',
      'products.view','products.create','products.update',
      'assets.view','assets.create','assets.update',
      'documents.view','documents.create','documents.update',
      'api.view','api.update','knowledge.view','knowledge.update',
      'video.view','video.update','audit.view'
    ],
    description: 'Quản trị nội dung nhưng không quản lý user/role/system.'
  },
  viewer: {
    label: 'Viewer',
    permissions: [
      'cms.view','articles.view','products.view','assets.view',
      'documents.view','api.view','knowledge.view','video.view'
    ],
    description: 'Chỉ xem nội dung, không tạo/sửa/xóa/publish.'
  }
};

const MODULE_PERMISSIONS = [
  ['CMS','cms.view','cms.update','cms.publish'],
  ['Articles','articles.view','articles.create','articles.update','articles.delete','articles.publish'],
  ['Products','products.view','products.create','products.update','products.delete','products.publish'],
  ['Documents','documents.view','documents.create','documents.update','documents.delete','documents.publish'],
  ['Assets','assets.view','assets.create','assets.update','assets.delete'],
  ['API','api.view','api.create','api.update','api.delete'],
  ['Knowledge','knowledge.view','knowledge.create','knowledge.update','knowledge.delete'],
  ['Video Conference','video.view','video.create','video.update','video.delete'],
  ['Users','users.view','users.create','users.update','users.delete'],
  ['Roles','roles.view','roles.update'],
  ['Audit','audit.view']
];

const MODULE_ACCESS = [
  {id:'contact-center', label:'Contact Center', routes:['#oncallcx','#ccaas-vn','#ccaas-global','#api-reference','#ucpbx-vn'], permissions:['contact.view','contact.edit']},
  {id:'oncallcx', label:'Contact Center / OnCallCX', routes:['#oncallcx','#oncallcx-product-center-ccaas','#oncallcx-product-center-ucaas'], permissions:['oncallcx.view','oncallcx.edit']},
  {id:'oncallcx-ucaas', label:'Contact Center / OnCallCX / UCaaS', routes:['#oncallcx-product-center-ucaas'], permissions:['oncallcx.ucaas.view','oncallcx.ucaas.edit']},
  {id:'video-conference', label:'Video Conference', routes:['#video-conferencing','#vc-yealink','#vc-logitech','#vc-poly','#vc-cisco','#vc-jabra','#vc-crestron','#vc-huddle-room','#vc-medium-large-room'], permissions:['video.view','video.update']},
  {id:'integration', label:'Integration', routes:['#integration','#crm','#compliance'], permissions:['integration.view','integration.edit']},
  {id:'demo-sales', label:'Demo & Sales', routes:['#demo','#compare','#resources'], permissions:['demo.view','demo.edit']},
  {id:'cms-data', label:'CMS Data', routes:['#cms'], permissions:['cms.view','cms.update','cms.publish']},
  {id:'system-security', label:'System & Security', routes:['#users','#permissions','#audit-log'], permissions:['users.view','roles.view','audit.view']}
];

const ROUTE_PERMISSIONS = MODULE_ACCESS.reduce((acc,module)=>{
  module.routes.forEach(route=>{acc[route]=module.permissions[0]});
  return acc;
},{});

const DEFAULT_GROUPS = [
  {id:'group-admin', name:'Administrators', description:'Full system access.', permissions:['*'], modules:MODULE_ACCESS.map(m=>m.id)},
  {id:'group-video-viewer', name:'Video Viewers', description:'Only view Video Conference.', permissions:['video.view'], modules:['video-conference']},
  {id:'group-oncallcx-editor', name:'OnCallCX Editors', description:'Edit Contact Center / OnCallCX / UCaaS.', permissions:['contact.view','oncallcx.view','oncallcx.edit','oncallcx.ucaas.view','oncallcx.ucaas.edit','cms.view','articles.view','articles.update','products.view','products.update'], modules:['contact-center','oncallcx','oncallcx-ucaas','cms-data']},
  {id:'group-cms-editor', name:'CMS Editors', description:'Manage CMS content without system administration.', permissions:['cms.view','cms.update','articles.view','articles.create','articles.update','products.view','products.create','products.update','assets.view','assets.create','assets.update'], modules:['cms-data','contact-center','integration','demo-sales']}
];

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,'0')).join('');
}

async function passwordHash(username, password) {
  return sha256(`${username}::fti-auth::${password}`);
}

function now() { return new Date().toISOString(); }

function readUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
  catch { return []; }
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  syncUsersToCms(users).catch(()=>{});
}

function seedGroups(groups=[]){
  const byId = new Map(groups.map(g => [g.id, g]));
  DEFAULT_GROUPS.forEach(group => {
    if(!byId.has(group.id)) byId.set(group.id, {...group});
  });
  return Array.from(byId.values());
}

function readGroups() {
  try { return seedGroups(JSON.parse(localStorage.getItem(GROUPS_KEY) || '[]')); }
  catch { return seedGroups([]); }
}

function writeGroups(groups) {
  localStorage.setItem(GROUPS_KEY, JSON.stringify(seedGroups(groups)));
  syncAuthConfigToCms().catch(()=>{});
}

function readCustomPermissions() {
  try { return JSON.parse(localStorage.getItem(CUSTOM_PERMISSIONS_KEY) || '[]'); }
  catch { return []; }
}

function writeCustomPermissions(items) {
  localStorage.setItem(CUSTOM_PERMISSIONS_KEY, JSON.stringify(items));
  syncAuthConfigToCms().catch(()=>{});
}

function readAudit() {
  try { return JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]'); }
  catch { return []; }
}

function writeAudit(items) {
  localStorage.setItem(AUDIT_KEY, JSON.stringify(items.slice(-500)));
  syncAuditToCms(items.slice(-500)).catch(()=>{});
}

function addAudit(action, detail = {}) {
  const session = getSession();
  const items = readAudit();
  items.push({
    id: `audit-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    at: now(),
    actor: session?.username || 'anonymous',
    role: session?.role || 'guest',
    action,
    detail
  });
  writeAudit(items);
}

async function syncUsersToCms(users) {
  const cms = await loadCms().catch(()=>({}));
  cms.auth = cms.auth || {};
  cms.auth.version = AUTH_VERSION;
  cms.auth.roles = ROLE_PERMISSIONS;
  cms.auth.groups = readGroups();
  cms.auth.customPermissions = readCustomPermissions();
  cms.auth.moduleAccess = MODULE_ACCESS;
  cms.auth.users = users.map(({passwordHash, ...safe}) => safe);
  cms.auth.updatedAt = now();
  await saveCms(cms);
}

async function syncAuthConfigToCms() {
  const cms = await loadCms().catch(()=>({}));
  cms.auth = cms.auth || {};
  cms.auth.version = AUTH_VERSION;
  cms.auth.roles = ROLE_PERMISSIONS;
  cms.auth.groups = readGroups();
  cms.auth.customPermissions = readCustomPermissions();
  cms.auth.moduleAccess = MODULE_ACCESS;
  cms.auth.users = readUsers().map(({passwordHash, ...safe}) => safe);
  cms.auth.updatedAt = now();
  await saveCms(cms);
}

async function syncAuditToCms(audit) {
  const cms = await loadCms().catch(()=>({}));
  cms.auth = cms.auth || {};
  cms.auth.auditLogs = audit;
  cms.auth.updatedAt = now();
  await saveCms(cms);
}

async function ensureDefaultUsers() {
  const users = readUsers();
  if (!users.some(u => u.username === 'admin')) {
    users.push({
      id: 'user-admin',
      username: 'admin',
      displayName: 'Administrator',
      email: 'admin@local',
      role: 'admin',
      groupIds: ['group-admin'],
      status: 'active',
      createdAt: now(),
      updatedAt: now(),
      passwordHash: await passwordHash('admin', DEFAULT_PASSWORD)
    });
    writeUsers(users);
    addAudit('system.seed_admin', {username:'admin'});
  }
  let migrated = false;
  users.forEach(user => {
    if(Array.isArray(user.groupIds)) return;
    if(user.role === 'admin') user.groupIds = ['group-admin'];
    else if(user.role === 'editor') user.groupIds = ['group-cms-editor'];
    else user.groupIds = ['group-video-viewer'];
    migrated = true;
  });
  if(migrated) writeUsers(users);
  writeGroups(readGroups());
  return readUsers();
}

function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
  catch { return null; }
}

function setSession(session) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
  updateAuthUi();
}

function currentUser() {
  const session = getSession();
  if (!session) return null;
  const user = readUsers().find(u => u.username === session.username && u.status === 'active');
  if(!user) return null;
  const groups = readGroups().filter(group => (user.groupIds || []).includes(group.id));
  return {...user, groups, session};
}

function hasPermission(permission) {
  const user = currentUser();
  if (!user) return false;
  const role = ROLE_PERMISSIONS[user.role];
  const rolePermissions = role?.permissions || [];
  const groupPermissions = (user.groups || []).flatMap(group => group.permissions || []);
  const permissions = new Set([...rolePermissions, ...groupPermissions]);
  return permissions.has('*') || permissions.has(permission);
}

function requirePermission(permission) {
  if (hasPermission(permission)) return true;
  showToast(`Bạn không có quyền: ${permission}`, 'warning');
  return false;
}

function showToast(message, type='info') {
  const root = document.querySelector('#toastRoot');
  if (!root) {
    console.log(`[${type}] ${message}`);
    return;
  }
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  root.appendChild(el);
  setTimeout(()=>el.remove(), 3200);
}

function showLogin() {
  const overlay = document.querySelector('#loginOverlay');
  if (overlay) overlay.hidden = false;
}

function hideLogin() {
  const overlay = document.querySelector('#loginOverlay');
  if (overlay) overlay.hidden = true;
}

async function login(username, password) {
  await ensureDefaultUsers();
  username = String(username || '').trim();
  const users = readUsers();
  const user = users.find(u => u.username === username);
  if (!user) {
    addAudit('auth.login_failed', {username, reason:'not_found'});
    throw new Error('User không tồn tại');
  }
  if (user.status !== 'active') {
    addAudit('auth.login_failed', {username, reason:'locked'});
    throw new Error('User đang bị khóa');
  }
  const hash = await passwordHash(username, password);
  if (hash !== user.passwordHash) {
    addAudit('auth.login_failed', {username, reason:'wrong_password'});
    throw new Error('Sai mật khẩu');
  }
  const session = {
    username: user.username,
    displayName: user.displayName || user.username,
    role: user.role,
    groupIds: user.groupIds || [],
    loginAt: now(),
    expiresAt: new Date(Date.now() + 8*60*60*1000).toISOString()
  };
  setSession(session);
  addAudit('auth.login_success', {username, role:user.role, groupIds:user.groupIds || []});
  hideLogin();
  showToast(`Đã đăng nhập: ${user.displayName || user.username}`, 'success');
}

function logout() {
  const s = getSession();
  addAudit('auth.logout', {username:s?.username});
  setSession(null);
  showLogin();
}

function isSessionValid() {
  const s = getSession();
  if (!s) return false;
  if (new Date(s.expiresAt).getTime() < Date.now()) {
    addAudit('auth.session_expired', {username:s.username});
    setSession(null);
    return false;
  }
  return true;
}

function updateAuthUi() {
  const user = currentUser();
  const chip = document.querySelector('#permissionChip');
  if (chip) {
    chip.classList.toggle('login-on', !!user);
    chip.classList.toggle('login-off', !user);
    const groupLabel = user?.groups?.length ? user.groups.map(g => g.name).join(', ') : (ROLE_PERMISSIONS[user?.role]?.label || user?.role || '');
    chip.textContent = user ? `Login: ON · ${user.username} · ${groupLabel}` : 'Login: OFF';
  }
  const footerName = document.querySelector('.user-pill strong');
  const footerRole = document.querySelector('.user-pill span');
  if (footerName) footerName.textContent = user ? (user.displayName || user.username) : 'Guest';
  if (footerRole) footerRole.textContent = user ? (user.groups?.map(g => g.name).join(', ') || ROLE_PERMISSIONS[user.role]?.label || user.role) : 'Not signed in';

  document.querySelectorAll('[data-permission]').forEach(el => {
    const perm = el.getAttribute('data-permission');
    el.classList.toggle('auth-denied', !hasPermission(perm));
  });
  applyModuleVisibility();
}

function bindLoginForm() {
  const form = document.querySelector('#loginForm');
  if (!form || form.dataset.authBound) return;
  form.dataset.authBound = '1';
  form.onsubmit = null;
  form.addEventListener('submit', async evt => {
    evt.preventDefault();
    const username = document.querySelector('#loginEmail')?.value || '';
    const password = document.querySelector('#loginPassword')?.value || '';
    try { await login(username, password); }
    catch (err) { showToast(err.message || 'Đăng nhập thất bại', 'error'); }
  });

  const toggleBtn = document.querySelector('#loginPasswordToggle');
  const passwordInput = document.querySelector('#loginPassword');
  if (toggleBtn && passwordInput && !toggleBtn.dataset.bound) {
    toggleBtn.dataset.bound = '1';
    toggleBtn.addEventListener('click', () => {
      const showing = passwordInput.type === 'text';
      passwordInput.type = showing ? 'password' : 'text';
      toggleBtn.setAttribute('aria-pressed', String(!showing));
      toggleBtn.setAttribute('aria-label', showing ? 'Hiện mật khẩu' : 'Ẩn mật khẩu');
      toggleBtn.querySelector('.icon-eye').hidden = !showing;
      toggleBtn.querySelector('.icon-eye-off').hidden = showing;
    });
  }

  const logoutBtn = document.querySelector('#logoutBtn');
  if (logoutBtn) logoutBtn.onclick = null;
  logoutBtn?.addEventListener('click', evt => {
    evt.preventDefault();
    logout();
  });
}

function fixSidebarNavigation() {
  return;
  // Fix: sidebar links, especially VIDEO CONFERENCE, render with one click.
  const sidebar = document.querySelector('#sidebar');
  if (!sidebar || sidebar.dataset.singleClickFixed) return;
  sidebar.dataset.singleClickFixed = '1';

  sidebar.addEventListener('click', evt => {
    const groupHead = evt.target.closest('[data-toggle-group]');
    if (groupHead) {
      evt.preventDefault();
      const group = groupHead.closest('.nav-group');
      group?.classList.toggle('expanded');
      return;
    }

    const link = evt.target.closest('a.nav-item[href^="#"]');
    if (!link) return;

    const permission = link.getAttribute('data-permission');
    if (permission && !requirePermission(permission)) {
      evt.preventDefault();
      evt.stopPropagation();
      return;
    }

    const href = link.getAttribute('href');
    if (!href) return;

    evt.preventDefault();
    evt.stopPropagation();

    document.querySelectorAll('.nav-item').forEach(a => a.classList.remove('active'));
    link.classList.add('active');

    if (location.hash === href) {
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    } else {
      location.hash = href;
    }
  }, true);
}

function setActiveNav() {
  const hash = location.hash || '#overview';
  document.querySelectorAll('.nav-item').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === hash);
  });
  const active = document.querySelector(`.nav-item[href="${CSS.escape(hash)}"]`);
  active?.closest('.nav-group')?.classList.add('expanded');
}

function renderGuardedPage(message) {
  const root = document.querySelector('#pageRoot');
  if (!root) return;
  root.innerHTML = `<section class="auth-page-hero"><span class="eyebrow">🔐 Access Control</span><h2>Không có quyền truy cập</h2><p>${esc(message)}</p><a class="btn btn-soft" href="#overview">Quay lại Tổng quan</a></section>`;
}

function moduleForRoute(route=''){
  return MODULE_ACCESS.find(module => module.routes.includes(route)) || null;
}

function hasWildcardPermission(user=currentUser()){
  if(!user) return false;
  const rolePermissions = ROLE_PERMISSIONS[user.role]?.permissions || [];
  const groupPermissions = (user.groups || []).flatMap(group => group.permissions || []);
  return rolePermissions.includes('*') || groupPermissions.includes('*');
}

function canAccessRoute(route=''){
  const user = currentUser();
  if(!user) return true;
  if(hasWildcardPermission(user)) return true;
  const module = moduleForRoute(route);
  if(!module) return true;
  const hasModule = (user.groups || []).some(group => (group.modules || []).includes(module.id));
  const required = ROUTE_PERMISSIONS[route] || module.permissions?.[0];
  return hasModule && (!required || hasPermission(required));
}

function moveCmsDataIntoSystemSecurity(){
  const cmsLink = document.querySelector('a.nav-item[href="#cms"]');
  const systemGroup = Array.from(document.querySelectorAll('.nav-group')).find(g => (g.textContent || '').toUpperCase().includes('SYSTEM & SECURITY'));
  const body = systemGroup?.querySelector('.nav-group-body');
  if(cmsLink && body && cmsLink.parentElement !== body) body.insertBefore(cmsLink, body.firstChild);
}

function applyModuleVisibility(){
  moveCmsDataIntoSystemSecurity();
  const user = currentUser();
  const loggedIn = !!user;
  const wildcard = hasWildcardPermission(user);

  document.querySelectorAll('a.nav-item[href^="#"]').forEach(link => {
    const href = link.getAttribute('href') || '';
    const permission = link.getAttribute('data-permission');
    let visible = true;
    if(loggedIn && !wildcard){
      if(ROUTE_PERMISSIONS[href]) visible = canAccessRoute(href);
      if(permission && !hasPermission(permission)) visible = false;
    }
    if(!loggedIn && permission) visible = false;
    link.hidden = !visible;
  });

  document.querySelectorAll('.nav-group').forEach(group => {
    const body = group.querySelector('.nav-group-body');
    if(!body) return;
    const hasVisibleChild = Array.from(body.querySelectorAll('a.nav-item')).some(a => !a.hidden);
    group.hidden = !hasVisibleChild;
  });
}

function guardProtectedRoutes() {
  const h = location.hash || '#overview';
  const map = {
    '#users': 'users.view',
    '#permissions': 'roles.view',
    '#audit-log': 'audit.view',
    '#enterprise-cms': 'cms.view',
    '#cms': 'cms.view',
    '#cms-audit': 'audit.view'
  };
  const perm = map[h];
  const routePerm = ROUTE_PERMISSIONS[h];
  if (routePerm && currentUser() && !canAccessRoute(h)) {
    renderGuardedPage(`Route ${esc(h)} chua duoc bat trong group/module cua user hien tai.`);
    return false;
  }
  if (perm && !hasPermission(perm)) {
    renderGuardedPage(`Route ${esc(h)} yêu cầu quyền ${esc(perm)}.`);
    return false;
  }
  return true;
}

function renderUsersPage() {
  if (location.hash !== '#users') return;
  if (!requirePermission('users.view')) return renderGuardedPage('Bạn cần quyền users.view.');
  const root = document.querySelector('#pageRoot');
  if (!root) return;
  const users = readUsers();
  const canWrite = hasPermission('users.create') || hasPermission('users.update');
  document.querySelector('#pageTitle').textContent = 'Quản lý User';
  document.querySelector('#pageSubtitle').textContent = 'Enterprise Authentication · Users';

  root.innerHTML = `<section class="auth-page-hero">
    <span class="eyebrow">👤 User Management</span>
    <h2>Quản lý User</h2>
    <p>Tạo user, gán role, khóa/mở khóa và reset password. Dữ liệu user được lưu local và đồng bộ metadata vào CMS data.</p>
    ${canWrite ? `<form id="createUserForm" class="auth-form">
      <input name="username" placeholder="username" required>
      <input name="displayName" placeholder="Tên hiển thị" required>
      <input name="password" placeholder="Mật khẩu" type="password" required>
      <select name="role">${Object.entries(ROLE_PERMISSIONS).map(([k,v])=>`<option value="${esc(k)}">${esc(v.label)}</option>`).join('')}</select>
      <button class="btn btn-primary">+ Tạo user</button>
    </form>` : `<p><b>Read-only:</b> bạn không có quyền tạo/sửa user.</p>`}
  </section>
  <section class="auth-card">
    <h3>Danh sách User</h3>
    <table class="auth-table">
      <thead><tr><th>Username</th><th>Tên hiển thị</th><th>Role</th><th>Status</th><th>Created</th><th>Action</th></tr></thead>
      <tbody>${users.map(u => `<tr>
        <td>${esc(u.username)}</td><td>${esc(u.displayName || '')}</td>
        <td><span class="auth-badge">${esc(ROLE_PERMISSIONS[u.role]?.label || u.role)}</span></td>
        <td><span class="auth-badge ${u.status !== 'active' ? 'locked' : ''}">${esc(u.status)}</span></td>
        <td>${esc((u.createdAt || '').slice(0,10))}</td>
        <td>${u.username === 'admin' ? 'Default admin' : `<button class="btn btn-soft" data-toggle-user="${esc(u.username)}">${u.status === 'active' ? 'Lock' : 'Unlock'}</button> <button class="btn btn-soft" data-reset-user="${esc(u.username)}">Reset Pass</button>`}</td>
      </tr>`).join('')}</tbody>
    </table>
  </section>`;

  document.querySelector('#createUserForm')?.addEventListener('submit', async evt => {
    evt.preventDefault();
    if (!requirePermission('users.create')) return;
    const fd = new FormData(evt.currentTarget);
    const username = String(fd.get('username') || '').trim();
    const users = readUsers();
    if (users.some(u => u.username === username)) return showToast('Username đã tồn tại', 'warning');
    users.push({
      id: `user-${Date.now()}`,
      username,
      displayName: String(fd.get('displayName') || '').trim(),
      role: String(fd.get('role') || 'viewer'),
      status: 'active',
      createdAt: now(),
      updatedAt: now(),
      passwordHash: await passwordHash(username, String(fd.get('password') || ''))
    });
    writeUsers(users);
    addAudit('users.create', {username});
    showToast('Đã tạo user', 'success');
    renderUsersPage();
  });

  root.querySelectorAll('[data-toggle-user]').forEach(btn => btn.addEventListener('click', () => {
    if (!requirePermission('users.update')) return;
    const username = btn.getAttribute('data-toggle-user');
    const users = readUsers();
    const u = users.find(x => x.username === username);
    if (u) {
      u.status = u.status === 'active' ? 'locked' : 'active';
      u.updatedAt = now();
      writeUsers(users);
      addAudit('users.toggle_status', {username, status:u.status});
      renderUsersPage();
    }
  }));

  root.querySelectorAll('[data-reset-user]').forEach(btn => btn.addEventListener('click', async () => {
    if (!requirePermission('users.update')) return;
    const username = btn.getAttribute('data-reset-user');
    const newPass = prompt(`Nhập mật khẩu mới cho ${username}`);
    if (!newPass) return;
    const users = readUsers();
    const u = users.find(x => x.username === username);
    if (u) {
      u.passwordHash = await passwordHash(username, newPass);
      u.updatedAt = now();
      writeUsers(users);
      addAudit('users.reset_password', {username});
      showToast('Đã reset password', 'success');
    }
  }));
}

function renderPermissionsPage() {
  if (location.hash !== '#permissions') return;
  if (!requirePermission('roles.view')) return renderGuardedPage('Bạn cần quyền roles.view.');
  const root = document.querySelector('#pageRoot');
  if (!root) return;
  document.querySelector('#pageTitle').textContent = 'Phân quyền';
  document.querySelector('#pageSubtitle').textContent = 'Role-Based Access Control';
  const roleHeaders = Object.entries(ROLE_PERMISSIONS).map(([k,v]) => `<th>${esc(v.label)}</th>`).join('');
  root.innerHTML = `<section class="auth-page-hero">
    <span class="eyebrow">🛡️ RBAC</span>
    <h2>Phân quyền User</h2>
    <p>RBAC hiện có 3 role mặc định: Admin, Editor, Viewer. Quyền được áp dụng ở UI level cho portal tĩnh.</p>
  </section>
  <section class="auth-grid">
    ${Object.entries(ROLE_PERMISSIONS).map(([k,v]) => `<article class="auth-card"><h3>${esc(v.label)}</h3><p>${esc(v.description)}</p><p><span class="auth-badge">${esc(k)}</span></p></article>`).join('')}
  </section>
  <section class="auth-card" style="margin-top:18px">
    <h3>Permission Matrix</h3>
    <table class="auth-table"><thead><tr><th>Module / Permission</th>${roleHeaders}</tr></thead><tbody>
      ${MODULE_PERMISSIONS.flatMap(row => row.slice(1).map(perm => `<tr><td><b>${esc(row[0])}</b> · ${esc(perm)}</td>${Object.values(ROLE_PERMISSIONS).map(role => `<td>${role.permissions.includes('*') || role.permissions.includes(perm) ? '✅' : '—'}</td>`).join('')}</tr>`)).join('')}
    </tbody></table>
  </section>`;
}

function renderAuditPage() {
  if (location.hash !== '#audit-log') return;
  if (!requirePermission('audit.view')) return renderGuardedPage('Bạn cần quyền audit.view.');
  const root = document.querySelector('#pageRoot');
  if (!root) return;
  const logs = readAudit().slice().reverse();
  document.querySelector('#pageTitle').textContent = 'Audit Log';
  document.querySelector('#pageSubtitle').textContent = 'Authentication and CMS activity logs';
  root.innerHTML = `<section class="auth-page-hero">
    <span class="eyebrow">📜 Audit</span>
    <h2>Audit Log</h2>
    <p>Ghi nhận login/logout, tạo user, khóa user, reset password và các thao tác hệ thống liên quan authentication.</p>
  </section>
  <section class="auth-card">
    <table class="auth-table"><thead><tr><th>Time</th><th>Actor</th><th>Role</th><th>Action</th><th>Detail</th></tr></thead><tbody>
      ${logs.map(l => `<tr><td>${esc(l.at)}</td><td>${esc(l.actor)}</td><td>${esc(l.role)}</td><td>${esc(l.action)}</td><td><code>${esc(JSON.stringify(l.detail || {}))}</code></td></tr>`).join('')}
    </tbody></table>
  </section>`;
}

function allPermissionRows(){
  const custom = readCustomPermissions().map(p => ['Custom', p.id]);
  const moduleRows = MODULE_PERMISSIONS.flatMap(row => row.slice(1).map(perm => [row[0], perm]));
  const accessRows = MODULE_ACCESS.flatMap(module => module.permissions.map(perm => [module.label, perm]));
  const seen = new Set();
  return [...moduleRows, ...accessRows, ...custom].filter(([,perm]) => {
    if(seen.has(perm)) return false;
    seen.add(perm);
    return true;
  });
}

function renderUsersPageV2() {
  if (location.hash !== '#users') return;
  if (!requirePermission('users.view')) return renderGuardedPage('Bạn cần quyền users.view.');
  const root = document.querySelector('#pageRoot');
  if (!root) return;
  const users = readUsers();
  const groups = readGroups();
  const canWrite = hasPermission('users.create') || hasPermission('users.update');
  document.querySelector('#pageTitle').textContent = 'Quản lý User';
  document.querySelector('#pageSubtitle').textContent = 'User · Group assignment';

  root.innerHTML = `<section class="auth-page-hero">
    <span class="eyebrow">User Management</span>
    <h2>Quản lý User theo Group</h2>
    <p>Tạo user, gán user vào group và để group quyết định quyền xem/chỉnh sửa theo module.</p>
    ${canWrite ? `<form id="createUserFormV2" class="auth-form">
      <input name="username" placeholder="username" required>
      <input name="displayName" placeholder="Tên hiển thị" required>
      <input name="password" placeholder="Mật khẩu" type="password" required>
      <select name="role">${Object.entries(ROLE_PERMISSIONS).map(([k,v])=>`<option value="${esc(k)}">${esc(v.label)}</option>`).join('')}</select>
      <select name="groupId">${groups.map(g=>`<option value="${esc(g.id)}">${esc(g.name)}</option>`).join('')}</select>
      <button class="btn btn-primary">+ Tạo user</button>
    </form>` : `<p><b>Read-only:</b> bạn không có quyền tạo/sửa user.</p>`}
  </section>
  <section class="auth-card">
    <h3>Danh sách User</h3>
    <table class="auth-table"><thead><tr><th>User</th><th>Role</th><th>Group</th><th>Status</th><th>Action</th></tr></thead><tbody>
      ${users.map(u => `<tr>
        <td><b>${esc(u.displayName || u.username)}</b><br><small>${esc(u.username)}</small></td>
        <td><span class="auth-badge">${esc(ROLE_PERMISSIONS[u.role]?.label || u.role)}</span></td>
        <td>${groups.map(g=>`<label class="auth-inline-check"><input type="checkbox" data-user-group="${esc(u.username)}|${esc(g.id)}" ${((u.groupIds||[]).includes(g.id))?'checked':''} ${canWrite?'':'disabled'}> ${esc(g.name)}</label>`).join('')}</td>
        <td><span class="auth-badge ${u.status !== 'active' ? 'locked' : ''}">${esc(u.status)}</span></td>
        <td>${u.username === 'admin' ? 'Default admin' : `<button class="btn btn-soft" data-toggle-user="${esc(u.username)}">${u.status === 'active' ? 'Lock' : 'Unlock'}</button> <button class="btn btn-soft" data-reset-user="${esc(u.username)}">Reset Pass</button>`}</td>
      </tr>`).join('')}
    </tbody></table>
  </section>`;

  document.querySelector('#createUserFormV2')?.addEventListener('submit', async evt => {
    evt.preventDefault();
    if (!requirePermission('users.create')) return;
    const fd = new FormData(evt.currentTarget);
    const username = String(fd.get('username') || '').trim();
    const users = readUsers();
    if (users.some(u => u.username === username)) return showToast('Username đã tồn tại', 'warning');
    users.push({
      id: `user-${Date.now()}`,
      username,
      displayName: String(fd.get('displayName') || '').trim(),
      role: String(fd.get('role') || 'viewer'),
      groupIds: [String(fd.get('groupId') || 'group-video-viewer')],
      status: 'active',
      createdAt: now(),
      updatedAt: now(),
      passwordHash: await passwordHash(username, String(fd.get('password') || ''))
    });
    writeUsers(users);
    addAudit('users.create', {username});
    showToast('Đã tạo user', 'success');
    renderUsersPageV2();
  });

  root.querySelectorAll('[data-user-group]').forEach(input => input.addEventListener('change', () => {
    if (!requirePermission('users.update')) return;
    const [username, groupId] = String(input.getAttribute('data-user-group') || '').split('|');
    const users = readUsers();
    const user = users.find(x => x.username === username);
    if(!user) return;
    const set = new Set(user.groupIds || []);
    if(input.checked) set.add(groupId); else set.delete(groupId);
    user.groupIds = Array.from(set);
    user.updatedAt = now();
    writeUsers(users);
    addAudit('users.update_groups', {username, groupIds:user.groupIds});
    updateAuthUi();
    showToast('Đã cập nhật group cho user.', 'success');
  }));

  root.querySelectorAll('[data-toggle-user]').forEach(btn => btn.addEventListener('click', () => {
    if (!requirePermission('users.update')) return;
    const username = btn.getAttribute('data-toggle-user');
    const users = readUsers();
    const u = users.find(x => x.username === username);
    if(!u) return;
    u.status = u.status === 'active' ? 'locked' : 'active';
    u.updatedAt = now();
    writeUsers(users);
    addAudit('users.toggle_status', {username, status:u.status});
    renderUsersPageV2();
  }));

  root.querySelectorAll('[data-reset-user]').forEach(btn => btn.addEventListener('click', async () => {
    if (!requirePermission('users.update')) return;
    const username = btn.getAttribute('data-reset-user');
    const newPass = prompt(`Nhập mật khẩu mới cho ${username}`);
    if(!newPass) return;
    const users = readUsers();
    const u = users.find(x => x.username === username);
    if(!u) return;
    u.passwordHash = await passwordHash(username, newPass);
    u.updatedAt = now();
    writeUsers(users);
    addAudit('users.reset_password', {username});
    showToast('Đã reset password', 'success');
  }));
}

function renderPermissionsPageV2() {
  if (location.hash !== '#permissions') return;
  if (!requirePermission('roles.view')) return renderGuardedPage('Bạn cần quyền roles.view.');
  const root = document.querySelector('#pageRoot');
  if (!root) return;
  const groups = readGroups();
  const permissions = allPermissionRows();
  const canUpdate = hasPermission('roles.update');
  document.querySelector('#pageTitle').textContent = 'Phân quyền';
  document.querySelector('#pageSubtitle').textContent = 'Group · Module · Custom permissions';

  root.innerHTML = `<section class="auth-page-hero">
    <span class="eyebrow">Group Permission</span>
    <h2>Phân quyền theo Group và Module</h2>
    <p>Tạo group, gán quyền theo từng module và tự thêm permission tùy biến. User nhận quyền từ group được gán.</p>
    ${canUpdate ? `<form id="createGroupForm" class="auth-form">
      <input name="name" placeholder="Tên group mới" required>
      <input name="description" placeholder="Mô tả group">
      <button class="btn btn-primary">+ Tạo group</button>
    </form>
    <form id="createPermissionForm" class="auth-form">
      <input name="id" placeholder="permission.custom.name" required>
      <input name="label" placeholder="Mô tả quyền">
      <button class="btn btn-soft">+ Tạo quyền tùy biến</button>
    </form>` : ''}
  </section>
  <section class="auth-grid">
    ${groups.map(g => `<article class="auth-card"><h3>${esc(g.name)}</h3><p>${esc(g.description || '')}</p><p><span class="auth-badge">${esc(g.id)}</span></p></article>`).join('')}
  </section>
  <section class="auth-card" style="margin-top:18px">
    <h3>Module visibility</h3>
    <table class="auth-table"><thead><tr><th>Module</th>${groups.map(g=>`<th>${esc(g.name)}</th>`).join('')}</tr></thead><tbody>
      ${MODULE_ACCESS.map(module => `<tr><td><b>${esc(module.label)}</b><br><small>${esc(module.routes.join(', '))}</small></td>${groups.map(g=>`<td><label class="auth-inline-check"><input type="checkbox" data-group-module="${esc(g.id)}|${esc(module.id)}" ${((g.modules||[]).includes(module.id))?'checked':''} ${canUpdate?'':'disabled'}> Hiển thị</label></td>`).join('')}</tr>`).join('')}
    </tbody></table>
  </section>
  <section class="auth-card" style="margin-top:18px">
    <h3>Permission Matrix</h3>
    <table class="auth-table"><thead><tr><th>Permission</th>${groups.map(g=>`<th>${esc(g.name)}</th>`).join('')}</tr></thead><tbody>
      ${permissions.map(([module,perm]) => `<tr><td><b>${esc(module)}</b> · ${esc(perm)}</td>${groups.map(g=>`<td><label class="auth-inline-check"><input type="checkbox" data-group-permission="${esc(g.id)}|${esc(perm)}" ${((g.permissions||[]).includes('*')||(g.permissions||[]).includes(perm))?'checked':''} ${canUpdate?'':'disabled'}> Cho phép</label></td>`).join('')}</tr>`).join('')}
    </tbody></table>
  </section>`;

  document.querySelector('#createGroupForm')?.addEventListener('submit', evt => {
    evt.preventDefault();
    if(!requirePermission('roles.update')) return;
    const fd = new FormData(evt.currentTarget);
    const name = String(fd.get('name') || '').trim();
    if(!name) return;
    const id = `group-${name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || Date.now()}`;
    const groups = readGroups();
    if(groups.some(g => g.id === id)) return showToast('Group đã tồn tại.', 'warning');
    groups.push({id, name, description:String(fd.get('description') || '').trim(), permissions:[], modules:[]});
    writeGroups(groups);
    addAudit('roles.create_group', {id});
    renderPermissionsPageV2();
  });

  document.querySelector('#createPermissionForm')?.addEventListener('submit', evt => {
    evt.preventDefault();
    if(!requirePermission('roles.update')) return;
    const fd = new FormData(evt.currentTarget);
    const id = String(fd.get('id') || '').trim();
    if(!id) return;
    const custom = readCustomPermissions();
    if(custom.some(p => p.id === id)) return showToast('Permission đã tồn tại.', 'warning');
    custom.push({id, label:String(fd.get('label') || '').trim(), createdAt:now()});
    writeCustomPermissions(custom);
    addAudit('roles.create_permission', {id});
    renderPermissionsPageV2();
  });

  root.querySelectorAll('[data-group-module]').forEach(input => input.addEventListener('change', () => {
    if(!requirePermission('roles.update')) return;
    const [groupId, moduleId] = String(input.getAttribute('data-group-module') || '').split('|');
    const groups = readGroups();
    const group = groups.find(g => g.id === groupId);
    if(!group) return;
    const set = new Set(group.modules || []);
    if(input.checked) set.add(moduleId); else set.delete(moduleId);
    group.modules = Array.from(set);
    writeGroups(groups);
    addAudit('roles.update_group_module', {groupId, moduleId, enabled:input.checked});
    applyModuleVisibility();
  }));

  root.querySelectorAll('[data-group-permission]').forEach(input => input.addEventListener('change', () => {
    if(!requirePermission('roles.update')) return;
    const [groupId, permission] = String(input.getAttribute('data-group-permission') || '').split('|');
    const groups = readGroups();
    const group = groups.find(g => g.id === groupId);
    if(!group) return;
    const set = new Set(group.permissions || []);
    if(input.checked) set.add(permission); else set.delete(permission);
    group.permissions = Array.from(set);
    writeGroups(groups);
    addAudit('roles.update_group_permission', {groupId, permission, enabled:input.checked});
    updateAuthUi();
    applyModuleVisibility();
  }));
}

function renderAuthRoutes() {
  if (!guardProtectedRoutes()) return;
  renderUsersPageV2();
  renderPermissionsPageV2();
  renderAuditPage();
  setActiveNav();
  updateAuthUi();
}

async function initAuth() {
  await ensureDefaultUsers();
  bindLoginForm();
  fixSidebarNavigation();

  if (!isSessionValid()) showLogin();
  else hideLogin();

  updateAuthUi();
  renderAuthRoutes();
}

window.addEventListener('DOMContentLoaded', () => setTimeout(initAuth, 150));
window.addEventListener('hashchange', () => setTimeout(renderAuthRoutes, 70));

window.FTIAuth = {
  login, logout, currentUser, hasPermission, readUsers, writeUsers, readAudit,
  runSeed: ensureDefaultUsers,
  roles: ROLE_PERMISSIONS
};


/* v10.8.1 Public Portal behavior override
   - Public users can browse customer-facing content without login.
   - Login is only required for CMS/edit/admin actions.
   - Sidebar expand/collapse and hamburger are fixed here without blocking default routers.
*/
(function(){
  const PUBLIC_ROUTES = new Set([
    '#overview','#oncallcx','#ccaas-vn','#ccaas-global','#api-reference','#ucpbx-vn',
    '#video-conferencing','#vc-yealink','#vc-logitech','#vc-poly','#vc-cisco','#vc-jabra','#vc-crestron',
    '#vc-huddle-room','#vc-medium-large-room','#integration','#crm','#compliance',
    '#demo','#compare','#resources'
  ]);
  const PROTECTED_ROUTES = {
    '#editor':'cms.view',
    '#vendor-editor':'cms.view',
    '#cms':'cms.view',
    '#enterprise-cms':'cms.view',
    '#cms-audit':'audit.view',
    '#users':'users.view',
    '#permissions':'roles.view',
    '#audit-log':'audit.view'
  };

  function session(){
    try{return JSON.parse(localStorage.getItem('fti_auth_session')||'null')}catch{return null}
  }
  function isLogged(){return !!session();}
  function hideLoginOverlay(){
    const overlay=document.querySelector('#loginOverlay');
    if(overlay) overlay.hidden=true;
  }
  function showLoginOverlay(){
    const overlay=document.querySelector('#loginOverlay');
    if(overlay) overlay.hidden=false;
  }
  function setPublicUi(){
    document.body.classList.toggle('cms-locked', !isLogged());
    const chip=document.querySelector('#permissionChip');
    if(chip){
      if(isLogged()){
        const s=session();
        const u = currentUser();
        const label = u?.groups?.length ? u.groups.map(g => g.name).join(', ') : s.role;
        chip.textContent=`Login: ON · ${s.username} · ${label}`;
        chip.classList.add('login-on');
        chip.classList.remove('login-guest','login-off');
      }else{
        chip.textContent='Login';
        chip.classList.add('login-guest');
        chip.classList.remove('login-on','login-off');
      }
      if(!chip.dataset.publicLoginBound){
        chip.dataset.publicLoginBound='1';
        chip.addEventListener('click', e=>{
          e.preventDefault();
          if(isLogged()){
            if(confirm('Bạn muốn đăng xuất?')){
              localStorage.removeItem('fti_auth_session');
              setPublicUi();
            }
          }else showLoginOverlay();
        });
      }
    }

    const footerName=document.querySelector('.user-pill strong');
    const footerRole=document.querySelector('.user-pill span');
    if(!isLogged()){
      if(footerName) footerName.textContent='Public Visitor';
      if(footerRole) footerRole.textContent='Customer View';
    }
    applyModuleVisibility();
  }

  function openProtectedNotice(permission){
    const root=document.querySelector('#pageRoot');
    const title=document.querySelector('#pageTitle');
    const subtitle=document.querySelector('#pageSubtitle');
    if(title) title.textContent='Yêu cầu đăng nhập';
    if(subtitle) subtitle.textContent='CMS editing area';
    if(root){
      root.innerHTML=`<section class="auth-page-hero">
        <span class="eyebrow">🔐 Login Required</span>
        <h2>Khu vực chỉnh sửa cần đăng nhập</h2>
        <p>Website cho phép khách hàng xem nội dung công khai. Các chức năng CMS/chỉnh sửa cần đăng nhập với quyền phù hợp: <b>${permission}</b>.</p>
        <button class="btn btn-primary" id="openLoginFromProtected">Login để chỉnh sửa</button>
        <a class="btn btn-soft" href="#overview">Quay lại Tổng quan</a>
      </section>`;
      document.querySelector('#openLoginFromProtected')?.addEventListener('click', showLoginOverlay);
    }
  }

  function routeGuard(){
    const hash=location.hash||'#overview';
    const required=PROTECTED_ROUTES[hash];
    if(required && !isLogged()){
      openProtectedNotice(required);
      return false;
    }
    const routePermission=ROUTE_PERMISSIONS[hash];
    if(routePermission && isLogged() && !canAccessRoute(hash)){
      openProtectedNotice(routePermission);
      return false;
    }
    return true;
  }

  function fixSidebar(){
    const shell=document.querySelector('.app-shell');
    const sidebar=document.querySelector('#sidebar');
    if(!sidebar || sidebar.dataset.v1081Fixed) return;
    sidebar.dataset.v1081Fixed='1';

    // Group expand/collapse
    sidebar.querySelectorAll('[data-toggle-group]').forEach(btn=>{
      btn.onclick = null;
      btn.addEventListener('click', e=>{
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        btn.closest('.nav-group')?.classList.toggle('expanded');
      }, true);
    });

    // One-click navigation, protected only for CMS/admin/edit.
    sidebar.querySelectorAll('a.nav-item[href^="#"]').forEach(a=>{
      a.addEventListener('click', e=>{
        const href=a.getAttribute('href');
        const protectedPermission=a.getAttribute('data-permission') || PROTECTED_ROUTES[href];
        if(protectedPermission && !isLogged()){
          e.preventDefault();
          e.stopPropagation();
          location.hash=href;
          setTimeout(()=>openProtectedNotice(protectedPermission),30);
          return;
        }
        const routePermission = ROUTE_PERMISSIONS[href];
        if(routePermission && isLogged() && !canAccessRoute(href)){
          e.preventDefault();
          e.stopPropagation();
          openProtectedNotice(routePermission);
          return;
        }
        document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active'));
        a.classList.add('active');
        a.closest('.nav-group')?.classList.add('expanded');
        if(PROTECTED_ROUTES[href] || routePermission){
          e.preventDefault();
          e.stopPropagation();
          if(location.hash===href) window.dispatchEvent(new HashChangeEvent('hashchange'));
          else location.hash=href;
          return;
        }
        // Let hash router run once; if hash unchanged, force event.
        if(location.hash===href){
          e.preventDefault();
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        }
      }, true);
    });

    // Hamburger collapse/expand
    document.querySelectorAll('#sidebarToggle,#mobileMenu').forEach(btn=>{
      if(btn.dataset.v1081Bound) return;
      btn.dataset.v1081Bound='1';
      btn.addEventListener('click', e=>{
        e.preventDefault();
        e.stopPropagation();
        shell?.classList.toggle('sidebar-collapsed');
        document.body.classList.toggle('sidebar-collapsed');
      }, true);
    });
  }

  function markActive(){
    const hash=location.hash||'#overview';
    document.querySelectorAll('.nav-item').forEach(a=>{
      const active=a.getAttribute('href')===hash;
      a.classList.toggle('active', active);
      if(active) a.closest('.nav-group')?.classList.add('expanded');
    });
  }

  window.addEventListener('DOMContentLoaded', ()=>{
    // Run immediately first — #permissionChip is static markup already in
    // index.html and localStorage reads are synchronous, so there's no need
    // to wait before showing the correct logged-in state. Without this,
    // the page briefly flashes "Login: OFF" / the locked CMS landing card
    // for up to ~1.4s (the staggered re-checks below) before settling on
    // the correct state, even for a user who's already logged in.
    hideLoginOverlay();
    setPublicUi();
    fixSidebar();
    markActive();
    setTimeout(()=>{
      hideLoginOverlay();
      setPublicUi();
      fixSidebar();
      markActive();
    },260);
  });
  window.addEventListener('hashchange', ()=>{
    setTimeout(()=>{
      setPublicUi();
      routeGuard();
      markActive();
    },90);
  });

  // Keep public mode after original v10.8 init tries to show login.
  setTimeout(()=>{hideLoginOverlay();setPublicUi();fixSidebar();},600);
  setTimeout(()=>{hideLoginOverlay();setPublicUi();fixSidebar();},1400);
})();



/* v10.8.2 System & Security visibility + expand fix */
(function(){
  function isLoggedIn(){
    try{return !!JSON.parse(localStorage.getItem('fti_auth_session')||'null')}catch{return false}
  }

  function syncSystemSecurityVisibility(){
    const group = Array.from(document.querySelectorAll('.nav-group')).find(g => {
      const text = (g.textContent || '').toUpperCase();
      return text.includes('SYSTEM & SECURITY');
    });
    if(!group) return;

    group.classList.add('auth-system-group');

    if(!isLoggedIn()){
      group.style.display = 'none';
      document.body.classList.add('cms-locked');
      applyModuleVisibility();
      return;
    }

    group.style.display = '';
    document.body.classList.remove('cms-locked');
    applyModuleVisibility();
  }

  function fixSystemSecurityExpand(){
    const group = Array.from(document.querySelectorAll('.nav-group')).find(g => {
      const text = (g.textContent || '').toUpperCase();
      return text.includes('SYSTEM & SECURITY');
    });
    if(!group) return;

    group.classList.add('auth-system-group');
    // Expand/collapse is handled by fixSidebar(). Keeping a second
    // SYSTEM-only toggle here makes the group open and close in one click.
  }

  function init(){
    syncSystemSecurityVisibility();
    fixSystemSecurityExpand();

    const loginBtn = document.querySelector('#permissionChip');
    if(loginBtn && !loginBtn.dataset.v1082VisibilityBound){
      loginBtn.dataset.v1082VisibilityBound = '1';
      loginBtn.addEventListener('click', () => setTimeout(() => {
        syncSystemSecurityVisibility();
        fixSystemSecurityExpand();
      }, 250));
    }

    const logoutBtn = document.querySelector('#logoutBtn');
    if(logoutBtn && !logoutBtn.dataset.v1082VisibilityBound){
      logoutBtn.dataset.v1082VisibilityBound = '1';
      logoutBtn.addEventListener('click', () => setTimeout(() => {
        syncSystemSecurityVisibility();
        fixSystemSecurityExpand();
      }, 250));
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(init, 350);
    setTimeout(init, 1200);
    setTimeout(init, 2200);
  });

  window.addEventListener('hashchange', () => setTimeout(init, 120));

  // Watch login/logout changes from localStorage in same tab flow
  const rawSetItem = localStorage.setItem;
  localStorage.setItem = function(key, value){
    rawSetItem.apply(this, arguments);
    if(key === 'fti_auth_session') setTimeout(init, 50);
  };
  const rawRemoveItem = localStorage.removeItem;
  localStorage.removeItem = function(key){
    rawRemoveItem.apply(this, arguments);
    if(key === 'fti_auth_session') setTimeout(init, 50);
  };

  setTimeout(init, 500);
})();
