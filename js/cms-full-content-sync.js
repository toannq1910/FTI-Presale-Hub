/* v10.7.1 CMS Full Content Sync
   Purpose:
   - Review/gap-fix CMS content coverage.
   - Seed all major articles/pages/routes into CMS data.
   - Keep existing user-edited data but complete missing CMS coverage.
   - Runtime-only, no reset required.

   Scope:
   - Core sidebar articles
   - Enterprise CMS routes v10.0 → v10.7
   - Video Conference VC 1.4.x catalog routes
   - Product seed for Video Conference brands
   - CMS Audit route: #cms-audit
*/
import { loadCms, saveCms, esc } from './cms/cms-core.js';

const SYNC_VERSION = 'v10.7.1-cms-full-content-sync';
const SYNC_STORAGE_KEY = 'fti_cms_full_content_sync_version';

const ARTICLE_SEEDS = [
  {
    id: 'article-overview',
    title: 'Tổng quan',
    sidebarId: 'overview',
    route: '#overview',
    type: 'portal-overview',
    status: 'active',
    module: 'Core Portal',
    summary: 'Trang tổng quan của FTI Collaboration Hub, hiển thị các phân hệ chính như Contact Center, Video Conference, Integration, CMS, Document Center, API Center và Knowledge Platform.',
    tags: ['overview','portal','dashboard'],
    cards: [
      {title:'Contact Center', summary:'Khu vực quản lý OnCallCX, CCaaS Việt Nam, CCaaS Global, API Reference và UC/PBX.', url:'#oncallcx'},
      {title:'Video Conference', summary:'Catalog thiết bị hội nghị theo thương hiệu và loại phòng họp.', url:'#video-conferencing'},
      {title:'Enterprise CMS', summary:'Trung tâm quản trị nội dung, sản phẩm, API, document, knowledge và publish workflow.', url:'#enterprise-cms'}
    ]
  },
  {
    id: 'article-oncallcx',
    title: 'OncallCX - Contact Center As A Service',
    sidebarId: 'oncallcx',
    route: '#oncallcx',
    type: 'product-article',
    status: 'active',
    module: 'Contact Center',
    summary: 'OnCallCX là nền tảng Contact Center as a Service made by FPT, hỗ trợ voice, omni-channel, recording, dashboard, campaign, CRM/ERP integration, API/Webhook và AI integration.',
    tags: ['oncallcx','ccaas','contact-center','fpt'],
    productRefs: ['oncallcx'],
    cards: [
      {title:'Product Center', summary:'Thông tin tổng quan, presentation, datasheet, demo và tài liệu sản phẩm.', url:'#product-detail:oncallcx'},
      {title:'API Reference', summary:'CDR API, Outbound Call API, Webhook Incoming và Recording API.', url:'#api-center'}
    ]
  },
  {
    id: 'article-ccaas-vietnam',
    title: 'CCaaS — Đối Tác Việt Nam',
    sidebarId: 'ccaas-vn',
    route: '#ccaas-vn',
    type: 'category-article',
    status: 'active',
    module: 'Contact Center',
    summary: 'Danh mục giải pháp Contact Center tại Việt Nam, đối tác CCaaS, use case, API, demo và checklist tư vấn khách hàng.',
    tags: ['ccaas','vietnam','partner','contact-center'],
    cards: [
      {title:'OnCallCX Full CC', summary:'Contact Center made by FPT, hỗ trợ CRM integration, ticket, campaign, dashboard và API.', url:'#product-detail:oncallcx'},
      {title:'VNPT Contact Center', summary:'Giải pháp tổng đài hosted từ VNPT, phù hợp khách hàng cần tích hợp SIP trunk và đầu số.', url:'#ccaas-vn'},
      {title:'Mitek Contact Center', summary:'Giải pháp Contact Center cho enterprise, tài chính, ngân hàng và bảo hiểm.', url:'#ccaas-vn'}
    ]
  },
  {
    id: 'article-ccaas-global',
    title: 'CCaaS — Nền Tảng Quốc Tế',
    sidebarId: 'ccaas-global',
    route: '#ccaas-global',
    type: 'category-article',
    status: 'active',
    module: 'Contact Center',
    summary: 'Danh mục nền tảng CCaaS quốc tế dùng để tham khảo, so sánh và tư vấn khách hàng enterprise/global.',
    tags: ['ccaas','global','genesys','nice','webex','zoom'],
    cards: [
      {title:'Genesys Cloud CX', summary:'Nền tảng cloud CX enterprise toàn cầu.', url:'https://developer.genesys.cloud/'},
      {title:'NICE CXone', summary:'CCaaS enterprise mạnh về AI, WFM và analytics.', url:'https://developer.niceincontact.com/'},
      {title:'Webex Contact Center', summary:'Cloud contact center thuộc hệ sinh thái Cisco/Webex.', url:'#product-detail:webex-contact-center'},
      {title:'Zoom Contact Center', summary:'Cloud contact center phù hợp khách hàng đang dùng Zoom.', url:'#product-detail:zoom-contact-center'}
    ]
  },
  {
    id: 'article-api-reference',
    title: 'API Reference',
    sidebarId: 'api-reference',
    route: '#api-reference',
    type: 'api-reference',
    status: 'active',
    module: 'Contact Center',
    summary: 'Khu vực API Reference chuẩn hóa theo product, method, endpoint, auth, request, response, notes và API Spec asset.',
    tags: ['api','reference','webhook','integration'],
    cards: [
      {title:'API Center', summary:'Structured API Reference với search, filter, request/response và copy endpoint.', url:'#api-center'},
      {title:'CDR API', summary:'Truy vấn lịch sử cuộc gọi, trạng thái, thời lượng và metadata.', url:'#api-center'},
      {title:'Webhook Incoming', summary:'Nhận sự kiện cuộc gọi realtime để tích hợp CRM/ERP.', url:'#api-center'},
      {title:'Recording API', summary:'Truy xuất ghi âm phục vụ QA/QC và tra soát.', url:'#api-center'}
    ]
  },
  {
    id: 'article-ucpbx-vietnam',
    title: 'UC / PBX — Nhà Cung Cấp Việt Nam',
    sidebarId: 'ucpbx-vn',
    route: '#ucpbx-vn',
    type: 'category-article',
    status: 'active',
    module: 'Contact Center',
    summary: 'Danh mục hệ thống UC/PBX/SIP có thể tích hợp với Contact Center qua SIP trunk, SBC, API, CTI hoặc mô hình BYOC.',
    tags: ['uc','pbx','sip','sbc','byoc'],
    cards: [
      {title:'Asterisk', summary:'PBX mã nguồn mở, phù hợp lab, SBC proxy, SIP integration và custom dialplan.', url:'https://www.asterisk.org/'},
      {title:'3CX', summary:'PBX/UC software hỗ trợ SIP trunk, softphone, web client và call flow.', url:'https://www.3cx.com/'},
      {title:'Cisco CUCM', summary:'IP Telephony enterprise, tích hợp SIP trunk, CUBE/SBC và contact center.', url:'#ucpbx-vn'},
      {title:'Ribbon SBC', summary:'Session Border Controller cho SIP interconnect, bảo mật và routing voice.', url:'https://ribboncommunications.com/'}
    ]
  },
  {
    id: 'article-integration-playbook',
    title: 'Integration Playbook',
    sidebarId: 'integration',
    route: '#integration',
    type: 'knowledge-base',
    status: 'active',
    module: 'Integration',
    summary: 'Playbook tích hợp Contact Center với CRM/ERP, SIP trunk, SBC, API/Webhook và các hệ thống nghiệp vụ nội bộ.',
    tags: ['integration','crm','erp','sip','webhook'],
    cards: [
      {title:'CRM Screen Pop', summary:'Bật màn hình thông tin khách hàng khi có cuộc gọi vào.', url:'#crm'},
      {title:'ERP Customer Sync', summary:'Đồng bộ hồ sơ khách hàng, ticket, đơn hàng hoặc mã khách hàng.', url:'#integration'},
      {title:'Webhook Events', summary:'Nhận sự kiện realtime để kích hoạt workflow.', url:'#api-center'},
      {title:'SIP / SBC Integration', summary:'Kết nối SIP trunk, SBC, PBX hoặc BYOC.', url:'#ucpbx-vn'}
    ]
  },
  {
    id: 'article-crm-erp-vietnam',
    title: 'CRM/ERP Việt Nam',
    sidebarId: 'crm',
    route: '#crm',
    type: 'category-article',
    status: 'active',
    module: 'Integration',
    summary: 'Danh mục CRM/ERP Việt Nam có thể tích hợp Contact Center, phục vụ screen pop, đồng bộ khách hàng, ticket, lịch sử cuộc gọi và workflow chăm sóc khách hàng.',
    tags: ['crm','erp','vietnam','integration'],
    cards: [
      {title:'Getfly CRM', summary:'CRM Việt Nam phù hợp SME, hỗ trợ bán hàng, marketing automation và chăm sóc khách hàng.', url:'https://getfly.vn/'},
      {title:'MISA AMIS CRM', summary:'Nền tảng CRM trong hệ sinh thái MISA AMIS.', url:'https://amis.misa.vn/'},
      {title:'CloudGO CRM', summary:'CRM cloud thuần Việt, mạnh về quản lý bán hàng và chăm sóc khách hàng.', url:'https://cloudgo.vn/'},
      {title:'Base.vn', summary:'Nền tảng quản trị doanh nghiệp liên quan workflow, ticket, approval và vận hành nội bộ.', url:'https://base.vn/'}
    ]
  },
  {
    id: 'article-compliance',
    title: 'Quy định & Tuân thủ',
    sidebarId: 'compliance',
    route: '#compliance',
    type: 'compliance',
    status: 'active',
    module: 'Integration',
    summary: 'Khu vực quản lý thông tin tuân thủ, bảo mật, lưu trữ dữ liệu, ghi âm, dữ liệu cá nhân, audit và chính sách tích hợp.',
    tags: ['compliance','security','recording','data-protection'],
    cards: [
      {title:'Data Protection', summary:'Kiểm soát dữ liệu cá nhân, mục đích xử lý, lưu trữ và quyền truy cập.', url:'#compliance'},
      {title:'Recording Policy', summary:'Thông báo ghi âm, lưu trữ an toàn và khả năng tra soát.', url:'#compliance'},
      {title:'API Security', summary:'Token, signature, rate limit, audit log và quyền truy cập API.', url:'#api-center'}
    ]
  },
  {
    id: 'article-video-conferencing',
    title: 'Tổng quan Video Conference',
    sidebarId: 'video-conferencing',
    route: '#video-conferencing',
    type: 'video-conference-overview',
    status: 'active',
    module: 'Video Conference',
    summary: 'Tổng quan danh mục giải pháp Video Conference: brand catalog, product detail, room recommendation, feature comparison, ecosystem, presales battle card và CMS relationship.',
    tags: ['video-conference','room','endpoint','meeting'],
    cards: [
      {title:'Yealink Meeting Bar', summary:'MeetingBar A40, all-in-one Android video bar, AI camera và Teams/Zoom/Meet certified.', url:'#vc-yealink'},
      {title:'Logitech Rally Bar', summary:'CollabOS, RightSight AI, Scribe, Tap, SWYTCH và Logitech Sync.', url:'#vc-logitech'},
      {title:'HP Poly Studio X52', summary:'DirectorAI, NoiseBlockAI, Acoustic Fence và TC10 controller.', url:'#vc-poly'},
      {title:'Room Recommendation', summary:'Huddle Room, Small Room, Medium Room và Large Room.', url:'#vc-huddle-room'}
    ]
  },
  {
    id: 'article-vc-yealink',
    title: 'Yealink Meeting Bar',
    sidebarId: 'vc-yealink',
    route: '#vc-yealink',
    type: 'video-product',
    status: 'active',
    module: 'Video Conference',
    summary: 'Yealink MeetingBar A40 là AI-powered all-in-one video bar cho Huddle, Small và Medium room, hỗ trợ Android, dual 48MP camera, IntelliFocus và nhiều nền tảng họp.',
    tags: ['yealink','meetingbar','a40','teams','zoom','google-meet'],
    productRefs: ['vc-yealink-a40'],
    cards: [
      {title:'AI Features', summary:'IntelliFocus, Auto-Framing, Speaker Tracking và People Counting.', url:'#vc-yealink'},
      {title:'Room Bundle', summary:'A40 + CTP25 + WPP30 + wireless mic cho Huddle/Small/Medium room.', url:'#vc-yealink'},
      {title:'Official Website', summary:'Trang sản phẩm chính thức Yealink.', url:'https://www.yealink.com/'}
    ]
  },
  {
    id: 'article-vc-logitech',
    title: 'Logitech Rally Bar',
    sidebarId: 'vc-logitech',
    route: '#vc-logitech',
    type: 'video-product',
    status: 'active',
    module: 'Video Conference',
    summary: 'Logitech Rally Bar là video bar với RightSight AI, CollabOS, Scribe, Tap Scheduler, Mic Pods, SWYTCH và Logitech Sync cho hybrid workplace.',
    tags: ['logitech','rally-bar','collabos','scribe','tap','swytch'],
    productRefs: ['vc-logitech-rally-bar'],
    cards: [
      {title:'Ecosystem', summary:'Rally Bar, Tap, Tap Scheduler, Scribe, Mic Pods, SWYTCH và Sync.', url:'#vc-logitech'},
      {title:'BYOD', summary:'SWYTCH adapter hỗ trợ kết nối laptop cá nhân.', url:'#vc-logitech'},
      {title:'Room Bundle', summary:'Small/Medium/Large room bundle với Tap và Mic Pods.', url:'#vc-logitech'},
      {title:'Official Website', summary:'Trang sản phẩm chính thức Logitech.', url:'https://www.logitech.com/'}
    ]
  },
  {
    id: 'article-vc-poly',
    title: 'HP Poly Studio X52',
    sidebarId: 'vc-poly',
    route: '#vc-poly',
    type: 'video-product',
    status: 'active',
    module: 'Video Conference',
    summary: 'HP Poly Studio X52 + TC10 hỗ trợ DirectorAI, NoiseBlockAI, Acoustic Fence, 4K Ultra HD, TC10 controller và quản trị Poly Lens.',
    tags: ['poly','hp-poly','studio-x52','tc10','directorai','noiseblockai'],
    productRefs: ['vc-poly-x52'],
    cards: [
      {title:'DirectorAI', summary:'Camera AI tự động định vị người đang phát biểu và tối ưu khung hình.', url:'#vc-poly'},
      {title:'NoiseBlockAI', summary:'Lọc tiếng ồn và tạo vùng thu âm bằng Acoustic Fence.', url:'#vc-poly'},
      {title:'TC10 Controller', summary:'Touch controller 10.1 inch cho điều khiển và scheduling.', url:'#vc-poly'},
      {title:'Official Website', summary:'Trang sản phẩm chính thức HP Poly.', url:'https://www.hp.com/us-en/poly.html'}
    ]
  },
  {
    id: 'article-vc-cisco',
    title: 'Cisco Webex Devices',
    sidebarId: 'vc-cisco',
    route: '#vc-cisco',
    type: 'video-product',
    status: 'active',
    module: 'Video Conference',
    summary: 'Cisco Webex Devices gồm Desk Pro, Board Pro, Room Kit EQ/Pro, Room Navigator và Control Hub, phù hợp enterprise Webex/Cisco ecosystem.',
    tags: ['cisco','webex','room-kit','board-pro','desk-pro','control-hub'],
    productRefs: ['vc-cisco-webex-devices'],
    cards: [
      {title:'Webex Native', summary:'Thiết bị native trong hệ sinh thái Cisco Webex.', url:'#vc-cisco'},
      {title:'Room Kit', summary:'Room Kit EQ/Pro cho medium/large room và boardroom.', url:'#vc-cisco'},
      {title:'Control Hub', summary:'Quản trị, analytics và lifecycle thiết bị Webex.', url:'#vc-cisco'},
      {title:'Official Website', summary:'Trang sản phẩm chính thức Webex Devices.', url:'https://www.webex.com/devices.html'}
    ]
  },
  {
    id: 'article-vc-jabra',
    title: 'Jabra PanaCast',
    sidebarId: 'vc-jabra',
    route: '#vc-jabra',
    type: 'video-product',
    status: 'active',
    module: 'Video Conference',
    summary: 'Jabra PanaCast 50 là camera AI panoramic 180°, plug-and-play USB, Intelligent Zoom, Virtual Director và Safe Distance Monitoring cho huddle/small room.',
    tags: ['jabra','panacast','180-degree','usb','byod'],
    productRefs: ['vc-jabra-panacast-50'],
    cards: [
      {title:'180° Panoramic AI', summary:'Toàn cảnh không góc chết cho huddle room.', url:'#vc-jabra'},
      {title:'Plug & Play', summary:'USB-C BYOD, triển khai nhanh với laptop cá nhân.', url:'#vc-jabra'},
      {title:'Virtual Director', summary:'Tự động tập trung người nói/nhóm đang tương tác.', url:'#vc-jabra'},
      {title:'Official Website', summary:'Trang sản phẩm chính thức Jabra.', url:'https://www.jabra.com/business/video-conferencing'}
    ]
  },
  {
    id: 'article-vc-crestron',
    title: 'Crestron Flex',
    sidebarId: 'vc-crestron',
    route: '#vc-crestron',
    type: 'video-product',
    status: 'active',
    module: 'Video Conference',
    summary: 'Crestron Flex là hệ thống UC/AV control enterprise cho Microsoft Teams Rooms, Zoom Rooms, room scheduling, XiO Cloud và AV/lighting/HVAC integration.',
    tags: ['crestron','flex','av-control','teams-rooms','zoom-rooms','xio-cloud'],
    productRefs: ['vc-crestron-flex'],
    cards: [
      {title:'AV Control', summary:'Điều khiển AV, lighting, shading và HVAC từ một hệ thống.', url:'#vc-crestron'},
      {title:'Room Scheduling', summary:'Scheduling panel và occupancy analytics.', url:'#vc-crestron'},
      {title:'XiO Cloud', summary:'Quản trị tập trung thiết bị Crestron enterprise.', url:'#vc-crestron'},
      {title:'Official Website', summary:'Trang sản phẩm chính thức Crestron Flex.', url:'https://www.crestron.com/Products/Workspace-Solutions/Unified-Communications'}
    ]
  },
  {
    id: 'article-vc-huddle-room',
    title: 'Huddle Room',
    sidebarId: 'vc-huddle-room',
    route: '#vc-huddle-room',
    type: 'room-solution',
    status: 'active',
    module: 'Video Conference',
    summary: 'Room recommendation cho Huddle Room 2–4 người, diện tích 10–15m², ưu tiên thiết bị all-in-one, USB/BYOD và triển khai nhanh.',
    tags: ['huddle-room','room-design','video-conference'],
    cards: [
      {title:'Yealink A40', summary:'All-in-one Android video bar cho Huddle/Small room.', url:'#vc-yealink'},
      {title:'Logitech Rally Bar Huddle', summary:'BYOD và CollabOS cho phòng nhỏ.', url:'#vc-logitech'},
      {title:'Jabra PanaCast 50', summary:'USB panoramic 180° plug-and-play.', url:'#vc-jabra'},
      {title:'Room Design', summary:'1 display 55”, video bar dưới màn hình, không cần mic mở rộng.', url:'#vc-huddle-room'}
    ]
  },
  {
    id: 'article-vc-medium-large-room',
    title: 'Medium / Large Room',
    sidebarId: 'vc-medium-large-room',
    route: '#vc-medium-large-room',
    type: 'room-solution',
    status: 'active',
    module: 'Video Conference',
    summary: 'Room recommendation cho Medium/Large room, ưu tiên dual display, mic mở rộng, DSP/AV control, scheduling và quản trị tập trung.',
    tags: ['medium-room','large-room','boardroom','av-design'],
    cards: [
      {title:'Logitech Rally Bar + Mic Pods', summary:'Medium room với Tap, Scribe, Mic Pods và Sync.', url:'#vc-logitech'},
      {title:'Poly X52 + TC10', summary:'DirectorAI, NoiseBlockAI và mic extension.', url:'#vc-poly'},
      {title:'Cisco Room Kit Pro', summary:'Enterprise Webex/Cisco room system.', url:'#vc-cisco'},
      {title:'Crestron Flex', summary:'Boardroom/AV control, XiO Cloud và scheduling.', url:'#vc-crestron'}
    ]
  },
  {
    id: 'article-enterprise-cms',
    title: 'Enterprise CMS',
    sidebarId: 'enterprise-cms',
    route: '#enterprise-cms',
    type: 'cms-module',
    status: 'active',
    module: 'Enterprise CMS',
    summary: 'Dashboard quản trị Enterprise CMS: Products, Articles, API Center, Assets, Demo Library, Downloads, Integrations, Compliance, Version, Publish Workflow và Search Index.',
    tags: ['cms','enterprise','admin','content'],
    cards: [
      {title:'Products', summary:'Quản lý product, vendor, category, feature, use case và product detail.', url:'#cms'},
      {title:'Articles', summary:'Quản lý bài viết/card nội dung cho sidebar và customer-facing pages.', url:'#cms'},
      {title:'Publish Workflow', summary:'Local edit → Export JSON → Git commit → GitHub Pages deployment.', url:'#cms'},
      {title:'Content Health', summary:'Kiểm tra nhanh dữ liệu trước khi publish.', url:'#enterprise-cms'}
    ]
  },
  {
    id: 'article-api-center',
    title: 'API Center',
    sidebarId: 'api-center',
    route: '#api-center',
    type: 'cms-module',
    status: 'active',
    module: 'Enterprise CMS',
    summary: 'Structured API Reference với search/filter, product grouping, method, endpoint, auth, request/response và copy endpoint.',
    tags: ['api-center','endpoint','request','response'],
    cards: [
      {title:'Search API', summary:'Tìm API theo name, endpoint, product và description.', url:'#api-center'},
      {title:'Filter Method', summary:'Lọc theo GET, POST, PUT, PATCH, DELETE.', url:'#api-center'},
      {title:'Detail Panel', summary:'Xem request/response và notes.', url:'#api-center'},
      {title:'CMS API Data', summary:'Đọc product.apiLinks từ CMS data.', url:'#cms'}
    ]
  },
];

