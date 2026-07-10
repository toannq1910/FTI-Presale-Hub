/* v11.0.0 Enterprise Authentication — Supabase-backed
   Real accounts (Supabase Auth) + database-backed Groups/Permissions/Audit,
   enforced additionally by Row Level Security at the database layer.
   Login is by EMAIL (Supabase Auth is email-based; there is no separate
   username concept anymore).
*/
import { esc } from './cms/cms-core.js';
import { supabase } from './supabase-client.js?v=20260709-1';

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

function now() { return new Date().toISOString(); }

// Display-only shortening: "toannq24@fpt.com" -> "toannq24". Used for the
// identity chip/sidebar footer only -- Audit Log keeps the full email
// since that's a record meant to be precise, not a friendly display name.
function shortName(emailOrName = '') {
  return String(emailOrName).split('@')[0] || emailOrName;
}

// ---------------------------------------------------------------
// Cached auth state. Supabase calls are async (network), but most of
// the app (route guards, sidebar visibility, permission checks) calls
// currentUser()/hasPermission() synchronously in tight loops — so we
// fetch once on login/startup/any write, cache here, and read from the
// cache everywhere else. refreshAuthState() is the only place this
// cache gets repopulated.
// ---------------------------------------------------------------
let authState = { authUser: null, profile: null, groups: [], allGroups: [] };

async function fetchAllGroups(){
  const { data, error } = await supabase.from('groups').select('*').order('name');
  if (error) { console.warn('[auth] fetchAllGroups', error.message); return []; }
  return data || [];
}

async function fetchUserGroups(userId){
  const { data, error } = await supabase
    .from('user_groups')
    .select('group_id, groups(*)')
    .eq('user_id', userId);
  if (error) { console.warn('[auth] fetchUserGroups', error.message); return []; }
  return (data || []).map(row => row.groups).filter(Boolean);
}

async function refreshAuthState(){
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    authState = { authUser: null, profile: null, groups: [], allGroups: authState.allGroups };
    updateAuthUi();
    window.dispatchEvent(new Event('fti-auth-changed'));
    return;
  }
  const [{ data: profile }, groups, allGroups] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    fetchUserGroups(user.id),
    fetchAllGroups()
  ]);
  authState = { authUser: user, profile, groups, allGroups };
  updateAuthUi();
  renderAuthRoutes();
  window.dispatchEvent(new Event('fti-auth-changed'));
}

function currentUser() {
  if (!authState.authUser) return null;
  return {
    id: authState.authUser.id,
    email: authState.authUser.email,
    username: authState.authUser.email,
    displayName: authState.profile?.full_name || shortName(authState.authUser.email),
    groups: authState.groups || []
  };
}

function hasWildcardPermission(user = currentUser()) {
  if (!user) return false;
  return (user.groups || []).some(group => (group.permissions || []).includes('*'));
}

function hasPermission(permission) {
  const user = currentUser();
  if (!user) return false;
  const permissions = new Set((user.groups || []).flatMap(group => group.permissions || []));
  return permissions.has('*') || permissions.has(permission);
}

function requirePermission(permission) {
  if (hasPermission(permission)) return true;
  showToast(`Bạn không có quyền: ${permission}`, 'warning');
  return false;
}

