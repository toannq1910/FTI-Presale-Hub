/* OnCallCX UCaaS API Reference
   Replaces the old public #api-reference content with API data read from
   API_OnCallCX_UCaaS_v2.pdf and verified against pbx.oncallcx.vn.
   No credentials are stored in this file.
*/
(function(){
  const API_META = {
    version: 'v1.0',
    updated: '20/05/2024',
    verified: '02/07/2026',
    baseUrl: 'https://pbx.oncallcx.vn',
    auth: 'Basic Auth',
    pbxName: 'CCaaS_FTI',
    orgUnitId: '4657',
    sourceFile: 'API_OnCallCX_UCaaS_v2.pdf',
    stats: [
      ['PBX', '1', 'CCaaS_FTI / orgUnitId 4657'],
      ['Extensions', '5', 'addresses theo orgUnitId 4657'],
      ['Queue Members', '31', 'acdMembers trả dữ liệu thật'],
      ['Conference', '1', 'Conference room'],
      ['Contacts', '1', 'Contact trả dữ liệu thật'],
      ['CDR sample', '10', 'limit=10 theo accOrgUnitId 4657']
    ]
  };

  const API_DOCS = [
    {
      id: 'auth-pbx',
      icon: '🔐',
      title: 'Xác thực & PBX',
      badge: 'Live verified',
      desc: 'Các API dùng Basic Auth bằng tài khoản PBX. Không lưu username/password trong frontend.',
      endpoints: [
        {
          method: 'GET',
          path: '/rest/orgUnits?where=type.like("pbx")',
          title: 'Lấy danh sách PBX',
          live: '200 OK - 1 PBX',
          note: 'Endpoint đầu tiên để lấy orgUnitId phục vụ extension, CDR và các truy vấn theo PBX.',
          request: 'Basic Auth\nAccept: application/json',
          response: '{\n  "orgUnits": [\n    {\n      "name": "CCaaS_FTI",\n      "id": 4657,\n      "type": "pbx",\n      "description": "CCaaS FTI Trial (Presale)",\n      "parentId": 4315\n    }\n  ]\n}'
        },
        {
          method: 'GET',
          path: '/rest/billingLimits?where=id.eq(4657)',
          title: 'Lấy quota/billing limit của PBX',
          live: '200 OK - rỗng',
          note: 'PDF có endpoint quota extension/PBX. Tài khoản hiện tại gọi được nhưng chưa có bản ghi billingLimits.',
          request: 'Basic Auth\nwhere=id.eq(orgUnitId)',
          response: '{\n  "billingLimits": []\n}'
        }
      ]
    },
    {
      id: 'extensions',
      icon: '📞',
      title: 'Extension / Address',
      badge: '5 records',
      desc: 'Nhóm API lấy thông tin số nội bộ/public address, trạng thái DND, call waiting, callback, IVR/service flags.',
      endpoints: [
        {
          method: 'GET',
          path: '/rest/addresses?where=orgUnitId.eq(4657)',
          title: 'Lấy extension/address theo PBX',
          live: '200 OK - 5 addresses',
          note: 'Dữ liệu thật đã mask số điện thoại ở ví dụ hiển thị.',
          request: 'Basic Auth\nwhere=orgUnitId.eq(4657)',
          response: '{\n  "addresses": [\n    {\n      "id": 5291,\n      "number": "0247300***",\n      "orgUnitId": 4657,\n      "disabled": false,\n      "doNotDisturb": false,\n      "callWaiting": false,\n      "callbackEnabled": false,\n      "trieName": "0247300***"\n    }\n  ]\n}'
        },
        {
          method: 'GET',
          path: '/rest/addresses',
          title: 'Lấy tất cả extension/address theo quyền tài khoản',
          live: 'Theo quyền Basic Auth',
          note: 'Có thể dùng để kiểm tra toàn bộ address mà tài khoản REST được phép đọc.',
          request: 'Basic Auth\nNo required query',
          response: '{\n  "addresses": [\n    { "id": 5291, "number": "0247300***", "orgUnitId": 4657 }\n  ]\n}'
        },
        {
          method: 'GET',
          path: '/rest/addresses?where=id.eq(addressesID)',
          title: 'Lấy chi tiết một extension/address',
          live: 'Cần addressesID',
          note: 'Dùng id lấy từ danh sách addresses để xem chi tiết một số cụ thể.',
          request: 'Basic Auth\nwhere=id.eq(5291)',
          response: '{\n  "addresses": [\n    { "id": 5291, "number": "0247300***", "disabled": false }\n  ]\n}'
        },
        {
          method: 'GET',
          path: '/rest/terminals?where=orgUnitId.eq(4657)',
          title: 'Lấy terminal/device theo PBX',
          live: '200 OK - rỗng',
          note: 'Tài khoản gọi được endpoint, PBX hiện tại chưa trả terminal.',
          request: 'Basic Auth\nwhere=orgUnitId.eq(4657)',
          response: '{\n  "terminals": []\n}'
        },
        {
          method: 'GET',
          path: '/rest/locations?where=terminalId.eq(terminalID)',
          title: 'Lấy location theo terminal',
          live: 'Chưa gọi vì terminals rỗng',
          note: 'Chỉ gọi được khi có terminalID từ API terminals.',
          request: 'Basic Auth\nwhere=terminalId.eq(terminalID)',
          response: '{\n  "locations": []\n}'
        }
      ]
    },
    {
      id: 'queue',
      icon: '🎧',
      title: 'Call Queue / ACD',
      badge: '31 members',
      desc: 'Nhóm API lấy thành viên queue, rank, ring delay, ring duration và trạng thái inactive.',
      endpoints: [
        {
          method: 'GET',
          path: '/rest/acdMembers',
          title: 'Lấy danh sách ACD members',
          live: '200 OK - 31 members',
          note: 'Dữ liệu thật trả nhiều member thuộc các acdId khác nhau.',
          request: 'Basic Auth',
          response: '{\n  "acdMembers": [\n    {\n      "id": 1257,\n      "number": "1007",\n      "acdId": 453,\n      "rank": 3,\n      "ringDelay": 5,\n      "ringDuration": 15,\n      "inactive": true\n    }\n  ]\n}'
        },
        {
          method: 'GET',
          path: '/rest/acdMembers?where=acdId.eq(acdId)',
          title: 'Lấy members của một queue',
          live: 'Cần acdId',
          note: 'Dùng acdId từ danh sách acdMembers để lọc thành viên của một queue cụ thể.',
          request: 'Basic Auth\nwhere=acdId.eq(453)',
          response: '{\n  "acdMembers": [\n    { "number": "1007", "acdId": 453, "rank": 3, "inactive": true }\n  ]\n}'
        }
      ]
    },
    {
      id: 'conference-contact',
      icon: '📇',
      title: 'Conference & Contact',
      badge: 'Live data',
      desc: 'Nhóm API lấy conference room và danh bạ/contact phục vụ UCaaS.',
      endpoints: [
        {
          method: 'GET',
          path: '/rest/conferences',
          title: 'Lấy danh sách conference room',
          live: '200 OK - 1 room',
          note: 'Pin được mask trong UI vì là thông tin nhạy cảm.',
          request: 'Basic Auth',
          response: '{\n  "conferences": [\n    {\n      "name": "Conference room",\n      "id": 9,\n      "orgUnitId": 4657,\n      "room": "6868",\n      "pin": "******"\n    }\n  ]\n}'
        },
        {
          method: 'GET',
          path: '/rest/conferences?where=id.eq(conferenceID)',
          title: 'Lấy chi tiết một conference room',
          live: 'Cần conferenceID',
          note: 'Dùng id từ danh sách conferences.',
          request: 'Basic Auth\nwhere=id.eq(9)',
          response: '{\n  "conferences": [\n    { "id": 9, "room": "6868", "orgUnitId": 4657 }\n  ]\n}'
        },
        {
          method: 'GET',
          path: '/rest/contacts',
          title: 'Lấy danh sách contact',
          live: '200 OK - 1 contact',
          note: 'Số điện thoại được mask trong UI.',
          request: 'Basic Auth',
          response: '{\n  "contacts": [\n    {\n      "name": "Minh test",\n      "id": 255,\n      "orgUnitId": 8941,\n      "telNumber": "0933353***"\n    }\n  ]\n}'
        },
        {
          method: 'GET',
          path: '/rest/contacts?where=orgUnitId.eq(orgUnitID)',
          title: 'Lấy contact theo group/orgUnit',
          live: 'Cần orgUnitID contact group',
          note: 'Dùng khi đã có orgUnitID nhóm contact từ danh sách contact/group.',
          request: 'Basic Auth\nwhere=orgUnitId.eq(orgUnitID)',
          response: '{\n  "contacts": []\n}'
        }
      ]
    },
    {
      id: 'cdr-recording',
      icon: '📊',
      title: 'CDR & Audio Recording',
      badge: '10 CDR sample',
      desc: 'Nhóm API lấy lịch sử cuộc gọi, trạng thái, thời lượng, Call-ID, SIP Call-ID và link ghi âm S3 theo tài liệu.',
      endpoints: [
        {
          method: 'GET',
          path: '/rest/cdrs?where=accOrgUnitId.eq(4657)&limit=100',
          title: 'Lấy CDR của một tổ chức',
          live: '200 OK - sample 10 records',
          note: 'Dữ liệu thật đã mask số gọi/số nhận và rút gọn Call-ID.',
          request: 'Basic Auth\nwhere=accOrgUnitId.eq(4657)\nlimit=100',
          response: '{\n  "cdrs": [\n    {\n      "id": 27301130,\n      "status": 200,\n      "callId": "cc1ftiprod-5ff0...470e",\n      "accOrgUnitId": 4657,\n      "accAddressId": 5293,\n      "origPublicNumber": "0919091***",\n      "destNumber": "223",\n      "timeStart": 1767598507787,\n      "timeConnect": 1767598508294,\n      "timeEnd": 1767598522988\n    }\n  ]\n}'
        },
        {
          method: 'GET',
          path: '/rest/cdrs?where=accOrgUnitId.eq(OU_Id).and(timeStart.ge(Unix_time_start)).and(timeStart.le(Unix_time_end))',
          title: 'Lấy CDR theo khoảng thời gian',
          live: 'Theo tài liệu PDF',
          note: 'Dùng Unix timestamp milliseconds theo trường timeStart.',
          request: 'Basic Auth\nOU_Id=4657\nUnix_time_start / Unix_time_end',
          response: '{\n  "cdrs": [\n    { "id": 27301130, "status": 200, "timeStart": 1767598507787 }\n  ]\n}'
        },
        {
          method: 'GET',
          path: '/rest/cdrs?where=callId.eq("Call_Id")',
          title: 'Lấy CDR theo Call-ID',
          live: 'Cần Call_Id',
          note: 'Call-ID là mã cuộc gọi duy nhất của OnCallCX, khác SIP Call-ID.',
          request: 'Basic Auth\nwhere=callId.eq("cc1ftiprod-...")',
          response: '{\n  "cdrs": [\n    { "callId": "cc1ftiprod-...", "sipCallId": "...", "status": 200 }\n  ]\n}'
        },
        {
          method: 'GET',
          path: 'https://s3stg-crm.oncallcx.vn/bucket/pbx-.../cr_<callId>.wav',
          title: 'Audio Recording file in S3',
          live: 'Theo tài liệu PDF',
          note: 'Endpoint ghi âm là file S3 theo naming convention. Không gọi tự động vì cần đúng bucket/path recording.',
          request: 'Basic Auth hoặc quyền truy cập file theo cấu hình S3',
          response: 'Audio file .wav theo Call-ID'
        }
      ]
    },
    {
      id: 'sdk-webhook',
      icon: '🔌',
      title: 'SDK / Webhook / Outbound',
      badge: 'No side-effect',
      desc: 'Tài liệu PDF có phần make-call qua anCTI. Đây là nhóm có khả năng tạo cuộc gọi thật nên không tự execute.',
      endpoints: [
        {
          method: 'SDK',
          path: 'Makecall anCTI',
          title: 'Thực hiện cuộc gọi ra từ một extension',
          live: 'Không tự gọi để tránh phát sinh cuộc gọi thật',
          note: 'Cần xác nhận số gọi, số nhận và môi trường trước khi test. Không dùng dữ liệu giả.',
          request: 'anCTI Makecall\nfromExtension + destinationNumber',
          response: 'CTI event response: ringing / answered / failed'
        },
        {
          method: 'WEBHOOK',
          path: 'Webhook Events',
          title: 'Nhận sự kiện cuộc gọi realtime',
          live: 'Cần webhook reference file nếu muốn dựng payload đầy đủ',
          note: 'PDF hiện tại chủ yếu mô tả REST UCaaS và CDR; nếu có file webhook riêng cần upload thêm.',
          request: 'Webhook endpoint của CRM/ERP nhận event',
          response: '200 OK từ hệ thống nhận webhook'
        }
      ]
    }
  ];

  function esc(value){
    return String(value ?? '').replace(/[&<>"']/g, ch => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[ch]));
  }

  function methodClass(method){
    const value = String(method || 'GET').toLowerCase();
    if (value === 'post') return 'post';
    if (value === 'sdk') return 'sdk';
    if (value === 'webhook') return 'webhook';
    return 'get';
  }

  function endpointCard(endpoint){
    return `<article class="uc-api-endpoint">
      <div class="uc-api-endpoint-head">
        <span class="method ${methodClass(endpoint.method)}">${esc(endpoint.method)}</span>
        <code>${esc(endpoint.path)}</code>
        <em>${esc(endpoint.live)}</em>
      </div>
      <h4>${esc(endpoint.title)}</h4>
      <p>${esc(endpoint.note)}</p>
      <div class="uc-api-code-grid">
        <div><b>Request</b><pre><code>${esc(endpoint.request)}</code></pre></div>
        <div><b>Response / dữ liệu thật</b><pre><code>${esc(endpoint.response)}</code></pre></div>
      </div>
    </article>`;
  }

  function sectionCard(section){
    return `<section class="uc-api-section" id="uc-api-${esc(section.id)}" data-uc-api-section>
      <header>
        <div class="uc-api-icon">${esc(section.icon)}</div>
        <div><span>${esc(section.badge)}</span><h3>${esc(section.title)}</h3><p>${esc(section.desc)}</p></div>
      </header>
      <div class="uc-api-endpoints">${section.endpoints.map(endpointCard).join('')}</div>
    </section>`;
  }

  function render(){
    const root = document.querySelector('#pageRoot');
    if (!root || (location.hash || '') !== '#api-reference') return;
    ensureStyle();
    const m = API_META;
    const title = document.querySelector('#pageTitle');
    const subtitle = document.querySelector('#pageSubtitle');
    if (title) title.textContent = 'API Reference';
    if (subtitle) subtitle.textContent = 'OnCallCX UCaaS REST API';
    root.innerHTML = `<section class="api-ref-hero uc-api-hero">
      <span class="eyebrow">API Reference - OnCallCX UCaaS ${esc(m.version)}</span>
      <h2>Tài liệu API<br><span class="gradient-text">OnCallCX UCaaS + Webhook</span></h2>
      <p>Thay thế nội dung API cũ bằng bộ REST API đọc từ file ${esc(m.sourceFile)} và đã gọi thử dữ liệu thật từ ${esc(m.baseUrl)}. API dùng Basic Auth; không lưu credential trong giao diện.</p>
      <div class="uc-api-tags">
        <span>Base URL: <code>${esc(m.baseUrl)}</code></span>
        <span>Auth: ${esc(m.auth)}</span>
        <span>PBX: ${esc(m.pbxName)}</span>
        <span>OrgUnitId: ${esc(m.orgUnitId)}</span>
        <span>Verified: ${esc(m.verified)}</span>
      </div>
    </section>
    <section class="uc-api-live">
      ${m.stats.map(([label,value,desc]) => `<article><b>${esc(value)}</b><span>${esc(label)}</span><small>${esc(desc)}</small></article>`).join('')}
    </section>
    <section class="uc-api-toolbar">
      <input id="ucApiSearch" placeholder="Tìm endpoint, nhóm API, CDR, extension, queue...">
      <select id="ucApiMethod"><option value="all">All methods</option><option>GET</option><option>SDK</option><option>WEBHOOK</option></select>
    </section>
    <section class="uc-api-shell">
      <aside class="uc-api-nav">
        <b>API Reference</b>
        ${API_DOCS.map(section => `<button type="button" data-uc-api-scroll="${esc(section.id)}"><span>${esc(section.icon)}</span>${esc(section.title)}</button>`).join('')}
        <div class="uc-api-note"><strong>Lưu ý</strong><p>Make-call/Outbound là API có side effect nên chưa tự execute. Chỉ execute khi bạn chỉ định rõ số test.</p></div>
      </aside>
      <main class="uc-api-main" id="ucApiMain">
        ${API_DOCS.map(sectionCard).join('')}
      </main>
    </section>`;
    bind(root);
  }

  function bind(root){
    root.querySelectorAll('[data-uc-api-scroll]').forEach(button => {
      button.addEventListener('click', () => {
        const id = button.getAttribute('data-uc-api-scroll');
        root.querySelector(`#uc-api-${id}`)?.scrollIntoView({behavior: 'smooth', block: 'start'});
      });
    });
    const filter = () => {
      const query = (root.querySelector('#ucApiSearch')?.value || '').toLowerCase().trim();
      const method = root.querySelector('#ucApiMethod')?.value || 'all';
      const sections = API_DOCS.map(section => ({
        ...section,
        endpoints: section.endpoints.filter(endpoint => {
          const methodOk = method === 'all' || String(endpoint.method).toUpperCase() === method;
          const text = [section.title, section.desc, endpoint.title, endpoint.path, endpoint.note, endpoint.live].join(' ').toLowerCase();
          return methodOk && (!query || text.includes(query));
        })
      })).filter(section => section.endpoints.length);
      const main = root.querySelector('#ucApiMain');
      if (main) main.innerHTML = sections.length ? sections.map(sectionCard).join('') : '<div class="cms-empty-state">Không tìm thấy API phù hợp.</div>';
    };
    root.querySelector('#ucApiSearch')?.addEventListener('input', filter);
    root.querySelector('#ucApiMethod')?.addEventListener('change', filter);
  }

  function ensureStyle(){
    if (document.getElementById('ucApiRefStyle')) return;
    const style = document.createElement('style');
    style.id = 'ucApiRefStyle';
    style.textContent = `
      .uc-api-hero{background:linear-gradient(135deg,rgba(16,185,129,.13),rgba(14,165,233,.09));border-color:rgba(16,185,129,.32)}
      .uc-api-tags{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px}
      .uc-api-tags span{border:1px solid rgba(16,185,129,.25);background:rgba(16,185,129,.08);border-radius:999px;padding:7px 10px;color:#bbf7d0;font-size:12px;font-weight:800}
      .uc-api-tags code{background:#020817;border:1px solid rgba(148,163,184,.2);border-radius:7px;padding:2px 6px;color:#bfdbfe}
      .uc-api-live{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px;margin:0 0 18px}
      .uc-api-live article{background:var(--card,#111c31);border:1px solid var(--line,#263754);border-radius:16px;padding:14px;min-width:0}
      .uc-api-live b{display:block;font-size:26px;color:#f8fafc}
      .uc-api-live span{display:block;color:#93c5fd;font-weight:900}
      .uc-api-live small{display:block;color:#93a4bd;line-height:1.4;margin-top:4px}
      .uc-api-toolbar{display:grid;grid-template-columns:minmax(0,1fr) 180px;gap:10px;margin-bottom:14px}
      .uc-api-toolbar input,.uc-api-toolbar select{border:1px solid var(--line,#263754);background:#050a18;color:#dbeafe;border-radius:12px;padding:11px 12px}
      .uc-api-shell{display:grid;grid-template-columns:270px minmax(0,1fr);gap:18px;align-items:start}
      .uc-api-nav{position:sticky;top:76px;display:grid;gap:8px;background:var(--card,#111c31);border:1px solid var(--line,#263754);border-radius:18px;padding:14px}
      .uc-api-nav>b{color:#93a4bd;text-transform:uppercase;font-size:11px;letter-spacing:.08em}
      .uc-api-nav button{display:flex;gap:9px;align-items:center;border:1px solid transparent;background:rgba(255,255,255,.035);color:#dbeafe;border-radius:12px;padding:10px;text-align:left;font-weight:800;cursor:pointer}
      .uc-api-nav button:hover{border-color:rgba(16,185,129,.35);background:rgba(16,185,129,.08)}
      .uc-api-note{border:1px solid rgba(249,115,22,.28);background:rgba(249,115,22,.08);border-radius:14px;padding:11px;color:#ffedd5}
      .uc-api-note p{margin:5px 0 0;color:#fed7aa;font-size:12px;line-height:1.45}
      .uc-api-main{display:grid;gap:16px}
      .uc-api-section{background:var(--card,#111c31);border:1px solid var(--line,#263754);border-radius:18px;overflow:hidden}
      .uc-api-section>header{display:flex;gap:12px;align-items:flex-start;padding:16px 18px;border-bottom:1px solid var(--line,#263754);background:rgba(255,255,255,.025)}
      .uc-api-icon{width:44px;height:44px;border-radius:13px;background:rgba(16,185,129,.14);display:grid;place-items:center;font-size:22px;flex:0 0 auto}
      .uc-api-section header span{color:#34d399;text-transform:uppercase;font-size:11px;font-weight:900}
      .uc-api-section h3{margin:4px 0;color:#f8fafc}
      .uc-api-section p{margin:0;color:#b8c5dc;line-height:1.55}
      .uc-api-endpoints{display:grid;gap:12px;padding:14px}
      .uc-api-endpoint{border:1px solid #2d3e5d;border-radius:15px;background:#101827;padding:14px}
      .uc-api-endpoint-head{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:9px;align-items:center}
      .uc-api-endpoint-head code{background:#020817;border:1px solid #263754;border-radius:9px;padding:7px 9px;color:#dbeafe;overflow:auto;white-space:nowrap}
      .uc-api-endpoint-head em{font-style:normal;border:1px solid rgba(16,185,129,.24);background:rgba(16,185,129,.08);color:#86efac;border-radius:999px;padding:6px 9px;font-size:11px;font-weight:900;white-space:nowrap}
      .uc-api-endpoint h4{margin:13px 0 7px;font-size:17px;color:#f8fafc}
      .uc-api-endpoint p{color:#cbd7ea}
      .uc-api-code-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
      .uc-api-code-grid div{border:1px solid rgba(148,163,184,.16);border-radius:12px;background:rgba(255,255,255,.03);padding:10px;min-width:0}
      .uc-api-code-grid b{display:block;color:#93c5fd;margin-bottom:7px}
      .uc-api-code-grid pre{margin:0;overflow:auto;background:#020817;border-radius:10px;padding:10px;max-height:260px}
      .uc-api-code-grid code{color:#dbeafe;font-size:12px}
      .method.sdk{background:#7c3aed}
      .method.webhook{background:#0891b2}
      @media(max-width:1200px){.uc-api-live{grid-template-columns:repeat(3,1fr)}.uc-api-shell{grid-template-columns:1fr}.uc-api-nav{position:relative;top:0}.uc-api-code-grid{grid-template-columns:1fr}}
      @media(max-width:720px){.uc-api-live,.uc-api-toolbar,.uc-api-endpoint-head{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function schedule(){
    setTimeout(render, 80);
    setTimeout(render, 240);
  }

  window.addEventListener('hashchange', schedule);
  window.addEventListener('DOMContentLoaded', schedule);
  schedule();
})();
