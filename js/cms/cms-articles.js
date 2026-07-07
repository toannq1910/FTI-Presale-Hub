/* v9.8.2 CMS Articles */
import { $, $$, esc, cloneData, saveCms, toast } from './cms-core.js';

export const DIRECT_ARTICLE_ROUTES = {
  'article-overview': '#overview',
  'article-oncallcx': '#oncallcx',
  'article-oncallcx-ccaas': '#oncallcx-product-center:prod-oncallcx-fpt',
  'article-oncallcx-ucaas': '#oncallcx-product-center:prod-oncallcx-ucaas-inherited',
  'article-oncallx-ccaas': '#oncallcx-product-center:prod-oncallcx-fpt',
  'article-oncallx-ucaas': '#oncallcx-product-center:prod-oncallcx-ucaas-inherited',
  'article-crm-erp-vietnam': '#crm',
  'article-uc-pbx-vietnam': '#ucpbx-vn',
  'article-ucpbx-vietnam': '#ucpbx-vn',
  'article-ccaas-vietnam': '#ccaas-vn',
  'article-ccaas-international': '#ccaas-global',
  'article-ccaas-global': '#ccaas-global',
  'article-api-reference': '#api-reference',
  'article-video': '#video-conferencing',
  'article-video-conferencing': '#video-conferencing',
  'article-compliance': '#compliance',
  'article-integration-playbook': '#integration',
  'article-vc-yealink': '#vc-yealink',
  'article-vc-logitech': '#vc-logitech',
  'article-vc-poly': '#vc-poly',
  'article-vc-cisco': '#vc-cisco',
  'article-vc-jabra': '#vc-jabra',
  'article-vc-crestron': '#vc-crestron',
  'article-vc-huddle-room': '#vc-huddle-room',
  'article-vc-medium-large-room': '#vc-medium-large-room',
  'article-demo': '#demo',
  'article-compare': '#compare',
  'article-resources': '#resources'
};

export const ARTICLE_TYPES = {
  'category-article': 'Category Article',
  'api-reference': 'API Reference',
  'asset-library': 'Asset Library',
  'knowledge-base': 'Knowledge Base',
  'static-page': 'Static Page'
};

const ONCALLCX_CCAAS_SUMMARY = 'OnCallCX là nền tảng Contact Center as a Service (CCaaS) do FPT Telecom phát triển, giúp doanh nghiệp triển khai tổng đài chăm sóc khách hàng trên nền tảng Cloud với thời gian triển khai nhanh, khả năng mở rộng linh hoạt và tích hợp dễ dàng với CRM, ERP, AI Bot và các hệ thống nghiệp vụ.';

