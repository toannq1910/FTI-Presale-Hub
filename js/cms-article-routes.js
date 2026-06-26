/* v9.8.6 Router Conflict Hotfix

Root cause:
- Previous cms-article-routes.js tried to render sidebar pages by itself.
- The project already has an existing main router for sidebar routes.
- Two routers were fighting each other, so the first click showed CMS Article,
  and the second click showed the original full page.

Fix:
- Disable standalone sidebar page rendering here.
- Keep CMS Articles data/admin for future use.
- Let the existing main router own sidebar pages:
  #crm, #api-reference, #ccaas-vn, #ccaas-global, #uc-pbx, #video, #demo, #compliance...
*/

export function cmsArticleRoutesDisabled(){
  return true;
}

console.info('[v9.8.6] cms-article-routes disabled to prevent router conflict. Existing main router owns sidebar pages.');