function showToast(message, type='info') {
  const root = document.querySelector('#toastRoot');
  if (!root) { console.log(`[${type}] ${message}`); return; }
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

// Login/password inputs otherwise keep whatever was last typed sitting in
// the DOM even after a successful login -- so if the user later logs out,
// the very same values silently reappear when the overlay is shown again.
// Reset explicitly at both points rather than relying on the overlay's
// hidden state alone.
function resetLoginForm() {
  const form = document.querySelector('#loginForm');
  form?.reset();
  const toggleBtn = document.querySelector('#loginPasswordToggle');
  const passwordInput = document.querySelector('#loginPassword');
  if (toggleBtn && passwordInput && passwordInput.type === 'text') {
    passwordInput.type = 'password';
    toggleBtn.setAttribute('aria-pressed', 'false');
    toggleBtn.setAttribute('aria-label', 'Hiện mật khẩu');
    toggleBtn.querySelector('.icon-eye').hidden = false;
    toggleBtn.querySelector('.icon-eye-off').hidden = true;
  }
}

async function addAudit(action, detail = {}) {
  const user = currentUser();
  try {
    await supabase.from('audit_log').insert({
      user_id: user?.id || null,
      username: user?.email || 'anonymous',
      action,
      details: detail
    });
  } catch (e) { console.warn('[auth] audit insert failed', e); }
}

async function login(email, password) {
  email = String(email || '').trim();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    await addAudit('auth.login_failed', { email, reason: error.message });
    const friendly = error.message === 'Invalid login credentials'
      ? 'Sai email hoặc mật khẩu'
      : error.message;
    throw new Error(friendly);
  }
  await refreshAuthState();
  await addAudit('auth.login_success', { email });
  hideLogin();
  resetLoginForm();
  showToast(`Đã đăng nhập: ${currentUser()?.displayName || shortName(email)}`, 'success');
}

async function logout() {
  await addAudit('auth.logout', {});
  await supabase.auth.signOut();
  await refreshAuthState();
  resetLoginForm();
  showLogin();
}

async function changeOwnPassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
  await addAudit('auth.self_change_password', {});
}

function updateAuthUi() {
  const user = currentUser();
  const chip = document.querySelector('#permissionChip');
  if (chip) {
    chip.classList.toggle('login-on', !!user);
    chip.classList.toggle('login-off', !user);
    const groupLabel = user?.groups?.length ? user.groups.map(g => g.name).join(', ') : '';
    const shortLabel = user ? (user.displayName || shortName(user.email)) : 'Login';
    chip.textContent = shortLabel;
    chip.title = user ? `${user.email}${groupLabel ? ' · ' + groupLabel : ''}` : '';
  }
  const changePasswordBtn = document.querySelector('#changePasswordBtn');
  const logoutBtn = document.querySelector('#logoutBtn');
  if (changePasswordBtn) changePasswordBtn.hidden = !user;
  if (logoutBtn) logoutBtn.hidden = !user;

  const footerName = document.querySelector('.user-pill strong');
  const footerRole = document.querySelector('.user-pill span');
  if (footerName) footerName.textContent = user ? (user.displayName || shortName(user.email)) : 'Guest';
  if (footerRole) footerRole.textContent = user ? (user.groups?.map(g => g.name).join(', ') || '') : 'Not signed in';

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
    const email = document.querySelector('#loginEmail')?.value || '';
    const password = document.querySelector('#loginPassword')?.value || '';
    const submitBtn = form.querySelector('.login-submit');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Đang đăng nhập…'; }
    try { await login(email, password); }
    catch (err) { showToast(err.message || 'Đăng nhập thất bại', 'error'); }
    finally { if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Đăng nhập'; } }
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
    renderGuardedPage(`Route ${esc(h)} chưa được bật trong group của user hiện tại.`);
    return false;
  }
  if (perm && !hasPermission(perm)) {
    renderGuardedPage(`Route ${esc(h)} yêu cầu quyền ${esc(perm)}.`);
    return false;
  }
  return true;
}

// ---------------------------------------------------------------
// Users page — lists real Supabase-backed users (profiles) and lets an
// Admin (re)assign their Group membership directly (writes straight to
// user_groups, protected by RLS). Creating brand-new users, locking, and
// resetting another user's password all require the Supabase Admin API
// (service_role key) — that goes through a dedicated Edge Function which
// is a separate follow-up piece, not wired up yet. For now those actions
// are visibly disabled with a note, rather than silently doing nothing.
// ---------------------------------------------------------------
async function fetchAllUsersWithGroups(){
  const { data: profiles, error } = await supabase.from('profiles').select('*').order('created_at');
  if (error) { console.warn('[auth] fetchAllUsersWithGroups', error.message); return []; }
  const { data: memberships } = await supabase.from('user_groups').select('user_id, group_id');
  return (profiles || []).map(p => ({
    ...p,
    groupIds: (memberships || []).filter(m => m.user_id === p.id).map(m => m.group_id)
  }));
}