const ARTICLE_SYNC_SEEDS = [
  {
    id:'article-overview',
    title:'Tổng quan',
    sidebarId:'overview',
    route:'#overview',
    type:'static-page',
    status:'active',
    module:'Tổng quan',
    summary:'Trang tổng quan giúp khách hàng đọc nhanh hệ sinh thái giải pháp FTI, xem demo luồng nghiệp vụ, so sánh nền tảng và nắm checklist triển khai tại Việt Nam.',
    cards:[
      {title:'Contact Center', summary:'OnCallCX, CCaaS Việt Nam, CCaaS Global, API Reference và UC/PBX.', url:'#oncallcx'},
      {title:'Video Conference', summary:'Catalog thiết bị hội nghị theo thương hiệu và loại phòng họp.', url:'#video-conferencing'},
      {title:'Integration', summary:'CRM/ERP, BYOC, API/Webhook và checklist tích hợp.', url:'#integration'},
      {title:'Demo & Sales', summary:'Demo sản phẩm, bảng so sánh và nguồn tài liệu bán hàng.', url:'#demo'}
    ]
  },
  {
    id:'article-oncallcx',
    title:'OnCallCX',
    sidebarId:'oncallcx',
    route:'#oncallcx',
    type:'category-article',
    status:'active',
    module:'CONTACT CENTER',
    summary:'Trang sản phẩm OnCallCX hiển thị hai bài viết độc lập: OnCallCX CCaaS và OnCallCX UCaaS. Mỗi bài có Product Center, Presentation và tài liệu riêng.',
    cards:[
      {title:'OnCallCX CCaaS', summary:ONCALLCX_CCAAS_SUMMARY, url:'#oncallcx-product-center:prod-oncallcx-fpt'},
      {title:'OnCallCX UCaaS', summary:'OnCallCX UCaaS tập trung vào tổng đài Cloud PBX, extension, SIP trunk, call routing và tích hợp CRM/API cho doanh nghiệp.', url:'#oncallcx-product-center:prod-oncallcx-ucaas-inherited'},
      {title:'API Reference', summary:'API/Webhook, CDR, Recording và tích hợp CRM/ERP.', url:'#api-reference'}
    ]
  },
  {
    id:'article-oncallx-ccaas',
    title:'OnCallCX CCaaS',
    sidebarId:'oncallcx-ccaas',
    route:'#oncallcx-product-center:prod-oncallcx-fpt',
    type:'product-article',
    status:'active',
    module:'CONTACT CENTER',
    summary:ONCALLCX_CCAAS_SUMMARY,
    cards:[
      {title:'Omnichannel Contact Center', summary:'Vận hành Voice, Chat, Email, Social và digital channels trong cùng một hàng đợi.', url:'#oncallcx-product-center:prod-oncallcx-fpt'},
      {title:'Voice / Chat / Email / Social', summary:'Hợp nhất tương tác khách hàng đa kênh trong một luồng vận hành.', url:'#oncallcx-product-center:prod-oncallcx-fpt'},
      {title:'AI Voicebot & Chatbot', summary:'Tự động hóa cuộc gọi, hội thoại, phân tuyến và ghi nhận kết quả.', url:'#oncallcx-product-center:prod-oncallcx-fpt'},
      {title:'Call Recording', summary:'Ghi âm, tra soát, QA/QC và báo cáo lịch sử cuộc gọi.', url:'#oncallcx-product-center:prod-oncallcx-fpt'},
      {title:'Dashboard & Realtime Report', summary:'Theo dõi realtime queue, SLA, agent performance và campaign report.', url:'#oncallcx-product-center:prod-oncallcx-fpt'},
      {title:'CRM / ERP Integration', summary:'Screen pop, ticket, customer sync, call log và workflow CSKH.', url:'#oncallcx-product-center:prod-oncallcx-fpt'},
      {title:'Workflow Automation', summary:'Tự động hóa quy trình chăm sóc khách hàng và phối hợp nghiệp vụ.', url:'#oncallcx-product-center:prod-oncallcx-fpt'},
      {title:'Open REST API & Webhook', summary:'Kết nối hệ thống ngoài bằng REST API và webhook realtime.', url:'#oncallcx-product-center:prod-oncallcx-fpt'}
    ]
  },
  {
    id:'article-oncallx-ucaas',
    title:'OnCallCX UCaaS',
    sidebarId:'oncallcx-ucaas',
    route:'#oncallcx-product-center:prod-oncallcx-ucaas-inherited',
    type:'product-article',
    status:'active',
    module:'CONTACT CENTER',
    summary:'OnCallCX UCaaS là bài viết mở rộng từ OnCallCX, tập trung vào tổng đài Cloud PBX, extension, SIP trunk, call routing và khả năng tích hợp CRM/API cho doanh nghiệp.',
    cards:[
      {title:'Cloud PBX', summary:'Tổng đài PBX cloud/hosted, quản lý extension và user tập trung.', url:'#oncallcx-product-center:prod-oncallcx-ucaas-inherited'},
      {title:'Extension / User', summary:'Tạo extension, user, voicemail, quyền gọi và nhóm người dùng.', url:'#oncallcx-product-center:prod-oncallcx-ucaas-inherited'},
      {title:'SIP Trunk', summary:'Kết nối đầu số, SIP trunk, DID, outbound/inbound route và prefix.', url:'#oncallcx-product-center:prod-oncallcx-ucaas-inherited'},
      {title:'Call Routing / IVR', summary:'Cấu hình lời chào, IVR, ring group và call distribution cơ bản.', url:'#oncallcx-product-center:prod-oncallcx-ucaas-inherited'},
      {title:'CDR / Call Log', summary:'Ghi nhận lịch sử cuộc gọi, trạng thái, thời lượng và metadata cơ bản.', url:'#oncallcx-product-center:prod-oncallcx-ucaas-inherited'},
      {title:'API-ready Integration', summary:'API chờ tích hợp provisioning, CDR, click-to-call hoặc CRM extension.', url:'#oncallcx-product-center:prod-oncallcx-ucaas-inherited'}
    ]
  },
  {id:'article-ccaas-vietnam', title:'CCaaS Việt Nam', sidebarId:'ccaas-vn', route:'#ccaas-vn', type:'category-article', status:'active', module:'CONTACT CENTER', summary:'Bài viết nhóm các nhà cung cấp CCaaS nội địa, phù hợp khách hàng cần hỗ trợ tiếng Việt, SIP trunk trong nước, dữ liệu tại Việt Nam và tích hợp CRM nội địa.'},
  {id:'article-ccaas-international', title:'CCaaS Global', sidebarId:'ccaas-global', route:'#ccaas-global', type:'category-article', status:'active', module:'CONTACT CENTER', summary:'Bài viết nhóm các nền tảng CCaaS quốc tế để tham khảo, so sánh và tư vấn khách hàng enterprise/global.'},
  {id:'article-api-reference', title:'API Reference', sidebarId:'api-reference', route:'#api-reference', type:'api-reference', status:'active', module:'CONTACT CENTER', summary:'Thư mục chứa các bài viết API, webhook, CDR, recording và integration spec đã được gom về một nơi.'},
  {id:'article-uc-pbx-vietnam', title:'UC/PBX Việt Nam', sidebarId:'ucpbx-vn', route:'#ucpbx-vn', type:'category-article', status:'active', module:'CONTACT CENTER', summary:'Nhóm nhà cung cấp UC/PBX/SIP có thể tích hợp với Contact Center qua SIP trunk, SBC, API, CTI hoặc BYOC.'},
  {id:'article-video', title:'Tổng quan Video Conference', sidebarId:'video-conferencing', route:'#video-conferencing', type:'category-article', status:'active', module:'VIDEO CONFERENCE', summary:'Tổng quan danh mục giải pháp Video Conference theo brand catalog, product detail, room recommendation, feature comparison và presales battle card.'},
  {id:'article-vc-yealink', title:'Yealink Meeting Bar', sidebarId:'vc-yealink', route:'#vc-yealink', type:'product-article', status:'active', module:'GLOBAL BRANDS', summary:'Yealink MeetingBar A40, all-in-one Android video bar, AI camera và Teams/Zoom/Meet certified.'},
  {id:'article-vc-logitech', title:'Logitech Rally Bar', sidebarId:'vc-logitech', route:'#vc-logitech', type:'product-article', status:'active', module:'GLOBAL BRANDS', summary:'Logitech Rally Bar với CollabOS, RightSight AI, Tap, Scribe, Mic Pods và Logitech Sync.'},
  {id:'article-vc-poly', title:'HP Poly Studio X52', sidebarId:'vc-poly', route:'#vc-poly', type:'product-article', status:'active', module:'GLOBAL BRANDS', summary:'HP Poly Studio X52 + TC10 hỗ trợ DirectorAI, NoiseBlockAI, Acoustic Fence và quản trị Poly Lens.'},
  {id:'article-vc-cisco', title:'Cisco Webex Devices', sidebarId:'vc-cisco', route:'#vc-cisco', type:'product-article', status:'active', module:'GLOBAL BRANDS', summary:'Cisco Webex Devices gồm Desk Pro, Board Pro, Room Kit, Room Navigator và Control Hub.'},
  {id:'article-vc-jabra', title:'Jabra PanaCast', sidebarId:'vc-jabra', route:'#vc-jabra', type:'product-article', status:'active', module:'GLOBAL BRANDS', summary:'Jabra PanaCast 50 là camera AI panoramic 180°, plug-and-play USB cho huddle/small room.'},
  {id:'article-vc-crestron', title:'Crestron Flex', sidebarId:'vc-crestron', route:'#vc-crestron', type:'product-article', status:'active', module:'GLOBAL BRANDS', summary:'Crestron Flex là hệ thống UC/AV control enterprise cho Teams Rooms, Zoom Rooms và quản trị XiO Cloud.'},
  {id:'article-vc-huddle-room', title:'Huddle Room', sidebarId:'vc-huddle-room', route:'#vc-huddle-room', type:'category-article', status:'active', module:'THEO LOẠI PHÒNG', summary:'Room recommendation cho Huddle Room 2-4 người, ưu tiên thiết bị all-in-one, USB/BYOD và triển khai nhanh.'},
  {id:'article-vc-medium-large-room', title:'Medium / Large Room', sidebarId:'vc-medium-large-room', route:'#vc-medium-large-room', type:'category-article', status:'active', module:'THEO LOẠI PHÒNG', summary:'Room recommendation cho Medium/Large room, ưu tiên dual display, mic mở rộng, DSP/AV control, scheduling và quản trị tập trung.'},
  {id:'article-integration-playbook', title:'Integration Playbook', sidebarId:'integration', route:'#integration', type:'knowledge-base', status:'active', module:'INTEGRATION', summary:'Playbook tích hợp Contact Center với CRM/ERP, SIP trunk, SBC, API/Webhook và các hệ thống nghiệp vụ nội bộ.'},
  {id:'article-crm-erp-vietnam', title:'CRM/ERP Việt Nam', sidebarId:'crm', route:'#crm', type:'category-article', status:'active', module:'INTEGRATION', summary:'Danh mục CRM/ERP Việt Nam có thể tích hợp Contact Center, phục vụ screen pop, đồng bộ khách hàng, ticket, lịch sử cuộc gọi và workflow CSKH.'},
  {id:'article-compliance', title:'Tuân thủ VN', sidebarId:'compliance', route:'#compliance', type:'knowledge-base', status:'active', module:'INTEGRATION', summary:'Khu vực quản lý thông tin tuân thủ, bảo mật, lưu trữ dữ liệu, ghi âm, dữ liệu cá nhân, audit và chính sách tích hợp.'},
  {id:'article-demo', title:'Demo sản phẩm', sidebarId:'demo', route:'#demo', type:'static-page', status:'active', module:'DEMO & SALES', summary:'Khu vực demo sản phẩm dùng cho khách hàng đọc hiểu và presales trình bày luồng nghiệp vụ.'},
  {id:'article-compare', title:'Bảng so sánh', sidebarId:'compare', route:'#compare', type:'static-page', status:'active', module:'DEMO & SALES', summary:'Bảng so sánh nhanh các nhóm giải pháp, tính năng và điểm phù hợp.'},
  {id:'article-resources', title:'Nguồn tài liệu', sidebarId:'resources', route:'#resources', type:'asset-library', status:'active', module:'DEMO & SALES', summary:'Nguồn tài liệu dùng cho presales, demo, checklist và handover.'}
];

