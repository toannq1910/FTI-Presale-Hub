import{CONFIG}from'./config.js';
import{stats,solutions,vendorGroups,compareRows,complianceCards,resources,partnerProductCatalog}from'./data.js';

function resolvePageFromHash(){
  const h=location.hash.replace('#','');
  if(h.startsWith('editor:'))return 'editor';
  if(h.startsWith('vendor-editor:'))return 'vendor-editor';
  if(h.startsWith('api-folder:'))return 'api-reference';
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
  video:['Video Solutions','Room system và endpoint'],
  devices:['Thiết bị phòng họp','Yealink · Logitech · Poly · Cisco'],
  integration:['Integration Playbook','CRM · ERP · BYOC · Webhook'],
  crm:['CRM/ERP Việt Nam','Tích hợp dữ liệu khách hàng'],
  compliance:['Tuân thủ Việt Nam','Checklist pháp lý và kỹ thuật'],
  demo:['Demo sản phẩm','Mô phỏng luồng khách hàng thực tế'],
  compare:['Bảng so sánh','So sánh giải pháp theo capability'],
  resources:['Nguồn tài liệu','Tài liệu dành cho khách hàng'],
  editor:['Chỉnh sửa bài viết','Content editor dùng LocalStorage'],
  'vendor-editor':['Quản lý bài viết nhóm','Thêm / sửa / xóa product articles']
};

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));

const GROUP_PAGE_KEYS=['ccaas-vn','ccaas-global','ucpbx-vn','crm'];
function groupKeyToPage(groupKey){return GROUP_PAGE_KEYS.includes(groupKey)?groupKey:'overview'}
function packVendorHash(groupKey,vendorId=''){return encodeURIComponent(groupKey)+'~'+encodeURIComponent(vendorId||'')}
function unpackVendorHash(payload=''){
  const parts=payload.split('~');
  return {groupKey:decodeURIComponent(parts[0]||''),vendorId:decodeURIComponent(parts[1]||'')};
}
function safeHashPage(page){
  if(page==='editor'&&location.hash.includes('editor:'))return;
  if(page==='vendor-editor'&&location.hash.includes('vendor-editor:'))return;
  if(page==='api-reference'&&location.hash.includes('api-folder:'))return;
  location.hash=page;
}
function toast(m){
  const e=document.createElement('div');
  e.className='toast';
  e.textContent=m;
  $('#toastRoot').appendChild(e);
  setTimeout(()=>e.remove(),3000);
}

/* ========= Generic article CRUD ========= */
const CONTENT_KEY='fti_hub_content_overrides_v1';
function getOverrides(){try{return JSON.parse(localStorage.getItem(CONTENT_KEY)||'{}')}catch{return {}}}
function saveOverrides(data){localStorage.setItem(CONTENT_KEY,JSON.stringify(data))}
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

function getStore(key){try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return {}}}
function saveStore(key,data){localStorage.setItem(key,JSON.stringify(data))}

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
  return group.products.find(p=>p.id===id)||group.products[0]||createProductArticle(groupKey);
}
function createProductArticle(groupKey){
  return {id:'custom-product-'+groupKey+'-'+Date.now(),name:'Bài viết sản phẩm mới',icon:'📝',category:'Sản phẩm / Đối tác',tags:['Product','Draft'],source:'',desc:'Nhập nội dung bài viết sản phẩm tại đây.',strengths:['Điểm nổi bật mới'],usecases:['Use case mới'],link:''};
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
function getComplianceStore(){try{return JSON.parse(localStorage.getItem(COMPLIANCE_KEY)||'{}')}catch{return {}}}
function saveComplianceStore(data){localStorage.setItem(COMPLIANCE_KEY,JSON.stringify(data))}
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


/* ========= v9.0.3 OnCallCX Document Manager ========= */
const OCX_DOC_DB='fti_ocx_document_manager_v1';
const OCX_DOC_STORE='files';
const OCX_DOC_META='meta';
let ocxDocObjectUrl=null;

function ocxOpenDb(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(OCX_DOC_DB,1);
    req.onupgradeneeded=()=>{
      const db=req.result;
      if(!db.objectStoreNames.contains(OCX_DOC_STORE))db.createObjectStore(OCX_DOC_STORE,{keyPath:'id'});
      if(!db.objectStoreNames.contains(OCX_DOC_META))db.createObjectStore(OCX_DOC_META,{keyPath:'key'});
    };
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}
async function ocxDbGet(store,key){
  const db=await ocxOpenDb();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,'readonly');
    const req=tx.objectStore(store).get(key);
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}
async function ocxDbPut(store,value){
  const db=await ocxOpenDb();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,'readwrite');
    const req=tx.objectStore(store).put(value);
    req.onsuccess=()=>resolve(value);
    req.onerror=()=>reject(req.error);
  });
}
async function ocxDbDelete(store,key){
  const db=await ocxOpenDb();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,'readwrite');
    const req=tx.objectStore(store).delete(key);
    req.onsuccess=()=>resolve(true);
    req.onerror=()=>reject(req.error);
  });
}
async function ocxDbAll(store){
  const db=await ocxOpenDb();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,'readonly');
    const req=tx.objectStore(store).getAll();
    req.onsuccess=()=>resolve(req.result||[]);
    req.onerror=()=>reject(req.error);
  });
}
function ocxFormatBytes(bytes){
  if(!bytes)return '0 B';
  const units=['B','KB','MB','GB'];
  let size=bytes, idx=0;
  while(size>=1024&&idx<units.length-1){size/=1024;idx++}
  return `${size.toFixed(size>=10||idx===0?0:1)} ${units[idx]}`;
}
function ocxVersionName(){
  const d=new Date();
  const yyyy=d.getFullYear();
  const mm=String(d.getMonth()+1).padStart(2,'0');
  const dd=String(d.getDate()).padStart(2,'0');
  const hh=String(d.getHours()).padStart(2,'0');
  const mi=String(d.getMinutes()).padStart(2,'0');
  return `${yyyy}-${mm}-${dd}_${hh}${mi}`;
}
async function ocxGetCurrentDoc(){
  const meta=await ocxDbGet(OCX_DOC_META,'current');
  if(meta?.versionId)return await ocxDbGet(OCX_DOC_STORE,meta.versionId);
  return null;
}
async function ocxSetCurrentDoc(versionId){
  await ocxDbPut(OCX_DOC_META,{key:'current',versionId,updatedAt:new Date().toISOString()});
}

async function ocxLoadPdfJs(){
  if(window.pdfjsLib)return window.pdfjsLib;
  await new Promise((resolve,reject)=>{
    const existing=document.querySelector('script[data-pdfjs]');
    if(existing){existing.addEventListener('load',resolve);existing.addEventListener('error',reject);return}
    const s=document.createElement('script');
    s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    s.dataset.pdfjs='true';
    s.onload=resolve;
    s.onerror=()=>reject(new Error('Không tải được PDF.js'));
    document.head.appendChild(s);
  });
  window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  return window.pdfjsLib;
}
async function ocxGeneratePdfPages(file,{maxWidth=1200,thumbWidth=260}={}){
  try{
    const pdfjs=await ocxLoadPdfJs();
    const buffer=await file.arrayBuffer();
    const pdf=await pdfjs.getDocument({data:buffer}).promise;
    const pages=[];
    let thumbnail='';
    for(let i=1;i<=pdf.numPages;i++){
      const page=await pdf.getPage(i);
      const viewport=page.getViewport({scale:1});
      const scale=maxWidth/viewport.width;
      const canvas=document.createElement('canvas');
      const ctx=canvas.getContext('2d');
      const scaled=page.getViewport({scale});
      canvas.width=Math.floor(scaled.width);
      canvas.height=Math.floor(scaled.height);
      await page.render({canvasContext:ctx,viewport:scaled}).promise;
      const image=canvas.toDataURL('image/jpeg',0.82);
      pages.push({title:`Slide ${i}`,image});
      if(i===1){
        const thumbScale=thumbWidth/viewport.width;
        const thumbCanvas=document.createElement('canvas');
        const thumbCtx=thumbCanvas.getContext('2d');
        const thumbVp=page.getViewport({scale:thumbScale});
        thumbCanvas.width=Math.floor(thumbVp.width);
        thumbCanvas.height=Math.floor(thumbVp.height);
        await page.render({canvasContext:thumbCtx,viewport:thumbVp}).promise;
        thumbnail=thumbCanvas.toDataURL('image/jpeg',0.76);
      }
    }
    return {pages,thumbnail,pageCount:pdf.numPages,generatedAt:new Date().toISOString()};
  }catch(err){
    console.warn('Auto thumbnail failed:',err);
    return {pages:[],thumbnail:'',pageCount:0,error:String(err?.message||err)};
  }
}

