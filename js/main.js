import{CONFIG}from'./config.js';
import{stats,solutions,vendorGroups,compareRows,complianceCards,resources,partnerProductCatalog}from'./data.js';
import{getProductAssets,assetObjectUrl,formatBytes,assetPut,generatePresentationPages,assetGet}from'./cms/cms-assets.js?v=20260701-4';
import{CMS_KEY}from'./cms/cms-core.js';
import{ocxGetCurrentDoc,ocxGetDocUrl}from'./oncallcx-doc-manager.js';

function isVideoConferenceHash(hash=location.hash){
  const h=String(hash||'').replace('#','');
  return h==='video-conferencing'||h.startsWith('vc-');
}
function isVideoConferencePage(page=''){
  const p=String(page||'');
  return p==='video'||p==='video-conferencing'||p.startsWith('vc-');
}
function videoHashFromPage(page=''){
  const p=String(page||'');
  if(p==='video'||p==='video-conferencing')return '#video-conferencing';
  if(p.startsWith('vc-'))return `#${p}`;
  return '';
}
function isSystemSecurityPage(page=''){
  return ['users','permissions','audit-log'].includes(String(page||''));
}
function resolvePageFromHash(){
  const h=location.hash.replace('#','');
  if(h==='editor'||h.startsWith('editor:'))return 'cms';
  if(h==='vendor-editor'||h.startsWith('vendor-editor:'))return 'cms';
  if(h.startsWith('api-folder:'))return 'api-reference';
  if(h==='oncallcx-product-center-ccaas'||h==='oncallcx-product-center-ucaas')return 'oncallcx-product-center';
  if(h.startsWith('oncallcx-product-center:'))return 'oncallcx-product-center';
  if(isVideoConferenceHash(h))return h;
  if(h==='oncallcx-presale-ccaas'||h==='oncallcx-presale-ucaas')return 'oncallcx-presale';
  if(h.startsWith('oncallcx-presale:'))return 'oncallcx-presale';
  if(h==='presentation-oncallcx-ccaas'||h==='presentation-oncallcx-ucaas')return 'presentation-oncallcx';
  if(h.startsWith('presentation-oncallcx:'))return 'presentation-oncallcx';
  return h||'overview';
}

const state={page:resolvePageFromHash(),demoStep:0};

const titles={
  overview:['Tổng quan','Customer-facing Collaboration Portal'],
  oncallcx:['OnCallCX','Trang sản phẩm OnCallCX'],
  'presentation-oncallcx':['OncallCX Presentation','Trình chiếu tài liệu OncallCX'],
  'oncallcx-product-center':['OnCallCX Product Center','Overview · Presentation · Demo · Datasheet'],
  'ccaas-vn':['CCaaS Việt Nam','Bài viết sản phẩm đối tác Việt Nam'],
  'ccaas-global':['CCaaS Global','Bài viết sản phẩm đối tác quốc tế'],
  'ucpbx-vn':['UC/PBX Việt Nam','Bài viết sản phẩm UC/PBX Việt Nam'],
  'api-reference':['API Reference','CONTACT CENTER/API Reference'],
  'video-conferencing':['Video Conferencing','System · Endpoint · Global'],
  video:['Video Solutions','Room system và endpoint'],
  devices:['Thiết bị phòng họp','Yealink · Logitech · Poly · Cisco'],
  integration:['Integration Playbook','CRM · ERP · BYOC · Webhook'],
  crm:['CRM/ERP Việt Nam','Tích hợp dữ liệu khách hàng'],
  compliance:['Tuân thủ Việt Nam','Checklist pháp lý và kỹ thuật'],
  demo:['Demo sản phẩm','Mô phỏng luồng khách hàng thực tế'],
  compare:['Bảng so sánh','So sánh giải pháp theo capability'],
  resources:['Nguồn tài liệu','Tài liệu dành cho khách hàng'],
  cms:['CMS Data','Unified content management'],
  users:['Quản lý User','Enterprise Authentication · Users'],
  permissions:['Phân quyền','Group-Based Access Control'],
  'audit-log':['Audit Log','Authentication and CMS activity logs']
};
titles['oncallcx-presale']=['OnCallCX Presale','Architecture · Pricing · Checklist'];

export const $=(s,r=document)=>r.querySelector(s);
export const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const safeHtml=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const isPdfAsset=a=>a&&(a.mimeType==='application/pdf'||/\.pdf$/i.test(a.fileName||''));
const isPowerPointAsset=a=>a&&(/powerpoint|presentation/i.test(a.mimeType||'')||/\.(ppt|pptx)$/i.test(a.fileName||''));