// Creating a brand-new Supabase Auth user + sending them an invite email
// requires the Admin API (auth.admin.inviteUserByEmail), which needs the
// service_role key -- that can never reach the browser, so this goes
// through a Supabase Edge Function ("invite-user") instead. The function
// re-checks the caller is actually an admin server-side before doing
// anything privileged; the users.create permission check here is just
// for UI purposes (hiding the form), not the real security boundary.
async function inviteNewUser(email, fullName, groupId){
  const { data: { session } } = await supabase.auth.getSession();
  if(!session) throw new Error('Phiên đăng nhập đã hết hạn, hãy đăng nhập lại.');
  const { data, error } = await supabase.functions.invoke('invite-user', {
    body: { email, full_name: fullName || null, group_id: groupId || null }
  });
  if(error){
    // supabase-js only gives a generic message for non-2xx responses;
    // the function's own JSON body (with the real reason) is on error.context.
    let detail = error.message;
    try { const body = await error.context.json(); if(body?.error) detail = body.error; } catch {}
    throw new Error(detail);
  }
  if(data?.error) throw new Error(data.error);
  return data || {};
}

async function renderUsersPageV2() {
  if (location.hash !== '#users') return;
  if (!requirePermission('users.view')) return renderGuardedPage('Bạn cần quyền users.view.');
  const root = document.querySelector('#pageRoot');
  if (!root) return;
  const [users, groups] = await Promise.all([fetchAllUsersWithGroups(), fetchAllGroups()]);
  if (location.hash !== '#users') return;
  const canWrite = hasPermission('users.update');
  const canCreate = hasPermission('users.create');
  document.querySelector('#pageTitle').textContent = 'Quản lý User';
  document.querySelector('#pageSubtitle').textContent = 'User · Group assignment (Supabase)';

  root.innerHTML = `<section class="auth-page-hero">
    <span class="eyebrow">User Management</span>
    <h2>Quản lý User theo Group</h2>
    <p>Gán user vào group để quyết định quyền xem/chỉnh sửa theo module. Dữ liệu đọc/ghi trực tiếp trên Supabase, có Row Level Security.</p>
    ${canCreate ? `<form id="inviteUserForm" class="auth-form">
      <input name="email" type="email" placeholder="Email user mới" required>
      <input name="full_name" placeholder="Họ tên (tùy chọn)">
      <select name="group_id"><option value="">— Chưa gán group —</option>${groups.map(g=>`<option value="${esc(g.id)}">${esc(g.name)}</option>`).join('')}</select>
      <button class="btn btn-primary">+ Tạo user &amp; gửi email mời</button>
    </form>` : ''}
  </section>
  <section class="auth-card">
    <h3>Danh sách User</h3>
    <table class="auth-table"><thead><tr><th>User</th><th>Group</th><th>Action</th></tr></thead><tbody>
      ${users.map(u => `<tr>
        <td><b>${esc(u.full_name || u.username || u.id)}</b><br><small>${esc(u.username || '')}</small></td>
        <td>${groups.map(g=>`<label class="auth-inline-check"><input type="checkbox" data-user-group="${esc(u.id)}|${esc(g.id)}" ${(u.groupIds||[]).includes(g.id)?'checked':''} ${canWrite?'':'disabled'}> ${esc(g.name)}</label>`).join('')}</td>
        <td><button class="btn btn-soft" data-reset-pass="${esc(u.username || '')}" ${canWrite && u.username ? '' : 'disabled'}>Reset Pass</button></td>
      </tr>`).join('')}
    </tbody></table>
  </section>`;

  root.querySelector('#inviteUserForm')?.addEventListener('submit', async evt => {
    evt.preventDefault();
    if (!requirePermission('users.create')) return;
    const form = evt.currentTarget;
    const fd = new FormData(form);
    const email = String(fd.get('email') || '').trim();
    const fullName = String(fd.get('full_name') || '').trim();
    const groupId = String(fd.get('group_id') || '').trim();
    if (!email) return;
    const submitBtn = form.querySelector('button');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang tạo user…';
    try {
      const result = await inviteNewUser(email, fullName, groupId);
      if (result.warning) showToast(result.warning, 'warning');
      else showToast(`Đã tạo user và gửi email mời tới ${email}.`, 'success');
      await addAudit('users.invite', { email, groupId });
      form.reset();
      renderUsersPageV2();
    } catch (err) {
      showToast('Lỗi: ' + err.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = '+ Tạo user & gửi email mời';
    }
  });

  root.querySelectorAll('[data-user-group]').forEach(input => input.addEventListener('change', async () => {
    if (!requirePermission('users.update')) { input.checked = !input.checked; return; }
    const [userId, groupId] = String(input.getAttribute('data-user-group') || '').split('|');
    if (input.checked) {
      const { error } = await supabase.from('user_groups').insert({ user_id: userId, group_id: groupId });
      if (error) { showToast('Lỗi: ' + error.message, 'error'); input.checked = false; return; }
    } else {
      const { error } = await supabase.from('user_groups').delete().eq('user_id', userId).eq('group_id', groupId);
      if (error) { showToast('Lỗi: ' + error.message, 'error'); input.checked = true; return; }
    }
    await addAudit('users.update_groups', { userId, groupId, checked: input.checked });
    await refreshAuthState();
    showToast('Đã cập nhật group cho user.', 'success');
  }));

  root.querySelectorAll('[data-reset-pass]').forEach(btn => btn.addEventListener('click', async () => {
    if (!requirePermission('users.update')) return;
    const email = btn.getAttribute('data-reset-pass');
    if (!email) return;
    if (!confirm(`Gửi email đặt lại mật khẩu tới ${email}?`)) return;
    btn.disabled = true;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}${location.pathname}#change-password`
    });
    btn.disabled = false;
    if (error) return showToast('Lỗi: ' + error.message, 'error');
    await addAudit('users.reset_password_email', { email });
    showToast(`Đã gửi email đặt lại mật khẩu tới ${email}.`, 'success');
  }));
}