async function ocxUploadDoc(file,versionName,description){
  const id='ocx-doc-'+Date.now();
  toast('Đang upload và tự sinh thumbnail...');
  const generated=await ocxGeneratePdfPages(file);
  const record={
    id,
    product:'oncallcx',
    docType:'presentation',
    version:versionName||ocxVersionName(),
    description:description||'',
    fileName:file.name,
    mimeType:file.type||'application/pdf',
    size:file.size,
    createdAt:new Date().toISOString(),
    blob:file,
    thumbnail:generated.thumbnail,
    pages:generated.pages,
    pageCount:generated.pageCount,
    generatedAt:generated.generatedAt,
    generationError:generated.error||''
  };
  await ocxDbPut(OCX_DOC_STORE,record);
  await ocxSetCurrentDoc(id);
  return record;
}
async function ocxGetDocUrl(record){
  if(ocxDocObjectUrl)URL.revokeObjectURL(ocxDocObjectUrl);
  ocxDocObjectUrl=URL.createObjectURL(record.blob);
  return ocxDocObjectUrl;
}
async function ocxRenderDocumentManager(){
  const root=$('#ocxDocumentManagerRoot');
  if(!root)return;
  const all=(await ocxDbAll(OCX_DOC_STORE)).filter(x=>x.product==='oncallcx').sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
  const meta=await ocxDbGet(OCX_DOC_META,'current');
  const current=meta?.versionId?all.find(x=>x.id===meta.versionId):null;

  root.innerHTML=`<div class="ocx-doc-current">
    <div>
      <span class="eyebrow">📂 Current Document</span>
      <h4>${current?current.version:'Chưa có file upload'}</h4>${current?.thumbnail?`<img class="ocx-doc-thumb" src="${current.thumbnail}" alt="Current thumbnail">`:''}
      <p>${current?`${current.fileName} · ${ocxFormatBytes(current.size)} · ${new Date(current.createdAt).toLocaleString('vi-VN')}`:'Mặc định Portal đang dùng file PDF nằm trong assets/presentation/oncallcx.pdf.'}</p>
    </div>
    <div class="ocx-doc-actions">
      ${current?`<button class="btn btn-primary" data-doc-view="${current.id}">Xem current</button><button class="btn btn-soft" data-doc-download="${current.id}">Download</button>`:`<button class="btn btn-soft" data-go="presentation-oncallcx">Xem file mặc định</button>`}
    </div>
  </div>

  <div class="ocx-upload-box">
    <h4>Upload Presentation mới</h4>
    <div class="ocx-upload-form">
      <input type="file" id="ocxDocFile" accept="application/pdf,.pdf">
      <input type="text" id="ocxDocVersion" placeholder="Tên version, ví dụ v4 hoặc 2026-06-25_v4">
      <input type="text" id="ocxDocDesc" placeholder="Mô tả thay đổi">
      <button class="btn btn-primary" id="ocxUploadBtn">Upload & đặt làm Current</button>
    </div>
    <small>File upload được lưu trong IndexedDB của trình duyệt hiện tại. Dữ liệu không gửi lên server.</small>
  </div>

  <div class="ocx-version-list">
    <div class="section-head"><div><h3>Lịch sử phiên bản</h3><p>Các file cũ vẫn được lưu lại để xem, tải hoặc restore.</p></div></div>
    ${all.length?all.map(x=>`<div class="ocx-version-item ${meta?.versionId===x.id?'current':''}">${x.thumbnail?`<img class="ocx-version-thumb" src="${x.thumbnail}" alt="${x.version} thumbnail">`:``}
      <div>
        <b>${x.version}</b>
        <span>${x.fileName} · ${ocxFormatBytes(x.size)} · ${x.pageCount?`${x.pageCount} trang · `:''}${new Date(x.createdAt).toLocaleString('vi-VN')}${x.generationError?' · Không sinh được thumbnail':''}</span>
        ${x.description?`<em>${x.description}</em>`:''}
      </div>
      <div class="ocx-version-actions">
        <button class="btn btn-soft" data-doc-view="${x.id}">Xem</button>
        <button class="btn btn-soft" data-doc-download="${x.id}">Tải</button>
        <button class="btn btn-primary" data-doc-restore="${x.id}">Restore</button>
        <button class="btn btn-danger" data-doc-delete="${x.id}">Xóa</button>
      </div>
    </div>`).join(''):`<div class="ocx-empty-state">Chưa có version upload nào.</div>`}
  </div>`;

  $('#ocxUploadBtn')?.addEventListener('click',async()=>{
    const file=$('#ocxDocFile').files?.[0];
    if(!file){toast('Vui lòng chọn file PDF.');return}
    if(file.type&&file.type!=='application/pdf'){toast('Chỉ hỗ trợ PDF ở phase này.');return}
    await ocxUploadDoc(file,$('#ocxDocVersion').value,$('#ocxDocDesc').value);
    toast('Đã upload và đặt làm current.');
    ocxRenderDocumentManager();
  });

  $$('[data-doc-view]').forEach(btn=>btn.onclick=async()=>{
    const rec=await ocxDbGet(OCX_DOC_STORE,btn.dataset.docView);
    if(!rec)return;
    const url=await ocxGetDocUrl(rec);
    const frame=$('#ocxDocPreviewFrame');
    const title=$('#ocxDocPreviewTitle');
    if(frame){frame.src=url}
    if(title){title.textContent=`${rec.version} — ${rec.fileName}`}
    $('.ocx-doc-preview')?.scrollIntoView({behavior:'smooth',block:'start'});
  });

  $$('[data-doc-download]').forEach(btn=>btn.onclick=async()=>{
    const rec=await ocxDbGet(OCX_DOC_STORE,btn.dataset.docDownload);
    if(!rec)return;
    const url=await ocxGetDocUrl(rec);
    const a=document.createElement('a');
    a.href=url;
    a.download=rec.fileName||`${rec.version}.pdf`;
    a.click();
  });

  $$('[data-doc-restore]').forEach(btn=>btn.onclick=async()=>{
    await ocxSetCurrentDoc(btn.dataset.docRestore);
    toast('Đã restore version này làm current.');
    ocxRenderDocumentManager();
  });

  $$('[data-doc-delete]').forEach(btn=>btn.onclick=async()=>{
    if(!confirm('Xóa version này khỏi trình duyệt?'))return;
    const meta=await ocxDbGet(OCX_DOC_META,'current');
    await ocxDbDelete(OCX_DOC_STORE,btn.dataset.docDelete);
    if(meta?.versionId===btn.dataset.docDelete)await ocxDbPut(OCX_DOC_META,{key:'current',versionId:null,updatedAt:new Date().toISOString()});
    toast('Đã xóa version.');
    ocxRenderDocumentManager();
  });
}

async function ocxUpdateDocMetadata(id,patch){
  const rec=await ocxDbGet(OCX_DOC_STORE,id);
  if(!rec)return null;
  const next={...rec,...patch,updatedAt:new Date().toISOString()};
  await ocxDbPut(OCX_DOC_STORE,next);
  return next;
}
async function ocxToggleDocArchive(id){
  const rec=await ocxDbGet(OCX_DOC_STORE,id);
  if(!rec)return null;
  return await ocxUpdateDocMetadata(id,{archived:!rec.archived});
}
function ocxVersionBadge(rec,currentId){
  if(currentId===rec.id)return '<span class="ocx-v-badge current">Current</span>';
  if(rec.archived)return '<span class="ocx-v-badge archived">Archived</span>';
  return '<span class="ocx-v-badge saved">Saved</span>';
}
async function ocxRenderVersionControl(){
  const root=$('#ocxVersionControlRoot');
  if(!root)return;

  const all=(await ocxDbAll(OCX_DOC_STORE))
    .filter(x=>x.product==='oncallcx')
    .sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));

  const meta=await ocxDbGet(OCX_DOC_META,'current');
  const currentId=meta?.versionId||null;
  const current=currentId?all.find(x=>x.id===currentId):null;
  const active=all.filter(x=>!x.archived);
  const archived=all.filter(x=>x.archived);

  root.innerHTML=`<div class="ocx-version-dashboard">
    <div class="ocx-v-stat">
      <span>Current</span>
      <b>${current?current.version:'Default PDF'}</b>
      <small>${current?current.fileName:'assets/presentation/oncallcx.pdf'}</small>
    </div>
    <div class="ocx-v-stat">
      <span>Total Versions</span>
      <b>${all.length}</b>
      <small>Uploaded in this browser</small>
    </div>
    <div class="ocx-v-stat">
      <span>Active</span>
      <b>${active.length}</b>
      <small>Available to restore</small>
    </div>
    <div class="ocx-v-stat">
      <span>Archived</span>
      <b>${archived.length}</b>
      <small>Hidden from normal use</small>
    </div>
  </div>

  <div class="ocx-version-policy">
    <h4>Version policy</h4>
    <div class="ocx-policy-grid">
      <span>✓ Mỗi lần upload tạo một version mới</span>
      <span>✓ Version cũ không bị ghi đè</span>
      <span>✓ Có thể restore version bất kỳ thành Current</span>
      <span>✓ Có thể archive để giữ lịch sử nhưng tránh nhầm lẫn</span>
    </div>
  </div>

  <div class="ocx-vc-list">
    <div class="section-head"><div><h3>Version Timeline</h3><p>Quản lý current, restore, archive và ghi chú version.</p></div></div>
    ${all.length?all.map((x,idx)=>`<div class="ocx-vc-item ${currentId===x.id?'current':''} ${x.archived?'archived':''}">
      <div class="ocx-vc-index">${String(all.length-idx).padStart(2,'0')}</div>
      <div class="ocx-vc-main">
        <div class="ocx-vc-title">
          <b>${x.version}</b>
          ${ocxVersionBadge(x,currentId)}
        </div>
        <span>${x.fileName} · ${ocxFormatBytes(x.size)} · ${x.pageCount?`${x.pageCount} trang · `:''}${new Date(x.createdAt).toLocaleString('vi-VN')}${x.generationError?' · Không sinh được thumbnail':''}</span>
        <textarea data-version-note="${x.id}" placeholder="Ghi chú version...">${x.note||x.description||''}</textarea>
      </div>
      <div class="ocx-vc-actions">
        <button class="btn btn-soft" data-vc-view="${x.id}">Xem</button>
        <button class="btn btn-primary" data-vc-current="${x.id}">Set Current</button>
        <button class="btn btn-soft" data-vc-note="${x.id}">Lưu note</button>
        <button class="btn btn-soft" data-vc-archive="${x.id}">${x.archived?'Unarchive':'Archive'}</button>
        <button class="btn btn-danger" data-vc-delete="${x.id}">Xóa</button>
      </div>
    </div>`).join(''):`<div class="ocx-empty-state">Chưa có version upload nào. Hãy upload PDF ở tab Document Manager.</div>`}
  </div>`;

  $$('[data-vc-view]').forEach(btn=>btn.onclick=async()=>{
    const rec=await ocxDbGet(OCX_DOC_STORE,btn.dataset.vcView);
    if(!rec)return;
    const url=await ocxGetDocUrl(rec);
    window.open(url,'_blank');
  });

  $$('[data-vc-current]').forEach(btn=>btn.onclick=async()=>{
    await ocxSetCurrentDoc(btn.dataset.vcCurrent);
    toast('Đã đặt version này làm Current.');
    ocxRenderVersionControl();
    ocxRenderDocumentManager();
  });

  $$('[data-vc-note]').forEach(btn=>btn.onclick=async()=>{
    const note=$(`[data-version-note="${btn.dataset.vcNote}"]`)?.value||'';
    await ocxUpdateDocMetadata(btn.dataset.vcNote,{note});
    toast('Đã lưu ghi chú version.');
    ocxRenderVersionControl();
  });

  $$('[data-vc-archive]').forEach(btn=>btn.onclick=async()=>{
    await ocxToggleDocArchive(btn.dataset.vcArchive);
    toast('Đã cập nhật trạng thái archive.');
    ocxRenderVersionControl();
    ocxRenderDocumentManager();
  });

  $$('[data-vc-delete]').forEach(btn=>btn.onclick=async()=>{
    if(!confirm('Xóa vĩnh viễn version này khỏi trình duyệt?'))return;
    const meta=await ocxDbGet(OCX_DOC_META,'current');
    await ocxDbDelete(OCX_DOC_STORE,btn.dataset.vcDelete);
    if(meta?.versionId===btn.dataset.vcDelete)await ocxDbPut(OCX_DOC_META,{key:'current',versionId:null,updatedAt:new Date().toISOString()});
    toast('Đã xóa version.');
    ocxRenderVersionControl();
    ocxRenderDocumentManager();
  });
}