const VIDEO_PRODUCTS = [
  {
    id: 'vc-yealink-a40',
    title: 'Yealink Meeting Bar A40',
    category: 'Video Conference',
    vendor: 'Yealink',
    route: '#vc-yealink',
    summary: 'AI-powered all-in-one video bar với dual 48MP camera, Android 13, IntelliFocus và chứng nhận Teams/Zoom/Google Meet.',
    tags: ['video-conference','yealink','meeting-bar','a40','teams','zoom'],
    highlights: ['2×48MP AI Camera','Android 13','IntelliFocus','Speaker Tracking','Teams/Zoom/Meet Certified'],
    apiLinks: [],
    integrations: [{name:'Meeting Platforms', items:['Microsoft Teams Rooms','Zoom Rooms','Google Meet']}],
    knowledgeSections: [
      {title:'Presales Fit', content:'Phù hợp huddle/small/medium room cần triển khai nhanh, all-in-one và chi phí tốt.'},
      {title:'Weak Point', content:'Boardroom lớn cần bổ sung mic/AV design.'}
    ],
    documents: ['doc-vc-yealink-datasheet','doc-vc-yealink-quickstart']
  },
  {
    id: 'vc-logitech-rally-bar',
    title: 'Logitech Rally Bar',
    category: 'Video Conference',
    vendor: 'Logitech',
    route: '#vc-logitech',
    summary: 'Video bar với RightSight AI, CollabOS, Scribe, Tap Scheduler, Mic Pods, SWYTCH và Logitech Sync.',
    tags: ['video-conference','logitech','rally-bar','collabos','scribe','swytch'],
    highlights: ['RightSight AI','CollabOS','SWYTCH BYOD','Scribe Whiteboard','Logitech Sync'],
    integrations: [{name:'Meeting Platforms', items:['Microsoft Teams Rooms','Zoom Rooms','Google Meet','Webex']}],
    knowledgeSections: [
      {title:'Presales Fit', content:'Phù hợp enterprise/hybrid workplace cần ecosystem đầy đủ và BYOD mạnh.'},
      {title:'Weak Point', content:'Chi phí tăng khi cần nhiều phụ kiện.'}
    ],
    documents: ['doc-vc-logitech-datasheet']
  },
  {
    id: 'vc-poly-x52',
    title: 'HP Poly Studio X52 + TC10',
    category: 'Video Conference',
    vendor: 'HP Poly',
    route: '#vc-poly',
    summary: 'Video system với DirectorAI, NoiseBlockAI, Acoustic Fence, 4K Ultra HD và TC10 controller.',
    tags: ['video-conference','poly','studio-x52','tc10','directorai'],
    highlights: ['DirectorAI','NoiseBlockAI','Acoustic Fence','TC10 Controller','Poly Lens'],
    integrations: [{name:'Meeting Platforms', items:['Microsoft Teams Rooms','Zoom Rooms','Google Meet']}],
    knowledgeSections: [
      {title:'Presales Fit', content:'Phù hợp executive/boardroom cần audio/video chất lượng cao và chống ồn tốt.'},
      {title:'Weak Point', content:'Giá cao hơn nhóm phổ thông và cần thiết kế kỹ cho phòng lớn.'}
    ],
    documents: ['doc-vc-poly-datasheet']
  },
  {
    id: 'vc-cisco-webex-devices',
    title: 'Cisco Webex Devices',
    category: 'Video Conference',
    vendor: 'Cisco',
    route: '#vc-cisco',
    summary: 'Hệ sinh thái Webex Devices gồm Desk Pro, Board Pro, Room Kit EQ/Pro, Room Navigator và Control Hub.',
    tags: ['video-conference','cisco','webex','room-kit','control-hub'],
    highlights: ['Webex Native','Control Hub','Room Analytics','Board Pro','Room Kit'],
    integrations: [{name:'Meeting Platforms', items:['Webex','Microsoft Teams','Zoom BYOD']}],
    knowledgeSections: [
      {title:'Presales Fit', content:'Phù hợp khách hàng enterprise đã dùng Cisco/Webex hoặc cần end-to-end collaboration.'},
      {title:'Weak Point', content:'Phức tạp và chi phí cao hơn với khách chỉ cần Teams/Zoom đơn giản.'}
    ],
    documents: ['doc-vc-cisco-datasheet']
  },
  {
    id: 'vc-jabra-panacast-50',
    title: 'Jabra PanaCast 50',
    category: 'Video Conference',
    vendor: 'Jabra',
    route: '#vc-jabra',
    summary: 'Camera AI panoramic 180° plug-and-play USB với Intelligent Zoom, Virtual Director và Safe Distance Monitoring.',
    tags: ['video-conference','jabra','panacast','usb','byod'],
    highlights: ['180° Panoramic','USB Plug & Play','Intelligent Zoom','Virtual Director','Safe Distance'],
    integrations: [{name:'Meeting Platforms', items:['Microsoft Teams','Zoom','Google Meet','Webex']}],
    knowledgeSections: [
      {title:'Presales Fit', content:'Phù hợp huddle/small room cần camera USB toàn cảnh, triển khai nhanh.'},
      {title:'Weak Point', content:'Không phù hợp boardroom lớn hoặc AV enterprise phức tạp.'}
    ],
    documents: ['doc-vc-jabra-datasheet']
  },
  {
    id: 'vc-crestron-flex',
    title: 'Crestron Flex',
    category: 'Video Conference',
    vendor: 'Crestron',
    route: '#vc-crestron',
    summary: 'UC/AV control enterprise cho Teams Rooms, Zoom Rooms, room scheduling, XiO Cloud và AV/lighting/HVAC integration.',
    tags: ['video-conference','crestron','flex','av-control','teams-rooms','zoom-rooms'],
    highlights: ['AV Control','Room Scheduling','XiO Cloud','Occupancy Analytics','Enterprise AV'],
    integrations: [{name:'Meeting Platforms', items:['Microsoft Teams Rooms','Zoom Rooms']}],
    knowledgeSections: [
      {title:'Presales Fit', content:'Phù hợp enterprise cần chuẩn hóa phòng họp, AV control và quản trị tập trung.'},
      {title:'Weak Point', content:'Không phải video bar plug-and-play, cần thiết kế/triển khai AV chuyên nghiệp.'}
    ],
    documents: ['doc-vc-crestron-datasheet']
  }
];

