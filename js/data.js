export const stats=[
{icon:'🎧',value:'28+',label:'CCaaS / UC / PBX Platforms',color:'bg-orange'},
{icon:'🎥',value:'6+',label:'Video Conferencing Brands',color:'bg-blue'},
{icon:'🔌',value:'16+',label:'CRM/ERP Integration Paths',color:'bg-green'},
{icon:'🛡️',value:'VN',label:'Compliance-ready Checklist',color:'bg-purple'}];

export const solutions=[
{id:'oncallcx',icon:'📞',title:'OnCallCX UCaaS/CCaaS',type:'FPT Partner Solution',desc:'Giải pháp tổng đài và contact center cho doanh nghiệp Việt Nam: voice, ticket, campaign, dashboard, API và webhook.',chips:['VN Native','REST API','Webhook','CRM-ready','Recording'],apis:[['POST','/api/call/outbound','Gọi ra từ CRM'],['GET','/api/cdr/list','Danh sách CDR'],['POST','/webhook/incoming','Sự kiện cuộc gọi']]},
{id:'ccaas-vn',icon:'🇻🇳',title:'CCaaS Việt Nam',type:'Nội địa / Telco-native',desc:'Nhóm nhà cung cấp CCaaS nội địa: Mitek, IDB, OnCallCX, StringeeX, Viettel CX, VNPT CC, NextCX, GCC, Callio. Phù hợp doanh nghiệp cần hỗ trợ tiếng Việt, SIP trunk trong nước, dữ liệu tại Việt Nam và tích hợp CRM nội địa.',chips:['Telco','Omnichannel','AI tiếng Việt','Local support'],apis:[['GET','/v1/agent/status','Trạng thái agent'],['POST','/v1/ticket/create','Tạo ticket CSKH'],['GET','/v1/report/summary','Báo cáo tổng hợp']]},
{id:'ccaas-global',icon:'☁️',title:'CCaaS Global',type:'International Platforms',desc:'Các nền tảng quốc tế như Genesys Cloud CX, NICE CXone, Webex Contact Center, Zoom Contact Center, Twilio Flex, Amazon Connect, Five9, Freshdesk Omni và Infobip Voice API.',chips:['Global','REST API','Webhook','SDK','Enterprise'],apis:[['GET','/v1/tasks','Tasks / interactions'],['POST','/v1/interactions','Tạo interaction'],['GET','/v2/contact_center/queues','Danh sách queue']]},
{id:'ucpbx-vn',icon:'🏁',title:'UC/PBX Việt Nam',type:'UC / PBX / Cloud PBX',desc:'Nhà cung cấp UC/PBX tại Việt Nam: Stringee, StringeeX CCaaS API, OnCallCX, Viettel CX Cloud, CloudFone, Zalo OA/ZNS, Mitek IP-PBX & UC Suite, VCC Corp Virtual Call Center.',chips:['VN Native','SIP Trunk','Click-to-call','Webhook','REST'],apis:[['POST','/v1/call2/callout','Tạo cuộc gọi ra'],['GET','/v1/cdr','Lấy CDR'],['POST','/webhook/call-status','Cập nhật trạng thái call']]},
{id:'crm',icon:'🧩',title:'CRM/ERP Việt Nam',type:'Customer Management',desc:'Định hướng tích hợp Getfly CRM, MISA AMIS CRM, CloudGO CRM, Base.vn, FastWork CRM, BRAVO ERP với contact center và hệ sinh thái CSKH.',chips:['SME','Mid-market','API','Case Study','Tích hợp CC'],apis:[['GET','/crm/customers','Tệp khách hàng'],['POST','/crm/ticket','Tạo case CSKH'],['POST','/crm/call-log','Đẩy log cuộc gọi']]},
{id:'video',icon:'🎥',title:'Video Conferencing',type:'Room & Endpoint',desc:'Giải pháp phòng họp từ huddle room đến large room: Yealink, Logitech, Poly, Cisco, Jabra, Crestron.',chips:['Teams','Zoom','BYOD','AI Camera','4K'],apis:[['GET','/rooms/devices','Danh sách thiết bị'],['POST','/meeting/schedule','Tạo lịch họp'],['GET','/room/health','Giám sát phòng họp']]},
{id:'integration',icon:'🔌',title:'Integration Playbook',type:'BYOC · BYOD · CRM · ERP',desc:'Playbook tích hợp giữa Contact Center, CRM/ERP, SIP trunk, SBC và các hệ thống nghiệp vụ nội bộ.',chips:['BYOC','Middleware','Webhook','SSO','Audit'],apis:[['POST','/crm/screen-pop','Bật màn hình khách hàng'],['POST','/erp/sync-customer','Đồng bộ khách hàng'],['POST','/webhook/events','Nhận sự kiện realtime']]},
{id:'api-reference',icon:'📗',title:'API Reference',type:'Customer-readable Docs',desc:'Tài liệu API được trình bày lại theo dạng dễ đọc: nhóm API, endpoint, request/response, tham số, checklist demo.',chips:['Swagger-like','Request','Response','Docs'],apis:[['GET','/docs/api-reference','Danh sách API'],['POST','/docs/generate','Tạo tài liệu'],['GET','/docs/export','Export Markdown']]}];

