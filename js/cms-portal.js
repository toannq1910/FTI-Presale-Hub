/* v9.4.0 Unified CMS entry */
import { openCms, ensureCmsMenu } from './cms/cms-app.js?v=20260701-6';
import { loadCms } from './cms/cms-core.js';
import { applySidebarIcons } from './cms/cms-sidebar-icons.js?v=20260701-5';

function hasCmsSession(){
  try{return !!JSON.parse(localStorage.getItem('fti_auth_session')||'null')}catch{return false}
}

function openCmsIfAllowed(){
  if (location.hash === '#cms' && hasCmsSession()) openCms();
}

window.addEventListener('hashchange', () => {
  openCmsIfAllowed();
});

window.addEventListener('DOMContentLoaded', () => {
  ensureCmsMenu();
  loadCms().then(data => applySidebarIcons(data.sidebarIcons)).catch(err => console.warn('Không áp dụng được icon sidebar:', err));
  // hasCmsSession() only reads localStorage (synchronous), so check
  // immediately first to avoid a visible flash of the locked "CMS Data"
  // landing card before flipping to the real admin view. Keep a delayed
  // fallback too in case #pageRoot hasn't been populated by main.js's own
  // initial render yet at this exact instant.
  if (location.hash === '#cms') {
    openCmsIfAllowed();
    setTimeout(openCmsIfAllowed, 80);
  }
});