function allPermissionRows(){
  const moduleRows = MODULE_PERMISSIONS.flatMap(row => row.slice(1).map(perm => [row[0], perm]));
  const accessRows = MODULE_ACCESS.flatMap(module => module.permissions.map(perm => [module.label, perm]));
  const seen = new Set();
  return [...moduleRows, ...accessRows].filter(([,perm]) => {
    if(seen.has(perm)) return false;
    seen.add(perm);
    return true;
  });
}

async function renderPermissionsPageV2() {
  if (location.hash !== '#permissions') return;
  if (!requirePermission('roles.view')) return renderGuardedPage('Bạn cần quyền roles.view.');
  const root = document.querySelector('#pageRoot');
  if (!root) return;
  const groups = await fetchAllGroups();
  if (location.hash !== '#permissions') return;
  const permissions = allPermissionRows();
  const canUpdate = hasPermission('roles.update');
  document.querySelector('#pageTitle').textContent = 'Phân quyền';
  document.querySelector('#pageSubtitle').textContent = 'Group · Module · Permission (Supabase)';

  root.innerHTML = `<section class="auth-page-hero">
    <span class="eyebrow">Group Permission</span>
    <h2>Phân quyền theo Group và Module</h2>
    <p>Tạo group, gán quyền theo từng module. User nhận quyền từ group được gán ở trang Quản lý User.</p>
    ${canUpdate ? `<form id="createGroupForm" class="auth-form">
      <input name="name" placeholder="Tên group mới" required>
      <input name="description" placeholder="Mô tả group">
      <button class="btn btn-primary">+ Tạo group</button>
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

  document.querySelector('#createGroupForm')?.addEventListener('submit', async evt => {
    evt.preventDefault();
    if(!requirePermission('roles.update')) return;
    const fd = new FormData(evt.currentTarget);
    const name = String(fd.get('name') || '').trim();
    if(!name) return;
    const id = `group-${name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || Date.now()}`;
    const { error } = await supabase.from('groups').insert({ id, name, description: String(fd.get('description') || '').trim(), permissions: [], modules: [] });
    if (error) return showToast('Lỗi: ' + error.message, 'error');
    await addAudit('roles.create_group', { id });
    showToast('Đã tạo group.', 'success');
    renderPermissionsPageV2();
  });

  root.querySelectorAll('[data-group-module]').forEach(input => input.addEventListener('change', async () => {
    if(!requirePermission('roles.update')) { input.checked = !input.checked; return; }
    const [groupId, moduleId] = String(input.getAttribute('data-group-module') || '').split('|');
    const group = groups.find(g => g.id === groupId);
    if(!group) return;
    const set = new Set(group.modules || []);
    if(input.checked) set.add(moduleId); else set.delete(moduleId);
    const { error } = await supabase.from('groups').update({ modules: Array.from(set) }).eq('id', groupId);
    if (error) { showToast('Lỗi: ' + error.message, 'error'); input.checked = !input.checked; return; }
    await addAudit('roles.update_group_module', { groupId, moduleId, enabled: input.checked });
    await refreshAuthState();
  }));

  root.querySelectorAll('[data-group-permission]').forEach(input => input.addEventListener('change', async () => {
    if(!requirePermission('roles.update')) { input.checked = !input.checked; return; }
    const [groupId, permission] = String(input.getAttribute('data-group-permission') || '').split('|');
    const group = groups.find(g => g.id === groupId);
    if(!group) return;
    const set = new Set(group.permissions || []);
    if(input.checked) set.add(permission); else set.delete(permission);
    const { error } = await supabase.from('groups').update({ permissions: Array.from(set) }).eq('id', groupId);
    if (error) { showToast('Lỗi: ' + error.message, 'error'); input.checked = !input.checked; return; }
    await addAudit('roles.update_group_permission', { groupId, permission, enabled: input.checked });
    await refreshAuthState();
  }));
}