export const vendorGroups={
'ccaas-vn':{title:'CCaaS — Đối Tác Việt Nam',subtitle:'Các nhà cung cấp CCaaS nội địa: Mitek, IDB, OnCallCX, StringeeX, Viettel CX, VNPT CC, NextCX, GCC, Callio — API tích hợp, omnichannel, AI tiếng Việt',icon:'🎧',vendors:[
{name:'Mitek Contact Center',icon:'🎧',category:'CCaaS / On-premise + Cloud',tags:['VN','REST','Webhook','SDK'],desc:'Mitek là nhà cung cấp giải pháp Contact Center hàng đầu Việt Nam (thành lập 2004). Chuyên on-premise & hybrid cloud, phục vụ ngân hàng, bảo hiểm, viễn thông. Sản phẩm: Mitek CC Suite, Mitek AI Voicebot, Mitek Omnichannel.',endpoints:[['POST','/api/v2/call/initiate','Khởi tạo cuộc gọi outbound'],['GET','/api/v2/queue/realtime','Thống kê hàng chờ realtime'],['POST','/api/v2/ticket','Tạo ticket CSKH'],['GET','/api/v2/report/agent','Báo cáo hiệu suất agent']],link:'mitek.vn'},
{name:'IDB — Intelligent Digital Bridge',icon:'🤖',category:'CCaaS / AI Contact Center',tags:['VN','REST','Webhook','SDK'],desc:'IDB cung cấp nền tảng AI-powered Contact Center với thế mạnh NLP tiếng Việt, Voicebot, Chatbot và phân tích cuộc hội thoại. Phục vụ nhiều ngân hàng top 10 và doanh nghiệp bảo hiểm lớn tại Việt Nam.',endpoints:[['POST','/v1/bot/conversation','Khởi tạo hội thoại AI'],['POST','/v1/speech','Phân tích giọng nói'],['POST','/v1/call/outbound','Tạo cuộc gọi outbound với AI script'],['GET','/v1/report/sentiment','Báo cáo phân tích cảm xúc KH']],link:'idb.vn'},
{name:'VNPT Contact Center',icon:'☎️',category:'CCaaS / Telecom-native',tags:['VN','REST','Webhook'],desc:'VNPT Contact Center là giải pháp tổng đài hosted từ VNPT, mạnh về hạ tầng viễn thông, SIP trunk VNPT, đầu số 1800/1900, phù hợp doanh nghiệp cần đầu số VNPT.',endpoints:[['POST','/api/call/outbound','Tạo cuộc gọi outbound'],['GET','/api/queue/status','Trạng thái queue'],['POST','/webhook/cdr','CDR webhook sau cuộc gọi'],['GET','/api/report/summary','Báo cáo tổng hợp']],link:'vnpt.com.vn'},
{name:'Callio (SalesUp)',icon:'📞',category:'CCaaS / SME-focused',tags:['VN','REST','Webhook'],desc:'Callio là phần mềm tổng đài SME tại Việt Nam, tập trung telesales và CSKH nhỏ. Tích hợp sẵn CRM nhẹ, ghi âm tự động, phân tích cuộc gọi theo agent. Phù hợp team sale 5–50 người. Có free trial.',endpoints:[['POST','/api/call/click-to-call','Click-to-call từ CRM'],['GET','/api/cdr/list','Danh sách CDR'],['POST','/webhook/call-end','Webhook sau cuộc gọi']],link:'callio.vn'},
{name:'NextCX (CMC Telecom)',icon:'☁️',category:'CCaaS / Cloud Native',tags:['VN','REST','Webhook','SDK'],desc:'NextCX là nền tảng Contact Center As A Service từ CMC Telecom, mạnh về hạ tầng cloud Việt Nam, datacenter Hà Nội + HCM, đạt Tier 3. Tích hợp AI Chatbot, Voicebot tiếng Việt, hỗ trợ ngân hàng và bảo hiểm.',endpoints:[['POST','/api/v1/call/create','Tạo cuộc gọi'],['GET','/api/v1/agent/status','Trạng thái agent'],['POST','/api/v1/chatbot/message','Gửi tin nhắn bot'],['GET','/api/v1/analytics/live','Analytics realtime']],link:'nextcx.vn'},
{name:'GCC — Global CyberSoft CC',icon:'🛡️',category:'CCaaS / Enterprise On-prem + Cloud',tags:['VN','REST','Webhook'],desc:'Global CyberSoft cung cấp giải pháp Contact Center chuyên cho tài chính, ngân hàng, chứng khoán tại Việt Nam. Thế mạnh: compliance recording, tích hợp core banking, audit trail đầy đủ, on-prem data residency.',endpoints:[['POST','/gcc/api/call/dial','Tạo cuộc gọi agent'],['GET','/gcc/api/recording/get','Lấy file ghi âm'],['POST','/gcc/api/ticket/open','Mở ticket CSKH'],['GET','/gcc/api/audit/log','Audit log tuân thủ']],link:'gcc.vn'},
{name:'OnCallCX Full CC',icon:'🎧',category:'CCaaS / Omnichannel',tags:['VN','REST','Webhook'],desc:'OnCallCX cung cấp Full Contact Center với CRM integration, multi-system, ticket system, chiến dịch outbound, dashboard báo cáo. Tích hợp đa kênh: voice, Zalo, Facebook, email, SMS.',endpoints:[['POST','/api/ticket/create','Tạo ticket'],['GET','/api/ticket/list','Danh sách ticket'],['POST','/api/campaign/create','Tạo chiến dịch gọi ra'],['GET','/api/report/realtime','Dashboard realtime']],link:'oncallcx.vn'}]},
'ccaas-global':{title:'CCaaS — Nền Tảng Quốc Tế',subtitle:'Các CCaaS global hàng đầu với hệ sinh thái API/SDK phong phú',icon:'☁️',vendors:[
{name:'Genesys Cloud CX API',icon:'☁️',category:'CCaaS Enterprise',tags:['Global','REST','Webhook','WebSocket'],desc:'Genesys Cloud CX là CCaaS enterprise hàng đầu. API đầy đủ: conversations, queues, users, analytics, routing, AI, outbound campaigns. SDKs cho nhiều ngôn ngữ. Webhooks và WebSocket notifications.',endpoints:[['GET','/api/v2/conversations','Danh sách cuộc hội thoại'],['POST','/api/v2/conversations/calls','Tạo cuộc gọi'],['GET','/api/v2/analytics/queues','Analytics hàng chờ'],['POST','/api/v2/outbound/campaigns','Tạo chiến dịch gọi ra']],link:'developer.genesys.cloud'},
{name:'NICE CXone API',icon:'🤖',category:'CCaaS Enterprise AI',tags:['Global','REST','Webhook','SDK'],desc:'NICE CXone là AI-first CCaaS. API bao gồm: contacts, interactions, agents, routing, analytics, Studio AI scripts, Agent AI. Tích hợp với Cognigy AI.',endpoints:[['GET','/incontactapi/services','Contacts đang hoạt động'],['POST','/incontactapi/services/v30/interactions','Outbound email'],['GET','/incontactapi/services/v30/agents','Trạng thái agent'],['POST','/incontactapi/services/v30/calls','Gọi ra theo mẫu']],link:'developer.niceincontact.com'},
{name:'Webex Contact Center API',icon:'💬',category:'CCaaS Enterprise',tags:['Global','REST','Webhook','WebSocket'],desc:'Webex Contact Center API: Task/Interaction management, Agent State, Queue Stats, Recording, Reporting, Customer Journey. Tích hợp sâu với Microsoft, Salesforce, Zendesk, ServiceNow.',endpoints:[['GET','/v1/tasks','Danh sách tasks/interactions'],['GET','/v1/captures/{taskId}','Lấy ghi âm/transcript'],['GET','/v1/statistics/queues','Thống kê hàng chờ'],['POST','/v1/agents/{id}/state','Thay đổi trạng thái agent']],link:'developer.webex.com'},
{name:'Zoom Contact Center API',icon:'🎥',category:'CCaaS Cloud',tags:['Global','REST','Webhook','SDK'],desc:'Zoom Contact Center API: Engagements, Queues, Agents, Analytics, Virtual Agent (AI bot), AI Expert Assist, Workforce Engagement Management. Phù hợp khách hàng đã dùng Zoom.',endpoints:[['GET','/v2/contact_center/engagements','Danh sách engagements'],['GET','/v2/contact_center/queues','Danh sách hàng chờ'],['GET','/v2/contact_center/agents','Danh sách agents'],['GET','/v2/contact_center/analytics','Analytics tổng hợp']],link:'developers.zoom.us'},
{name:'Twilio Flex API',icon:'🧱',category:'CCaaS Programmable',tags:['Global','REST','Webhook','SDK'],desc:'Twilio Flex là CC platform có thể lập trình hoàn toàn. Flex UI có thể tùy biến 100%. Interactions API, Flex Insights API, Task Router API. Phù hợp dev team muốn full control.',endpoints:[['POST','/v1/Interactions','Tạo interaction mới'],['GET','/v1/Interactions/{Sid}','Chi tiết interaction'],['POST','/v1/Workspaces/{Sid}/Tasks','Tạo task routing'],['GET','/insights/v1/sessions','Analytics sessions']],link:'twilio.com/docs/flex'},
{name:'Amazon Connect API',icon:'aws',category:'CCaaS Cloud (AWS)',tags:['Global','REST','Webhook','SDK'],desc:'Amazon Connect là CCaaS của AWS. Tích hợp tự nhiên với Lex AI bot, Polly TTS, Transcribe STT, Lambda, DynamoDB, S3. Streams API cho desktop agent. Phù hợp đã dùng AWS.',endpoints:[['POST','/instance/{id}/start-outbound-voice-contact','Gọi ra'],['GET','/instance/{id}/queue/metrics','Metrics hàng chờ'],['GET','/instance/{id}/contact/{contactId}','Thông tin contact'],['POST','/lambda/contact-flow','Lambda Contact Flow']],link:'docs.aws.amazon.com/connect'},
{name:'Five9 Cloud Contact Center',icon:'📱',category:'CCaaS Enterprise',tags:['Global','REST','Webhook','SDK'],desc:'Five9 cung cấp Agent REST API, Supervisor REST API, CRM SDK JavaScript. Tích hợp Salesforce, ServiceNow, Microsoft Dynamics. AI: Intelligent Virtual Agent, agent assist, workforce intelligence.',endpoints:[['POST','/api/v2/orgs/{orgId}/contacts','Tạo contact'],['GET','/api/v2/orgs/{orgId}/calls','Thông tin cuộc gọi'],['POST','/api/v2/orgs/{orgId}/campaigns','Khởi động chiến dịch'],['GET','/api/v2/orgs/{orgId}/stats/agents','Thống kê agent']],link:'documentation.five9.com'},
{name:'Freshdesk Omni API',icon:'🎟️',category:'CCaaS / Helpdesk',tags:['Global','REST','Webhook','SDK'],desc:'Freshdesk Omni tích hợp helpdesk + live chat + contact center. API đầy đủ cho ticket, contact, conversation, agent, reporting. Freshchat API cho real-time chat. Tích hợp Freddy AI.',endpoints:[['POST','/api/v2/tickets','Tạo ticket'],['GET','/api/v2/tickets/{id}','Chi tiết ticket'],['PUT','/api/v2/tickets/{id}','Cập nhật ticket'],['GET','/api/v2/contacts','Danh sách contacts']],link:'developers.freshdesk.com'},
{name:'Infobip Voice API',icon:'🧡',category:'CPaaS / CCaaS',tags:['Global','REST','Webhook','SDK'],desc:'Infobip hỗ trợ Voice API + Zalo ZNS API, đặc biệt cho thị trường Việt Nam. Conversations CCaaS phù hợp rộng tại Đông Nam Á, hỗ trợ số VN và ZNS templates.',endpoints:[['POST','/calls/1/calls','Tạo cuộc gọi'],['GET','/calls/1/calls/{callId}','Thông tin cuộc gọi'],['POST','/zns/v1/message','Gửi ZNS'],['POST','/conversations/1/conversations','Tạo conversation CC']],link:'infobip.com/docs/api'}]},
'ucpbx-vn':{title:'UC / PBX — Nhà Cung Cấp Việt Nam',subtitle:'Stringee, 3CX VN, Yeastar VN, CloudFone, Zalo OA, Mitek IP-PBX, VCC Corp — SIP trunk đầu số VN, click-to-call, CTI integration',icon:'🏁',vendors:[
{name:'Stringee Call API',icon:'📞',category:'UC / PBX',tags:['VN','REST','Webhook','SDK'],desc:'API gọi điện lập trình của Stringee Việt Nam. Hỗ trợ App-to-App, App-to-Phone, Phone-to-App, Conference call, ghi âm, báo cáo. SDK cho Web, iOS, Android.',endpoints:[['POST','/v1/call2/callout','Tạo cuộc gọi ra'],['POST','/v1/call2/hangup','Kết thúc cuộc gọi'],['GET','/v1/cdr','Lấy CDR'],['WS','wss://api.stringee.com','Nhận sự kiện thời gian thực']],link:'developer.stringee.com'},
{name:'StringeeX CCaaS API',icon:'🎧',category:'CCaaS / Omnichannel',tags:['VN','REST','Webhook','SDK'],desc:'StringeeX là CCaaS toàn diện từ Stringee, hỗ trợ đa kênh voice, chat, email, social, ticket, CRM integration, WFM. Có API set đầy đủ cho setup và vận hành contact center.',endpoints:[['POST','/api/v1/agents','Quản lý agent'],['GET','/api/v1/queues','Lấy danh sách hàng chờ'],['POST','/api/v1/calls/outbound','Tạo cuộc gọi ra'],['GET','/api/v1/reports/cdr','Báo cáo CDR']],link:'stringeex.com'},
{name:'OnCallCX (FPT)',icon:'🏢',category:'CCaaS / Contact Center',tags:['VN','REST','Webhook'],desc:'OnCallCX là giải pháp contact center made by FPT. Hỗ trợ gói Basic/Advanced/Social/Premium. Tích hợp CRM, ERP, đa kênh Zalo, Facebook, SMS, voice, ticket, chiến dịch.',endpoints:[['POST','/api/call/outbound','Gọi ra từ CRM'],['GET','/api/cdr/list','Danh sách CDR'],['POST','/webhook/incoming','Nhận cuộc gọi đến'],['POST','/api/ticket/create','Tạo ticket mới']],link:'oncallcx.vn'},
{name:'Viettel CX Cloud',icon:'📶',category:'CCaaS / Omnichannel',tags:['VN','REST'],desc:'Viettel CX Cloud là hệ thống tổng đài đa kênh từ Viettel, tích hợp AI, Data Analytics. Hỗ trợ voice, chat, email, social. Phù hợp enterprise Việt Nam cần đầu số Viettel.',endpoints:[['POST','/api/v1/call/make','Tạo cuộc gọi'],['GET','/api/v1/queue/status','Trạng thái hàng chờ'],['POST','/webhook/call-event','Sự kiện cuộc gọi'],['GET','/api/v1/report/daily','Báo cáo ngày']],link:'solutions.viettel.vn'},
{name:'CloudFone (ODS)',icon:'☁️',category:'UC / Cloud PBX',tags:['VN','REST','Webhook'],desc:'CloudFone là tổng đài ảo VoIP tại Việt Nam, tích hợp API kết nối CRM như CloudGO, Getfly, AMIS. Hỗ trợ đầu số cố định, di động, 1800/1900. Tích hợp sẵn GetFly 4.0.',endpoints:[['POST','/api/click-to-call','Click-to-call từ CRM'],['GET','/api/cdr','Lấy lịch sử cuộc gọi'],['POST','/webhook/call-status','Cập nhật trạng thái call']],link:'ods.vn'},
{name:'Zalo OA / ZNS API',icon:'💬',category:'Messaging / Notification',tags:['VN','REST','Webhook'],desc:'Zalo OA OpenAPI + ZNS: Kênh nhắn tin doanh nghiệp tại Việt Nam. ZNS gửi thông báo transactional như xác nhận đơn, OTP, nhắc lịch. OA API hỗ trợ chatbot, broadcast, customer care.',endpoints:[['POST','/v3/zns/send','Gửi tin ZNS theo template'],['GET','/v2.0/oa/followers','Lấy danh sách follower OA'],['POST','/v3/oa/message','Gửi tin nhắn tới khách hàng'],['POST','/webhook/message','Nhận tin nhắn từ khách hàng']],link:'developers.zalo.me'},
{name:'Mitek IP-PBX & UC Suite',icon:'🖧',category:'UC / PBX On-prem + Cloud',tags:['VN','REST','Webhook','SDK'],desc:'Mitek IP-PBX là hệ thống tổng đài nội bộ on-premise hàng đầu Việt Nam, tích hợp UC: voice, video, conference, presence. Hỗ trợ SIP trunk VNPT/Viettel, tương thích Cisco IP Phone, Yealink, Fanvil.',endpoints:[['GET','/pbx/api/extension/list','Danh sách máy nhánh'],['POST','/pbx/api/call/transfer','Chuyển cuộc gọi'],['GET','/pbx/api/cdr','Lịch sử cuộc gọi CDR'],['POST','/pbx/webhook/call-event','Sự kiện realtime']],link:'mitek.vn'},
{name:'VCC Corp — Virtual Call Center',icon:'📱',category:'CCaaS / Cloud Tổng Đài',tags:['VN','REST','Webhook'],desc:'VCC Corp cung cấp tổng đài ảo cloud tại Việt Nam, mạnh về tốc độ triển khai trong 24h, tích hợp sẵn 30+ phần mềm CRM Việt Nam. Phù hợp SME cần tổng đài nhanh, chi phí thấp. Có free trial 14 ngày.',endpoints:[['POST','/api/click-to-call','Click-to-call'],['GET','/api/cdr','CDR cuộc gọi'],['POST','/webhook/call-status','Cập nhật trạng thái']],link:'vcc.vn'}]},
'crm':{title:'CRM/ERP Việt Nam',subtitle:'Các nền tảng CRM/ERP có khả năng tích hợp Contact Center tại Việt Nam',icon:'🧩',vendors:[
{name:'Getfly CRM',icon:'🚀',category:'Công ty CP Công nghệ Getfly Việt Nam',score:'9/10',tags:['Hà Nội','SME — Mid-Market','5,000+ doanh nghiệp','150,000+ người dùng'],desc:'Getfly CRM là phần mềm quản lý & chăm sóc khách hàng toàn diện dành cho SME Việt Nam. Nổi bật về quản lý pipeline bán hàng, chăm sóc sau bán, tích hợp tổng đài và Zalo. Made in Vietnam.',endpoints:[['GET','/api/customers','Tệp KH'],['POST','/api/call-log','Tích hợp CC'],['POST','/api/ticket','Case Study']],strengths:['Made in VN, tiếng Việt hoàn toàn','Giá cạnh tranh','Support tốt','Tích hợp tổng đài VN native'],limits:['Tính năng enterprise còn hạn chế','API ít hơn so với global platforms','Báo cáo phức tạp cần tuỳ chỉnh'],link:'getflycrm.com'},
{name:'MISA AMIS CRM',icon:'📘',category:'Công ty CP MISA',score:'7/10',tags:['Hà Nội','SME — Enterprise','250,000+ doanh nghiệp sử dụng hệ sinh thái MISA'],desc:'MISA AMIS CRM là module trong hệ sinh thái MISA AMIS — nền tảng quản trị doanh nghiệp tổng thể. Điểm mạnh: tích hợp sâu với MISA kế toán, AMIS HRM, AMIS Marketing. 250K+ khách hàng tin dùng.',endpoints:[['GET','/amis/customers','Tệp KH'],['POST','/amis/call-log','Tích hợp CC'],['POST','/amis/ticket','Case Study']],strengths:['Hệ sinh thái MISA rộng','250K+ KH base','Giá tốt','AI OneAI mới'],limits:['Giao diện phức tạp','API documentation chưa đầy đủ','Tích hợp CC cần custom work'],link:'amis.misa.vn/crm'},
{name:'CloudGO CRM',icon:'☁️',category:'Công ty CP Giải pháp Công nghệ CloudGO',score:'8/10',tags:['TP.HCM','SME','3,000+ doanh nghiệp'],desc:'CloudGO là CRM cloud thuần Việt với điểm mạnh về omnichannel: Zalo, Facebook, Website chat, SMS, Email. Tích hợp sẵn nhiều tổng đài VN. Phổ biến trong ngành bán lẻ, bất động sản, giáo dục.',endpoints:[['GET','/cloudgo/customers','Tệp KH'],['POST','/cloudgo/call-log','Tích hợp CC'],['POST','/cloudgo/ticket','Case Study']],strengths:['Omnichannel mạnh','Chatbot tích hợp sẵn','Giá thấp nhất','Phổ biến SME miền Nam'],limits:['Tính năng reporting hạn chế','Ít phù hợp enterprise lớn','Hỗ trợ sau giờ hành chính yếu'],link:'cloudgo.vn'},
{name:'Base.vn',icon:'🧱',category:'Công ty CP Nền Tảng Base',score:'7/10',tags:['Hà Nội','SME — Mid-Market','8,000+ doanh nghiệp'],desc:'Base.vn là nền tảng quản trị doanh nghiệp với module Base CRM, Base Request, Ticketing, Base Workflow. Đặc điểm: tùy biến cao, workflow automation mạnh. Phù hợp doanh nghiệp cần quy trình riêng.',endpoints:[['GET','/base/customers','Tệp KH'],['POST','/base/workflow','Tích hợp CC'],['POST','/base/ticket','Case Study']],strengths:['Workflow automation mạnh','Tùy biến cao','API đầy đủ','Phù hợp logistics/F&B'],limits:['Học curve cao','Tích hợp tổng đài chưa native','Giá không rõ ràng'],link:'base.vn'},
{name:'FastWork CRM',icon:'⚡',category:'Công ty CP Phần mềm FastWork',score:'6/10',tags:['Hà Nội','SME — Mid-Market','3,500+ doanh nghiệp'],desc:'FastWork là nền tảng quản trị doanh nghiệp tổng hợp gồm CRM + Project + OKR. Phù hợp SME cần quản lý toàn bộ vận hành. CRM module tập trung bán hàng B2B.',endpoints:[['GET','/fastwork/customers','Tệp KH'],['POST','/fastwork/call-log','Tích hợp CC'],['POST','/fastwork/ticket','Case Study']],strengths:['HRM+CRM all-in-one','Phù hợp B2B SME','OKR integration'],limits:['CRM không chuyên sâu bằng Getfly/AMIS','API hạn chế hơn','Tích hợp CC cần effort'],link:'fastwork.vn'},
{name:'BRAVO ERP',icon:'🏭',category:'Công ty CP BRAVO',score:'6/10',tags:['ERP','Mid-Market — Enterprise','1,200+ doanh nghiệp vừa và lớn'],desc:'BRAVO ERP là giải pháp ERP tổng thể dành cho doanh nghiệp vừa và lớn tại Việt Nam. Bao gồm tài chính, kế toán, bán hàng, mua hàng, sản xuất, CRM, HRM. Mạnh nhất ở khối sản xuất và thương mại.',endpoints:[['GET','/bravo/customers','Tệp KH'],['POST','/bravo/order','ERP Sync'],['POST','/bravo/call-log','Tích hợp CC']],strengths:['ERP sâu cho doanh nghiệp lớn','Tùy biến quy trình','Phù hợp sản xuất/thương mại'],limits:['Triển khai dài','API/tích hợp cần phân tích kỹ','Chi phí cao hơn SME CRM'],link:'bravo.com.vn'}]}}
;