const ARTICLE_GROUPS = [
  {id:'overview', title:'Tổng quan', match:['overview']},
  {id:'contact-center', title:'CONTACT CENTER', subtitle:'UCaaS · CCaaS · AI', match:['oncallcx','oncallcx-ccaas','oncallcx-ucaas','ccaas-vn','ccaas-global','api-reference','ucpbx-vn']},
  {id:'video-conference', title:'VIDEO CONFERENCE', subtitle:'Room · Endpoint', match:['video-conferencing']},
  {id:'global-brands', title:'GLOBAL BRANDS', match:['vc-yealink','vc-logitech','vc-poly','vc-cisco','vc-jabra','vc-crestron']},
  {id:'room-types', title:'THEO LOẠI PHÒNG', match:['vc-huddle-room','vc-medium-large-room']},
  {id:'integration', title:'INTEGRATION', subtitle:'CRM · ERP · BYOC', match:['integration','crm','compliance']},
  {id:'demo-sales', title:'DEMO & SALES', subtitle:'Khách hàng đọc hiểu', match:['demo','compare','resources']}
];

const ROUTE_ALIASES = {
  '#uc-pbx': '#ucpbx-vn',
  '#uc-pbx-vietnam': '#ucpbx-vn',
  '#ccaas-vietnam': '#ccaas-vn',
  '#ccaas-international': '#ccaas-global',
  '#video': '#video-conferencing',
  '#integration-playbook': '#integration',
  '#crm-erp-vietnam': '#crm',
  '#product-detail:oncallcx': '#oncallcx-product-center-ccaas',
  '#oncallcx-product-centerprod-oncallcx-fpt': '#oncallcx-product-center-ccaas',
  '#oncallcx-product-centerprod-oncallcx-ucaas-inherited': '#oncallcx-product-center-ucaas',
  '#oncallcx-product-center:prod-oncallcx-fpt': '#oncallcx-product-center-ccaas',
  '#oncallcx-product-center:prod-oncallcx-ucaas-inherited': '#oncallcx-product-center-ucaas'
};