const OCX_DOC_TYPE_LABELS={
  presentation:'Presentation',
  video:'Demo Video',
  datasheet:'Datasheet',
  caseStudy:'Case Study',
  apiGuide:'API Guide',
  releaseNote:'Release Note',
  architecture:'Architecture',
  proposal:'Proposal'
};
function ocxDocTypeLabel(type){return OCX_DOC_TYPE_LABELS[type]||type||'Document'}
function ocxAcceptByDocType(type){
  if(type==='video')return 'video/mp4,video/webm,.mp4,.webm';
  return 'application/pdf,.pdf';
}
async function ocxUploadGenericDoc({file,docType,version,description,setCurrent=false}){
  const id='ocx-doc-'+docType+'-'+Date.now();
  let generated={pages:[],thumbnail:'',pageCount:0};
  if((file.type||'').includes('pdf')||file.name.toLowerCase().endsWith('.pdf')){
    generated=await ocxGeneratePdfPages(file);
  }
  const record={
    id,
    product:'oncallcx',
    docType,
    version:version||ocxVersionName(),
    description:description||'',
    fileName:file.name,
    mimeType:file.type||'application/octet-stream',
    size:file.size,
    createdAt:new Date().toISOString(),
    blob:file,
    thumbnail:generated.thumbnail||'',
    pages:generated.pages||[],
    pageCount:generated.pageCount||0,
    generatedAt:generated.generatedAt||new Date().toISOString(),
    generationError:generated.error||''
  };
  await ocxDbPut(OCX_DOC_STORE,record);
  if(setCurrent&&docType==='presentation')await ocxSetCurrentDoc(id);
  return record;
}
async function ocxGetDocsByType(docType){
  return (await ocxDbAll(OCX_DOC_STORE))
    .filter(x=>x.product==='oncallcx' && x.docType===docType)
    .sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
}
async function ocxRenderAdminUpload(){
  const root=$('#ocxAdminUploadRoot');
  if(!root)return;
  const all=(await ocxDbAll(OCX_DOC_STORE))
    .filter(x=>x.product==='oncallcx')
    .sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
  const grouped=Object.keys(OCX_DOC_TYPE_LABELS).map(type=>({
    type,
    label:ocxDocTypeLabel(type),
    count:all.filter(x=>x.docType===type).length
  }));

  root.innerHTML=`<div class="ocx-admin-upload-hero">
    <div>
      <span class="eyebrow">🛠️ Admin Upload</span>
      <h4>Upload tài liệu cho OnCallCX</h4>
      <p>Quản lý các loại tài liệu sản phẩm: Presentation, Demo Video, Datasheet, Case Study, API Guide, Release Note...</p>
    </div>
  </div>

  <div class="ocx-admin-form-card">
    <h4>Upload file mới</h4>
    <div class="ocx-admin-form">
      <label>Loại tài liệu</label>
      <select id="ocxAdminDocType">
        ${Object.entries(OCX_DOC_TYPE_LABELS).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}
      </select>
      <label>Chọn file</label>
      <input type="file" id="ocxAdminFile" accept="application/pdf,.pdf">
      <label>Version</label>
      <input type="text" id="ocxAdminVersion" placeholder="VD: v1, 2026-06-25_v1">
      <label>Mô tả</label>
      <input type="text" id="ocxAdminDesc" placeholder="Mô tả thay đổi / ghi chú">
      <label class="ocx-checkline"><input type="checkbox" id="ocxAdminSetCurrent"> Đặt làm Current nếu là Presentation</label>
      <button class="btn btn-primary" id="ocxAdminUploadBtn">Upload file</button>
    </div>
    <small>PDF sẽ tự sinh thumbnail/pages nếu có thể tải PDF.js. Video và file khác được lưu version nhưng không sinh slide.</small>
  </div>

  <div class="ocx-admin-type-grid">
    ${grouped.map(g=>`<button class="ocx-admin-type-card" data-admin-type="${g.type}">
      <b>${g.label}</b>
      <span>${g.count} file</span>
    </button>`).join('')}
  </div>

  <div class="ocx-admin-library">
    <div class="section-head"><div><h3>Library</h3><p>Danh sách tài liệu đã upload theo loại.</p></div></div>
    <div id="ocxAdminLibraryList">${ocxAdminLibraryMarkup(all)}</div>
  </div>`;

  const typeSelect=$('#ocxAdminDocType');
  const fileInput=$('#ocxAdminFile');
  typeSelect.onchange=()=>fileInput.accept=ocxAcceptByDocType(typeSelect.value);

  $('#ocxAdminUploadBtn').onclick=async()=>{
    const file=fileInput.files?.[0];
    if(!file){toast('Vui lòng chọn file.');return}
    const docType=typeSelect.value;
    const version=$('#ocxAdminVersion').value;
    const description=$('#ocxAdminDesc').value;
    const setCurrent=$('#ocxAdminSetCurrent').checked;
    await ocxUploadGenericDoc({file,docType,version,description,setCurrent});
    toast('Đã upload tài liệu.');
    ocxRenderAdminUpload();
    ocxRenderDocumentManager();
    ocxRenderVersionControl();
  };

  $$('[data-admin-type]').forEach(btn=>btn.onclick=async()=>{
    const type=btn.dataset.adminType;
    const docs=await ocxGetDocsByType(type);
    $('#ocxAdminLibraryList').innerHTML=ocxAdminLibraryMarkup(docs,true);
  });

  ocxBindAdminLibraryActions();
}
function ocxAdminLibraryMarkup(items,filtered=false){
  if(!items.length)return `<div class="ocx-empty-state">${filtered?'Chưa có file thuộc loại này.':'Chưa có tài liệu upload.'}</div>`;
  return items.map(x=>`<div class="ocx-admin-file-item">
    ${x.thumbnail?`<img class="ocx-version-thumb" src="${x.thumbnail}" alt="${x.version} thumbnail">`:`<div class="ocx-file-icon">${x.docType==='video'?'🎬':'📄'}</div>`}
    <div class="ocx-admin-file-main">
      <div><b>${ocxDocTypeLabel(x.docType)} · ${x.version}</b><span>${x.fileName} · ${ocxFormatBytes(x.size)} · ${x.pageCount?`${x.pageCount} trang · `:''}${new Date(x.createdAt).toLocaleString('vi-VN')}</span></div>
      ${x.description?`<em>${x.description}</em>`:''}
    </div>
    <div class="ocx-admin-file-actions">
      <button class="btn btn-soft" data-admin-view="${x.id}">Xem</button>
      <button class="btn btn-soft" data-admin-download="${x.id}">Tải</button>
      ${x.docType==='presentation'?`<button class="btn btn-primary" data-admin-current="${x.id}">Set Current</button>`:''}
      <button class="btn btn-danger" data-admin-delete="${x.id}">Xóa</button>
    </div>
  </div>`).join('');
}
function ocxBindAdminLibraryActions(){
  $$('[data-admin-view]').forEach(btn=>btn.onclick=async()=>{
    const rec=await ocxDbGet(OCX_DOC_STORE,btn.dataset.adminView);
    if(!rec)return;
    const url=await ocxGetDocUrl(rec);
    window.open(url,'_blank');
  });
  $$('[data-admin-download]').forEach(btn=>btn.onclick=async()=>{
    const rec=await ocxDbGet(OCX_DOC_STORE,btn.dataset.adminDownload);
    if(!rec)return;
    const url=await ocxGetDocUrl(rec);
    const a=document.createElement('a');
    a.href=url;
    a.download=rec.fileName||`${rec.version}`;
    a.click();
  });
  $$('[data-admin-current]').forEach(btn=>btn.onclick=async()=>{
    await ocxSetCurrentDoc(btn.dataset.adminCurrent);
    toast('Đã đặt Presentation này làm Current.');
    ocxRenderAdminUpload();
    ocxRenderDocumentManager();
    ocxRenderVersionControl();
  });
  $$('[data-admin-delete]').forEach(btn=>btn.onclick=async()=>{
    if(!confirm('Xóa file này khỏi trình duyệt?'))return;
    const meta=await ocxDbGet(OCX_DOC_META,'current');
    await ocxDbDelete(OCX_DOC_STORE,btn.dataset.adminDelete);
    if(meta?.versionId===btn.dataset.adminDelete)await ocxDbPut(OCX_DOC_META,{key:'current',versionId:null,updatedAt:new Date().toISOString()});
    toast('Đã xóa file.');
    ocxRenderAdminUpload();
    ocxRenderDocumentManager();
    ocxRenderVersionControl();
  });
}


