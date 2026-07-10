/* v9.5.0 Unified CMS entry */
import { openCms, ensureCmsMenu } from './cms/cms-app.js?v=20260701-6';
import { loadCms } from './cms/cms-core.js';
import { applySidebarIcons } from './cms/cms-sidebar-icons.js?v=20260701-5';

// hasCmsSession() used to read the old localStorage-based
// "fti_auth_session" key directly. That key no longer exists since the
// Supabase migration -- auth state now lives in enterprise-auth-runtime.js
// and is exposed via window.FTIAuth. Checking it here instead.
function hasCmsSession(){
  return !!(window.FTIAuth && window.FTIAuth.currentUser && window.FTIAuth.currentUser());
}

function openCmsIfAllowed(){
  if (location.hash === '#cms' && hasCmsSession()) openCms();
}

window.addEventListener('hashchange', () => {
  openCmsIfAllowed();
});

// Auth state now resolves asynchronously (Supabase network check), so the
// exact moment hasCmsSession() starts returning true can't be predicted
// with a fixed delay alone -- react to the explicit event
// enterprise-auth-runtime.js dispatches once it actually knows the answer.
window.addEventListener('fti-auth-changed', () => {
  openCmsIfAllowed();
});

window.addEventListener('DOMContentLoaded', () => {
  ensureCmsMenu();
  loadCms().then(data => applySidebarIcons(data.sidebarIcons)).catch(err => console.warn('Không áp dụng được icon sidebar:', err));
  // hasCmsSession() may not have a real answer yet this early (Supabase
  // check is still in flight) -- try immediately in case it's already
  // resolved from a previous visit, then rely on the fti-auth-changed
  // listener above for the real, timing-safe trigger. The extra delayed
  // check is just a low-cost fallback.
  if (location.hash === '#cms') {
    openCmsIfAllowed();
    setTimeout(openCmsIfAllowed, 80);
  }
});
