/* v9.4.0 Unified CMS entry */
import { openCms, ensureCmsMenu } from './cms/cms-app.js';

window.addEventListener('hashchange', () => {
  if (location.hash === '#cms') openCms();
});

window.addEventListener('DOMContentLoaded', () => {
  ensureCmsMenu();
  if (location.hash === '#cms') setTimeout(openCms, 80);
});