export const compareRows=[
['Stringee Call API','UC / PBX','VN',true,true,true,true,true,false,false,false,true,'Docs →'],
['StringeeX CCaaS API','CCaaS / Omnichannel','VN',true,true,true,true,true,true,false,true,false,'Docs →'],
['OnCallCX (FPT)','CCaaS / Contact Center','VN',true,true,false,false,true,true,false,true,false,'Docs →'],
['Viettel CX Cloud','CCaaS / Omnichannel','VN',true,true,false,false,true,true,true,true,false,'Docs →'],
['CloudFone (ODS)','UC / Cloud PBX','VN',true,true,false,false,true,false,false,false,false,'Docs →'],
['Zalo OA / ZNS API','Messaging / Notification','VN',true,true,false,true,false,true,false,false,false,'Docs →'],
['Mitek IP-PBX & UC Suite','UC / PBX On-prem + Cloud','VN',true,true,true,true,true,false,false,false,false,'Docs →'],
['VCC Corp — Virtual Call Center','CCaaS / Cloud Tổng Đài','VN',true,true,false,false,true,true,false,false,true,'Docs →'],
['3CX Call Control API','PBX / UC Platform','Global',true,true,true,true,true,false,true,false,true,'Docs →'],
['Yeastar Cloud PBX API','PBX / UC Platform','Global',true,true,false,false,true,false,false,false,false,'Docs →'],
['Zoom Phone API','UCaaS / Cloud Phone','Global',true,true,false,true,true,false,true,false,false,'Docs →'],
['Webex Calling API','UCaaS / Cloud Calling','Global',true,true,true,true,true,false,false,false,false,'Docs →'],
['Microsoft Teams Phone API','UCaaS / Cloud PBX','Global',true,false,false,true,true,false,true,false,false,'Docs →'],
['Twilio Programmable Voice','CPaaS / Voice API','Global',true,true,false,true,true,false,true,false,true,'Docs →'],
['Vonage / Nexmo Voice API','CPaaS / Voice API','Global',true,true,true,true,true,false,true,false,true,'Docs →'],
['Asterisk ARI / AMI / AGI','Open Source PBX','Global',true,false,true,true,true,false,true,false,true,'Docs →']];