const ROUTE_PRESETS = [
  ['#overview','Trang tổng quan'],
  ['#oncallcx','Trang OnCallCX'],
  ['#oncallcx-product-center-ccaas','Product Center CCaaS'],
  ['#oncallcx-product-center-ucaas','Product Center UCaaS'],
  ['#ccaas-vn','CCaaS Việt Nam'],
  ['#ccaas-global','CCaaS Global'],
  ['#api-reference','API Reference'],
  ['#ucpbx-vn','UC/PBX Việt Nam'],
  ['#video-conferencing','Video Conference'],
  ['#vc-yealink','Yealink Meeting Bar'],
  ['#vc-logitech','Logitech Rally Bar'],
  ['#vc-poly','HP Poly Studio X52'],
  ['#vc-cisco','Cisco Webex Devices'],
  ['#vc-jabra','Jabra PanaCast'],
  ['#vc-crestron','Crestron Flex'],
  ['#vc-huddle-room','Huddle Room'],
  ['#vc-medium-large-room','Medium / Large Room'],
  ['#integration','Integration Playbook'],
  ['#crm','CRM/ERP Việt Nam'],
  ['#compliance','Tuân thủ VN'],
  ['#demo','Demo sản phẩm'],
  ['#compare','Bảng so sánh'],
  ['#resources','Nguồn tài liệu']
];

const VALID_ROUTE_SET = new Set(ROUTE_PRESETS.map(([route]) => route));
const CARD_FALLBACK_ROUTES = {
  'article-oncallx-ccaas': '#oncallcx-product-center-ccaas',
  'article-oncallcx-ccaas': '#oncallcx-product-center-ccaas',
  'article-oncallx-ucaas': '#oncallcx-product-center-ucaas',
  'article-oncallcx-ucaas': '#oncallcx-product-center-ucaas'
};

function articleSeedMap(){
  const map = new Map();
  ARTICLE_SYNC_SEEDS.forEach(seed => map.set(seed.id, seed));
  return map;
}

function routeOptions(){
  return ROUTE_PRESETS.map(([route,label]) => `<option value="${esc(route)}">${esc(label)}</option>`).join('');
}