function mergeById(existing = [], seeds = [], mode = 'upsert') {
  const map = new Map();
  existing.forEach(item => {
    if (item && item.id) map.set(item.id, item);
  });
  seeds.forEach(seed => {
    const current = map.get(seed.id);
    if (!current) {
      map.set(seed.id, seed);
      return;
    }
    // Complete/refresh known CMS fields but keep custom user-managed cards.
    map.set(seed.id, {
      ...current,
      ...seed,
      title: current.title || seed.title,
      sidebarId: current.sidebarId || seed.sidebarId,
      route: current.route || seed.route,
      type: current.type || seed.type,
      status: current.status || seed.status,
      summary: current.summary || seed.summary,
      cards: Array.isArray(current.cards) ? current.cards : seed.cards,
      customFields: current.customFields || seed.customFields,
      userNotes: current.userNotes || seed.userNotes
    });
  });
  return Array.from(map.values());
}

function buildAudit(data) {
  const requiredRoutes = ARTICLE_SEEDS.map(a => a.route);
  const articles = Array.isArray(data.articles) ? data.articles : [];
  const products = Array.isArray(data.products) ? data.products : [];
  const missingRoutes = requiredRoutes.filter(route => !articles.some(a => a.route === route));
  const incompleteArticles = articles
    .filter(a => requiredRoutes.includes(a.route))
    .filter(a => !a.title || !a.summary || !Array.isArray(a.cards) || a.cards.length === 0)
    .map(a => a.route || a.id);

  return {
    requiredArticleCount: ARTICLE_SEEDS.length,
    currentArticleCount: articles.length,
    requiredProductCount: VIDEO_PRODUCTS.length,
    currentVideoProductCount: products.filter(p => String(p.category || '').toLowerCase().includes('video')).length,
    missingRoutes,
    incompleteArticles
  };
}