export const complianceCards=[
{title:'Quy Định Đầu Số Viễn Thông',icon:'🚨',type:'danger',bullets:['Tất cả đầu số 1800/1900/028/024 phải đăng ký tên doanh nghiệp với Bộ TT&TT.','Số 1800: miễn phí người gọi, phải đăng ký với nhà mạng.','Số 1900: trả phí cho người gọi, cần giấy phép Bộ TT&TT.','Số cố định 028/024: đăng ký theo địa chỉ doanh nghiệp.','Số di động 09x: chỉ dùng cá nhân, không dùng cho doanh nghiệp CC.','BYOC: phải dùng SIP trunk từ nhà mạng được cấp phép tại VN.']},
{title:'Luật Ghi Âm & Bảo Mật Cuộc Gọi',icon:'⚠️',type:'warn',bullets:['Phải thông báo cho khách hàng biết cuộc gọi được ghi âm qua IVR announcement.','Ghi âm phải được lưu trữ an toàn, không để lộ cho bên thứ ba.','Thời gian lưu trữ tối thiểu: tùy ngành, tài chính 5 năm, thường 1–3 năm.','Khách hàng có quyền yêu cầu xóa ghi âm theo Luật BVQLNTD.','API ghi âm của CCaaS phải lưu trữ tại data center tại VN.']},
{title:'Bảo Vệ Dữ Liệu Cá Nhân (NĐ 13/2023)',icon:'🔒',type:'danger',bullets:['Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân có hiệu lực.','Phải có cơ chế đồng ý trước khi thu thập số điện thoại.','Dữ liệu khách hàng VN phải lưu tại VN hoặc thông báo cho Bộ CA.','API/webhook không được gửi PII sang server nước ngoài không được phép.','Phải có DPO cho tổ chức xử lý dữ liệu lớn.','Vi phạm: phạt đến 5% doanh thu hoặc 100 triệu đồng.']},
{title:'Quy Định Cuộc Gọi Quảng Cáo / Outbound',icon:'📞',type:'warn',bullets:['Không gọi trước 8:00 sáng và sau 22:00 tối.','Phải giới thiệu danh tính doanh nghiệp trong 5 giây đầu.','Khách hàng có quyền từ chối DNC – Do Not Call list.','Phải có cơ chế opt-out và xử lý trong vòng 5 ngày làm việc.','Outbound dialer API cần logging đầy đủ cho kiểm tra compliance.']},
{title:'Ngành Tài Chính — Yêu Cầu Đặc Biệt',icon:'🏦',type:'info',bullets:['CCaaS tích hợp với ngân hàng/bảo hiểm/fintech cần tuân thủ thêm quy định NHNN và BTC.','Ghi âm tất cả cuộc gọi tư vấn đầu tư/bảo hiểm.','Lưu trữ tối thiểu 5 năm theo quy định kế toán.','Không lưu thông tin thẻ PAN/CVV trong CRM — PCI DSS compliance.','Các thực OTP qua voice/SMS trước khi thực hiện giao dịch.','API logs phải đủ điều kiện audit trail cho NHNN kiểm tra.']},
{title:'Best Practices — Triển Khai An Toàn',icon:'✅',type:'success',bullets:['Dùng TLS 1.2+ cho tất cả API calls và SIP trunks.','Rotate API key/token định kỳ 90 ngày hoặc ít hơn.','Không hardcode credentials trong code.','Rate limiting và circuit breaker cho tất cả API integration.','Audit log tất cả API calls.','Data masking: ẩn 6 số giữa của số điện thoại trong log.']}];