function ocxHistoryIcon(type){
  const map={presentation:'📘',video:'🎬',datasheet:'📄',caseStudy:'💬',apiGuide:'📚',releaseNote:'🧾',architecture:'🏗️',proposal:'📑'};
  return map[type]||'📎';
}
async function ocxRenderHistoryCenter(){
  const root=$('#ocxHistoryRoot');
  if(!root)return;

  const all=(await ocxDbAll(OCX_DOC_STORE))
    .filter(x=>x.product==='oncallcx')
    .sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
  const meta=await ocxDbGet(OCX_DOC_META,'current');
  const currentId=meta?.versionId||null;

  const types=['all',...Object.keys(OCX_DOC_TYPE_LABELS)];
  const currentFilter=root.dataset.filter||'all';
  const filtered=currentFilter==='all'?all:all.filter(x=>x.docType===currentFilter);

  const groupedByDate=filtered.reduce((acc,item)=>{
    const d=new Date(item.createdAt);
    const key=d.toLocaleDateString('vi-VN');
    acc[key]=acc[key]||[];
    acc[key].push(item);
    return acc;
  },{});

  root.innerHTML=`<div class="ocx-history-header">
    <div>
      <span class="eyebrow">🕘 History Center</span>
      <h4>Lịch sử tài liệu OnCallCX</h4>
      <p>Xem lại toàn bộ file đã upload theo thời gian, loại tài liệu và trạng thái Current/Archived.</p>
    </div>
    <div class="ocx-history-summary">
      <span><b>${all.length}</b><small>Total</small></span>
      <span><b>${all.filter(x=>x.id===currentId).length}</b><small>Current</small></span>
      <span><b>${all.filter(x=>x.archived).length}</b><small>Archived</small></span>
    </div>
  </div>

  <div class="ocx-history-filters">
    ${types.map(t=>`<button class="${currentFilter===t?'active':''}" data-history-filter="${t}">
      ${t==='all'?'🗂️':ocxHistoryIcon(t)} ${t==='all'?'All':ocxDocTypeLabel(t)}
    </button>`).join('')}
  </div>

  <div class="ocx-history-timeline">
    ${Object.keys(groupedByDate).length?Object.entries(groupedByDate).map(([date,items])=>`<section class="ocx-history-day">
      <h4>${date}</h4>
      <div class="ocx-history-items">
        ${items.map(x=>`<article class="ocx-history-item ${x.id===currentId?'current':''} ${x.archived?'archived':''}">
          <div class="ocx-history-marker">${ocxHistoryIcon(x.docType)}</div>
          ${x.thumbnail?`<img class="ocx-history-thumb" src="${x.thumbnail}" alt="${x.version} thumbnail">`:`<div class="ocx-history-fileicon">${ocxHistoryIcon(x.docType)}</div>`}
          <div class="ocx-history-main">
            <div class="ocx-history-title">
              <b>${ocxDocTypeLabel(x.docType)} · ${x.version}</b>
              ${ocxVersionBadge(x,currentId)}
            </div>
            <span>${x.fileName} · ${ocxFormatBytes(x.size)} · ${x.pageCount?`${x.pageCount} trang · `:''}${new Date(x.createdAt).toLocaleTimeString('vi-VN')}</span>
            ${x.note?`<em>${x.note}</em>`:''}
            ${x.description&&!x.note?`<em>${x.description}</em>`:''}
          </div>
          <div class="ocx-history-actions">
            <button class="btn btn-soft" data-history-view="${x.id}">Xem</button>
            <button class="btn btn-soft" data-history-download="${x.id}">Tải</button>
            ${x.docType==='presentation'?`<button class="btn btn-primary" data-history-restore="${x.id}">Restore</button>`:''}
          </div>
        </article>`).join('')}
      </div>
    </section>`).join(''):`<div class="ocx-empty-state">Chưa có lịch sử tài liệu. Hãy upload ở tab Admin Upload hoặc Document Manager.</div>`}
  </div>`;

  $$('[data-history-filter]').forEach(btn=>btn.onclick=()=>{
    root.dataset.filter=btn.dataset.historyFilter;
    ocxRenderHistoryCenter();
  });

  $$('[data-history-view]').forEach(btn=>btn.onclick=async()=>{
    const rec=await ocxDbGet(OCX_DOC_STORE,btn.dataset.historyView);
    if(!rec)return;
    const url=await ocxGetDocUrl(rec);
    window.open(url,'_blank');
  });

  $$('[data-history-download]').forEach(btn=>btn.onclick=async()=>{
    const rec=await ocxDbGet(OCX_DOC_STORE,btn.dataset.historyDownload);
    if(!rec)return;
    const url=await ocxGetDocUrl(rec);
    const a=document.createElement('a');
    a.href=url;
    a.download=rec.fileName||`${rec.version}`;
    a.click();
  });

  $$('[data-history-restore]').forEach(btn=>btn.onclick=async()=>{
    await ocxSetCurrentDoc(btn.dataset.historyRestore);
    toast('Đã restore version này làm Current.');
    ocxRenderHistoryCenter();
    ocxRenderVersionControl();
    ocxRenderDocumentManager();
  });
}


function ocxNormalizeText(v){
  return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
}
function ocxDocSearchText(x){
  return [
    x.version,
    x.fileName,
    x.description,
    x.note,
    x.docType,
    ocxDocTypeLabel(x.docType),
    x.pageCount?`${x.pageCount} trang`:'',
    ...(x.pages||[]).map(p=>p.title||'')
  ].join(' ');
}
function ocxHighlight(text,query){
  if(!query)return text||'';
  const safe=String(text||'');
  const idx=ocxNormalizeText(safe).indexOf(ocxNormalizeText(query));
  if(idx<0)return safe;
  return safe.slice(0,idx)+`<mark>`+safe.slice(idx,idx+query.length)+`</mark>`+safe.slice(idx+query.length);
}
async function ocxRenderSearchCenter(){
  const root=$('#ocxSearchRoot');
  if(!root)return;

  const all=(await ocxDbAll(OCX_DOC_STORE))
    .filter(x=>x.product==='oncallcx')
    .sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
  const query=root.dataset.query||'';
  const filter=root.dataset.filter||'all';

  const normalized=ocxNormalizeText(query);
  const filtered=all.filter(x=>{
    const matchType=filter==='all'||x.docType===filter;
    const matchText=!normalized||ocxNormalizeText(ocxDocSearchText(x)).includes(normalized);
    return matchType&&matchText;
  });

  const typeOptions=['all',...Object.keys(OCX_DOC_TYPE_LABELS)];

  root.innerHTML=`<div class="ocx-search-hero">
    <div>
      <span class="eyebrow">🔎 Search Center</span>
      <h4>Tìm kiếm tài liệu OnCallCX</h4>
      <p>Tìm theo tên file, version, loại tài liệu, mô tả, ghi chú và tiêu đề slide đã sinh.</p>
    </div>
  </div>

  <div class="ocx-search-bar">
    <input id="ocxSearchInput" value="${query}" placeholder="Nhập từ khóa: presentation, datasheet, v1, API, case study...">
    <select id="ocxSearchFilter">
      ${typeOptions.map(t=>`<option value="${t}" ${filter===t?'selected':''}>${t==='all'?'All':ocxDocTypeLabel(t)}</option>`).join('')}
    </select>
    <button class="btn btn-primary" id="ocxSearchBtn">Search</button>
    <button class="btn btn-soft" id="ocxClearSearchBtn">Clear</button>
  </div>

  <div class="ocx-search-summary">
    <span><b>${filtered.length}</b> kết quả</span>
    <span><b>${all.length}</b> tài liệu trong thư viện</span>
  </div>

  <div class="ocx-search-results">
    ${filtered.length?filtered.map(x=>`<article class="ocx-search-result">
      ${x.thumbnail?`<img class="ocx-search-thumb" src="${x.thumbnail}" alt="${x.version} thumbnail">`:`<div class="ocx-search-icon">${ocxHistoryIcon(x.docType)}</div>`}
      <div class="ocx-search-main">
        <div class="ocx-search-title">
          <b>${ocxHighlight(`${ocxDocTypeLabel(x.docType)} · ${x.version}`,query)}</b>
          ${x.archived?'<span class="ocx-v-badge archived">Archived</span>':''}
        </div>
        <p>${ocxHighlight(x.fileName,query)} · ${ocxFormatBytes(x.size)} · ${x.pageCount?`${x.pageCount} trang · `:''}${new Date(x.createdAt).toLocaleString('vi-VN')}</p>
        ${x.description?`<em>${ocxHighlight(x.description,query)}</em>`:''}
        ${x.note?`<em>${ocxHighlight(x.note,query)}</em>`:''}
      </div>
      <div class="ocx-search-actions">
        <button class="btn btn-soft" data-search-view="${x.id}">Xem</button>
        <button class="btn btn-soft" data-search-download="${x.id}">Tải</button>
        ${x.docType==='presentation'?`<button class="btn btn-primary" data-search-restore="${x.id}">Set Current</button>`:''}
      </div>
    </article>`).join(''):`<div class="ocx-empty-state">Không tìm thấy kết quả phù hợp.</div>`}
  </div>`;

  const runSearch=()=>{
    root.dataset.query=$('#ocxSearchInput').value.trim();
    root.dataset.filter=$('#ocxSearchFilter').value;
    ocxRenderSearchCenter();
  };

  $('#ocxSearchBtn').onclick=runSearch;
  $('#ocxSearchInput').onkeydown=e=>{if(e.key==='Enter')runSearch()};
  $('#ocxSearchFilter').onchange=runSearch;
  $('#ocxClearSearchBtn').onclick=()=>{
    root.dataset.query='';
    root.dataset.filter='all';
    ocxRenderSearchCenter();
  };

  $$('[data-search-view]').forEach(btn=>btn.onclick=async()=>{
    const rec=await ocxDbGet(OCX_DOC_STORE,btn.dataset.searchView);
    if(!rec)return;
    const url=await ocxGetDocUrl(rec);
    window.open(url,'_blank');
  });

  $$('[data-search-download]').forEach(btn=>btn.onclick=async()=>{
    const rec=await ocxDbGet(OCX_DOC_STORE,btn.dataset.searchDownload);
    if(!rec)return;
    const url=await ocxGetDocUrl(rec);
    const a=document.createElement('a');
    a.href=url;
    a.download=rec.fileName||`${rec.version}`;
    a.click();
  });

  $$('[data-search-restore]').forEach(btn=>btn.onclick=async()=>{
    await ocxSetCurrentDoc(btn.dataset.searchRestore);
    toast('Đã đặt Presentation này làm Current.');
    ocxRenderSearchCenter();
    ocxRenderVersionControl();
    ocxRenderDocumentManager();
  });
}