async function renderAuditPage() {
  if (location.hash !== '#audit-log') return;
  if (!requirePermission('audit.view')) return renderGuardedPage('Bạn cần quyền audit.view.');
  const root = document.querySelector('#pageRoot');
  if (!root) return;
  document.querySelector('#pageTitle').textContent = 'Audit Log';
  document.querySelector('#pageSubtitle').textContent = 'Authentication and CMS activity logs (Supabase)';
  const { data: logs, error } = await supabase
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);
  if (location.hash !== '#audit-log') return;
  if (error) { renderGuardedPage('Không tải được audit log: ' + error.message); return; }
  root.innerHTML = `<section class="auth-page-hero">
    <span class="eyebrow">📜 Audit</span>
    <h2>Audit Log</h2>
    <p>Ghi nhận login/logout, tạo group, đổi group user và các thao tác hệ thống liên quan authentication.</p>
  </section>
  <section class="auth-card">
    <table class="auth-table"><thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Detail</th></tr></thead><tbody>
      ${(logs||[]).map(l => `<tr><td>${esc(l.created_at)}</td><td>${esc(l.username || '')}</td><td>${esc(l.action)}</td><td><code>${esc(JSON.stringify(l.details || {}))}</code></td></tr>`).join('')}
    </tbody></table>
  </section>`;
}

function renderAuthRoutes() {
  if (!guardProtectedRoutes()) return;
  renderUsersPageV2();
  renderPermissionsPageV2();
  renderAuditPage();
  renderChangePasswordPage();
  setActiveNav();
  updateAuthUi();
}