export const resources=[
{icon:'📄',title:'Solution Brief',desc:'Tóm tắt giải pháp theo từng ngành: banking, retail, logistics, healthcare.'},
{icon:'🧪',title:'Demo Script',desc:'Kịch bản demo click-to-call, inbound ticket, dashboard supervisor.'},
{icon:'🧱',title:'Architecture',desc:'Mô hình tích hợp: CRM ↔ CCaaS ↔ SIP/SBC ↔ Telco.'},
{icon:'📊',title:'Bảng so sánh',desc:'So sánh nhà cung cấp theo API, webhook, SDK, CRM, AI Bot.'},
{icon:'🛡️',title:'Compliance VN',desc:'Checklist đầu số, ghi âm, bảo mật dữ liệu, audit log.'},
{icon:'🚀',title:'Demo sản phẩm',desc:'Khu vực mô phỏng giao diện agent, cuộc gọi, ticket và báo cáo.'}];


export const partnerProductCatalog = {
  "ccaas-vn": {
    "title": "CCaaS — Đối Tác Việt Nam",
    "apiFolder": "CONTACT CENTER/API Reference/CCaaS/Đối Tác Việt Nam",
    "productTitle": "CCaaS Việt Nam — Bài viết sản phẩm đối tác",
    "products": [
      {
        "id": "prod-oncallcx-fpt",
        "name": "OncallCX - Contact Center As A Service",
        "icon": "📞",
        "category": "Cloud Contact Center Platform",
        "tags": [
          "FPT",
          "CCaaS",
          "Omnichannel",
          "AI",
          "CRM Integration"
        ],
        "source": "oncallcx.vn",
        "desc": "OncallCX là nền tảng Contact Center as a Service (CCaaS) do FPT Telecom phát triển, giúp doanh nghiệp triển khai tổng đài chăm sóc khách hàng trên nền tảng Cloud với thời gian triển khai nhanh, khả năng mở rộng linh hoạt và tích hợp dễ dàng với CRM, ERP, AI Bot và các hệ thống nghiệp vụ.",
        "strengths": [
          "Omnichannel Contact Center",
          "Voice / Chat / Email / Social",
          "AI Voicebot & Chatbot",
          "Call Recording",
          "Dashboard & Realtime Report",
          "Workflow Automation",
          "CRM Integration",
          "Open REST API & Webhook"
        ],
        "usecases": [
          "Enterprise",
          "Banking",
          "Finance",
          "Insurance",
          "Healthcare",
          "Retail",
          "Logistics",
          "Government"
        ],
        "link": "oncallcx.vn"
      },
      {
        "id": "prod-mitek-contact-center",
        "name": "Mitek Contact Center",
        "icon": "🎧",
        "category": "CCaaS / On-premise + Cloud",
        "tags": [
          "VN",
          "Contact Center",
          "Enterprise",
          "Hybrid"
        ],
        "source": "mitek.vn",
        "desc": "Mitek là nhà cung cấp giải pháp Contact Center tại Việt Nam, tập trung vào các sản phẩm và giải pháp phục vụ doanh nghiệp cần tổng đài chăm sóc khách hàng, vận hành chiến dịch, báo cáo và tích hợp hệ thống. Mô hình phù hợp với khách hàng cần lựa chọn on-premise, cloud hoặc triển khai lai.",
        "strengths": [
          "Có hiện diện và hỗ trợ tại Việt Nam",
          "Phù hợp khách hàng cần kiểm soát hạ tầng",
          "Định hướng giải pháp Contact Center cho doanh nghiệp",
          "Có kênh hỗ trợ/hotline và tư vấn trong nước"
        ],
        "usecases": [
          "Ngân hàng, bảo hiểm, tài chính",
          "Doanh nghiệp cần on-premise/hybrid",
          "Tổng đài CSKH có yêu cầu tuân thủ dữ liệu"
        ],
        "link": "mitek.vn"
      },
      {
        "id": "prod-stringeex",
        "name": "StringeeX — Cloud Contact Center",
        "icon": "🎧",
        "category": "CCaaS / Omnichannel",
        "tags": [
          "VN",
          "AI",
          "Callbot",
          "Chatbot",
          "Cloud"
        ],
        "source": "stringeex.com",
        "desc": "StringeeX là nền tảng Cloud Contact Center hỗ trợ chăm sóc khách hàng đa kênh, kết hợp AI, Callbot và Chatbot để tự động hóa một phần quy trình vận hành, hỗ trợ agent và nâng cao năng suất đội ngũ CSKH.",
        "strengths": [
          "Nền tảng cloud contact center",
          "Hỗ trợ voice call và kênh số",
          "Có AI, Callbot, Chatbot",
          "Có thống kê, giám sát và báo cáo",
          "Phù hợp đội CSKH cần triển khai nhanh"
        ],
        "usecases": [
          "CSKH đa kênh",
          "Call center cloud",
          "Telesales có báo cáo và giám sát",
          "Doanh nghiệp cần automation bằng AI"
        ],
        "link": "stringeex.com"
      },
      {
        "id": "prod-viettel-cx-cloud",
        "name": "Viettel CX Cloud",
        "icon": "📶",
        "category": "Omni-channel Cloud Contact Center",
        "tags": [
          "VN",
          "AI",
          "Data Analytics",
          "Enterprise"
        ],
        "source": "solutions.viettel.vn",
        "desc": "Viettel CX Cloud là hệ thống tổng đài đa kênh cho doanh nghiệp, kết hợp AI và Data Analytics nhằm nâng cao hiệu suất nhân viên, tối ưu chi phí vận hành và hỗ trợ doanh nghiệp quản lý tập trung hoạt động bán hàng/chăm sóc khách hàng.",
        "strengths": [
          "Omni-channel cloud contact center",
          "Kết hợp AI và Data Analytics",
          "Hỗ trợ quản lý người dùng, quy trình, chất lượng nghiệp vụ",
          "Phù hợp doanh nghiệp cần hạ tầng/telco Việt Nam"
        ],
        "usecases": [
          "Tổng đài đa kênh quy mô lớn",
          "Bán hàng và CSKH tập trung",
          "Doanh nghiệp cần đầu số/telco Viettel",
          "Tối ưu chi phí vận hành contact center"
        ],
        "link": "solutions.viettel.vn"
      },
      {
        "id": "prod-callio",
        "name": "Callio — CRM + Tổng đài bán hàng",
        "icon": "📞",
        "category": "SME Sales CRM / Call Center",
        "tags": [
          "VN",
          "CRM",
          "Telesales",
          "AI Agent"
        ],
        "source": "callio.vn",
        "desc": "Callio là phần mềm quản lý kinh doanh tập trung tích hợp tổng đài thông minh, hướng tới tăng tốc cuộc gọi telesales, quản lý khách hàng, hội thoại đa kênh và tạo chiến dịch gọi/nhắn tin/email tự động cho đội bán hàng.",
        "strengths": [
          "Tích hợp CRM và tổng đài trong cùng nền tảng",
          "Tập trung vào telesales và tăng trưởng doanh số",
          "Có quản lý chat/hội thoại đa kênh",
          "Có campaign gọi, nhắn tin, email tự động",
          "Phù hợp doanh nghiệp SME và đội sales"
        ],
        "usecases": [
          "Telesales SME",
          "Quản lý lead và pipeline bán hàng",
          "CSKH nhỏ và vừa",
          "Đội sales cần gọi nhanh, theo dõi lịch sử và chiến dịch"
        ],
        "link": "callio.vn"
      },
      {
        "id": "prod-cmc-nextcx",
        "name": "CMC Telecom Contact Center / NextCX",
        "icon": "☁️",
        "category": "Cloud Contact Center / AI CX",
        "tags": [
          "VN",
          "CMC",
          "AI",
          "Omnichannel"
        ],
        "source": "cmctelecom.vn",
        "desc": "Nhóm giải pháp Contact Center của CMC Telecom hướng tới nâng tầm dịch vụ khách hàng với mô hình đa kênh, kết hợp AI Contact Center để cá nhân hóa trải nghiệm, hiểu khách hàng tốt hơn và tối ưu chi phí mở rộng đội CSKH.",
        "strengths": [
          "Định hướng CSKH đa kênh all-in-one",
          "Có câu chuyện AI Contact Center",
          "Phù hợp doanh nghiệp cần cá nhân hóa trải nghiệm khách hàng",
          "Có nền tảng hạ tầng và dịch vụ doanh nghiệp từ CMC Telecom"
        ],
        "usecases": [
          "CSKH đa kênh",
          "AI Contact Center",
          "Doanh nghiệp bán lẻ/dịch vụ cần cá nhân hóa CX",
          "Khách hàng cần nhà cung cấp hạ tầng trong nước"
        ],
        "link": "cmctelecom.vn"
      }
    ]
  },
  "ccaas-global": {
    "title": "CCaaS — Nền Tảng Quốc Tế",
    "apiFolder": "CONTACT CENTER/API Reference/CCaaS/Đối tác quốc tế",
    "productTitle": "CCaaS Quốc tế — Bài viết sản phẩm đối tác",
    "products": [
      {
        "id": "prod-genesys-cloud-cx",
        "name": "Genesys Cloud CX",
        "icon": "☁️",
        "category": "AI-powered Experience Orchestration",
        "tags": [
          "Global",
          "AI",
          "Omnichannel",
          "Enterprise"
        ],
        "source": "genesys.com",
        "desc": "Genesys Cloud CX là nền tảng cloud-native cho contact center và điều phối trải nghiệm khách hàng bằng AI. Giải pháp nhấn mạnh khả năng mở rộng, giao diện sẵn sàng triển khai, công cụ xây dựng orchestration flow và nền tảng dữ liệu sự kiện.",
        "strengths": [
          "Cloud-native và dễ mở rộng",
          "AI-powered experience orchestration",
          "Hỗ trợ voice, digital, AI và workforce engagement",
          "Phù hợp enterprise contact center đa kênh"
        ],
        "usecases": [
          "Enterprise CCaaS",
          "Omnichannel customer experience",
          "Journey orchestration",
          "Workforce engagement management"
        ],
        "link": "genesys.com"
      },
      {
        "id": "prod-nice-cxone",
        "name": "NICE CXone",
        "icon": "🤖",
        "category": "Enterprise CCaaS / AI",
        "tags": [
          "Global",
          "AI",
          "WEM",
          "Enterprise"
        ],
        "source": "nice.com",
        "desc": "NICE CXone là nền tảng CCaaS quốc tế cho contact center enterprise, tập trung vào AI, quản trị tương tác khách hàng, tối ưu vận hành agent và workforce engagement. Phù hợp các tổ chức cần nền tảng cloud contact center quy mô lớn.",
        "strengths": [
          "Định vị enterprise CCaaS",
          "Tập trung AI và tối ưu năng suất agent",
          "Hỗ trợ quản trị contact center quy mô lớn",
          "Phù hợp nhu cầu vận hành đa quốc gia"
        ],
        "usecases": [
          "Enterprise contact center",
          "AI agent assist",
          "Workforce optimization",
          "Global customer service"
        ],
        "link": "nice.com"
      },
      {
        "id": "prod-webex-contact-center",
        "name": "Webex Contact Center",
        "icon": "💬",
        "category": "Cloud Contact Center",
        "tags": [
          "Global",
          "Cisco",
          "Webex",
          "Enterprise"
        ],
        "source": "webex.com",
        "desc": "Webex Contact Center là nền tảng contact center cloud trong hệ sinh thái Cisco/Webex, phù hợp khách hàng đã sử dụng collaboration, meeting và calling của Cisco. Giải pháp tập trung vào agent experience, customer journey và tích hợp hệ thống.",
        "strengths": [
          "Nằm trong hệ sinh thái Cisco/Webex",
          "Phù hợp khách hàng đã dùng Webex Calling/Meeting",
          "Hỗ trợ contact center cloud",
          "Có hướng tích hợp CRM và hệ thống enterprise"
        ],
        "usecases": [
          "Cloud contact center",
          "Khách hàng dùng Cisco/Webex",
          "Customer journey management",
          "Enterprise collaboration + contact center"
        ],
        "link": "webex.com"
      },
      {
        "id": "prod-zoom-contact-center",
        "name": "Zoom Contact Center",
        "icon": "🎥",
        "category": "Cloud Contact Center",
        "tags": [
          "Global",
          "Zoom",
          "Video",
          "Cloud"
        ],
        "source": "zoom.us",
        "desc": "Zoom Contact Center phù hợp doanh nghiệp đã dùng hệ sinh thái Zoom và muốn mở rộng sang contact center cloud. Sản phẩm kết hợp các kênh tương tác khách hàng, quản lý hàng chờ/agent và trải nghiệm khách hàng trên nền tảng Zoom.",
        "strengths": [
          "Tích hợp tốt với hệ sinh thái Zoom",
          "Phù hợp tổ chức đã dùng Zoom Phone/Meetings",
          "Hỗ trợ cloud contact center",
          "Tập trung trải nghiệm khách hàng hiện đại"
        ],
        "usecases": [
          "Contact center cloud cho khách hàng Zoom",
          "Video/customer engagement",
          "Agent queue management",
          "Digital service desk"
        ],
        "link": "zoom.us"
      },
      {
        "id": "prod-twilio-flex",
        "name": "Twilio Flex",
        "icon": "🧱",
        "category": "Programmable Contact Center",
        "tags": [
          "Global",
          "CPaaS",
          "Programmable",
          "Developer"
        ],
        "source": "twilio.com",
        "desc": "Twilio Flex là nền tảng contact center có khả năng lập trình và tùy biến cao, phù hợp đội ngũ kỹ thuật muốn kiểm soát sâu UI, routing, workflow và tích hợp với các dịch vụ CPaaS của Twilio.",
        "strengths": [
          "Programmable contact center",
          "Tùy biến sâu theo nghiệp vụ",
          "Phù hợp đội kỹ thuật mạnh",
          "Kết hợp tốt với hệ sinh thái CPaaS"
        ],
        "usecases": [
          "Contact center tùy biến cao",
          "Sản phẩm cần embedded communications",
          "Workflow đặc thù",
          "Dev team muốn full control"
        ],
        "link": "twilio.com"
      },
      {
        "id": "prod-amazon-connect",
        "name": "Amazon Connect",
        "icon": "aws",
        "category": "AWS Cloud Contact Center",
        "tags": [
          "Global",
          "AWS",
          "Cloud",
          "AI"
        ],
        "source": "aws.amazon.com",
        "desc": "Amazon Connect là dịch vụ contact center cloud của AWS, phù hợp khách hàng đang sử dụng AWS và cần tích hợp sâu với các dịch vụ như storage, analytics, AI/ML, automation và event-driven architecture.",
        "strengths": [
          "Tích hợp tự nhiên với AWS",
          "Cloud-native và mở rộng linh hoạt",
          "Phù hợp kiến trúc serverless/event-driven",
          "Có khả năng kết hợp analytics và AI/ML"
        ],
        "usecases": [
          "Contact center trên AWS",
          "Tích hợp S3/Lambda/AI",
          "Doanh nghiệp cloud-first",
          "Dịch vụ khách hàng quy mô linh hoạt"
        ],
        "link": "aws.amazon.com/connect"
      }
    ]
  },
  "ucpbx-vn": {
    "title": "UC / PBX — Nhà Cung Cấp Việt Nam",
    "apiFolder": "CONTACT CENTER/API Reference/UCaaS/Đối Tác Việt Nam",
    "productTitle": "UCaaS / PBX Việt Nam — Bài viết sản phẩm đối tác",
    "products": [
      {
        "id": "prod-stringee-call-api",
        "name": "Stringee Call API",
        "icon": "📞",
        "category": "Programmable Voice / UC",
        "tags": [
          "VN",
          "Voice API",
          "SDK",
          "Web/iOS/Android"
        ],
        "source": "developer.stringee.com / stringee.com",
        "desc": "Stringee Call API cung cấp khả năng gọi điện lập trình cho ứng dụng web/mobile, hỗ trợ các mô hình App-to-App, App-to-Phone, Phone-to-App, conference và tích hợp realtime communications vào sản phẩm số.",
        "strengths": [
          "Voice API cho web/mobile app",
          "Có SDK cho Web, iOS, Android",
          "Phù hợp tích hợp gọi điện vào ứng dụng",
          "Hỗ trợ kịch bản click-to-call và app calling"
        ],
        "usecases": [
          "Ứng dụng cần gọi trực tiếp",
          "Click-to-call trong CRM",
          "Tư vấn khách hàng trên app",
          "Kết nối thoại trong sản phẩm số"
        ],
        "link": "developer.stringee.com"
      },
      {
        "id": "prod-oncallcx-uc",
        "name": "OnCallCX UCaaS",
        "icon": "🏢",
        "category": "UCaaS / Contact Center",
        "tags": [
          "FPT",
          "UCaaS",
          "Contact Center",
          "Vietnam"
        ],
        "source": "oncallcx.vn / fpt-corp.com",
        "desc": "OnCallCX trong nhóm UCaaS/Contact Center hỗ trợ doanh nghiệp vận hành tổng đài, quản lý tương tác khách hàng, tích hợp ticket/campaign và kết nối hệ sinh thái FPT như hotline, SMS Brandname, AI, Chatbot, Voicebot.",
        "strengths": [
          "Vận hành trên hệ sinh thái FPT",
          "Kết nối hotline, SMS Brandname, AI, Chatbot, Voicebot",
          "Phù hợp khách hàng cần giải pháp tổng đài và contact center trong nước",
          "Hỗ trợ mở rộng theo nhu cầu doanh nghiệp"
        ],
        "usecases": [
          "Tổng đài doanh nghiệp",
          "Contact center tích hợp CRM",
          "Omnichannel CSKH",
          "Khách hàng cần dịch vụ FPT đồng bộ"
        ],
        "link": "oncallcx.vn"
      },
      {
        "id": "prod-cloudfone",
        "name": "CloudFone",
        "icon": "☁️",
        "category": "Cloud PBX",
        "tags": [
          "VN",
          "Cloud PBX",
          "CRM Integration"
        ],
        "source": "ods.vn",
        "desc": "CloudFone là giải pháp tổng đài ảo/Cloud PBX tại Việt Nam, hướng tới doanh nghiệp cần triển khai nhanh tổng đài, quản lý cuộc gọi và tích hợp với các phần mềm CRM phổ biến.",
        "strengths": [
          "Cloud PBX triển khai nhanh",
          "Phù hợp SME",
          "Hỗ trợ tích hợp CRM",
          "Không cần đầu tư tổng đài vật lý lớn"
        ],
        "usecases": [
          "Tổng đài ảo cho SME",
          "Click-to-call CRM",
          "Quản lý lịch sử cuộc gọi",
          "Hotline kinh doanh"
        ],
        "link": "ods.vn"
      },
      {
        "id": "prod-mitek-ippbx",
        "name": "Mitek IP-PBX & UC Suite",
        "icon": "🖧",
        "category": "IP-PBX / UC Suite",
        "tags": [
          "VN",
          "IP-PBX",
          "UC",
          "On-premise"
        ],
        "source": "mitek.vn",
        "desc": "Mitek IP-PBX & UC Suite phù hợp doanh nghiệp cần hệ thống tổng đài nội bộ, quản lý máy nhánh, thoại doanh nghiệp và các tính năng UC như hội nghị, presence hoặc kết nối SIP trunk.",
        "strengths": [
          "Phù hợp triển khai on-premise",
          "Hỗ trợ nhu cầu tổng đài nội bộ",
          "Có định hướng UC cho doanh nghiệp",
          "Phù hợp khách hàng cần kiểm soát hạ tầng"
        ],
        "usecases": [
          "Tổng đài nội bộ doanh nghiệp",
          "Kết nối SIP trunk",
          "UC trong văn phòng",
          "Doanh nghiệp có yêu cầu triển khai tại chỗ"
        ],
        "link": "mitek.vn"
      }
    ]
  },
  "ucaas-global": {
    "title": "UCaaS — Đối tác quốc tế",
    "apiFolder": "CONTACT CENTER/API Reference/UCaaS/Đối tác quốc tế",
    "productTitle": "UCaaS Quốc tế — Bài viết sản phẩm đối tác",
    "products": [
      {
        "id": "prod-webex-calling",
        "name": "Webex Calling",
        "icon": "📞",
        "category": "Cloud Calling / UCaaS",
        "tags": [
          "Global",
          "Cisco",
          "Cloud Calling"
        ],
        "source": "webex.com",
        "desc": "Webex Calling là dịch vụ cloud calling trong hệ sinh thái Webex, phù hợp doanh nghiệp muốn hiện đại hóa hệ thống thoại, tích hợp với meeting, messaging và collaboration.",
        "strengths": [
          "Cloud calling trong hệ sinh thái Cisco",
          "Phù hợp enterprise collaboration",
          "Kết hợp meeting, messaging và calling",
          "Có khả năng triển khai theo mô hình cloud"
        ],
        "usecases": [
          "Enterprise cloud calling",
          "Thay thế PBX truyền thống",
          "Collaboration suite",
          "Liên kết với Webex Meetings"
        ],
        "link": "webex.com"
      },
      {
        "id": "prod-zoom-phone",
        "name": "Zoom Phone",
        "icon": "🎥",
        "category": "Cloud Phone / UCaaS",
        "tags": [
          "Global",
          "Zoom",
          "Cloud Phone"
        ],
        "source": "zoom.us",
        "desc": "Zoom Phone là dịch vụ cloud phone trong hệ sinh thái Zoom, phù hợp tổ chức đã dùng Zoom Meetings và muốn hợp nhất thoại doanh nghiệp trên cùng nền tảng.",
        "strengths": [
          "Phù hợp khách hàng đã dùng Zoom",
          "Cloud phone dễ mở rộng",
          "Kết hợp meeting và phone",
          "Quản lý người dùng tập trung"
        ],
        "usecases": [
          "Cloud phone cho doanh nghiệp",
          "Hợp nhất meeting và calling",
          "Làm việc từ xa",
          "Văn phòng phân tán"
        ],
        "link": "zoom.us"
      },
      {
        "id": "prod-microsoft-teams-phone",
        "name": "Microsoft Teams Phone",
        "icon": "🟦",
        "category": "Teams Calling / UCaaS",
        "tags": [
          "Global",
          "Microsoft",
          "Teams"
        ],
        "source": "microsoft.com",
        "desc": "Microsoft Teams Phone phù hợp khách hàng đã dùng Microsoft 365/Teams và muốn tích hợp thoại doanh nghiệp, gọi nội bộ, PSTN hoặc Direct Routing/Operator Connect trong cùng workspace.",
        "strengths": [
          "Tích hợp sâu với Microsoft Teams",
          "Phù hợp Microsoft 365 enterprise",
          "Hỗ trợ các mô hình PSTN linh hoạt",
          "Trải nghiệm người dùng thống nhất"
        ],
        "usecases": [
          "Teams Calling",
          "Direct Routing",
          "Operator Connect",
          "Doanh nghiệp dùng Microsoft 365"
        ],
        "link": "microsoft.com"
      }
    ]
  }
};