async function ocxGetPresentationPathOrDefault(){
  const current=await ocxGetCurrentDoc();
  if(!current)return 'assets/presentation/oncallcx.pdf';
  return await ocxGetDocUrl(current);
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
  return `<article class="solution-card" data-solution="${i.id}"><div class="solution-top"><div class="solution-icon">${i.icon}</div><div><h3>${i.title}</h3><small>${i.type}</small></div></div><div class="solution-body"><p>${i.desc}</p><div class="chips">${(i.chips||[]).map((c,n)=>`<span class="chip ${n%3===0?'orange':n%3===1?'green':'blue'}">${c}</span>`).join('')}</div><div class="api-list">${(i.apis||[]).map(a=>`<div class="api-row"><span class="method ${String(a[0]).toLowerCase()==='post'?'post':String(a[0]).toLowerCase()==='ws'?'ws':'get'}">${a[0]}</span><span class="path">${a[1]}</span><span class="api-desc">${a[2]}</span></div>`).join('')}</div><div class="card-actions"><button class="btn btn-soft" data-edit-id="${i.id}">Chỉnh sửa</button><button class="btn btn-danger" data-delete-solution="${i.id}">Xóa</button></div></div></article>`;
}
function renderSolutions(filter){
  const source=allContentItems();
  const list=filter?source.filter(s=>s.id===filter||s.bucket===filter||s.type.toLowerCase().includes(filter)||s.title.toLowerCase().includes(filter)):source;
  const safeFilter=filter||'general';
  return `<div class="section-head"><div><h2>Danh mục giải pháp</h2><p>Trình bày dạng card, dùng cho các trang không thuộc nhóm API/Product Partner.</p></div><button class="btn btn-primary" data-add-solution="${safeFilter}">+ Thêm bài viết</button></div><div class="solution-grid">${list.map(solutionCard).join('')}</div>`;
}

