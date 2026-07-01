/* v9.4.0 Unified CMS entry */
import { openCms, ensureCmsMenu } from './cms/cms-app.js?v=20260701-4';

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
  if (location.hash === '#cms') setTimeout(openCmsIfAllowed, 80);
});