const GROUP_PAGE_KEYS=['ccaas-vn','ccaas-global','ucpbx-vn','crm'];
function groupKeyToPage(groupKey){return GROUP_PAGE_KEYS.includes(groupKey)?groupKey:'overview'}
function packVendorHash(groupKey,vendorId=''){return encodeURIComponent(groupKey)+'~'+encodeURIComponent(vendorId||'')}
function unpackVendorHash(payload=''){
  const parts=payload.split('~');
  return {groupKey:decodeURIComponent(parts[0]||''),vendorId:decodeURIComponent(parts[1]||'')};
}
function safeHashPage(page){
  if(page==='editor'||page==='vendor-editor')page='cms';
  const videoHash=videoHashFromPage(page);
  if(videoHash){
    if(location.hash!==videoHash)location.hash=videoHash;
    return;
  }
  if(page==='editor'&&location.hash.includes('editor:'))return;
  if(page==='vendor-editor'&&location.hash.includes('vendor-editor:'))return;
  if(page==='api-reference'&&location.hash.includes('api-folder:'))return;
  if(page==='oncallcx-product-center'&&/^#oncallcx-product-center-(ccaas|ucaas)$/.test(location.hash))return;
  if(page==='oncallcx-product-center'&&location.hash.includes('oncallcx-product-center:'))return;
  if(page==='oncallcx-presale'&&/^#oncallcx-presale-(ccaas|ucaas)$/.test(location.hash))return;
  if(page==='oncallcx-presale'&&location.hash.includes('oncallcx-presale:'))return;
  if(page==='presentation-oncallcx'&&/^#presentation-oncallcx-(ccaas|ucaas)$/.test(location.hash))return;
  if(page==='presentation-oncallcx'&&location.hash.includes('presentation-oncallcx:'))return;
  location.hash=page;
}
export function toast(m){
  const e=document.createElement('div');
  e.className='toast';
  e.textContent=m;
  $('#toastRoot').appendChild(e);
  setTimeout(()=>e.remove(),3000);
}

/* ========= Generic article CRUD ========= */
const LEGACY_LOCAL_CRUD_ENABLED=false;
const CONTENT_KEY='fti_hub_content_overrides_v1';
function getOverrides(){if(!LEGACY_LOCAL_CRUD_ENABLED)return {};try{return JSON.parse(localStorage.getItem(CONTENT_KEY)||'{}')}catch{return {}}}
function saveOverrides(data){if(!LEGACY_LOCAL_CRUD_ENABLED)return;localStorage.setItem(CONTENT_KEY,JSON.stringify(data))}
function createContentItem(bucket='general'){
  return {id:'custom-solution-'+Date.now(),bucket,icon:'📝',title:'Bài viết mới',type:'Nội dung mới',desc:'Nhập mô tả bài viết tại đây.',chips:['New','Draft'],apis:[['GET','/api/new','Mô tả endpoint']]};
}
function allContentItems(){
  const overrides=getOverrides();
  const deleted=new Set(overrides.__deleted||[]);
  const custom=overrides.__custom||[];
  const base=solutions.filter(x=>!deleted.has(x.id)).map(x=>({...x,...(overrides[x.id]||{})}));
  return [...base,...custom];
}
function getContentItem(id){return allContentItems().find(x=>x.id===id)||solutions[0]}
function updateContentItem(id,patch){
  const overrides=getOverrides();
  if(id?.startsWith('custom-solution-')){
    overrides.__custom=overrides.__custom||[];
    const idx=overrides.__custom.findIndex(x=>x.id===id);
    const item={id,...patch,updatedAt:new Date().toISOString()};
    if(idx>=0)overrides.__custom[idx]={...overrides.__custom[idx],...item};else overrides.__custom.push(item);
  }else overrides[id]={...(overrides[id]||{}),...patch,updatedAt:new Date().toISOString()};
  saveOverrides(overrides);
}
function deleteContentItem(id){
  const overrides=getOverrides();
  if(id?.startsWith('custom-solution-'))overrides.__custom=(overrides.__custom||[]).filter(x=>x.id!==id);
  else{overrides.__deleted=overrides.__deleted||[];if(!overrides.__deleted.includes(id))overrides.__deleted.push(id)}
  saveOverrides(overrides);
}
function resetContentItem(id){
  const overrides=getOverrides();
  if(id?.startsWith('custom-solution-'))overrides.__custom=(overrides.__custom||[]).filter(x=>x.id!==id);
  else{delete overrides[id];overrides.__deleted=(overrides.__deleted||[]).filter(x=>x!==id)}
  saveOverrides(overrides);
}

/* ========= Product article + moved API article CRUD ========= */
const PRODUCT_KEY='fti_hub_product_article_overrides_v8';
const MOVED_API_KEY='fti_hub_moved_api_article_overrides_v8';

function getStore(key){if(!LEGACY_LOCAL_CRUD_ENABLED)return {};try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return {}}}
function saveStore(key,data){if(!LEGACY_LOCAL_CRUD_ENABLED)return;localStorage.setItem(key,JSON.stringify(data))}

function baseProductGroup(groupKey){
  const c=partnerProductCatalog[groupKey];
  if(!c)return {title:groupKey,productTitle:groupKey,products:[],apiDocs:[]};
  const apiDocs=(vendorGroups[groupKey]?.vendors||[]).map((v,i)=>({id:v.id||`api-${groupKey}-${i}`,...v}));
  return {...c,apiDocs};
}
function getProductGroup(groupKey){
  const base=baseProductGroup(groupKey);
  const store=getStore(PRODUCT_KEY);
  const group=store[groupKey]||{custom:[],edited:{},deleted:[]};
  const deleted=new Set(group.deleted||[]);
  const edited=group.edited||{};
  const baseProducts=(base.products||[]).map((p,i)=>({id:p.id||`product-${groupKey}-${i}`,...p,...(edited[p.id||`product-${groupKey}-${i}`]||{})})).filter(p=>!deleted.has(p.id));
  return {...base,products:[...baseProducts,...(group.custom||[])]};
}
function getProductArticle(groupKey,id){
  const group=getProductGroup(groupKey);
  return group.products.find(p=>p.id===id)||getVirtualProductArticle(groupKey,id,group)||group.products[0]||createProductArticle(groupKey);
}
function createProductArticle(groupKey){
  return {id:'custom-product-'+groupKey+'-'+Date.now(),name:'Bài viết sản phẩm mới',icon:'📝',category:'Sản phẩm / Đối tác',tags:['Product','Draft'],source:'',desc:'Nhập nội dung bài viết sản phẩm tại đây.',strengths:['Điểm nổi bật mới'],usecases:['Use case mới'],link:''};
}
function createInheritedOnCallCXArticle(primary){
  if(!primary)return null;
  const productData=getOnCallCXCmsProduct('ucaas')||ONCALLCX_UCAAS_PRODUCT_DEFAULT;
  return cmsProductToProductArticle(productData,{
    ...primary,
    id:'prod-oncallcx-ucaas-inherited',
    name:'OnCallCX UCaaS',
    icon:'🏢',
    category:'UCaaS / Cloud PBX Platform',
    source:primary.source||'oncallcx.vn',
    desc:'OnCallCX UCaaS là bài viết mở rộng từ nội dung OncallCX hiện có, tập trung vào tổng đài Cloud PBX, extension, SIP trunk, call routing và khả năng tích hợp CRM/API cho doanh nghiệp.',
    link:primary.link||'oncallcx.vn'
  });
}
function currentOnCallCXProductId(){
  const h=location.hash.replace('#','');
  if(h.endsWith('-ucaas'))return 'prod-oncallcx-ucaas-inherited';
  if(h.endsWith('-ccaas'))return 'prod-oncallcx-fpt';
  const payload=h.includes(':')?h.split(':').slice(1).join(':'):'';
  return payload||'prod-oncallcx-fpt';
}
function onCallCXRouteSlug(productId=currentOnCallCXProductId()){
  return productId==='prod-oncallcx-ucaas-inherited'?'ucaas':'ccaas';
}
function onCallCXProductCenterHash(productId=currentOnCallCXProductId()){
  return `oncallcx-product-center-${onCallCXRouteSlug(productId)}`;
}
function onCallCXPresaleHash(productId=currentOnCallCXProductId()){
  return `oncallcx-presale-${onCallCXRouteSlug(productId)}`;
}
function onCallCXPresentationHash(productId=currentOnCallCXProductId()){
  return `presentation-oncallcx-${onCallCXRouteSlug(productId)}`;
}
function onCallCXPresentationConfig(productId=currentOnCallCXProductId()){
  const isUcaas=productId==='prod-oncallcx-ucaas-inherited';
  return isUcaas ? {
    productId,
    title:'OnCallCX UCaaS',
    subtitle:'Cloud PBX Platform',
    label:'OnCallCX UCaaS Presentation',
    description:'Presentation riêng cho OnCallCX UCaaS. File này độc lập với OnCallCX CCaaS và sẽ được cấu hình/upload riêng.',
    pdfPath:'assets/presentation/oncallcx-ucaas.pdf',
    pagesDir:'assets/presentation/oncallcx-ucaas-pages',
    pageCount:13,
    assetProductIds:['prod-oncallcx-ucaas-inherited','oncallcx-as7-ucaas'],
    cmsProductLabel:'OnCallCX UCaaS'
  } : {
    productId:'prod-oncallcx-fpt',
    title:'OncallCX - Contact Center As A Service',
    subtitle:'Cloud Contact Center Platform',
    label:'OnCallCX CCaaS Presentation',
    description:'Presentation riêng cho OnCallCX CCaaS / Contact Center as a Service.',
    pdfPath:'assets/presentation/oncallcx.pdf',
    pagesDir:'assets/presentation/oncallcx-pages',
    pageCount:49,
    assetProductIds:['oncallcx','prod-oncallcx-fpt'],
    cmsProductLabel:'OnCallCX'
  };
}
async function findOnCallCXAsset(cfg,type='presentation'){
  const ids=cfg.assetProductIds||[cfg.productId];
  try{
    for(const id of ids){
      const found=(await getProductAssets(id)).find(a=>a.type===type);
      if(found)return found;
    }
  }catch(err){
    console.warn('Cannot load product asset from CMS Asset Manager',err);
  }
  return null;
}
async function findOnCallCXAssets(cfg,type='api'){
  const ids=cfg.assetProductIds||[cfg.productId];
  const seen=new Set();
  const results=[];
  try{
    for(const id of ids){
      const list=(await getProductAssets(id)).filter(a=>a.type===type);
      list.forEach(a=>{ if(!seen.has(a.id)){ seen.add(a.id); results.push(a); } });
    }
  }catch(err){
    console.warn('Cannot load product assets from CMS Asset Manager',err);
  }
  return results;
}
async function findOnCallCXPresentationAsset(cfg){
  return findOnCallCXAsset(cfg,'presentation');
}
async function ensureOnCallCXAssetPages(asset){
  if(Array.isArray(asset?.pages) && asset.pages.length) return asset;
  if(!asset?.blob) return asset;
  toast('Đang render file Presentation đã upload...');
  const generated=await generatePresentationPages(asset.blob,{fileName:asset.fileName});
  const next={
    ...asset,
    pages:generated.pages||[],
    thumbnail:generated.thumbnail||'',
    pageCount:generated.pageCount||0,
    generatedAt:generated.generatedAt||new Date().toISOString(),
    renderSource:generated.renderSource||asset.renderSource||'',
    generationError:generated.error||''
  };
  await assetPut(next);
  if(next.pageCount) toast(`Đã render ${next.pageCount} slide.`);
  else if(next.generationError) toast('Chưa render được slide từ file này.');
  return next;
}
function getVirtualProductArticle(groupKey,id,group=getProductGroup(groupKey)){
  if(groupKey!=='ccaas-vn'||id!=='prod-oncallcx-ucaas-inherited')return null;
  const store=getStore(PRODUCT_KEY);
  const groupStore=store[groupKey]||{};
  if((groupStore.deleted||[]).includes(id))return null;
  const primary=(group.products||[]).find(p=>p.id==='prod-oncallcx-fpt'||/OncallCX|OnCallCX/i.test(p.name));
  const base=createInheritedOnCallCXArticle(primary);
  return base?{...base,...(groupStore.edited?.[id]||{})}:null;
}
function upsertProductArticle(groupKey,article){
  const store=getStore(PRODUCT_KEY);
  store[groupKey]=store[groupKey]||{custom:[],edited:{},deleted:[]};
  if(article.id?.startsWith('custom-product-')){
    const idx=store[groupKey].custom.findIndex(x=>x.id===article.id);
    if(idx>=0)store[groupKey].custom[idx]=article;else store[groupKey].custom.push(article);
  }else store[groupKey].edited[article.id]=article;
  saveStore(PRODUCT_KEY,store);
}
function deleteProductArticle(groupKey,id){
  const store=getStore(PRODUCT_KEY);
  store[groupKey]=store[groupKey]||{custom:[],edited:{},deleted:[]};
  if(id.startsWith('custom-product-'))store[groupKey].custom=(store[groupKey].custom||[]).filter(x=>x.id!==id);
  else if(!store[groupKey].deleted.includes(id))store[groupKey].deleted.push(id);
  saveStore(PRODUCT_KEY,store);
}

function getMovedApiGroup(groupKey){
  const base=baseProductGroup(groupKey);
  const store=getStore(MOVED_API_KEY);
  const group=store[groupKey]||{custom:[],edited:{},deleted:[]};
  const deleted=new Set(group.deleted||[]);
  const edited=group.edited||{};
  const docs=(base.apiDocs||[]).map((d,i)=>({id:d.id||`api-${groupKey}-${i}`,...d,...(edited[d.id||`api-${groupKey}-${i}`]||{})})).filter(d=>!deleted.has(d.id));
  return {...base,apiDocs:[...docs,...(group.custom||[])]};
}

/* ========= Compliance CRUD ========= */
const COMPLIANCE_KEY='fti_hub_compliance_overrides_v1';
function getComplianceStore(){if(!LEGACY_LOCAL_CRUD_ENABLED)return {};try{return JSON.parse(localStorage.getItem(COMPLIANCE_KEY)||'{}')}catch{return {}}}
function saveComplianceStore(data){if(!LEGACY_LOCAL_CRUD_ENABLED)return;localStorage.setItem(COMPLIANCE_KEY,JSON.stringify(data))}
function getComplianceCards(){
  const store=getComplianceStore();
  const deleted=new Set(store.deleted||[]);
  const edited=store.edited||{};
  const custom=store.custom||[];
  const base=complianceCards.map((c,i)=>({id:c.id||`base-compliance-${i}`,...c,...(edited[c.id||`base-compliance-${i}`]||{})})).filter(c=>!deleted.has(c.id));
  return [...base,...custom];
}
function upsertComplianceCard(card){
  const store=getComplianceStore();
  store.custom=store.custom||[];store.edited=store.edited||{};
  if(card.id?.startsWith('custom-compliance-')){
    const idx=store.custom.findIndex(x=>x.id===card.id);
    if(idx>=0)store.custom[idx]=card;else store.custom.push(card);
  }else store.edited[card.id]=card;
  saveComplianceStore(store);
}
function deleteComplianceCard(id){
  const store=getComplianceStore();
  if(id?.startsWith('custom-compliance-'))store.custom=(store.custom||[]).filter(x=>x.id!==id);
  else{store.deleted=store.deleted||[];if(!store.deleted.includes(id))store.deleted.push(id)}
  saveComplianceStore(store);
}
function promptComplianceCard(existing){
  const title=prompt('Tiêu đề bài viết tuân thủ:',existing?.title||'Bài viết tuân thủ mới');
  if(!title)return null;
  const icon=prompt('Icon:',existing?.icon||'🛡️')||'🛡️';
  const bulletsText=prompt('Nội dung bullet, phân tách bằng dấu ;',(existing?.bullets||['Nội dung mới']).join('; '));
  return {id:existing?.id||'custom-compliance-'+Date.now(),title,icon,type:existing?.type||'info',bullets:(bulletsText||'').split(';').map(x=>x.trim()).filter(Boolean)}
}


/* ========= Auth ========= */
function initAuth(){
  const chip=$('#permissionChip');
  chip.textContent=CONFIG.LOGIN_REQUIRED?'Login: ON':'Login: OFF';
  chip.style.color=CONFIG.LOGIN_REQUIRED?'#fdba74':'#86efac';
  if(!CONFIG.LOGIN_REQUIRED)return;
  const raw=sessionStorage.getItem(CONFIG.SESSION_KEY)||localStorage.getItem(CONFIG.SESSION_KEY);
  if(raw){try{if(Date.now()<JSON.parse(raw).expiresAt)return}catch{}}
  $('#loginOverlay').hidden=false;
}
function login(email){
  sessionStorage.setItem(CONFIG.SESSION_KEY,JSON.stringify({email,expiresAt:Date.now()+8*3600*1000}));
  $('#loginOverlay').hidden=true;
  toast('Đăng nhập demo thành công');
}
function logout(){
  sessionStorage.removeItem(CONFIG.SESSION_KEY);
  localStorage.removeItem(CONFIG.SESSION_KEY);
  if(CONFIG.LOGIN_REQUIRED)$('#loginOverlay').hidden=false;
  toast('Đã xóa session demo');
}

/* ========= UI ========= */
function renderStats(){
  return `<div class="stats-grid">${stats.map(s=>`<div class="stat-card"><div class="stat-icon ${s.color}">${s.icon}</div><div><div class="stat-value">${s.value}</div><div class="stat-label">${s.label}</div></div></div>`).join('')}</div>`;
}
function renderHero(){
  return `<section class="hero"><div class="hero-grid"><div><span class="eyebrow">🚀 FTI Collaboration Customer Hub</span><h2>Bản đồ giải pháp<br><span class="gradient-text">Contact Center · Video · Integration</span></h2><p>Trang web hướng tới khách hàng: giúp đọc hiểu nhanh hệ sinh thái giải pháp FTI, xem demo luồng nghiệp vụ, so sánh nền tảng và nắm checklist triển khai tại Việt Nam.</p><div class="hero-actions"><button class="btn btn-primary" data-go="demo">Xem Demo sản phẩm</button><button class="btn btn-soft" data-go="oncallcx">Khám phá OnCallCX</button><button class="btn btn-ghost" data-go="api-reference">Xem API Reference</button></div></div><div class="hero-visual"><div class="mini-window"><div class="mini-head"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div><div class="mini-body"><div class="flow-line"><div class="flow-node">Product Articles</div><div class="flow-arrow">→</div><div class="flow-node">Customer View</div></div><div class="flow-line"><div class="flow-node">API Reference</div><div class="flow-arrow">↔</div><div class="flow-node">Technical View</div></div><div class="flow-line"><div class="flow-node">Demo</div><div class="flow-arrow">→</div><div class="flow-node">Presales</div></div></div></div></div></div></section>`;
}
function solutionCard(input){
  const i=input?.id?getContentItem(input.id):input;
  return `<article class="solution-card" data-solution="${safeHtml(i.id)}"><div class="solution-top"><div class="solution-icon">${safeHtml(i.icon)}</div><div><h3>${safeHtml(i.title)}</h3><small>${safeHtml(i.type)}</small></div></div><div class="solution-body"><p>${safeHtml(i.desc)}</p><div class="chips">${(i.chips||[]).map((c,n)=>`<span class="chip ${n%3===0?'orange':n%3===1?'green':'blue'}">${safeHtml(c)}</span>`).join('')}</div><div class="api-list">${(i.apis||[]).map(apiEndpointRow).join('')}</div></div></article>`;
}
function renderSolutions(filter){
  const legacySource=allContentItems();
  const legacyList=filter?legacySource.filter(s=>s.id===filter||s.bucket===filter||s.type.toLowerCase().includes(filter)||s.title.toLowerCase().includes(filter)):legacySource;
  return `<div class="section-head"><div><h2>Danh mục giải pháp</h2><p>Trình bày dạng card, dùng cho các trang không thuộc nhóm API/Product Partner.</p></div></div><div class="solution-grid">${legacyList.map(solutionCard).join('')}</div>`;
}

/* ========= Product Article pages ========= */
function productArticleCard(v,groupKey='',presentationMode=false,routeOverride=''){
  const features=(v.strengths&&v.strengths.length?v.strengths:(v.tags||[])).slice(0,4);
  const uses=(v.usecases||[]).slice(0,3);
  const href=(v.link||'#').startsWith('http')?(v.link||'#'):(v.link?`https://${v.link}`:'#');
  const actionRoute=normalizePublicRoute(routeOverride||'');
  const routeAction=actionRoute&&!actionRoute.startsWith('#product-detail:');
  return `<article class="partner-card">
    <div class="partner-head">
      <div class="partner-icon">${safeHtml(v.icon)}</div>
      <div>
        <h3>${safeHtml(v.name)}</h3>
        <small>${safeHtml(v.category||'Product')}</small>
      </div>
    </div>
    <div class="partner-body">
      <div class="partner-meta">${[v.source||'',...(v.tags||[]).slice(0,3)].filter(Boolean).map(x=>`<span>${safeHtml(x)}</span>`).join('')}</div>
      <p>${safeHtml(v.desc)}</p>
      <div class="partner-features">${features.map(x=>`<span>&#10003; ${safeHtml(x)}</span>`).join('')}</div>
      ${uses.length?`<div class="partner-usecases"><b>Phù hợp:</b>${uses.map(x=>`<em>${safeHtml(x)}</em>`).join('')}</div>`:''}
    </div>
      <div class="partner-foot">
      ${routeAction
        ? `<button class="btn btn-primary" ${publicCardAttrs(actionRoute)}>Xem chi tiết</button>`
        : presentationMode
          ? `<button class="btn btn-primary" data-ocx-product-center="${safeHtml(v.id)}">Xem chi tiết</button>`
          : `<a class="btn btn-primary btn-link" href="${safeHtml(href)}" target="_blank" rel="noopener">Xem chi tiết</a>`}
    </div>
  </article>`;
}
function renderProductGroup(groupKey,customTitle=''){
  const g=getProductGroup(groupKey);
  const legacyTitle=customTitle||g.productTitle||g.title;
  return `<section class="product-hero">
    <span class="eyebrow">Product Articles</span>
    <h2>${safeHtml(legacyTitle)}</h2>
    <p>Các bài viết tại đây là nội dung sản phẩm/đối tác dành cho khách hàng đọc hiểu. Các bài viết kỹ thuật/API cũ đã được chuyển sang khu vực API Reference.</p>
    <div class="hero-actions">
      <button class="btn btn-soft" data-go="api-reference">Xem API Reference</button>
    </div>
  </section>
  <div class="partner-grid">${g.products.map(v=>productArticleCard(v,groupKey)).join('')}</div>`;
}
function renderOnCallCXProduct(){
  return renderProductGroup('ccaas-vn','OnCallCX & nhóm Contact Center Việt Nam');
}

/* ========= API Reference: moved full articles ========= */
const apiFolders=[
  {id:'ccaas-vn',path:'CONTACT CENTER/API Reference/CCaaS/Đối Tác Việt Nam',title:'CCaaS / Đối Tác Việt Nam',groupKey:'ccaas-vn',icon:'🇻🇳'},
  {id:'ccaas-global',path:'CONTACT CENTER/API Reference/CCaaS/Đối tác quốc tế',title:'CCaaS / Đối tác quốc tế',groupKey:'ccaas-global',icon:'☁️'},
  {id:'ucaas-vn',path:'CONTACT CENTER/API Reference/UCaaS/Đối Tác Việt Nam',title:'UCaaS / Đối Tác Việt Nam',groupKey:'ucpbx-vn',icon:'🏁'},
  {id:'ucaas-global',path:'CONTACT CENTER/API Reference/UCaaS/Đối tác quốc tế',title:'UCaaS / Đối tác quốc tế',groupKey:'ucaas-global',icon:'🌐'}
];
function apiEndpointRow(a){
  const method=String(a?.[0]||'GET');
  const methodClass=method.toLowerCase()==='post'?'post':method.toLowerCase()==='ws'?'ws':'get';
  return `<div class="api-row"><span class="method ${methodClass}">${safeHtml(method)}</span><span class="path">${safeHtml(a?.[1]||'')}</span><span class="api-desc">${safeHtml(a?.[2]||'')}</span></div>`;
}
function apiArticleCard(v,groupKey=''){
  return `<article class="api-doc-card">
    <header><div class="vendor-icon">${safeHtml(v.icon)}</div><div><h3>${safeHtml(v.name)}</h3><small>${safeHtml(v.category)}</small></div></header>
    <p class="api-article-desc">${safeHtml(v.desc)}</p>
    <div class="chips">${(v.tags||[]).map((t,i)=>`<span class="chip ${i%3===0?'green':i%3===1?'blue':'orange'}">${safeHtml(t)}</span>`).join('')}</div>
    <h4>Endpoints / API notes</h4>
    <div class="api-list">${(v.endpoints||[]).map(apiEndpointRow).join('')}</div>
  </article>`;
}
function renderApiReference(){
  const selected=location.hash.includes('api-folder:')?location.hash.split('api-folder:')[1]:'ccaas-vn';
  const active=apiFolders.find(f=>f.id===selected)||apiFolders[0];
  const group=getMovedApiGroup(active.groupKey);
  return `<section class="api-ref-hero">
    <span class="eyebrow">API Reference</span>
    <h2>CONTACT CENTER / API Reference</h2>
    <p>Toàn bộ bài viết cũ đang hiển thị dạng API trong các mục OnCallCX, CCaaS, UC/PBX đã được chuyển về đây theo cấu trúc thư mục.</p>
    <div class="api-folder-tabs">
      ${apiFolders.map(f=>`<button class="${f.id===active.id?'active':''}" data-api-folder="${safeHtml(f.id)}"><span>${safeHtml(f.icon)}</span><b>${safeHtml(f.title)}</b></button>`).join('')}
    </div>
  </section>
  <main class="api-ref-content full">
    <div class="breadcrumb">${safeHtml(active.title)}</div>
    <div class="section-head"><div><h2>${safeHtml(active.title)}</h2><p>${safeHtml(group?.apiFolder||active.title)}</p></div></div>
    <div class="api-doc-list">${(group?.apiDocs||[]).map(v=>apiArticleCard(v,active.groupKey)).join('')}</div>
  </main>`;
}

/* ========= Other pages ========= */
const PUBLIC_ROUTE_ALIASES={
  '#uc-pbx':'#ucpbx-vn',
  '#uc-pbx-vietnam':'#ucpbx-vn',
  '#ccaas-vietnam':'#ccaas-vn',
  '#ccaas-international':'#ccaas-global',
  '#video':'#video-conferencing',
  '#integration-playbook':'#integration',
  '#crm-erp-vietnam':'#crm',
  '#product-detail:oncallcx':'#oncallcx-product-center-ccaas',
  '#oncallcx-product-center:prod-oncallcx-fpt':'#oncallcx-product-center-ccaas',
  '#oncallcx-product-center:prod-oncallcx-ucaas-inherited':'#oncallcx-product-center-ucaas'
};
function getLocalCmsData(){
  try{return JSON.parse(localStorage.getItem(CMS_KEY)||'{}')}catch{return {}}
}
const ONCALLCX_UCAAS_PRODUCT_DEFAULT={
  id:'oncallcx-ucaas',
  title:'OnCallCX UCaaS',
  subtitle:'UCaaS / Cloud PBX Platform',
  vendor:'FPT Telecom',
  category:'OnCallCX',
  status:'active',
  score:'9/10',
  website:'https://oncallcx.vn',
  tags:['oncallcx','ucaas','cloud-pbx','extension','sip-trunk','api-ready'],
  summary:'OnCallCX UCaaS là bài viết mở rộng từ OnCallCX, tập trung vào tổng đài Cloud PBX, extension, SIP trunk, call routing và khả năng tích hợp CRM/API cho doanh nghiệp.',
  highlights:['Cloud PBX','Extension / User','SIP Trunk','Call Routing / IVR','CDR / Call Log','API-ready Integration'],
  useCases:['Enterprise','Banking','Finance']
};
function getCmsProductByIds(ids=[]){
  const cms=getLocalCmsData();
  const products=Array.isArray(cms.products)?cms.products:[];
  const matches=ids.map(id=>products.find(p=>p.id===id)).filter(Boolean);
  return matches.find(p=>p.status==='active')||matches[0]||null;
}
function getOnCallCXCmsProduct(kind='ccaas'){
  if(kind==='ucaas')return getCmsProductByIds(['oncallcx-ucaas','prod-oncallcx-uc','oncallcx-as7-ucaas']);
  return getCmsProductByIds(['oncallcx','prod-oncallcx-fpt']);
}
function cmsProductToProductArticle(product={},fallback={}){
  return {
    ...fallback,
    id:fallback.id||product.id||'product',
    name:product.title||fallback.name||'Untitled',
    icon:fallback.icon||'📄',
    category:product.subtitle||product.category||fallback.category||'Product',
    source:product.vendor||fallback.source||'',
    desc:product.summary||fallback.desc||'',
    tags:Array.isArray(product.tags)&&product.tags.length?product.tags:(fallback.tags||[]),
    strengths:Array.isArray(product.highlights)&&product.highlights.length?product.highlights:(fallback.strengths||[]),
    usecases:Array.isArray(product.useCases)&&product.useCases.length?product.useCases:(fallback.usecases||[]),
    link:product.website||fallback.link||''
  };
}
function getCmsArticleById(id){
  const cms=getLocalCmsData();
  return (cms.articles||[]).find(a=>a.id===id)||null;
}
const PUBLIC_ARTICLE_ROUTE_BY_PAGE={
  overview:'#overview',
  oncallcx:'#oncallcx',
  'ccaas-vn':'#ccaas-vn',
  'ccaas-global':'#ccaas-global',
  'ucpbx-vn':'#ucpbx-vn',
  'api-reference':'#api-reference',
  video:'#video-conferencing',
  devices:'#video-conferencing',
  integration:'#integration',
  crm:'#crm'
};
function normalizePublicRoute(route=''){
  const raw=String(route||'').trim();
  if(!raw)return '';
  if(PUBLIC_ROUTE_ALIASES[raw])return PUBLIC_ROUTE_ALIASES[raw];
  if(raw.startsWith('#oncallcx-product-centerprod-oncallcx-ucaas'))return '#oncallcx-product-center-ucaas';
  if(raw.startsWith('#oncallcx-product-centerprod-oncallcx-fpt'))return '#oncallcx-product-center-ccaas';
  if(raw.startsWith('#oncallcx-product-center:prod-oncallcx-ucaas'))return '#oncallcx-product-center-ucaas';
  if(raw.startsWith('#oncallcx-product-center:prod-oncallcx-fpt'))return '#oncallcx-product-center-ccaas';
  return raw;
}
function getCmsArticleByRoute(route=''){
  const target=normalizePublicRoute(route);
  if(!target)return null;
  const cms=getLocalCmsData();
  return (cms.articles||[]).find(article=>{
    const articleRoute=normalizePublicRoute(article.route||'');
    const sidebarRoute=normalizePublicRoute(article.sidebarId?`#${article.sidebarId}`:'');
    return articleRoute===target||sidebarRoute===target;
  })||null;
}
function getCmsArticleForPage(page='overview'){
  return getCmsArticleByRoute(PUBLIC_ARTICLE_ROUTE_BY_PAGE[page]||`#${page}`)||null;
}
function getCmsArticleCards(article){
  return (Array.isArray(article?.cards)?article.cards:[])
    .filter(card=>card&&(card.title||card.summary||card.url||card.route))
    .map(card=>({...card,url:normalizePublicRoute(card.url||card.route||article?.route||'')}));
}
function textSlug(value=''){
  return String(value||'')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/^-+|-+$/g,'');
}
function productsForCmsGroup(groupKey=''){
  const group=getProductGroup(groupKey);
  const products=[...(group.products||[])];
  if(groupKey==='ccaas-vn'){
    const inherited=getVirtualProductArticle('ccaas-vn','prod-oncallcx-ucaas-inherited',group);
    if(inherited&&!products.some(p=>p.id===inherited.id))products.push(inherited);
  }
  return products;
}
function cmsRouteProductId(route=''){
  const normalized=normalizePublicRoute(route);
  if(normalized==='#oncallcx-product-center-ccaas')return 'prod-oncallcx-fpt';
  if(normalized==='#oncallcx-product-center-ucaas')return 'prod-oncallcx-ucaas-inherited';
  const detail=normalized.match(/^#product-detail:([^#]+)/);
  if(detail)return detail[1];
  return '';
}
function findProductForCmsCard(card,groupKey=''){
  const route=normalizePublicRoute(card.url||card.route||'');
  const routeId=cmsRouteProductId(route);
  const routeSlug=textSlug(routeId.replace(/^prod-/,''));
  const titleSlug=textSlug(card.title||'');
  const products=productsForCmsGroup(groupKey);
  return products.find(product=>{
    const idSlug=textSlug(String(product.id||'').replace(/^prod-/,''));
    const nameSlug=textSlug(product.name||'');
    return (routeSlug&&(idSlug===routeSlug||nameSlug===routeSlug||nameSlug.includes(routeSlug)))||
      (titleSlug&&(nameSlug===titleSlug||nameSlug.includes(titleSlug)||titleSlug.includes(nameSlug)));
  })||null;
}
function cmsPartnerCard(card,groupKey='',presentationMode=false){
  const route=normalizePublicRoute(card.url||card.route||'');
  const product=findProductForCmsCard(card,groupKey);
  if(product)return productArticleCard(product,groupKey,presentationMode,route);
  const title=card.title||'Untitled';
  return `<article class="partner-card cms-public-card">
    <div class="partner-head">
      <div class="partner-icon">${safeHtml(card.icon||overviewIcon(route,title))}</div>
      <div><h3>${safeHtml(title)}</h3><small>${safeHtml(route||'CMS Articles')}</small></div>
    </div>
    <div class="partner-body"><p>${safeHtml(card.summary||'')}</p></div>
    <div class="partner-foot"><button class="btn btn-primary" ${publicCardAttrs(route)}>Xem chi tiết</button></div>
  </article>`;
}
function cmsApiCard(card){
  const route=normalizePublicRoute(card.url||card.route||'');
  const title=card.title||'Untitled';
  return `<article class="api-doc-card cms-public-card">
    <header><div class="vendor-icon">${safeHtml(card.icon||overviewIcon(route,title))}</div><div><h3>${safeHtml(title)}</h3><small>${safeHtml(route||'CMS Articles')}</small></div></header>
    <p class="api-article-desc">${safeHtml(card.summary||'')}</p>
    <div class="hero-actions"><button class="btn btn-primary" ${publicCardAttrs(route)}>Xem chi tiết</button></div>
  </article>`;
}
function cmsSolutionCard(card){
  const route=normalizePublicRoute(card.url||card.route||'');
  const title=card.title||'Untitled';
  return `<article class="solution-card cms-public-card">
    <div class="solution-top"><div class="solution-icon">${safeHtml(card.icon||overviewIcon(route,title))}</div><div><h3>${safeHtml(title)}</h3><small>${safeHtml(route||'CMS Articles')}</small></div></div>
    <div class="solution-body"><p>${safeHtml(card.summary||'')}</p><div class="hero-actions"><button class="btn btn-primary" ${publicCardAttrs(route)}>Xem chi tiết</button></div></div>
  </article>`;
}
function getOnCallCXProductCmsArticle(productId=currentOnCallCXProductId()){
  const route=productId==='prod-oncallcx-ucaas-inherited'?'#oncallcx-product-center-ucaas':'#oncallcx-product-center-ccaas';
  const fallbackId=productId==='prod-oncallcx-ucaas-inherited'?'article-oncallx-ucaas':'article-oncallx-ccaas';
  return getCmsArticleByRoute(route)||getCmsArticleById(fallbackId)||null;
}
function ocxCmsOverviewFeatures(article){
  const cards=getCmsArticleCards(article);
  if(!cards.length)return '';
  return cards.map(card=>`<span>&#10003; ${safeHtml(card.title||'Feature')}</span>`).join('');
}
function overviewIcon(route='',title=''){
  const text=`${route} ${title}`.toLowerCase();
  if(text.includes('oncall'))return '📞';
  if(text.includes('ccaas-vn')||text.includes('việt nam'))return '🇻🇳';
  if(text.includes('ccaas-global')||text.includes('global'))return '☁️';
  if(text.includes('api'))return '📗';
  if(text.includes('video')||text.includes('vc-'))return '🎥';
  if(text.includes('integration'))return '🔌';
  if(text.includes('crm'))return '🧩';
  if(text.includes('demo'))return '▶️';
  if(text.includes('compare'))return '📊';
  if(text.includes('resource'))return '📚';
  return '📄';
}
function publicCardAttrs(route=''){
  const safe=safeHtml(route);
  if(/^https?:\/\//i.test(route))return `data-external-route="${safe}"`;
  if(route.startsWith('#'))return `data-route="${safe}"`;
  return `data-go="${safeHtml(route.replace(/^#/,'')||'overview')}"`;
}
function overviewResourceCards(){
  const fallback=[
    {title:'OnCallCX',summary:'Trang sản phẩm dạng Wordpress cho khách hàng.',url:'#oncallcx'},
    {title:'CCaaS Việt Nam',summary:'Bài viết sản phẩm đối tác nội địa.',url:'#ccaas-vn'},
    {title:'CCaaS Global',summary:'Bài viết sản phẩm nền tảng quốc tế.',url:'#ccaas-global'},
    {title:'API Reference',summary:'Thư mục chứa bài viết API đã di chuyển.',url:'#api-reference'}
  ];
  const article=getCmsArticleById('article-overview');
  const cards=Array.isArray(article?.cards)&&article.cards.length?article.cards:fallback;
  return cards.map(card=>{
    const route=normalizePublicRoute(card.url||card.route||'');
    const title=card.title||'Untitled';
    const summary=card.summary||'';
    return `<div class="resource-card" ${publicCardAttrs(route)}>
      <div class="icon">${safeHtml(card.icon||overviewIcon(route,title))}</div>
      <div><h4>${safeHtml(title)}</h4><p>${safeHtml(summary)}</p></div>
    </div>`;
  }).join('');
}
function renderOverview(){
  return `${renderHero()}${renderStats()}<div class="section-head"><div><h2>Trang sản phẩm & tài liệu</h2><p>Nội dung khu vực này lấy từ CMS Articles → bài Tổng quan → Cards nội dung.</p></div></div><div class="resource-grid">${overviewResourceCards()}</div>`;
}
function renderDemoStage(){
  const screens=[
    `<div class="phone-ui"><div class="phone-header">Incoming Call</div><div class="call-card"><div style="font-size:42px">📞</div><h4>Nguyễn Văn A</h4><p class="muted">Hotline 1900 · Banking VIP</p><div class="call-actions"><button class="circle-btn accept">✓</button><button class="circle-btn decline">×</button></div></div></div>`,
    `<div class="solution-card" style="max-width:620px;margin:auto"><div class="solution-top"><div class="solution-icon">👤</div><div><h3>CRM Screen Pop</h3><small>Customer 360</small></div></div><div class="solution-body"><p><b>Nguyễn Văn A</b> · Phân khúc VIP · 3 ticket đang mở · Lần gọi gần nhất 12/06/2026.</p></div></div>`,
    `<div class="solution-card" style="max-width:620px;margin:auto"><div class="solution-top"><div class="solution-icon">🎫</div><div><h3>Ticket #CSKH-2026-0182</h3><small>Đồng bộ CRM/ERP</small></div></div><div class="solution-body"><p>Yêu cầu: Kiểm tra giao dịch thẻ. SLA: 4 giờ. Recording link đã đính kèm.</p></div></div>`,
    `<div class="stats-grid" style="grid-template-columns:repeat(2,1fr)"><div class="stat-card"><div class="stat-icon bg-green">✓</div><div><div class="stat-value">98%</div><div class="stat-label">SLA</div></div></div><div class="stat-card"><div class="stat-icon bg-orange">32</div><div><div class="stat-value">Live</div><div class="stat-label">Agents online</div></div></div></div>`
  ];
  return screens[state.demoStep];
}
function renderDemo(){
  const steps=[['Khách hàng gọi vào','Mô phỏng cuộc gọi inbound vào tổng đài.'],['Screen Pop CRM','Agent thấy thông tin khách hàng và lịch sử tương tác.'],['Tạo ticket','Ghi nhận yêu cầu CSKH tự động.'],['Supervisor Dashboard','Giám sát SLA, recording và báo cáo realtime.']];
  return `<section class="hero"><span class="eyebrow">▶️ Product Demo Area</span><h2>Demo sản phẩm dành cho khách hàng</h2><p>Khu vực mô phỏng luồng Contact Center phổ biến.</p></section><div class="demo-layout" style="margin-top:18px"><aside class="demo-panel"><h3>Kịch bản Demo</h3>${steps.map((s,i)=>`<div class="demo-step ${i===state.demoStep?'active':''}" data-demo-step="${i}"><div class="num">${i+1}</div><div><strong>${s[0]}</strong><p class="muted">${s[1]}</p></div></div>`).join('')}<button class="btn btn-primary" id="nextDemo">Chạy bước tiếp theo</button></aside><section class="demo-screen"><h3>Màn hình mô phỏng</h3><div class="demo-stage">${renderDemoStage()}</div></section></div>`;
}
function renderCompare(){
  return `<div class="section-head"><div><h2>Bảng so sánh tổng thể</h2><p>So sánh nhanh theo API, webhook, SDK, CRM và khả năng demo.</p></div><select class="filter-select"><option>Tất cả</option></select></div><div class="compare-wrap"><table class="compare-table"><thead><tr>${['Platform','Loại','Xuất xứ','REST API','Webhook','WebSocket','SDK','Click-to-Call CRM','Omnichannel','AI Bot','Ticketing','Free Tier','Tài liệu'].map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${compareRows.map(r=>`<tr>${r.map(c=>`<td>${typeof c==='boolean'?(c?'<span class="check">✓</span>':'<span class="dash">—</span>'):c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function renderCompliance(){
  const cards=getComplianceCards();
  return `<section class="hero"><span class="eyebrow">🛡️ Vietnam Compliance</span><h2>Quy Định & Tuân Thủ Tại Việt Nam</h2><p>Các yêu cầu pháp lý, kỹ thuật khi triển khai UC/CCaaS tại thị trường Việt Nam.</p></section><div class="alert">⚠️ Lưu ý quan trọng: Tài liệu này cung cấp thông tin chung về quy định tại Việt Nam. Doanh nghiệp cần tham vấn pháp lý chuyên nghiệp trước khi triển khai.</div><div class="section-head"><div><h2>Danh sách bài viết tuân thủ</h2><p>Nội dung được quản trị tập trung trong CMS Data để tránh xung đột dữ liệu.</p></div></div><div class="compliance-grid" style="margin-top:18px">${cards.map(c=>`<div class="compliance-card ${c.type||''}"><h3>${c.icon} ${c.title}</h3><ul class="list">${(c.bullets||[]).map(b=>`<li>${b}</li>`).join('')}</ul></div>`).join('')}</div>`;
}
function renderResources(){
  return `<div class="section-head"><div><h2>Nguồn tài liệu & bộ công cụ</h2><p>Dành cho khách hàng, presales và đội triển khai.</p></div></div><div class="resource-grid">${resources.map(r=>`<div class="resource-card"><div class="icon">${r.icon}</div><div><h4>${r.title}</h4><p>${r.desc}</p></div></div>`).join('')}</div>`;
}
function renderEditor(){
  return renderCmsPlaceholder();
}
function renderVendorEditor(){
  return renderCmsPlaceholder();
}


function renderOnCallCXOnly(){
  const cmsArticle=getCmsArticleForPage('oncallcx');
  const cmsCards=getCmsArticleCards(cmsArticle);
  const group=getProductGroup('ccaas-vn');
  const products=group.products||[];
  const primary=products.find(p=>p.id==='prod-oncallcx-fpt'||/OncallCX|OnCallCX/i.test(p.name));
  const inherited=getVirtualProductArticle('ccaas-vn','prod-oncallcx-ucaas-inherited',group);
  const selected=[
    primary,
    inherited
  ].filter(Boolean);
  return `<section class="product-hero">
    <span class="eyebrow">📰 Product Articles</span>
    <h2>OncallCX</h2>
    <p>Trang này hiển thị các bài viết OncallCX của FPT. Bài viết mới kế thừa nhóm tính năng, use case và hành động từ bài gốc để giữ trải nghiệm quản trị thống nhất.</p>
    <div class="hero-actions">
      <button class="btn btn-soft" data-go="api-reference">Xem API Reference</button>
    </div>
  </section>
  <div class="partner-grid">${cmsCards.length?cmsCards.map(card=>cmsPartnerCard(card,'ccaas-vn',true)).join(''):selected.map(v=>productArticleCard(v,'ccaas-vn',true)).join('')}</div>`;
}

function renderCmsPlaceholder(){
  return `<section class="hero editor-hero"><span class="eyebrow">🧩 CMS Data</span><h2>Unified Content CMS</h2><p>Tất cả thao tác Thêm, Chỉnh sửa và Xóa nội dung được quản lý tập trung trong CMS để tránh xung đột với dữ liệu bài viết.</p><div class="hero-actions"><a class="btn btn-primary btn-link" href="#cms">Mở CMS Data</a></div></section>`;
}




function presentationViewerMarkup(){
  return `<section class="present-layout ppt-style" data-total-pages="0">
    <aside class="present-thumbbar">
      <div class="present-thumb-head">
        <h3>Mục lục</h3>
        <small id="presentTotalText">Đang tải...</small>
      </div>
      <div class="present-thumb-list" id="presentThumbList">
        <div class="ocx-empty-state">Đang tải trang trình chiếu...</div>
      </div>
    </aside>

    <main class="present-viewer">
      <div class="present-toolbar">
        <button class="btn btn-soft" id="prevPresentPage">← Previous</button>
        <strong>Trang <span id="presentPageNo">1</span> / <span id="presentPageTotal">0</span></strong>
        <button class="btn btn-soft" id="nextPresentPage">Next →</button>
        <button class="btn btn-soft" id="presentZoomOut">−</button>
        <button class="btn btn-soft" id="presentZoomIn">+</button>
        <button class="btn btn-primary" id="presentFullscreen">Fullscreen</button>
      </div>
      <div class="present-stage" id="presentStage">
        <button class="fs-nav fs-prev" id="fsPrevPage" aria-label="Previous page">‹</button>
        <img id="presentPageImage" src="" alt="OncallCX presentation page">
        <button class="fs-nav fs-next" id="fsNextPage" aria-label="Next page">›</button>
      </div>
    </main>
  </section>`;
}

function renderOnCallCXPresentation(){
  const cfg=onCallCXPresentationConfig();
  const pdfPath=cfg.pdfPath;

  if(!cfg.pageCount){
    return `<section class="presentation-hero">
      <div>
        <span class="eyebrow">📘 ${cfg.label}</span>
        <h2>${cfg.title}</h2>
        <p>${cfg.description}</p>
      </div>
      <div class="presentation-actions">
        <button class="btn btn-soft" data-go="overview">← Quay lại Trang chủ</button>
        <a class="btn btn-soft btn-link" href="${pdfPath}" target="_blank" rel="noopener" id="presentationOpenStandalone">Mở file riêng</a>
      </div>
    </section>
    <section class="ocx-placeholder" id="presentationAssetResolver" data-presentation-product="${cfg.productId}">
      <div id="presentationAssetIcon">📄</div>
      <strong id="presentationAssetTitle">Chưa cấu hình file Presentation riêng cho ${cfg.title}</strong>
      <p id="presentationAssetGuide">Upload nhanh tại <b>CMS Data → Asset Manager</b>, chọn sản phẩm <code>${cfg.cmsProductLabel}</code> và chọn <b>Loại asset = Presentation</b>. Khi xuất bản static, đặt PDF tại <code>${pdfPath}</code> và ảnh slide tại <code>${cfg.pagesDir}/page-01.jpg</code>, <code>page-02.jpg</code>... để bài này dùng bộ tài liệu riêng.</p>
      <p id="presentationAssetStatus">Đang kiểm tra file Presentation đã upload trong Asset Manager...</p>
      <p><a class="btn btn-primary btn-link" href="#cms">Mở CMS Data</a></p>
    </section>`;
  }

  return `<section class="presentation-hero">
    <div>
      <span class="eyebrow">📘 ${cfg.label}</span>
      <h2>${cfg.title}</h2>
      <p>${cfg.description}</p>
    </div>
    <div class="presentation-actions">
      <button class="btn btn-soft" data-go="overview">← Quay lại Trang chủ</button>
      <a class="btn btn-primary btn-link" href="${pdfPath}" target="_blank" rel="noopener" id="presentationOpenPdf">Mở PDF gốc</a>
      <a class="btn btn-soft btn-link" href="${pdfPath}" download id="presentationDownloadPdf">Download PDF</a>
    </div>
  </section>
  ${presentationViewerMarkup()}`;
}

function bindPresentationSlides({pages,pdfUrl,fileName}){
  const layout=$('.present-layout');
  if(!layout)return;
  const total=pages.length;
  layout.dataset.totalPages=String(total);
  $('#presentPageTotal').textContent=total;
  $('#presentTotalText').textContent=total?`${total} trang`:'Chưa có slide';
  if($('#presentationOpenPdf'))$('#presentationOpenPdf').href=pdfUrl;
  if($('#presentationDownloadPdf')){
    $('#presentationDownloadPdf').href=pdfUrl;
    if(fileName)$('#presentationDownloadPdf').download=fileName;
  }

  if(!total){
    $('#presentThumbList').innerHTML='<div class="ocx-empty-state">Chưa render được slide từ file này.</div>';
    $('#presentPageImage').alt='No presentation slide';
    return;
  }

  $('#presentThumbList').innerHTML=pages.map((p,i)=>`<button class="${i===0?'active':''}" data-goto-page="${i+1}">
    <span class="thumb-no">${i+1}</span>
    <img src="${p.image}" alt="${p.title||`Slide ${i+1}`}">
  </button>`).join('');

  const img=$('#presentPageImage');
  const pageNo=$('#presentPageNo');
  const stage=$('#presentStage');
  let current=1;
  let zoom=1;
  let hideTimer=null;

  const render=()=>{
    current=Math.max(1,Math.min(total,current));
    pageNo.textContent=current;
    img.src=pages[current-1]?.image||'';
    img.alt=pages[current-1]?.title||`OncallCX presentation page ${current}`;
    img.style.transform=`scale(${zoom})`;

    $$('[data-goto-page]').forEach(btn=>{
      const active=Number(btn.dataset.gotoPage)===current;
      btn.classList.toggle('active',active);
      if(active)btn.scrollIntoView({block:'nearest',behavior:'smooth'});
    });
  };

  const showFsNav=()=>{
    if(!stage)return;
    stage.classList.add('show-nav');
    clearTimeout(hideTimer);
    hideTimer=setTimeout(()=>stage.classList.remove('show-nav'),1400);
  };

  $$('[data-goto-page]').forEach(btn=>{
    btn.onclick=()=>{
      current=Number(btn.dataset.gotoPage);
      render();
    };
  });

  $('#prevPresentPage').onclick=()=>{current--;render()};
  $('#nextPresentPage').onclick=()=>{current++;render()};
  $('#fsPrevPage').onclick=()=>{current--;render();showFsNav()};
  $('#fsNextPage').onclick=()=>{current++;render();showFsNav()};
  $('#presentZoomOut').onclick=()=>{zoom=Math.max(.5,zoom-.1);render()};
  $('#presentZoomIn').onclick=()=>{zoom=Math.min(2.5,zoom+.1);render()};
  $('#presentFullscreen').onclick=()=>stage.requestFullscreen?.();

  stage.onmousemove=showFsNav;
  stage.onmouseenter=showFsNav;

  document.onkeydown=(e)=>{
    if(!$('.present-layout'))return;
    if(e.key==='ArrowRight'){current++;render();showFsNav()}
    if(e.key==='ArrowLeft'){current--;render();showFsNav()}
    if(e.key==='Escape')stage.classList.remove('show-nav');
  };

  render();
}

async function bindOnCallCXPresentation(){
  const resolver=$('#presentationAssetResolver');
  if(resolver){
    const cfg=onCallCXPresentationConfig();
    const asset=await findOnCallCXPresentationAsset(cfg);
    const status=$('#presentationAssetStatus');
    if(asset&&status){
      const renderedAsset=await ensureOnCallCXAssetPages(asset);
      const url=assetObjectUrl(renderedAsset);
      const title=$('#presentationAssetTitle');
      const icon=$('#presentationAssetIcon');
      const guide=$('#presentationAssetGuide');
      const standalone=$('#presentationOpenStandalone');
      if(title)title.textContent=`Đã gắn Presentation riêng cho ${cfg.title}`;
      if(icon)icon.textContent=isPdfAsset(renderedAsset)?'📘':'✅';
      if(guide)guide.innerHTML=`File đã upload trong <b>CMS Data → Asset Manager</b> và đang được gắn với sản phẩm <code>${safeHtml(renderedAsset.product)}</code>.`;
      if(standalone){
        standalone.href=url;
        standalone.textContent=isPowerPointAsset(renderedAsset)?'Tải PowerPoint':'Mở file upload';
        if(isPowerPointAsset(renderedAsset))standalone.setAttribute('download',renderedAsset.fileName||'presentation.pptx');
      }
      const fileMeta=`${safeHtml(renderedAsset.fileName)} · ${formatBytes(renderedAsset.size)}`;
      if(Array.isArray(renderedAsset.pages)&&renderedAsset.pages.length){
        resolver.outerHTML=presentationViewerMarkup();
        bindPresentationSlides({pages:renderedAsset.pages,pdfUrl:url,fileName:renderedAsset.fileName});
      }else if(isPdfAsset(renderedAsset)){
        status.innerHTML=`<span class="ocx-asset-found">PDF đã sẵn sàng: <b>${fileMeta}</b></span><br><a class="btn btn-primary btn-link" href="${url}" target="_blank" rel="noopener">Mở PDF upload</a> <a class="btn btn-soft btn-link" href="${url}" download="${safeHtml(renderedAsset.fileName||'presentation.pdf')}">Download</a><iframe class="ocx-uploaded-pdf-frame" src="${url}"></iframe>`;
      }else if(isPowerPointAsset(renderedAsset)){
        status.innerHTML=`<span class="ocx-asset-found">PowerPoint đã sẵn sàng: <b>${fileMeta}</b></span><br><span class="ocx-asset-note">Chưa render được slide từ PPTX này. Vui lòng kiểm tra file hoặc upload bản PDF nếu cần hiển thị chính xác 100%.</span><br><a class="btn btn-primary btn-link" href="${url}" download="${safeHtml(renderedAsset.fileName||'presentation.pptx')}">Tải / mở bằng PowerPoint</a>`;
      }else{
        status.innerHTML=`<span class="ocx-asset-found">Đã tìm thấy file upload: <b>${fileMeta}</b></span><br><a class="btn btn-primary btn-link" href="${url}" target="_blank" rel="noopener">Mở file upload</a> <a class="btn btn-soft btn-link" href="${url}" download="${safeHtml(renderedAsset.fileName||'presentation')}">Download</a>`;
      }
    }else if(status){
      status.innerHTML=`Chưa có file upload trong Asset Manager cho sản phẩm này. Hãy vào CMS Data → Asset Manager để upload Presentation.`;
    }
    return;
  }

  const layout=$('.present-layout');
  if(!layout)return;

  const cfg=onCallCXPresentationConfig();
  const currentDoc=await ocxGetCurrentDoc();
  let pages=[];
  let pdfUrl=cfg.pdfPath;
  let assetDoc=null;

  if(cfg.productId==='prod-oncallcx-fpt'&&currentDoc?.pages?.length){
    pages=currentDoc.pages;
    pdfUrl=await ocxGetDocUrl(currentDoc);
  }else{
    assetDoc=await findOnCallCXPresentationAsset(cfg);
    if(assetDoc && !isPowerPointAsset(assetDoc)){
      assetDoc=await ensureOnCallCXAssetPages(assetDoc);
      pdfUrl=assetObjectUrl(assetDoc);
      if(Array.isArray(assetDoc.pages)&&assetDoc.pages.length) pages=assetDoc.pages;
    }
    if(!pages.length){
      pages=Array.from({length:cfg.pageCount},(_,i)=>({
        title:`Slide ${i+1}`,
        image:`${cfg.pagesDir}/page-${String(i+1).padStart(2,'0')}.jpg`
      }));
    }
  }

  bindPresentationSlides({
    pages,
    pdfUrl,
    fileName:currentDoc?.fileName||assetDoc?.fileName||''
  });
}

function ocxAssetMeta(asset){
  if(!asset)return '';
  return `${safeHtml(asset.fileName||asset.title||'asset')} · ${formatBytes(asset.size)} · ${new Date(asset.createdAt||Date.now()).toLocaleString('vi-VN')}`;
}
function ocxAssetEmpty(label,type){
  return `<div class="ocx-placeholder ocx-asset-empty">
    <div>📄</div>
    <strong>Chưa có ${safeHtml(label)} cho sản phẩm này</strong>
    <p>Vào <b>CMS Data → Asset Manager</b>, chọn đúng sản phẩm <code>${safeHtml(onCallCXPresentationConfig().cmsProductLabel)}</code>, chọn <code>Loại asset = ${safeHtml(type)}</code>, rồi upload file PDF.</p>
    <button class="btn btn-primary" data-go="cms">Mở CMS Data</button>
  </div>`;
}
async function ocxOpenAssetById(id,download=false){
  const asset=await assetGet(id);
  if(!asset)return;
  const url=assetObjectUrl(asset);
  if(download){
    const a=document.createElement('a');
    a.href=url;
    a.download=asset.fileName||asset.title||'asset';
    a.click();
    return;
  }
  window.open(url,'_blank','noopener');
}
function bindOnCallCXAssetButtons(){
  $$('[data-ocx-asset-open]').forEach(btn=>btn.onclick=()=>ocxOpenAssetById(btn.dataset.ocxAssetOpen,false));
  $$('[data-ocx-asset-download]').forEach(btn=>btn.onclick=()=>ocxOpenAssetById(btn.dataset.ocxAssetDownload,true));
  $$('[data-go]').forEach(b=>b.onclick=()=>navigate(b.dataset.go));
}
async function ocxRenderProductAssetDoc(type,rootSelector,label){
  const root=$(rootSelector);
  if(!root)return;
  const cfg=onCallCXPresentationConfig();
  const asset=await findOnCallCXAsset(cfg,type);
  if(!asset){
    root.innerHTML=ocxAssetEmpty(label,label);
    return;
  }
  const url=assetObjectUrl(asset);
  const isPdf=isPdfAsset(asset);
  root.innerHTML=`<article class="ocx-asset-doc-card">
    <div class="ocx-asset-doc-head">
      <div>
        <b>${safeHtml(asset.title||label)}</b>
        <small>${ocxAssetMeta(asset)}</small>
        ${asset.description?`<p>${safeHtml(asset.description)}</p>`:''}
      </div>
      <div class="ocx-action-row">
        <button class="btn btn-primary" data-ocx-asset-open="${safeHtml(asset.id)}">Mở file</button>
        <button class="btn btn-soft" data-ocx-asset-download="${safeHtml(asset.id)}">Download</button>
      </div>
    </div>
    ${isPdf?`<iframe class="ocx-asset-doc-frame" src="${url}#toolbar=1&navpanes=0"></iframe>`:`<div class="ocx-placeholder"><div>📎</div><strong>File đã upload</strong><p>Định dạng này không có preview trực tiếp. Dùng nút Mở file hoặc Download.</p></div>`}
  </article>`;
  bindOnCallCXAssetButtons();
}
async function ocxRenderProductApiDocs(rootSelector){
  const root=$(rootSelector);
  if(!root)return;
  const cfg=onCallCXPresentationConfig();
  const assets=await findOnCallCXAssets(cfg,'api');
  if(!assets.length){
    root.innerHTML=ocxAssetEmpty('API Spec','API Spec');
    return;
  }
  root.innerHTML=assets.map(asset=>{
    const url=assetObjectUrl(asset);
    const isPdf=isPdfAsset(asset);
    return `<article class="ocx-asset-doc-card">
    <div class="ocx-asset-doc-head">
      <div>
        <b>${safeHtml(asset.title||asset.fileName)}</b>
        <small>${ocxAssetMeta(asset)}</small>
        ${asset.description?`<p>${safeHtml(asset.description)}</p>`:''}
      </div>
      <div class="ocx-action-row">
        <button class="btn btn-primary" data-ocx-asset-open="${safeHtml(asset.id)}">Mở file</button>
        <button class="btn btn-soft" data-ocx-asset-download="${safeHtml(asset.id)}">Download</button>
      </div>
    </div>
    ${isPdf?`<iframe class="ocx-asset-doc-frame" src="${url}#toolbar=1&navpanes=0"></iframe>`:`<div class="ocx-placeholder"><div>📎</div><strong>File đã upload</strong><p>Định dạng này không có preview trực tiếp. Dùng nút Mở file hoặc Download.</p></div>`}
  </article>`;
  }).join('');
  bindOnCallCXAssetButtons();
}
function ocxDownloadAssetCard(asset,label,type){
  if(!asset){
    return `<div class="ocx-download-card muted">
      <div>
        <b>${safeHtml(label)}</b>
        <small>Chưa upload trong Asset Manager · Loại asset = ${safeHtml(type)}</small>
      </div>
      <button class="btn btn-soft" data-go="cms">Mở CMS</button>
    </div>`;
  }
  return `<div class="ocx-download-card">
    <div>
      <b>${safeHtml(asset.title||label)}</b>
      <small>${safeHtml(label)} · ${ocxAssetMeta(asset)}</small>
    </div>
    <div class="ocx-download-actions">
      <button class="btn btn-soft" data-ocx-asset-open="${safeHtml(asset.id)}">Mở</button>
      <button class="btn btn-primary" data-ocx-asset-download="${safeHtml(asset.id)}">Download</button>
    </div>
  </div>`;
}
async function ocxRenderDownloadAssets(){
  const root=$('#ocxDownloadAssetsRoot');
  if(!root)return;
  const cfg=onCallCXPresentationConfig();
  const [userGuide,datasheet]=await Promise.all([
    findOnCallCXAsset(cfg,'userGuide'),
    findOnCallCXAsset(cfg,'datasheet')
  ]);
  root.innerHTML=[
    ocxDownloadAssetCard(userGuide,'User Guide','User Guide'),
    ocxDownloadAssetCard(datasheet,'Datasheet','Datasheet')
  ].join('');
  bindOnCallCXAssetButtons();
}
const OCX_PRODUCT_MODULES={
  demo:{enabled:false,hasContent:false},
  caseStudy:{enabled:false,hasContent:false},
  faq:{enabled:true,hasContent:true},
  presaleInternal:{enabled:true,hasContent:true}
};
function ocxModuleVisible(key){
  const module=OCX_PRODUCT_MODULES[key];
  return Boolean(module?.enabled&&module?.hasContent);
}
async function ocxResolvePresentationBundle(cfg){
  const currentDoc=await ocxGetCurrentDoc();
  let pages=[];
  let pdfUrl=cfg.pdfPath;
  let fileName='';
  let assetDoc=null;

  if(cfg.productId==='prod-oncallcx-fpt'&&currentDoc?.pages?.length){
    pages=currentDoc.pages;
    pdfUrl=await ocxGetDocUrl(currentDoc);
    fileName=currentDoc.fileName||'';
  }else{
    assetDoc=await findOnCallCXPresentationAsset(cfg);
    if(assetDoc && !isPowerPointAsset(assetDoc)){
      assetDoc=await ensureOnCallCXAssetPages(assetDoc);
      pdfUrl=assetObjectUrl(assetDoc);
      fileName=assetDoc.fileName||'';
      if(Array.isArray(assetDoc.pages)&&assetDoc.pages.length)pages=assetDoc.pages;
    }
    if(!pages.length&&cfg.pageCount){
      pages=Array.from({length:cfg.pageCount},(_,i)=>({
        title:`Slide ${i+1}`,
        image:`${cfg.pagesDir}/page-${String(i+1).padStart(2,'0')}.jpg`
      }));
    }
  }

  return {pages,pdfUrl,fileName,assetDoc,currentDoc};
}
async function ocxRenderProductPresentation(){
  const root=$('#ocxProductPresentationRoot');
  if(!root)return;
  const cfg=onCallCXPresentationConfig();
  root.innerHTML=`<section class="presentation-hero ocx-inline-presentation-hero">
    <div>
      <span class="eyebrow">📘 ${cfg.label}</span>
      <h2>${cfg.title}</h2>
      <p>${cfg.description}</p>
    </div>
    <div class="presentation-actions">
      <button class="btn btn-soft" data-go="overview">← Quay lại Trang chủ</button>
      <a class="btn btn-primary btn-link" href="${cfg.pdfPath}" target="_blank" rel="noopener" id="presentationOpenPdf">Mở PDF gốc</a>
      <a class="btn btn-soft btn-link" href="${cfg.pdfPath}" download id="presentationDownloadPdf">Download PDF</a>
    </div>
  </section>
  ${presentationViewerMarkup()}`;
  const bundle=await ocxResolvePresentationBundle(cfg);
  bindPresentationSlides(bundle);
  bindOnCallCXAssetButtons();
}
function ocxRenderDynamicTab(tab){
  if(tab==='presentation')ocxRenderProductPresentation();
  if(tab==='user-guide')ocxRenderProductAssetDoc('userGuide','#ocxUserGuideRoot','User Guide');
  if(tab==='datasheet')ocxRenderProductAssetDoc('datasheet','#ocxDatasheetRoot','Datasheet');
  if(tab==='api')ocxRenderProductApiDocs('#ocxApiRoot');
  if(tab==='downloads')ocxRenderDownloadAssets();
}

function renderOnCallCXProductCenter(){
  const cfg=onCallCXPresentationConfig();
  const cmsArticle=getOnCallCXProductCmsArticle(cfg.productId);
  const productKind=cfg.productId==='prod-oncallcx-ucaas-inherited'?'ucaas':'ccaas';
  const cmsProduct=getOnCallCXCmsProduct(productKind)||(productKind==='ucaas'?ONCALLCX_UCAAS_PRODUCT_DEFAULT:null);
  const productOverviewFeatures=Array.isArray(cmsProduct?.highlights)&&cmsProduct.highlights.length
    ? cmsProduct.highlights.map(item=>`<span>&#10003; ${safeHtml(item)}</span>`).join('')
    : '';
  const cmsOverviewFeatures=productOverviewFeatures||ocxCmsOverviewFeatures(cmsArticle);
  const overviewSummary=cmsProduct?.summary||cmsArticle?.summary||(cfg.productId==='prod-oncallcx-ucaas-inherited'?'OnCallCX UCaaS tập trung vào tổng đài Cloud PBX, extension, SIP trunk, call routing và tích hợp CRM/API cho doanh nghiệp.':'OncallCX là nền tảng Contact Center as a Service do FPT Telecom phát triển, hỗ trợ doanh nghiệp triển khai tổng đài chăm sóc khách hàng trên Cloud, mở rộng linh hoạt và tích hợp với CRM, ERP, AI Bot, REST API và Webhook.');
  const pdfPath=cfg.pdfPath;
  return `<section class="ocx-product-hero">
    <div>
      <span class="eyebrow">📦 Product Center</span>
      <h2>${cfg.title}</h2>
      <p>Trung tâm nội dung sản phẩm ${cfg.title}. Mỗi sản phẩm có bộ file Presentation, User Guide, Datasheet và nội dung quản trị riêng.</p>
    </div>
    <div class="presentation-actions">
      <button class="btn btn-soft" data-go="oncallcx">← Quay lại OnCallCX</button>
      ${ocxModuleVisible('presaleInternal')?`<button class="btn btn-soft" data-ocx-presale="${cfg.productId}">Presale nội bộ</button>`:''}
    </div>
  </section>

  <section class="ocx-product-layout">
    <aside class="ocx-product-menu">
      <button class="active" data-ocx-tab="overview">📑 Overview</button>
      <button data-ocx-tab="presentation">📘 Presentation</button>
      <button data-ocx-tab="user-guide">📖 User Guide</button>
      <button data-ocx-tab="datasheet">📄 Datasheet</button>
      <button data-ocx-tab="api">📚 API Reference</button>
      ${ocxModuleVisible('demo')?`<button data-ocx-tab="demo">🎬 Demo Video</button>`:''}
      ${ocxModuleVisible('caseStudy')?`<button data-ocx-tab="case-study">💬 Case Study</button>`:''}
      ${ocxModuleVisible('faq')?`<button data-ocx-tab="faq">❓ FAQ</button>`:''}
      <button data-ocx-tab="downloads">⬇ Download</button>
    </aside>

    <main class="ocx-product-content">
      <div class="ocx-panel active" id="ocx-overview">
        <h3>Overview</h3>
        <p>${safeHtml(overviewSummary)}</p>
        <div class="ocx-feature-grid">
          ${cmsOverviewFeatures||`<span>✓ Omnichannel Contact Center</span>
          <span>✓ Voice / Chat / Email / Social</span>
          <span>✓ AI Voicebot & Chatbot</span>
          <span>✓ Call Recording</span>
          <span>✓ Dashboard & Realtime Report</span>
          <span>✓ CRM / ERP Integration</span>
          <span>✓ Workflow Automation</span>
          <span>✓ Open REST API & Webhook</span>`}
        </div>
      </div>

      <div class="ocx-panel" id="ocx-presentation">
        <div id="ocxProductPresentationRoot"></div>
      </div>

      <div class="ocx-panel" id="ocx-demo">
        <h3>Demo Video</h3>
        <div class="ocx-placeholder">
          <div>🎬</div>
          <strong>Demo video chưa được cấu hình</strong>
          <p>Sau này có thể đặt file tại <code>assets/video/oncallcx-demo.mp4</code> hoặc dùng upload manager ở phase sau.</p>
        </div>
      </div>

      <div class="ocx-panel" id="ocx-datasheet">
        <h3>Datasheet</h3>
        <p>Datasheet dùng file riêng theo từng sản phẩm và được upload tại CMS Data → Asset Manager.</p>
        <div id="ocxDatasheetRoot" class="ocx-asset-doc-root"></div>
      </div>

      <div class="ocx-panel" id="ocx-user-guide">
        <h3>User Guide</h3>
        <p>Tài liệu hướng dẫn sử dụng được gắn theo sản phẩm. Upload tại CMS Data → Asset Manager với <code>Loại asset = User Guide</code>.</p>
        <div id="ocxUserGuideRoot" class="ocx-asset-doc-root"></div>
      </div>

      <div class="ocx-panel" id="ocx-api">
        <h3>API Reference</h3>
        <p>Tài liệu API đã upload cho sản phẩm này (loại asset = API Spec), gắn tại CMS Data → Asset Manager.</p>
        <div id="ocxApiRoot" class="ocx-asset-doc-root"></div>
        <p class="ocx-api-secondary">Ngoài ra có thể xem thêm bài viết API/partner đối tác đã gom theo thư mục:</p>
        <button class="btn btn-soft" data-go="api-reference">Mở API Reference (thư mục đối tác)</button>
      </div>

      <div class="ocx-panel" id="ocx-case-study">
        <h3>Case Study</h3>
        <div class="ocx-placeholder">
          <div>💬</div>
          <strong>Chưa cấu hình case study</strong>
          <p>Có thể bổ sung câu chuyện triển khai, bài toán khách hàng, phạm vi tích hợp và kết quả vận hành ở phase sau.</p>
        </div>
      </div>

      <div class="ocx-panel" id="ocx-downloads">
        <h3>Download</h3>
        <div class="ocx-download-list">
          <div class="ocx-download-card">
            <div>
              <b>${cfg.label}</b>
              <small>PDF · ${cfg.productId==='prod-oncallcx-ucaas-inherited'?'UCaaS riêng':'CCaaS riêng'}</small>
            </div>
            <a class="btn btn-primary btn-link" href="${pdfPath}" download>Download</a>
          </div>
          <div id="ocxDownloadAssetsRoot" class="ocx-download-list"></div>
        </div>
      </div>


      <div class="ocx-panel" id="ocx-faq">
        <h3>FAQ</h3>
        <p>Các câu hỏi thường gặp khi tư vấn OnCallCX cho khách hàng.</p>
        <div class="ocx-faq-list">
          <details open><summary>OnCallCX có tích hợp CRM được không?</summary><p>Có. Có thể tích hợp qua REST API, Webhook, CTI hoặc screen pop tùy hệ thống CRM/ERP của khách hàng.</p></details>
          <details><summary>Có hỗ trợ ghi âm cuộc gọi không?</summary><p>Có. Recording có thể phục vụ tra soát, QA/QC, đào tạo agent và đối soát dịch vụ.</p></details>
          <details><summary>Có triển khai được AI Voicebot/Chatbot không?</summary><p>Có thể tích hợp AI Bot trong luồng CSKH, phân loại yêu cầu, tạo ticket và hỗ trợ self-service.</p></details>
          <details><summary>Khách hàng cần chuẩn bị gì trước khi POC?</summary><p>Cần thông tin số lượng agent, kênh tương tác, đầu số, CRM cần tích hợp, kịch bản IVR, báo cáo mong muốn và tiêu chí nghiệm thu.</p></details>
        </div>
      </div>

    </main>
  </section>`;
}

function renderOnCallCXPresale(){
  const cfg=onCallCXPresentationConfig();
  return `<section class="ocx-product-hero">
    <div>
      <span class="eyebrow">🔒 Presale nội bộ</span>
      <h2>${cfg.title} Presale</h2>
      <p>Khu vực nội bộ cho đội tư vấn: architecture, pricing tham khảo và checklist đầu vào. Nội dung này được tách khỏi Product Center công khai.</p>
    </div>
    <div class="presentation-actions">
      <button class="btn btn-primary" data-ocx-product-center="${cfg.productId}">Chuyển sang Product Center</button>
      <button class="btn btn-soft" data-go="overview">Trang chủ</button>
    </div>
  </section>

  <section class="ocx-product-content ocx-presale-page">
    <div class="ocx-panel active">
      <h3>Architecture</h3>
      <p>Mô hình kiến trúc tham khảo cho OnCallCX trong tư vấn Presales.</p>
      <div class="ocx-arch-diagram">
        <div class="ocx-arch-node orange">Khách hàng<br><small>Voice / Chat / Email / Social</small></div>
        <div class="ocx-arch-arrow">→</div>
        <div class="ocx-arch-node blue">OnCallCX Cloud<br><small>Routing · Queue · IVR · Recording</small></div>
        <div class="ocx-arch-arrow">→</div>
        <div class="ocx-arch-node green">Agent / Supervisor<br><small>Desktop · Dashboard · Report</small></div>
      </div>
      <div class="ocx-arch-grid">
        <div><b>Integration Layer</b><span>REST API, Webhook, CTI, CRM Screen Pop</span></div>
        <div><b>AI Layer</b><span>Voicebot, Chatbot, Call Summary, QA/QC</span></div>
        <div><b>Data Layer</b><span>Call Detail, Recording, Ticket, Campaign Report</span></div>
        <div><b>Security</b><span>Role-based access, audit log, data policy</span></div>
      </div>

      <h3>Pricing</h3>
      <p>Khu vực tham khảo cấu trúc giá để Presales chuẩn hóa tư vấn. Giá thực tế cần cập nhật theo chính sách kinh doanh.</p>
      <div class="ocx-pricing-grid">
        <div class="ocx-price-card">
          <h4>Starter</h4>
          <p>Phù hợp pilot hoặc đội CSKH nhỏ.</p>
          <ul><li>Voice channel</li><li>Basic report</li><li>Small agent team</li></ul>
        </div>
        <div class="ocx-price-card highlight">
          <h4>Business</h4>
          <p>Phù hợp doanh nghiệp cần Omnichannel và CRM.</p>
          <ul><li>Omnichannel</li><li>CRM Integration</li><li>Recording + Dashboard</li></ul>
        </div>
        <div class="ocx-price-card">
          <h4>Enterprise</h4>
          <p>Phù hợp khách hàng quy mô lớn, yêu cầu tích hợp/AI.</p>
          <ul><li>AI Bot</li><li>Advanced API</li><li>Custom workflow</li></ul>
        </div>
      </div>

      <h3>Presales Checklist</h3>
      <p>Checklist đầu vào để đội Presales thu thập thông tin trước khi xây dựng SOW/POC.</p>
      <div class="ocx-checklist-grid">
        <label><input type="checkbox"> Số lượng agent / supervisor / admin</label>
        <label><input type="checkbox"> Kênh cần triển khai: Voice, Chat, Email, Social</label>
        <label><input type="checkbox"> Đầu số hotline và SIP trunk/BYOC</label>
        <label><input type="checkbox"> Kịch bản IVR và routing</label>
        <label><input type="checkbox"> CRM/ERP cần tích hợp</label>
        <label><input type="checkbox"> Báo cáo, dashboard, SLA cần theo dõi</label>
        <label><input type="checkbox"> Chính sách ghi âm và lưu trữ dữ liệu</label>
        <label><input type="checkbox"> Tiêu chí POC/UAT/Go-live</label>
      </div>
    </div>
  </section>`;
}

function bindOnCallCXProductCenter(){
  const tabs=$$('[data-ocx-tab]');
  if(!tabs.length)return;
  ocxRenderDynamicTab($('.ocx-panel.active')?.id?.replace('ocx-','')||'overview');
  tabs.forEach(btn=>{
    btn.onclick=()=>{
      const tab=btn.dataset.ocxTab;
      tabs.forEach(x=>x.classList.remove('active'));
      $$(`[data-ocx-tab="${tab}"]`).forEach(x=>x.classList.add('active'));
      $$('.ocx-panel').forEach(panel=>panel.classList.remove('active'));
      const panel=$('#ocx-'+tab);
      if(panel)panel.classList.add('active');
      ocxRenderDynamicTab(tab);
    };
  });
}


function renderPage(p){
  if(p==='overview')return renderOverview();
  if(p==='demo')return renderDemo();
  if(p==='compare')return renderCompare();
  if(p==='compliance')return renderCompliance();
  if(p==='resources')return renderResources();
  if(p==='cms'||p==='editor'||p==='vendor-editor')return renderCmsPlaceholder();
  if(p==='oncallcx')return renderOnCallCXOnly();
  if(p==='oncallcx-product-center')return renderOnCallCXProductCenter();
  if(p==='oncallcx-presale')return renderOnCallCXPresale();
  if(p==='presentation-oncallcx')return renderOnCallCXPresentation();
  if(p==='ccaas-vn')return renderProductGroup('ccaas-vn','CCaaS — Đối Tác Việt Nam');
  if(p==='ccaas-global')return renderProductGroup('ccaas-global','CCaaS — Nền Tảng Quốc Tế');
  if(p==='ucpbx-vn')return renderProductGroup('ucpbx-vn','UC / PBX — Nhà Cung Cấp Việt Nam');
  if(p==='api-reference')return renderApiReference();
  if(p==='video'||p==='devices')return renderSolutions('video');
  if(p==='integration')return renderSolutions('integration');
  if(p==='crm')return renderSolutions('crm');
  return renderOverview();
}
function navigate(p){
  state.page=p;
  safeHashPage(p);
  $$('.nav-item').forEach(a=>{
    const href=a.getAttribute('href')||'';
    const isActive=a.dataset.page===p||((isVideoConferencePage(p)||isSystemSecurityPage(p))&&href===location.hash);
    a.classList.toggle('active',isActive);
  });
  const [t,s]=isVideoConferencePage(p)?(titles['video-conferencing']||titles.video):(titles[p]||titles.overview);
  $('#pageTitle').textContent=t;
  $('#pageSubtitle').textContent=s;
  if(isVideoConferencePage(p)||isSystemSecurityPage(p)){
    bindPage();
    return;
  }
  $('#pageRoot').innerHTML=renderPage(p);
  bindPage();
  window.scrollTo({top:0,behavior:'smooth'});
}
function openPublicRoute(route=''){
  const target=normalizePublicRoute(route);
  if(!target)return;
  if(/^https?:\/\//i.test(target)){
    window.open(target,'_blank','noopener');
    return;
  }
  if(target.startsWith('#')){
    location.hash=target;
    navigate(resolvePageFromHash());
    return;
  }
  navigate(target);
}
function bindPage(){
  $$('[data-ocx-product-center]').forEach(b=>b.onclick=()=>{
    const productId=b.dataset.ocxProductCenter||'prod-oncallcx-fpt';
    location.hash=onCallCXProductCenterHash(productId);
    navigate('oncallcx-product-center');
  });
  $$('[data-ocx-presale]').forEach(b=>b.onclick=()=>{
    const productId=b.dataset.ocxPresale||currentOnCallCXProductId();
    location.hash=onCallCXPresaleHash(productId);
    navigate('oncallcx-presale');
  });
  $$('[data-ocx-open-presentation]').forEach(b=>b.onclick=()=>{
    const productId=b.dataset.ocxOpenPresentation||currentOnCallCXProductId();
    location.hash=onCallCXPresentationHash(productId);
    navigate('presentation-oncallcx');
  });
  $$('[data-go]').forEach(b=>b.onclick=()=>navigate(b.dataset.go));
  $$('[data-route]').forEach(b=>b.onclick=()=>openPublicRoute(b.dataset.route));
  $$('[data-external-route]').forEach(b=>b.onclick=()=>openPublicRoute(b.dataset.externalRoute));
  $$('[data-solution]').forEach(c=>c.onclick=()=>toast('Mở chi tiết: '+c.dataset.solution));
  const routeLegacyCrudToCms=e=>{
    e?.preventDefault?.();
    e?.stopPropagation?.();
    location.hash='cms';
    navigate('cms');
    toast('Quan tri noi dung tai CMS Data.');
  };
  $$('[data-edit-id],[data-editor-select],[data-add-solution],[data-delete-solution],[data-add-product],[data-edit-product],[data-delete-product],[data-product-group],[data-product-select],[data-add-compliance],[data-edit-compliance],[data-delete-compliance]').forEach(b=>b.onclick=routeLegacyCrudToCms);
  $$('[data-api-folder]').forEach(b=>b.onclick=()=>{location.hash='api-folder:'+b.dataset.apiFolder;navigate('api-reference')});

  $$('[data-demo-step]').forEach(s=>s.onclick=()=>{state.demoStep=Number(s.dataset.demoStep);navigate('demo')});
  const n=$('#nextDemo');if(n)n.onclick=()=>{state.demoStep=(state.demoStep+1)%4;navigate('demo')};
  bindOnCallCXProductCenter();
  bindOnCallCXPresentation();
}
function bindGlobal(){
  $$('[data-page]').forEach(a=>a.onclick=e=>{
    const href=a.getAttribute('href')||'';
    const wasHandled=e.defaultPrevented;
    if(isVideoConferenceHash(href)){
      e.preventDefault();
      e.stopPropagation();
      if(!wasHandled&&location.hash!==href)location.hash=href;
      $$('.nav-item').forEach(x=>x.classList.toggle('active',(x.getAttribute('href')||'')===href));
      $('#sidebar').classList.remove('open');
      return;
    }
    e.preventDefault();
    navigate(a.dataset.page);
    $('#sidebar').classList.remove('open');
  });
  $$('[data-toggle-group]').forEach(b=>b.onclick=()=>b.closest('.nav-group').classList.toggle('expanded'));
  $('#mobileMenu').onclick=()=>$('#sidebar').classList.toggle('open');
  $('#themeToggle').onclick=()=>{document.documentElement.dataset.theme=document.documentElement.dataset.theme==='light'?'dark':'light'};
  $('#globalSearch').oninput=e=>{const q=e.target.value.toLowerCase().trim();if(!q)return;const f=allContentItems().find(s=>[s.title,s.type,s.desc,(s.chips||[]).join(' ')].join(' ').toLowerCase().includes(q));if(f)navigate(f.id)};
  $('#loginForm').onsubmit=e=>{e.preventDefault();login($('#loginEmail').value)};
  $('#logoutBtn').onclick=logout;
}
window.addEventListener('hashchange',()=>{
  if(isVideoConferenceHash()){
    state.page=resolvePageFromHash();
    $$('.nav-item').forEach(a=>a.classList.toggle('active',(a.getAttribute('href')||'')===location.hash));
    return;
  }
  const p=resolvePageFromHash();
  if(isSystemSecurityPage(p)){
    state.page=p;
    $$('.nav-item').forEach(a=>a.classList.toggle('active',(a.getAttribute('href')||'')===location.hash));
    return;
  }
  if(p!==state.page||p==='presentation-oncallcx'||p==='oncallcx-product-center'||p==='oncallcx-presale')navigate(p);
});
initAuth();bindGlobal();navigate(state.page);