async function runSync(force = false) {
  const currentVersion = localStorage.getItem(SYNC_STORAGE_KEY);
  if (currentVersion === SYNC_VERSION && !force) return null;

  const data = await loadCms().catch(() => ({}));
  const before = buildAudit(data);

  data.meta = data.meta || {};
  data.meta.version = 'v10.7.1';
  data.meta.cmsCoverage = 'full-content-sync';
  data.meta.cmsCoverageUpdatedAt = new Date().toISOString();

  data.articles = mergeById(Array.isArray(data.articles) ? data.articles : [], ARTICLE_SEEDS);
  data.products = mergeById(Array.isArray(data.products) ? data.products : [], VIDEO_PRODUCTS);

  data.cmsModules = mergeById(Array.isArray(data.cmsModules) ? data.cmsModules : [], [
    {id:'module-video-conference', title:'Video Conference CMS', route:'#video-conferencing', status:'active', collection:'articles/products', description:'Brand, product, room, feature, battle card and CMS relationship data.'},
    {id:'module-enterprise-cms', title:'Enterprise CMS', route:'#enterprise-cms', status:'active', collection:'articles/products/assets', description:'Enterprise knowledge platform CMS modules.'},
    {id:'module-api-center', title:'API Center', route:'#api-center', status:'active', collection:'products.apiLinks', description:'Structured API catalog.'}
  ]);

  data.navigationCoverage = {
    version: 'VC 1.4.4 + v10.7.1',
    staticSidebar: true,
    videoConferenceRoutes: [
      '#video-conferencing','#vc-yealink','#vc-logitech','#vc-poly','#vc-cisco','#vc-jabra','#vc-crestron','#vc-huddle-room','#vc-medium-large-room'
    ],
    enterpriseRoutes: [
      '#enterprise-cms','#api-center'
    ]
  };

  const after = buildAudit(data);
  data.cmsAudit = {
    lastRunAt: new Date().toISOString(),
    before,
    after,
    fixedMissingRouteCount: before.missingRoutes.length,
    fixedIncompleteArticleCount: before.incompleteArticles.length
  };

  await saveCms(data);
  localStorage.setItem(SYNC_STORAGE_KEY, SYNC_VERSION);
  console.info('[v10.7.1] CMS Full Content Sync completed', data.cmsAudit);
  return data.cmsAudit;
}