// ---------------------------------------------------------------
// Self-service "Đổi mật khẩu" — any logged-in user, including Admins,
// can change their own password this way (Supabase Auth handles it
// directly, no admin/service_role key needed for changing YOUR OWN
// password). Admin changing someone ELSE's password is a different,
// privileged operation deferred to the Edge Function follow-up.
// ---------------------------------------------------------------
// ---------------------------------------------------------------
// Self-service "Đổi mật khẩu" page — any logged-in user, including
// Admins, can change their own password this way via
// supabase.auth.updateUser(), no elevated privileges needed. Admin
// changing someone ELSE's password is a different, privileged
// operation deferred to the Edge Function follow-up.
// ---------------------------------------------------------------
function renderChangePasswordPage() {
  if (location.hash !== '#change-password') return;
  const user = currentUser();
  const root = document.querySelector('#pageRoot');
  if (!root) return;
  if (!user) { renderGuardedPage('Bạn cần đăng nhập để đổi mật khẩu.'); return; }

  document.querySelector('#pageTitle').textContent = 'Đổi mật khẩu';
  document.querySelector('#pageSubtitle').textContent = 'Tài khoản của tôi';

  root.innerHTML = `<section class="auth-page-hero">
    <span class="eyebrow">🔑 Tài khoản</span>
    <h2>Đổi mật khẩu</h2>
    <p>Đổi mật khẩu đăng nhập cho tài khoản <b>${esc(user.email)}</b>. Sau khi đổi thành công, hãy dùng mật khẩu mới cho lần đăng nhập tiếp theo.</p>
  </section>
  <section class="auth-card" style="max-width:460px">
    <h3>Mật khẩu mới</h3>
    <form id="changePasswordForm" class="change-password-form">
      <label for="newPassword">Mật khẩu mới</label>
      <input id="newPassword" type="password" autocomplete="new-password" placeholder="Tối thiểu 8 ký tự" required minlength="8">
      <label for="confirmPassword">Nhập lại mật khẩu mới</label>
      <input id="confirmPassword" type="password" autocomplete="new-password" placeholder="Nhập lại để xác nhận" required minlength="8">
      <p class="field-error" id="changePasswordError"></p>
      <button class="btn btn-primary" type="submit">Đổi mật khẩu</button>
      <a class="btn btn-soft" href="#overview" style="margin-top:10px;text-align:center">Hủy, quay lại Tổng quan</a>
    </form>
  </section>`;

  const form = document.querySelector('#changePasswordForm');
  form?.addEventListener('submit', async evt => {
    evt.preventDefault();
    const errorEl = document.querySelector('#changePasswordError');
    errorEl.textContent = '';
    const newPassword = document.querySelector('#newPassword').value;
    const confirmPassword = document.querySelector('#confirmPassword').value;
    if (newPassword.length < 8) { errorEl.textContent = 'Mật khẩu cần tối thiểu 8 ký tự.'; return; }
    if (newPassword !== confirmPassword) { errorEl.textContent = 'Hai mật khẩu không khớp.'; return; }
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang đổi mật khẩu…';
    try {
      await changeOwnPassword(newPassword);
      showToast('Đã đổi mật khẩu thành công.', 'success');
      form.reset();
      location.hash = '#overview';
    } catch (err) {
      errorEl.textContent = 'Lỗi: ' + err.message;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Đổi mật khẩu';
    }
  });
}

function bindChangePasswordControl(){
  const btn = document.querySelector('#changePasswordBtn');
  if(!btn || btn.dataset.bound) return;
  btn.dataset.bound = '1';
  btn.addEventListener('click', evt => {
    evt.preventDefault();
    if(!currentUser()) return;
    location.hash = '#change-password';
  });
}

async function initAuth() {
  bindLoginForm();
  bindChangePasswordControl();

  supabase.auth.onAuthStateChange((_event, _session) => {
    refreshAuthState();
  });

  await refreshAuthState();
  if (!currentUser()) showLogin(); else hideLogin();
  renderAuthRoutes();
}