function normalizeRouteValue(value = '', fallback = ''){
  const raw = String(value || '').trim();
  if(!raw) return '';
  if(ROUTE_ALIASES[raw]) return ROUTE_ALIASES[raw];
  if(raw.startsWith('#oncallcx-product-centerprod-oncallcx-ucaas')) return '#oncallcx-product-center-ucaas';
  if(raw.startsWith('#oncallcx-product-centerprod-oncallcx-fpt')) return '#oncallcx-product-center-ccaas';
  if(raw.startsWith('#oncallcx-product-center:prod-oncallcx-ucaas')) return '#oncallcx-product-center-ucaas';
  if(raw.startsWith('#oncallcx-product-center:prod-oncallcx-fpt')) return '#oncallcx-product-center-ccaas';
  if(raw.startsWith('#oncallcx-product-center:prod-on') && fallback) return fallback;
  return raw;
}

function normalizeCard(card = {}, article = {}){
  const fallback = CARD_FALLBACK_ROUTES[article.id] || article.route || '';
  return {
    ...card,
    url: normalizeRouteValue(card.url || '', fallback)
  };
}

function routeState(value){
  const route = String(value || '').trim();
  if(!route) return {className:'empty', label:'Chưa có route'};
  if(/^https?:\/\//i.test(route) || route.startsWith('mailto:') || route.startsWith('tel:')) return {className:'valid', label:'External'};
  if(VALID_ROUTE_SET.has(route) || route.startsWith('#presentation-oncallcx:')) return {className:'valid', label:'Route hợp lệ'};
  return {className:'invalid', label:'Cần kiểm tra'};
}

function getCollapsedArticleGroups(){
  try{
    return new Set(JSON.parse(sessionStorage.getItem('fti_collapsed_article_groups') || '[]'));
  }catch(err){
    return new Set();
  }
}

function setCollapsedArticleGroups(groups){
  sessionStorage.setItem('fti_collapsed_article_groups', JSON.stringify(Array.from(groups)));
}

function dedupeArticles(articles){
  const preferredIds = new Set(ARTICLE_SYNC_SEEDS.map(seed => seed.id));
  const byKey = new Map();
  articles.forEach(article => {
    const key = article.sidebarId || article.route || article.id;
    const existing = byKey.get(key);
    if(!existing || (preferredIds.has(article.id) && !preferredIds.has(existing.id))){
      byKey.set(key, article);
    }
  });
  return Array.from(byKey.values());
}

function articleGroup(article){
  const key = article.sidebarId || String(article.route || '').replace(/^#/,'');
  return ARTICLE_GROUPS.find(g => g.match.includes(key)) || {id:'other', title:'KHÁC', match:[]};
}

function articleOrder(article){
  const group = articleGroup(article);
  const key = article.sidebarId || String(article.route || '').replace(/^#/,'');
  const groupIndex = ARTICLE_GROUPS.findIndex(g => g.id === group.id);
  const itemIndex = group.match.indexOf(key);
  return [
    groupIndex === -1 ? 999 : groupIndex,
    itemIndex === -1 ? 999 : itemIndex,
    String(article.title || '')
  ];
}

function normalizeArticleRoute(article){
  if(!article) return article;
  const direct = DIRECT_ARTICLE_ROUTES[article.id];
  article.route = normalizeRouteValue(article.route || direct || '');
  article.cards = Array.isArray(article.cards) ? article.cards.map(card => normalizeCard(card, article)) : [];
  return article;
}

function normalizeArticleRoutes(data){
  data.articles = Array.isArray(data.articles) ? data.articles : [];
  const byId = new Map(data.articles.map(a => [a.id, a]));
  articleSeedMap().forEach((seed,id) => {
    const existing = byId.get(id);
    if(existing){
      const hasExistingCards = Object.prototype.hasOwnProperty.call(existing, 'cards') && Array.isArray(existing.cards);
      const nextCards = hasExistingCards ? existing.cards : (seed.cards || []);
      Object.assign(existing, {
        ...seed,
        title: existing.title || seed.title,
        sidebarId: existing.sidebarId || seed.sidebarId,
        route: existing.route || seed.route,
        type: existing.type || seed.type,
        status: existing.status || seed.status,
        summary: existing.summary || seed.summary
      });
      existing.cards = nextCards.map(card => normalizeCard(card, existing));
    }else{
      const created = {...seed, cards: seed.cards ? seed.cards.map(c => ({...c})) : []};
      data.articles.push(created);
      byId.set(id, created);
    }
  });
  data.articles.forEach(normalizeArticleRoute);
  data.articles = dedupeArticles(data.articles);
  data.articles.sort((a,b) => {
    const ao = articleOrder(a);
    const bo = articleOrder(b);
    return ao[0] - bo[0] || ao[1] - bo[1] || ao[2].localeCompare(bo[2], 'vi');
  });
  return data;
}

function activeArticle(data){
  const articles = Array.isArray(data.articles) ? data.articles : [];
  const activeId = sessionStorage.getItem('fti_active_article_id') || 'article-overview';
  return articles.find(a => a.id === activeId) || articles[0] || null;
}

function articleList(articles, activeId){
  if(!articles.length) return `<div class="cms-empty-state">Chưa có bài viết CMS.</div>`;
  const collapsedGroups = getCollapsedArticleGroups();
  const groups = new Map();
  articles.forEach(article => {
    const group = articleGroup(article);
    if(!groups.has(group.id)) groups.set(group.id, {group, items:[]});
    groups.get(group.id).items.push(article);
  });
  return Array.from(groups.values()).map(({group,items}) => {
    const isCollapsed = collapsedGroups.has(group.id);
    return `<div class="article-group ${isCollapsed ? 'collapsed' : ''}" data-article-group="${esc(group.id)}">
    <button class="article-group-title" type="button" data-article-group-toggle="${esc(group.id)}" aria-expanded="${isCollapsed ? 'false' : 'true'}">
      <span>
        <b>${esc(group.title)}</b>
        ${group.subtitle ? `<em>${esc(group.subtitle)}</em>` : ''}
      </span>
      <small>${isCollapsed ? '+' : '−'}</small>
    </button>
    <div class="article-group-items">
    ${items.map(a => `<button class="article-list-item ${a.id === activeId ? 'active' : ''}" data-article-id="${esc(a.id)}">
      <b>${esc(a.title || 'Untitled')}</b>
      <span>${esc(a.sidebarId || a.route || a.type || '')}</span>
      <em>${esc(a.status || 'draft')}</em>
    </button>`).join('')}
    </div>
  </div>`;
  }).join('');
}

function cardRows(article){
  const cards = Array.isArray(article.cards) ? article.cards : [];
  return cards.map((c,i) => {
    const state = routeState(c.url);
    return `<div class="article-card-tile" data-article-card="${i}">
    <div class="article-card-tile-preview">
      <b>${esc(c.title || 'Card chưa có tiêu đề')}</b>
      <p>${esc(c.summary || 'Chưa có mô tả — khách hàng sẽ không thấy nội dung ở đây.')}</p>
    </div>
    <div class="article-card-tile-fields">
      <label>Tiêu đề card</label>
      <input data-card-title="${i}" value="${esc(c.title || '')}" placeholder="VD: Omnichannel Contact Center">
      <label>Mô tả ngắn</label>
      <input data-card-summary="${i}" value="${esc(c.summary || '')}" placeholder="1 câu mô tả ngắn gọn cho khách hàng đọc">
      <label>Bấm vào card sẽ mở trang nào?</label>
      <div class="article-route-input">
        <input class="${state.className === 'invalid' ? 'route-invalid' : ''}" data-card-url="${i}" list="articleRouteOptions" value="${esc(c.url || '')}" placeholder="Chọn từ danh sách hoặc dán URL">
        <span class="article-route-state ${esc(state.className)}">${esc(state.label)}</span>
      </div>
    </div>
    <button class="btn btn-danger article-card-tile-remove" data-remove-card="${i}">Xóa card này</button>
  </div>`;
  }).join('') || `<div class="cms-empty-state">Chưa có card nội dung. Bấm “+ Thêm card” để tạo card đầu tiên.</div>`;
}

function renderArticleForm(article){
  if(!article) return `<div class="cms-empty-state">Chưa có bài viết.</div>`;
  const articleRouteState = routeState(article.route);
  return `<div class="article-editor-card">
    <datalist id="articleRouteOptions">${routeOptions()}</datalist>
    <div class="article-editor-head">
      <div>
        <h3>${esc(article.title || 'Bài viết')}</h3>
        <p>Đang sửa bài viết này. Nhớ bấm “Lưu bài viết” sau khi chỉnh xong.</p>
      </div>
      <div class="article-actions">
        <button class="btn btn-soft" id="duplicateArticle">Nhân bản</button>
        <button class="btn btn-danger" id="deleteArticle">Xóa</button>
        <button class="btn btn-primary" id="saveArticle">Lưu bài viết</button>
      </div>
    </div>

    <div class="pm-form-grid">
      <label>Tên bài viết</label><input id="articleTitle" value="${esc(article.title || '')}" placeholder="Tên hiển thị cho khách hàng đọc">
      <label>Trạng thái</label>
      <select id="articleStatus">
        <option value="active" ${article.status === 'active' ? 'selected' : ''}>Active — đang hiển thị cho khách hàng</option>
        <option value="draft" ${article.status === 'draft' ? 'selected' : ''}>Draft — bản nháp, chưa công khai</option>
        <option value="archived" ${article.status === 'archived' ? 'selected' : ''}>Archived — đã ẩn, lưu trữ</option>
      </select>
      <label>Mô tả tổng quan</label><textarea id="articleSummary" placeholder="Đoạn mô tả ngắn hiển thị đầu trang">${esc(article.summary || '')}</textarea>
    </div>

    <details class="article-advanced">
      <summary>⚙️ Cài đặt kỹ thuật (chỉ sửa khi chắc chắn)</summary>
      <div class="pm-form-grid">
        <label>ID bài viết</label><input id="articleId" value="${esc(article.id || '')}">
        <p class="article-field-hint">Mã định danh nội bộ, dùng để hệ thống nhận diện bài viết. Đổi ID có thể làm mất liên kết ở nơi khác — chỉ đổi khi chắc chắn.</p>
        <label>Mã sidebar</label><input id="articleSidebarId" value="${esc(article.sidebarId || '')}">
        <p class="article-field-hint">Mã dùng để nối bài viết với mục tương ứng trên thanh điều hướng bên trái.</p>
        <label>Đường dẫn trang</label><div class="article-route-input"><input id="articleRoute" class="${articleRouteState.className === 'invalid' ? 'route-invalid' : ''}" list="articleRouteOptions" value="${esc(article.route || '')}"><span class="article-route-state ${esc(articleRouteState.className)}">${esc(articleRouteState.label)}</span></div>
        <p class="article-field-hint">Đường dẫn (route) sẽ mở khi bấm vào bài viết này ở menu chính. Để trống nếu bài viết này chỉ chứa card, không phải trang riêng.</p>
        <label>Loại bài viết</label>
        <select id="articleType">${Object.entries(ARTICLE_TYPES).map(([k,v]) => `<option value="${k}" ${article.type === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
        <p class="article-field-hint">Chỉ ảnh hưởng cách hệ thống phân loại nội bộ, không hiển thị cho khách hàng.</p>
      </div>
    </details>

    <div class="article-card-editor">
      <div class="article-editor-head">
        <div>
          <h3>Các card nội dung</h3>
          <p>Mỗi card là 1 ô sẽ hiện trên trang này để khách hàng bấm vào xem tiếp.</p>
        </div>
        <button class="btn btn-soft" id="addArticleCard">+ Thêm card</button>
      </div>
      <div id="articleCardRows" class="article-card-tile-list">${cardRows(article)}</div>
    </div>
  </div>`;
}

function collectArticle(old = {}){
  const cards = $$('[data-article-card]').map(row => {
    const i = row.dataset.articleCard;
    return {
      title: $(`[data-card-title="${i}"]`)?.value || '',
      summary: $(`[data-card-summary="${i}"]`)?.value || '',
      url: normalizeRouteValue($(`[data-card-url="${i}"]`)?.value || '', old.route || '')
    };
  }).filter(c => c.title || c.summary || c.url);

  return {
    ...old,
    id: $('#articleId')?.value || old.id || `article-${Date.now()}`,
    title: $('#articleTitle')?.value || '',
    sidebarId: $('#articleSidebarId')?.value || '',
    route: normalizeRouteValue($('#articleRoute')?.value || ''),
    type: $('#articleType')?.value || 'category-article',
    status: $('#articleStatus')?.value || 'draft',
    summary: $('#articleSummary')?.value || '',
    cards
  };
}

export function renderCmsArticles(data, description = ''){
  normalizeArticleRoutes(data);
  const active = activeArticle(data);
  const routeGuide = ROUTE_PRESETS.slice(0, 9);
  return `<section class="article-hero">
    <div>
      <span class="eyebrow">📝 CMS Articles</span>
      <h2>Quản lý tất cả bài viết và card</h2>
      <p>${esc(description || 'Nơi quản lý tất cả bài viết và card hiển thị ngoài portal. Khi tạo bài viết mới, dùng Route hoặc URL card để quyết định nội dung sẽ mở ở trang nào.')}</p>
    </div>
    <button class="btn btn-primary" id="addArticle">+ Thêm bài viết</button>
  </section>

  <section class="cms-form-card article-route-guide">
    <h3>Bài viết mới hiển thị ở đâu?</h3>
    <p>Điền <b>Route</b> bằng hash của trang cần mở. Card con dùng trường <b>URL hoặc #route</b> để trỏ tới trang, product detail, PDF hoặc website.</p>
    <div class="cms-tags">${routeGuide.map(([route,label]) => `<span><code>${esc(route)}</code> ${esc(label)}</span>`).join('')}</div>
  </section>

  <section class="article-layout">
    <aside class="article-sidebar">
      <input id="articleSearch" placeholder="Tìm bài viết...">
      <div class="article-group-tools">
        <button class="btn btn-soft" id="expandArticleGroups">Mở tất cả</button>
        <button class="btn btn-soft" id="collapseArticleGroups">Thu gọn</button>
      </div>
      <div id="articleList">${articleList(data.articles, active?.id)}</div>
    </aside>
    <main class="article-main">
      ${renderArticleForm(active)}
    </main>
  </section>`;
}

export function bindCmsArticles(data, renderCms){
  normalizeArticleRoutes(data);
  let articles = data.articles;
  let active = activeArticle(data);

  const bindList = () => {
    $$('[data-article-id]').forEach(btn => btn.onclick = () => {
      sessionStorage.setItem('fti_active_article_id', btn.dataset.articleId);
      renderCms(data, 'articles');
    });
  };

  const bindGroupControls = () => {
    $$('[data-article-group-toggle]').forEach(btn => btn.onclick = () => {
      const groups = getCollapsedArticleGroups();
      const id = btn.dataset.articleGroupToggle;
      if(groups.has(id)) groups.delete(id);
      else groups.add(id);
      setCollapsedArticleGroups(groups);
      $('#articleList').innerHTML = articleList(articles, active?.id);
      bindList();
      bindGroupControls();
    });
  };
  bindList();
  bindGroupControls();

  $('#expandArticleGroups')?.addEventListener('click', () => {
    setCollapsedArticleGroups(new Set());
    $('#articleList').innerHTML = articleList(articles, active?.id);
    bindList();
    bindGroupControls();
  });

  $('#collapseArticleGroups')?.addEventListener('click', () => {
    setCollapsedArticleGroups(new Set(ARTICLE_GROUPS.map(g => g.id)));
    $('#articleList').innerHTML = articleList(articles, active?.id);
    bindList();
    bindGroupControls();
  });

  $('#articleSearch')?.addEventListener('input', () => {
    const q = ($('#articleSearch')?.value || '').toLowerCase();
    const visible = articles.filter(a => !q || [a.title,a.sidebarId,a.route,a.summary,a.type,a.module].join(' ').toLowerCase().includes(q));
    $('#articleList').innerHTML = articleList(visible, active?.id);
    bindList();
    bindGroupControls();
  });

  $('#addArticle')?.addEventListener('click', () => {
    const next = cloneData(data);
    next.articles = Array.isArray(next.articles) ? next.articles : [];
    const article = {
      id: `article-${Date.now()}`,
      title: 'Bài viết mới',
      sidebarId: '',
      route: '',
      type: 'category-article',
      status: 'draft',
      summary: 'Nhập mô tả bài viết.',
      cards: []
    };
    next.articles.unshift(article);
    sessionStorage.setItem('fti_active_article_id', article.id);
    saveCms(next);
    toast('Đã tạo bài viết mới.');
    renderCms(next, 'articles');
  });

  $('#saveArticle')?.addEventListener('click', () => {
    if(!active) return;
    const updated = collectArticle(active);
    const next = cloneData(data);
    next.articles = next.articles.map(a => a.id === active.id ? updated : a);
    next.meta = next.meta || {};
    next.meta.version = 'v9.8.2';
    next.meta.updatedAt = new Date().toISOString().slice(0,10);
    sessionStorage.setItem('fti_active_article_id', updated.id);
    saveCms(next);
    toast('Đã lưu bài viết.');
    renderCms(next, 'articles');
  });

  $('#deleteArticle')?.addEventListener('click', () => {
    if(!active || !confirm('Xóa bài viết này?')) return;
    const next = cloneData(data);
    next.articles = next.articles.filter(a => a.id !== active.id);
    sessionStorage.setItem('fti_active_article_id', next.articles[0]?.id || '');
    saveCms(next);
    toast('Đã xóa bài viết.');
    renderCms(next, 'articles');
  });

  $('#duplicateArticle')?.addEventListener('click', () => {
    if(!active) return;
    const next = cloneData(data);
    const clone = {...collectArticle(active), id: `${active.id}-copy-${Date.now()}`, title: `${active.title} Copy`, status:'draft'};
    next.articles.unshift(clone);
    sessionStorage.setItem('fti_active_article_id', clone.id);
    saveCms(next);
    toast('Đã nhân bản bài viết.');
    renderCms(next, 'articles');
  });

  $('#addArticleCard')?.addEventListener('click', () => {
    if(!active) return;
    const next = cloneData(data);
    const idx = next.articles.findIndex(a => a.id === active.id);
    if(idx < 0){ toast('Không tìm thấy bài viết đang chọn.'); return; }
    const current = collectArticle(active);
    const before = current.cards.length;
    current.cards.push({title:'Card mới',summary:'Mô tả',url:''});
    next.articles[idx] = current;
    normalizeArticleRoutes(next);
    const after = next.articles.find(a => a.id === current.id)?.cards?.length || 0;
    if(after <= before){ toast('Chưa thêm được card. Vui lòng kiểm tra lại dữ liệu bài viết.'); return; }
    saveCms(next);
    toast('Đã thêm card nội dung.');
    renderCms(next, 'articles');
  });

  $$('[data-remove-card]').forEach(btn => btn.onclick = () => {
    if(!active) return;
    const next = cloneData(data);
    const idx = next.articles.findIndex(a => a.id === active.id);
    if(idx < 0){ toast('Không tìm thấy bài viết đang chọn.'); return; }
    const current = collectArticle(active);
    const before = current.cards.length;
    current.cards.splice(Number(btn.dataset.removeCard),1);
    next.articles[idx] = current;
    normalizeArticleRoutes(next);
    const after = next.articles.find(a => a.id === current.id)?.cards?.length || 0;
    if(after >= before){ toast('Chưa xóa được card. Vui lòng kiểm tra lại dữ liệu bài viết.'); return; }
    saveCms(next);
    toast('Đã xóa card nội dung.');
    renderCms(next, 'articles');
  });
}