/* ========= Product Article pages ========= */
function productArticleCard(v,groupKey='',presentationMode=false){
  const features=(v.strengths&&v.strengths.length?v.strengths:(v.tags||[])).slice(0,4);
  const uses=(v.usecases||[]).slice(0,3);
  const href=(v.link||'#').startsWith('http')?(v.link||'#'):(v.link?`https://${v.link}`:'#');
  return `<article class="partner-card">
    <div class="partner-head">
      <div class="partner-icon">${v.icon}</div>
      <div>
        <h3>${v.name}</h3>
        <small>${v.category||'Product'}</small>
      </div>
    </div>
    <div class="partner-body">
      <div class="partner-meta">${[v.source||'',...(v.tags||[]).slice(0,3)].filter(Boolean).map(x=>`<span>${x}</span>`).join('')}</div>
      <p>${v.desc}</p>
      <div class="partner-features">${features.map(x=>`<span>✓ ${x}</span>`).join('')}</div>
      ${uses.length?`<div class="partner-usecases"><b>Phù hợp:</b>${uses.map(x=>`<em>${x}</em>`).join('')}</div>`:''}
    </div>
    <div class="partner-foot">
      <div class="partner-actions-left">
        <button class="btn btn-soft" data-edit-product="${groupKey}|${v.id}">Chỉnh sửa</button>
        <button class="btn btn-danger" data-delete-product="${groupKey}|${v.id}">Xóa</button>
      </div>
      ${presentationMode
        ? `<button class="btn btn-primary" data-go="oncallcx-product-center">Xem Presentation</button>`
        : `<a class="btn btn-primary btn-link" href="${href}" target="_blank" rel="noopener">Xem chi tiết</a>`}
    </div>
  </article>`;
}
function renderProductGroup(groupKey,customTitle=''){
  const g=getProductGroup(groupKey);
  return `<section class="product-hero">
    <span class="eyebrow">📰 Product Articles</span>
    <h2>${customTitle||g.productTitle||g.title}</h2>
    <p>Các bài viết tại đây là nội dung sản phẩm/đối tác dành cho khách hàng đọc hiểu. Các bài viết kỹ thuật/API cũ đã được chuyển sang khu vực API Reference.</p>
    <div class="hero-actions">
      <button class="btn btn-primary" data-add-product="${groupKey}">+ Thêm bài viết sản phẩm</button>
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
  return `<div class="api-row"><span class="method ${String(a[0]).toLowerCase()==='post'?'post':String(a[0]).toLowerCase()==='ws'?'ws':'get'}">${a[0]}</span><span class="path">${a[1]}</span><span class="api-desc">${a[2]}</span></div>`;
}
function apiArticleCard(v,groupKey=''){
  return `<article class="api-doc-card">
    <header><div class="vendor-icon">${v.icon}</div><div><h3>${v.name}</h3><small>${v.category}</small></div></header>
    <p class="api-article-desc">${v.desc}</p>
    <div class="chips">${(v.tags||[]).map((t,i)=>`<span class="chip ${i%3===0?'green':i%3===1?'blue':'orange'}">${t}</span>`).join('')}</div>
    <h4>Endpoints / API notes</h4>
    <div class="api-list">${(v.endpoints||[]).map(apiEndpointRow).join('')}</div>
  </article>`;
}
function renderApiReference(){
  const selected=location.hash.includes('api-folder:')?location.hash.split('api-folder:')[1]:'ccaas-vn';
  const active=apiFolders.find(f=>f.id===selected)||apiFolders[0];
  const group=getMovedApiGroup(active.groupKey);
  return `<section class="api-ref-hero">
    <span class="eyebrow">📗 API Reference</span>
    <h2>CONTACT CENTER / API Reference</h2>
    <p>Toàn bộ bài viết cũ đang hiển thị dạng API trong các mục OnCallCX, CCaaS, UC/PBX đã được chuyển về đây theo cấu trúc thư mục.</p>
    <div class="api-folder-tabs">
      ${apiFolders.map(f=>`<button class="${f.id===active.id?'active':''}" data-api-folder="${f.id}"><span>${f.icon}</span><b>${f.title}</b></button>`).join('')}
    </div>
  </section>
  <main class="api-ref-content full">
    <div class="breadcrumb">${active.title}</div>
    <div class="section-head"><div><h2>${active.title}</h2><p>${group?.apiFolder||active.title}</p></div></div>
    <div class="api-doc-list">${(group?.apiDocs||[]).map(v=>apiArticleCard(v,active.groupKey)).join('')}</div>
  </main>`;
}

/* ========= Other pages ========= */
function renderOverview(){
  return `${renderHero()}${renderStats()}<div class="section-head"><div><h2>Trang sản phẩm & tài liệu</h2><p>Product pages hiển thị dạng bài viết; bài viết kỹ thuật/API được gom vào API Reference.</p></div></div><div class="resource-grid"><div class="resource-card" data-go="oncallcx"><div class="icon">📞</div><div><h4>OnCallCX</h4><p>Trang sản phẩm dạng Wordpress cho khách hàng.</p></div></div><div class="resource-card" data-go="ccaas-vn"><div class="icon">🇻🇳</div><div><h4>CCaaS Việt Nam</h4><p>Bài viết sản phẩm đối tác nội địa.</p></div></div><div class="resource-card" data-go="ccaas-global"><div class="icon">☁️</div><div><h4>CCaaS Global</h4><p>Bài viết sản phẩm nền tảng quốc tế.</p></div></div><div class="resource-card" data-go="api-reference"><div class="icon">📗</div><div><h4>API Reference</h4><p>Thư mục chứa bài viết API đã di chuyển.</p></div></div></div>`;
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
  return `<section class="hero"><span class="eyebrow">🛡️ Vietnam Compliance</span><h2>Quy Định & Tuân Thủ Tại Việt Nam</h2><p>Các yêu cầu pháp lý, kỹ thuật khi triển khai UC/CCaaS tại thị trường Việt Nam.</p></section><div class="alert">⚠️ Lưu ý quan trọng: Tài liệu này cung cấp thông tin chung về quy định tại Việt Nam. Doanh nghiệp cần tham vấn pháp lý chuyên nghiệp trước khi triển khai.</div><div class="section-head"><div><h2>Danh sách bài viết tuân thủ</h2><p>Có thể thêm, sửa, xóa ngay trên frontend.</p></div><button class="btn btn-primary" data-add-compliance>+ Thêm bài viết</button></div><div class="compliance-grid" style="margin-top:18px">${cards.map(c=>`<div class="compliance-card ${c.type||''}"><h3>${c.icon} ${c.title}</h3><ul class="list">${(c.bullets||[]).map(b=>`<li>${b}</li>`).join('')}</ul><div class="card-actions"><button class="btn btn-soft" data-edit-compliance="${c.id}">Chỉnh sửa</button><button class="btn btn-danger" data-delete-compliance="${c.id}">Xóa</button></div></div>`).join('')}</div>`;
}
function renderResources(){
  return `<div class="section-head"><div><h2>Nguồn tài liệu & bộ công cụ</h2><p>Dành cho khách hàng, presales và đội triển khai.</p></div></div><div class="resource-grid">${resources.map(r=>`<div class="resource-card"><div class="icon">${r.icon}</div><div><h4>${r.title}</h4><p>${r.desc}</p></div></div>`).join('')}</div>`;
}
function renderEditor(){
  const items=allContentItems();
  const hashPayload=location.hash.includes('editor:')?location.hash.split('editor:')[1]:'';
  const isNew=hashPayload.startsWith('new:');
  const newBucket=isNew?hashPayload.split('new:')[1]:'general';
  const currentId=isNew?'':(hashPayload||items[0]?.id||'oncallcx');
  const item=isNew?createContentItem(newBucket):getContentItem(currentId);
  const apiText=(item.apis||[]).map(a=>a.join('|')).join('\n');
  return `<section class="hero editor-hero"><span class="eyebrow">✏️ Content Management</span><h2>Chỉnh sửa bài viết / card nội dung</h2><p>Khu vực này dùng cho bài viết chung. Bài viết sản phẩm đối tác dùng mục “Quản lý bài viết sản phẩm đối tác”.</p><div class="hero-actions"><button class="btn btn-primary" data-go="vendor-editor">Quản lý bài viết sản phẩm đối tác</button></div></section><div class="editor-layout"><aside class="editor-list"><h3>Danh sách bài viết</h3><button class="btn btn-primary full-btn" data-add-solution="general">+ Thêm bài viết mới</button>${items.map(x=>`<button class="editor-list-item ${x.id===currentId?'active':''}" data-editor-select="${x.id}"><span>${x.icon}</span><div><b>${x.title}</b><small>${x.type}</small></div></button>`).join('')}</aside><section class="editor-panel"><div class="editor-panel-head"><div><h3>Thông tin bài viết</h3><p>Đang chỉnh: <b>${item.title}</b></p></div><div class="editor-actions">${!isNew?`<button class="btn btn-danger" id="deleteEditor">Xóa bài viết</button>`:''}<button class="btn btn-soft" id="resetEditor">Khôi phục mặc định</button><button class="btn btn-primary" id="saveEditor">Lưu thay đổi</button></div></div><div class="editor-form"><label>Bucket/Page</label><input id="editBucket" value="${item.bucket||newBucket||''}"><label>Icon</label><input id="editIcon" value="${item.icon||''}"><label>Tiêu đề</label><input id="editTitle" value="${item.title||''}"><label>Loại / Subtitle</label><input id="editType" value="${item.type||''}"><label>Mô tả bài viết</label><textarea id="editDesc">${item.desc||''}</textarea><label>Tags</label><input id="editChips" value="${(item.chips||[]).join(', ')}"><label>Endpoints</label><textarea id="editApis">${apiText}</textarea></div><div class="section-head"><div><h2>Preview</h2></div></div><div class="solution-grid one-col">${solutionCard(item)}</div></section></div>`;
}
function renderVendorEditor(){
  const groupKeys=Object.keys(partnerProductCatalog);
  const payload=location.hash.includes('vendor-editor:')?location.hash.split('vendor-editor:')[1]:'';
  const unpacked=unpackVendorHash(payload);
  const groupKey=unpacked.groupKey||groupKeys[0];
  const productId=unpacked.vendorId||'';
  const group=getProductGroup(groupKey);
  const article=productId?getProductArticle(groupKey,productId):createProductArticle(groupKey);
  const tagText=(article.tags||[]).join(', ');
  const strengthText=(article.strengths||[]).join('\n');
  const usecaseText=(article.usecases||[]).join('\n');
  return `<section class="hero editor-hero"><span class="eyebrow">🧩 Product Article CRUD</span><h2>Thêm / sửa / xóa bài viết sản phẩm đối tác</h2><p>Các bài viết này là trang sản phẩm kiểu Wordpress. Bài viết API cũ đã được di chuyển sang API Reference.</p></section><div class="editor-layout"><aside class="editor-list"><h3>Nhóm sản phẩm</h3>${groupKeys.map(k=>`<button class="editor-list-item ${k===groupKey?'active':''}" data-product-group="${k}"><span>${partnerProductCatalog[k].products?.[0]?.icon||'📁'}</span><div><b>${partnerProductCatalog[k].title}</b><small>${getProductGroup(k).products.length} bài viết</small></div></button>`).join('')}<hr class="editor-sep"><h3>Bài viết trong nhóm</h3>${(group?.products||[]).map(v=>`<button class="editor-list-item ${v.id===article.id?'active':''}" data-product-select="${groupKey}|${v.id}"><span>${v.icon}</span><div><b>${v.name}</b><small>${v.category}</small></div></button>`).join('')}<button class="btn btn-primary full-btn" data-add-product="${groupKey}">+ Thêm bài viết mới</button></aside><section class="editor-panel"><div class="editor-panel-head"><div><h3>Form bài viết sản phẩm</h3><p>Nhóm: <b>${group?.productTitle||groupKey}</b></p></div><div class="editor-actions">${article.id?.startsWith('custom-product-')||productId?`<button class="btn btn-danger" id="deleteProductEditor">Xóa bài viết</button>`:''}<button class="btn btn-primary" id="saveProductEditor">Lưu bài viết</button></div></div><div class="editor-form"><label>Icon</label><input id="productIcon" value="${article.icon||''}"><label>Tên bài viết/card</label><input id="productName" value="${article.name||''}"><label>Category/Sub title</label><input id="productCategory" value="${article.category||''}"><label>Nguồn/tham chiếu</label><input id="productSource" value="${article.source||''}"><label>Tags</label><input id="productTags" value="${tagText}"><label>Mô tả sản phẩm</label><textarea id="productDesc">${article.desc||''}</textarea><label>Điểm nổi bật, mỗi dòng 1 ý</label><textarea id="productStrengths">${strengthText}</textarea><label>Use case, mỗi dòng 1 ý</label><textarea id="productUsecases">${usecaseText}</textarea><label>Link hiển thị</label><input id="productLink" value="${article.link||''}"></div><div class="section-head"><div><h2>Preview bài viết</h2></div></div><div class="partner-grid one-col">${productArticleCard(article,groupKey)}</div></section></div>`;
}


function renderOnCallCXOnly(){
  const group=getProductGroup('ccaas-vn');
  const item=(group.products||[]).find(p=>p.id==='prod-oncallcx-fpt'||/OncallCX|OnCallCX/i.test(p.name)) || (group.products||[])[0];
  const selected=item ? [item] : [];
  return `<section class="product-hero">
    <span class="eyebrow">📰 Product Articles</span>
    <h2>OncallCX</h2>
    <p>Trang này chỉ hiển thị duy nhất sản phẩm OncallCX của FPT. Các bài viết đối tác khác được tách sang mục CCaaS Việt Nam.</p>
    <div class="hero-actions">
      <button class="btn btn-primary" data-add-product="ccaas-vn">+ Thêm bài viết sản phẩm</button>
      <button class="btn btn-soft" data-go="api-reference">Xem API Reference</button>
    </div>
  </section>
  <div class="partner-grid">${selected.map(v=>productArticleCard(v,'ccaas-vn',true)).join('')}</div>`;
}




function renderOnCallCXPresentation(){
  const pdfPath='assets/presentation/oncallcx.pdf';

  return `<section class="presentation-hero">
    <div>
      <span class="eyebrow">📘 OncallCX Presentation</span>
      <h2>OncallCX - Contact Center As A Service</h2>
      <p>Presentation Center dạng PowerPoint: tự dùng version Current nếu đã upload trong Document Manager; nếu chưa có sẽ dùng file mặc định.</p>
    </div>
    <div class="presentation-actions">
      <button class="btn btn-soft" data-go="oncallcx-product-center">← Quay lại Product Center</button>
      <a class="btn btn-primary btn-link" href="${pdfPath}" target="_blank" rel="noopener" id="presentationOpenPdf">Mở PDF gốc</a>
      <a class="btn btn-soft btn-link" href="${pdfPath}" download id="presentationDownloadPdf">Download PDF</a>
    </div>
  </section>

  <section class="present-layout ppt-style" data-total-pages="0">
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

async function bindOnCallCXPresentation(){
  const layout=$('.present-layout');
  if(!layout)return;

  const currentDoc=await ocxGetCurrentDoc();
  let pages=[];
  let pdfUrl='assets/presentation/oncallcx.pdf';

  if(currentDoc?.pages?.length){
    pages=currentDoc.pages;
    pdfUrl=await ocxGetDocUrl(currentDoc);
  }else{
    pages=Array.from({length:49},(_,i)=>({
      title:`Slide ${i+1}`,
      image:`assets/presentation/oncallcx-pages/page-${String(i+1).padStart(2,'0')}.jpg`
    }));
  }

  const total=pages.length;
  layout.dataset.totalPages=String(total);
  $('#presentPageTotal').textContent=total;
  $('#presentTotalText').textContent=`${total} trang`;
  $('#presentationOpenPdf').href=pdfUrl;
  $('#presentationDownloadPdf').href=pdfUrl;
  if(currentDoc?.fileName)$('#presentationDownloadPdf').download=currentDoc.fileName;

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






function renderOnCallCXProductCenter(){
  const pdfPath='assets/presentation/oncallcx.pdf';
  return `<section class="ocx-product-hero">
    <div>
      <span class="eyebrow">📦 Product Center</span>
      <h2>OncallCX - Contact Center As A Service</h2>
      <p>Trung tâm nội dung sản phẩm OnCallCX. Khu vực này chỉ áp dụng cho sidebar OnCallCX, không ảnh hưởng các module khác.</p>
    </div>
    <div class="presentation-actions">
      <button class="btn btn-soft" data-go="oncallcx">← Quay lại OnCallCX</button>
      <button class="btn btn-primary" data-ocx-tab="presentation">Xem Presentation</button>
    </div>
  </section>

  <section class="ocx-product-layout">
    <aside class="ocx-product-menu">
      <button class="active" data-ocx-tab="overview">📑 Overview</button>
      <button data-ocx-tab="presentation">📘 Presentation</button>
      <button data-ocx-tab="demo">🎬 Demo Video</button>
      <button data-ocx-tab="datasheet">📄 Datasheet</button>
      <button data-ocx-tab="api">📚 API Reference</button>
      <button data-ocx-tab="case-study">💬 Case Study</button>
      <button data-ocx-tab="downloads">⬇ Download</button>
      <button data-ocx-tab="documents">🗂️ Document Manager</button>
      <button data-ocx-tab="version-control">🧬 Version Control</button>
      <button data-ocx-tab="admin-upload">🛠️ Admin Upload</button>
      <button data-ocx-tab="history">🕘 History</button>
      <button data-ocx-tab="search">🔎 Search</button>
      <button data-ocx-tab="architecture">🏗️ Architecture</button>
      <button data-ocx-tab="pricing">💰 Pricing</button>
      <button data-ocx-tab="faq">❓ FAQ</button>
      <button data-ocx-tab="presales">✅ Presales Checklist</button>
      <button data-ocx-tab="release-notes">🧾 Release Notes</button>
    </aside>

    <main class="ocx-product-content">
      <div class="ocx-panel active" id="ocx-overview">
        <h3>Overview</h3>
        <p>OncallCX là nền tảng Contact Center as a Service do FPT Telecom phát triển, hỗ trợ doanh nghiệp triển khai tổng đài chăm sóc khách hàng trên Cloud, mở rộng linh hoạt và tích hợp với CRM, ERP, AI Bot, REST API và Webhook.</p>
        <div class="ocx-feature-grid">
          <span>✓ Omnichannel Contact Center</span>
          <span>✓ Voice / Chat / Email / Social</span>
          <span>✓ AI Voicebot & Chatbot</span>
          <span>✓ Call Recording</span>
          <span>✓ Dashboard & Realtime Report</span>
          <span>✓ CRM / ERP Integration</span>
          <span>✓ Workflow Automation</span>
          <span>✓ Open REST API & Webhook</span>
        </div>
      </div>

      <div class="ocx-panel" id="ocx-presentation">
        <h3>Presentation</h3>
        <p>Xem tài liệu trình chiếu OnCallCX trực tiếp trên Portal.</p>
        <div class="ocx-action-row">
          <button class="btn btn-primary" data-go="presentation-oncallcx">Mở Presentation Center</button>
          <a class="btn btn-soft btn-link" href="${pdfPath}" download>Download PDF</a>
        </div>
        <iframe class="ocx-pdf-preview" src="${pdfPath}#toolbar=1&navpanes=0"></iframe>
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
        <p>Tạm thời sử dụng file PDF presentation hiện tại như datasheet. Phase sau sẽ tách riêng upload Datasheet.</p>
        <div class="ocx-action-row">
          <a class="btn btn-primary btn-link" href="${pdfPath}" target="_blank" rel="noopener">Mở Datasheet</a>
          <a class="btn btn-soft btn-link" href="${pdfPath}" download>Download</a>
        </div>
      </div>

      <div class="ocx-panel" id="ocx-api">
        <h3>API Reference</h3>
        <p>Chuyển sang khu API Reference để xem tài liệu kỹ thuật/API đã được gom theo thư mục.</p>
        <button class="btn btn-primary" data-go="api-reference">Mở API Reference</button>
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
        <div class="ocx-download-card">
          <div>
            <b>OnCallCX Presentation</b>
            <small>PDF · Current version</small>
          </div>
          <a class="btn btn-primary btn-link" href="${pdfPath}" download>Download</a>
        </div>
      </div>


      <div class="ocx-panel" id="ocx-documents">
        <h3>Document Manager</h3>
        <p>Upload và quản lý các phiên bản Presentation của OnCallCX. File cũ được lưu lại trong trình duyệt để xem lại, tải xuống hoặc restore.</p>
        <div id="ocxDocumentManagerRoot" class="ocx-doc-manager"></div>
        <div class="ocx-doc-preview">
          <div class="ocx-doc-preview-head">
            <strong id="ocxDocPreviewTitle">Preview</strong>
            <small>PDF preview từ file đã upload</small>
          </div>
          <iframe id="ocxDocPreviewFrame" class="ocx-doc-preview-frame"></iframe>
        </div>
      </div>


      <div class="ocx-panel" id="ocx-version-control">
        <h3>Version Control</h3>
        <p>Quản lý vòng đời các phiên bản Presentation: Current, Restore, Archive, Note và Delete.</p>
        <div id="ocxVersionControlRoot" class="ocx-version-control-root"></div>
      </div>


      <div class="ocx-panel" id="ocx-admin-upload">
        <h3>Admin Upload</h3>
        <p>Upload và quản lý nhiều loại tài liệu cho OnCallCX. Đây là bước mở rộng từ Document Manager sang Product Library.</p>
        <div id="ocxAdminUploadRoot"></div>
      </div>


      <div class="ocx-panel" id="ocx-history">
        <h3>History</h3>
        <p>Lịch sử toàn bộ tài liệu OnCallCX đã upload, có thể lọc theo loại tài liệu và restore Presentation cũ.</p>
        <div id="ocxHistoryRoot" class="ocx-history-root"></div>
      </div>


      <div class="ocx-panel" id="ocx-search">
        <h3>Search</h3>
        <p>Tìm kiếm toàn bộ tài liệu đã upload trong OnCallCX Product Center.</p>
        <div id="ocxSearchRoot" class="ocx-search-root"></div>
      </div>


      <div class="ocx-panel" id="ocx-architecture">
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
      </div>

      <div class="ocx-panel" id="ocx-pricing">
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

      <div class="ocx-panel" id="ocx-presales">
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

      <div class="ocx-panel" id="ocx-release-notes">
        <h3>Release Notes</h3>
        <div class="ocx-release-list">
          <div><b>v9.1.0</b><span>Nâng Product Center thành Product Portal với Architecture, Pricing, FAQ, Presales Checklist.</span></div><div><b>v9.0.8</b><span>Thêm Search Center tìm kiếm tài liệu OnCallCX.</span></div><div><b>v9.0.7</b><span>Thêm History Center lọc và xem lại tài liệu.</span></div><div><b>v9.0.6</b><span>Thêm Admin Upload cho nhiều loại tài liệu.</span></div><div><b>v9.0.5</b><span>Tự sinh thumbnail/slide từ PDF upload.</span></div><div><b>v9.0.4</b><span>Thêm Version Control dashboard, archive, note và set current.</span></div><div><b>v9.0.3</b><span>Thêm Document Manager upload/restore/version history.</span></div><div><b>v9.0.2</b><span>Thêm Presentation Center dạng PowerPoint.</span></div><div><b>v9.0.1</b><span>Thêm Product Center cho OnCallCX.</span></div>
          <div><b>v8.3</b><span>OnCallCX Presentation PDF viewer.</span></div>
        </div>
      </div>
    </main>
  </section>`;
}

function bindOnCallCXProductCenter(){
  const tabs=$$('[data-ocx-tab]');
  if(!tabs.length)return;
  if($('#ocx-documents')?.classList.contains('active'))ocxRenderDocumentManager();
  if($('#ocx-version-control')?.classList.contains('active'))ocxRenderVersionControl();
  if($('#ocx-admin-upload')?.classList.contains('active'))ocxRenderAdminUpload();
  if($('#ocx-history')?.classList.contains('active'))ocxRenderHistoryCenter();
  if($('#ocx-search')?.classList.contains('active'))ocxRenderSearchCenter();
  tabs.forEach(btn=>{
    btn.onclick=()=>{
      const tab=btn.dataset.ocxTab;
      tabs.forEach(x=>x.classList.remove('active'));
      $$(`[data-ocx-tab="${tab}"]`).forEach(x=>x.classList.add('active'));
      $$('.ocx-panel').forEach(panel=>panel.classList.remove('active'));
      const panel=$('#ocx-'+tab);
      if(panel)panel.classList.add('active');
      if(tab==='documents')ocxRenderDocumentManager();
      if(tab==='version-control')ocxRenderVersionControl();
      if(tab==='admin-upload')ocxRenderAdminUpload();
      if(tab==='history')ocxRenderHistoryCenter();
      if(tab==='search')ocxRenderSearchCenter();
    };
  });
}


function renderPage(p){
  if(p==='overview')return renderOverview();
  if(p==='demo')return renderDemo();
  if(p==='compare')return renderCompare();
  if(p==='compliance')return renderCompliance();
  if(p==='resources')return renderResources();
  if(p==='editor')return renderEditor();
  if(p==='vendor-editor')return renderVendorEditor();
  if(p==='oncallcx')return renderOnCallCXOnly();
  if(p==='oncallcx-product-center')return renderOnCallCXProductCenter();
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
  $$('.nav-item').forEach(a=>a.classList.toggle('active',a.dataset.page===p));
  const [t,s]=titles[p]||titles.overview;
  $('#pageTitle').textContent=t;
  $('#pageSubtitle').textContent=s;
  $('#pageRoot').innerHTML=renderPage(p);
  bindPage();
  window.scrollTo({top:0,behavior:'smooth'});
}
function bindPage(){
  $$('[data-go]').forEach(b=>b.onclick=()=>navigate(b.dataset.go));
  $$('[data-solution]').forEach(c=>c.onclick=()=>toast('Mở chi tiết: '+c.dataset.solution));
  $$('[data-edit-id]').forEach(b=>b.onclick=(e)=>{e.preventDefault();e.stopPropagation();location.hash='editor:'+b.dataset.editId;navigate('editor')});
  $$('[data-editor-select]').forEach(b=>b.onclick=()=>{location.hash='editor:'+b.dataset.editorSelect;navigate('editor')});
  $$('[data-add-solution]').forEach(b=>b.onclick=()=>{location.hash='editor:new:'+b.dataset.addSolution;navigate('editor')});
  $$('[data-delete-solution]').forEach(b=>b.onclick=(e)=>{e.preventDefault();e.stopPropagation();if(confirm('Xóa bài viết/card này?')){deleteContentItem(b.dataset.deleteSolution);toast('Đã xóa bài viết.');navigate(state.page)}});

  $$('[data-add-product]').forEach(b=>b.onclick=(e)=>{e.preventDefault();e.stopPropagation();location.hash='vendor-editor:'+packVendorHash(b.dataset.addProduct,'');navigate('vendor-editor')});
  $$('[data-edit-product]').forEach(b=>b.onclick=(e)=>{e.preventDefault();e.stopPropagation();const [g,id]=b.dataset.editProduct.split('|');location.hash='vendor-editor:'+packVendorHash(g,id);navigate('vendor-editor')});
  $$('[data-delete-product]').forEach(b=>b.onclick=(e)=>{e.preventDefault();e.stopPropagation();const [g,id]=b.dataset.deleteProduct.split('|');if(confirm('Xóa bài viết sản phẩm này?')){deleteProductArticle(g,id);toast('Đã xóa bài viết.');navigate(groupKeyToPage(g))}});
  $$('[data-product-group]').forEach(b=>b.onclick=()=>{location.hash='vendor-editor:'+packVendorHash(b.dataset.productGroup,'');navigate('vendor-editor')});
  $$('[data-product-select]').forEach(b=>b.onclick=()=>{const [g,id]=b.dataset.productSelect.split('|');location.hash='vendor-editor:'+packVendorHash(g,id);navigate('vendor-editor')});
  $$('[data-api-folder]').forEach(b=>b.onclick=()=>{location.hash='api-folder:'+b.dataset.apiFolder;navigate('api-reference')});

  const saveProduct=$('#saveProductEditor');
  if(saveProduct)saveProduct.onclick=()=>{
    const payload=location.hash.includes('vendor-editor:')?location.hash.split('vendor-editor:')[1]:'';
    const unpacked=unpackVendorHash(payload);
    const groupKey=unpacked.groupKey||Object.keys(partnerProductCatalog)[0];
    const productId=unpacked.vendorId||createProductArticle(groupKey).id;
    const article={id:productId,icon:$('#productIcon').value||'📝',name:$('#productName').value||'Bài viết sản phẩm mới',category:$('#productCategory').value||'Sản phẩm / Đối tác',source:$('#productSource').value||'',tags:$('#productTags').value.split(',').map(x=>x.trim()).filter(Boolean),desc:$('#productDesc').value,strengths:$('#productStrengths').value.split('\n').map(x=>x.trim()).filter(Boolean),usecases:$('#productUsecases').value.split('\n').map(x=>x.trim()).filter(Boolean),link:$('#productLink').value||''};
    upsertProductArticle(groupKey,article);
    toast('Đã lưu bài viết sản phẩm.');
    location.hash='vendor-editor:'+packVendorHash(groupKey,article.id);
    navigate('vendor-editor');
  };
  const delProduct=$('#deleteProductEditor');
  if(delProduct)delProduct.onclick=()=>{const payload=location.hash.split('vendor-editor:')[1]||'';const unpacked=unpackVendorHash(payload);if(unpacked.vendorId&&confirm('Xóa bài viết sản phẩm này?')){deleteProductArticle(unpacked.groupKey,unpacked.vendorId);toast('Đã xóa bài viết.');location.hash='vendor-editor:'+packVendorHash(unpacked.groupKey,'');navigate('vendor-editor')}};

  const save=$('#saveEditor');
  if(save)save.onclick=()=>{
    const hashPayload=location.hash.includes('editor:')?location.hash.split('editor:')[1]:'';
    const isNew=hashPayload.startsWith('new:');
    const existingId=isNew?'':(hashPayload||'oncallcx');
    const id=isNew?'custom-solution-'+Date.now():existingId;
    const apis=$('#editApis').value.split('\n').map(x=>x.trim()).filter(Boolean).map(x=>{const p=x.split('|');return [p[0]||'GET',p[1]||'/api',p.slice(2).join('|')||'Mô tả']});
    updateContentItem(id,{bucket:$('#editBucket').value||'general',icon:$('#editIcon').value,title:$('#editTitle').value,type:$('#editType').value,desc:$('#editDesc').value,chips:$('#editChips').value.split(',').map(x=>x.trim()).filter(Boolean),apis});
    toast('Đã lưu nội dung bài viết vào LocalStorage.');
    location.hash='editor:'+id;
    navigate('editor');
  };
  const delEditor=$('#deleteEditor');
  if(delEditor)delEditor.onclick=()=>{const id=location.hash.includes('editor:')?location.hash.split('editor:')[1]:'';if(id&&confirm('Xóa bài viết này?')){deleteContentItem(id);toast('Đã xóa bài viết.');location.hash='editor';navigate('editor')}};
  const reset=$('#resetEditor');
  if(reset)reset.onclick=()=>{const id=location.hash.includes('editor:')?location.hash.split('editor:')[1]:'oncallcx';resetContentItem(id);toast('Đã khôi phục nội dung mặc định.');navigate('editor')};

  $$('[data-add-compliance]').forEach(b=>b.onclick=()=>{const card=promptComplianceCard();if(card){upsertComplianceCard(card);toast('Đã thêm bài viết tuân thủ.');navigate('compliance')}});
  $$('[data-edit-compliance]').forEach(b=>b.onclick=()=>{const card=getComplianceCards().find(x=>x.id===b.dataset.editCompliance);const next=promptComplianceCard(card);if(next){upsertComplianceCard(next);toast('Đã cập nhật bài viết tuân thủ.');navigate('compliance')}});
  $$('[data-delete-compliance]').forEach(b=>b.onclick=()=>{if(confirm('Xóa bài viết tuân thủ này?')){deleteComplianceCard(b.dataset.deleteCompliance);toast('Đã xóa bài viết tuân thủ.');navigate('compliance')}});

  $$('[data-demo-step]').forEach(s=>s.onclick=()=>{state.demoStep=Number(s.dataset.demoStep);navigate('demo')});
  const n=$('#nextDemo');if(n)n.onclick=()=>{state.demoStep=(state.demoStep+1)%4;navigate('demo')};
  bindOnCallCXProductCenter();
  bindOnCallCXPresentation();
}
function bindGlobal(){
  $$('[data-page]').forEach(a=>a.onclick=e=>{e.preventDefault();navigate(a.dataset.page);$('#sidebar').classList.remove('open')});
  $$('[data-toggle-group]').forEach(b=>b.onclick=()=>b.closest('.nav-group').classList.toggle('expanded'));
  $('#mobileMenu').onclick=()=>$('#sidebar').classList.toggle('open');
  $('#themeToggle').onclick=()=>{document.documentElement.dataset.theme=document.documentElement.dataset.theme==='light'?'dark':'light'};
  $('#globalSearch').oninput=e=>{const q=e.target.value.toLowerCase().trim();if(!q)return;const f=allContentItems().find(s=>[s.title,s.type,s.desc,(s.chips||[]).join(' ')].join(' ').toLowerCase().includes(q));if(f)navigate(f.id)};
  $('#loginForm').onsubmit=e=>{e.preventDefault();login($('#loginEmail').value)};
  $('#logoutBtn').onclick=logout;
}
window.addEventListener('hashchange',()=>{const p=resolvePageFromHash();if(p!==state.page)navigate(p)});
initAuth();bindGlobal();navigate(state.page);
