/* v9.8.3 Legacy Editor Cleanup Hotfix
   v9.8.2 hid #pageRoot too aggressively because it searched all div/section text.
   This version only hides explicit legacy editor links/buttons in non-CMS pages.
*/
function cleanupLegacyEditors(){
  if(location.hash === '#cms') return;

  const keywords = [
    'Chỉnh sửa bài viết',
    'card nội dung'
  ];

  document.querySelectorAll('a,button').forEach(el => {
    const text = (el.textContent || '').trim();
    if(!keywords.some(k => text.includes(k))) return;

    const isNewCms = el.closest('#cms-articles') || el.closest('.article-hero') || el.closest('.article-layout');
    if(isNewCms) return;

    el.style.display = 'none';
    el.dataset.removedByCms = 'v9.8.3';
  });
}

window.addEventListener('hashchange', () => setTimeout(cleanupLegacyEditors, 250));
window.addEventListener('DOMContentLoaded', () => setTimeout(cleanupLegacyEditors, 500));
