/* v9.8.1 Sidebar Alignment route bridge */
import { loadCms } from './cms/cms-core.js';
import { renderSidebarAlignment, bindSidebarAlignment } from './cms/cms-sidebar.js';
import { renderCms } from './cms/cms-app.js?v=20260701-5';

async function openSidebarAlignment(){
  if(location.hash !== '#sidebar-alignment') return;
  const root = document.querySelector('#pageRoot');
  if(!root) return;

  try{
    const data = await loadCms();
    const title = document.querySelector('#pageTitle');
    const subtitle = document.querySelector('#pageSubtitle');
    if(title) title.textContent = 'Sidebar CMS Alignment';
    if(subtitle) subtitle.textContent = 'Review sidebar taxonomy and CMS ownership';
    root.innerHTML = renderSidebarAlignment(data);
    bindSidebarAlignment(data, renderCms);
  }catch(err){
    console.error('Cannot open sidebar alignment', err);
  }
}

window.addEventListener('hashchange', () => setTimeout(openSidebarAlignment, 80));
window.addEventListener('DOMContentLoaded', () => setTimeout(openSidebarAlignment, 120));