function ensureAuditStyle() {
  if (document.getElementById('cmsAuditStyle')) return;
  const style = document.createElement('style');
  style.id = 'cmsAuditStyle';
  style.textContent = `
  .audit-hero{background:linear-gradient(135deg,rgba(249,115,22,.16),rgba(59,130,246,.10));border:1px solid rgba(249,115,22,.28);border-radius:28px;padding:30px;margin-bottom:18px}
  .audit-hero h2{font-size:36px;margin:10px 0}.audit-hero p{color:#c4d3ea;line-height:1.65;max-width:980px}
  .audit-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:18px}.audit-card{background:var(--card,#111c31);border:1px solid var(--line,#263754);border-radius:20px;padding:18px}.audit-card b{display:block;font-size:28px}.audit-card span{color:#c4d3ea}
  .audit-panel{background:var(--card,#111c31);border:1px solid var(--line,#263754);border-radius:20px;padding:18px;margin-bottom:18px}.audit-panel h3{margin-top:0}.audit-panel p,.audit-panel li{color:#c4d3ea;line-height:1.7}.audit-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
  .audit-table{width:100%;border-collapse:collapse}.audit-table th,.audit-table td{border-bottom:1px solid rgba(148,163,184,.15);padding:10px;text-align:left;color:#c4d3ea}.audit-table th{color:#e2e8f0;background:rgba(255,255,255,.04)}
  @media(max-width:900px){.audit-grid{grid-template-columns:1fr}.audit-hero h2{font-size:30px}}
  `;
  document.head.appendChild(style);
}

