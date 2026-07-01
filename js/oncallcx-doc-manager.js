/* ========= OnCallCX Document Manager (tách từ main.js) =========
   Module quản lý tài liệu OnCallCX qua IndexedDB: upload, version control,
   admin library, history, search. Tách riêng ngày 2026-07-01 để giảm kích
   thước main.js (God file 2245 dòng -> tách theo ranh giới chức năng sẵn có
   trong code gốc, không đổi logic bên trong).
   Phụ thuộc: $, $$, toast được export từ main.js.
*/
import { $, $$, toast } from './main.js';

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
export async function ocxGetCurrentDoc(){
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
export async function ocxGetDocUrl(record){
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