window.addEventListener('DOMContentLoaded', () => setTimeout(initAuth, 0));
window.addEventListener('hashchange', () => setTimeout(renderAuthRoutes, 70));

window.FTIAuth = { login, logout, currentUser, hasPermission, changeOwnPassword };


/* v10.8.1 Public Portal behavior override
   - Public users can browse customer-facing content without login.
   - Login is only required for CMS/edit/admin actions.
   - Sidebar expand/collapse and hamburger are fixed here without blocking default routers.
*/
(function(){
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

  function isLogged(){ return !!currentUser(); }
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
    const changePasswordBtn=document.querySelector('#changePasswordBtn');
    const logoutBtn=document.querySelector('#logoutBtn');
    if(chip){
      const u = currentUser();
      if(u){
        const label = u.groups?.length ? u.groups.map(g => g.name).join(', ') : '';
        chip.textContent = u.displayName || shortName(u.email);
        chip.title = `${u.email}${label ? ' · ' + label : ''}`;
        chip.classList.add('login-on');
        chip.classList.remove('login-guest','login-off');
      }else{
        chip.textContent='Login';
        chip.title='';
        chip.classList.add('login-guest');
        chip.classList.remove('login-on','login-off');
      }
      if(changePasswordBtn) changePasswordBtn.hidden = !u;
      if(logoutBtn) logoutBtn.hidden = !u;
      if(!chip.dataset.publicLoginBound){
        chip.dataset.publicLoginBound='1';
        chip.addEventListener('click', e=>{
          e.preventDefault();
          if(isLogged()) location.hash='#change-password';
          else showLoginOverlay();
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

    sidebar.querySelectorAll('[data-toggle-group]').forEach(btn=>{
      btn.onclick = null;
      btn.addEventListener('click', e=>{
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        btn.closest('.nav-group')?.classList.toggle('expanded');
      }, true);
    });

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
        if(location.hash===href){
          e.preventDefault();
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        }
      }, true);
    });

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
    hideLoginOverlay();
    setPublicUi();
    fixSidebar();
    markActive();
  });
  window.addEventListener('hashchange', ()=>{
    setTimeout(()=>{
      setPublicUi();
      routeGuard();
      markActive();
    },90);
  });

  // Re-sync whenever auth state actually changes (login/logout resolve).
  window.addEventListener('fti-auth-changed', ()=>{ hideLoginOverlay(); setPublicUi(); fixSidebar(); });
})();


/* v10.8.2 System & Security visibility + expand fix */
(function(){
  function syncSystemSecurityVisibility(){
    const group = Array.from(document.querySelectorAll('.nav-group')).find(g => {
      const text = (g.textContent || '').toUpperCase();
      return text.includes('SYSTEM & SECURITY');
    });
    if(!group) return;
    group.classList.add('auth-system-group');
    if(!currentUser()){
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
    if(group) group.classList.add('auth-system-group');
  }

  function init(){
    syncSystemSecurityVisibility();
    fixSystemSecurityExpand();

    const loginBtn = document.querySelector('#permissionChip');
    if(loginBtn && !loginBtn.dataset.v1082VisibilityBound){
      loginBtn.dataset.v1082VisibilityBound = '1';
      loginBtn.addEventListener('click', () => setTimeout(init, 250));
    }
    const logoutBtn = document.querySelector('#logoutBtn');
    if(logoutBtn && !logoutBtn.dataset.v1082VisibilityBound){
      logoutBtn.dataset.v1082VisibilityBound = '1';
      logoutBtn.addEventListener('click', () => setTimeout(init, 250));
    }
  }

  window.addEventListener('DOMContentLoaded', () => setTimeout(init, 0));
  window.addEventListener('hashchange', () => setTimeout(init, 120));
  window.addEventListener('fti-auth-changed', () => setTimeout(init, 0));
})();