async function renderAudit() {
  if (location.hash !== '#cms-audit') return;

  ensureAuditStyle();
  const root = document.querySelector('#pageRoot');
  if (!root) return;

  const data = await loadCms().catch(() => ({}));
  const audit = data.cmsAudit || buildAudit(data);
  const title = document.querySelector('#pageTitle');
  const subtitle = document.querySelector('#pageSubtitle');
  if (title) title.textContent = 'CMS Audit';
  if (subtitle) subtitle.textContent = 'CMS content coverage and article synchronization';

  const missing = audit.after?.missingRoutes || audit.missingRoutes || [];
  const incomplete = audit.after?.incompleteArticles || audit.incompleteArticles || [];

  root.innerHTML = `<section class="audit-hero">
    <span class="eyebrow">🧭 CMS Audit v10.7.1</span>
    <h2>CMS Content Coverage Review</h2>
    <p>Kiểm tra toàn bộ bài viết và module đã được đưa vào CMS data hay chưa. Bản sync này bổ sung Core Portal, Contact Center, Integration, Video Conference, Enterprise CMS, API Center, Document Center, Search, Relationship, Knowledge Base và AI Assistant.</p>
    <div class="audit-actions">
      <button class="btn btn-primary" id="forceCmsSync">Force Sync CMS Content</button>
      <a class="btn btn-soft" href="#cms">Mở CMS</a>
      <a class="btn btn-soft" href="#video-conferencing">Video Conference</a>
    </div>
  </section>

  <section class="audit-grid">
    <article class="audit-card"><b>${ARTICLE_SEEDS.length}</b><span>Required Articles</span></article>
    <article class="audit-card"><b>${Array.isArray(data.articles) ? data.articles.length : 0}</b><span>Current Articles</span></article>
    <article class="audit-card"><b>${VIDEO_PRODUCTS.length}</b><span>Video Products</span></article>
    <article class="audit-card"><b>${missing.length}</b><span>Missing Routes</span></article>
  </section>

  <section class="audit-panel">
    <h3>Coverage Result</h3>
    <table class="audit-table">
      <thead><tr><th>Hạng mục</th><th>Kết quả</th></tr></thead>
      <tbody>
        <tr><td>Missing routes</td><td>${missing.length ? missing.map(esc).join(', ') : 'Không còn thiếu route chính'}</td></tr>
        <tr><td>Incomplete articles</td><td>${incomplete.length ? incomplete.map(esc).join(', ') : 'Không còn article thiếu title/summary/cards'}</td></tr>
        <tr><td>Last sync</td><td>${esc(data.cmsAudit?.lastRunAt || 'Chưa có')}</td></tr>
        <tr><td>CMS Coverage Version</td><td>${esc(data.meta?.version || 'N/A')}</td></tr>
      </tbody>
    </table>
  </section>

  <section class="audit-panel">
    <h3>Modules updated vào CMS</h3>
    <ul>
      <li>Core Portal / Overview</li>
      <li>Contact Center: OnCallCX, CCaaS VN, CCaaS Global, API Reference, UC/PBX VN</li>
      <li>Integration: Integration Playbook, CRM/ERP Việt Nam, Compliance</li>
      <li>Video Conference: Tổng quan, Yealink, Logitech, Poly, Cisco, Jabra, Crestron, Huddle Room, Medium/Large Room</li>
      <li>Enterprise CMS: API Center, Document Center, Global Search, Asset Manager 2.0, Relationship Graph, Knowledge Base, AI Assistant</li>
    </ul>
  </section>`;

  document.querySelector('#forceCmsSync')?.addEventListener('click', async () => {
    await runSync(true);
    await renderAudit();
  });
}

window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => runSync(false), 400);
  setTimeout(renderAudit, 600);
});
window.addEventListener('hashchange', () => {
  setTimeout(renderAudit, 100);
});

// Expose for debugging/manual operation.
window.FTICmsFullContentSync = { runSync, ARTICLE_SEEDS, VIDEO_PRODUCTS };
