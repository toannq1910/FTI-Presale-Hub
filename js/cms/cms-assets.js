/* v9.7.0 Product Asset Binding */
import { $, $$, esc, toast, loadCms } from './cms-core.js';

const DB = 'fti_unified_asset_manager_v1';
const STORE = 'assets';

export const ASSET_TYPES = {
  presentation:'Presentation',
  userGuide:'User Guide',
  datasheet:'Datasheet',
  video:'Demo Video',
  image:'Image',
  logo:'Logo',
  api:'API Spec',
  caseStudy:'Case Study',
  other:'Other'
};

export function assetTypeLabel(t){ return ASSET_TYPES[t] || t || 'Asset'; }

export function assetAccept(t){
  if(t === 'presentation') return 'application/pdf,.pdf,application/vnd.ms-powerpoint,.ppt,application/vnd.openxmlformats-officedocument.presentationml.presentation,.pptx';
  if(t === 'userGuide' || t === 'datasheet' || t === 'caseStudy') return 'application/pdf,.pdf';
  if(t === 'video') return 'video/mp4,video/webm,.mp4,.webm';
  if(t === 'image' || t === 'logo') return 'image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp';
  if(t === 'api') return 'application/json,.json,.yaml,.yml';
  return 'application/pdf,.pdf';
}

export function formatBytes(bytes){
  if(!bytes) return '0 B';
  const u = ['B','KB','MB','GB'];
  let s = bytes, i = 0;
  while(s >= 1024 && i < u.length - 1){ s /= 1024; i++; }
  return `${s.toFixed(s >= 10 || i === 0 ? 0 : 1)} ${u[i]}`;
}

function loadScriptOnce(src, marker){
  return new Promise((resolve,reject)=>{
    if(marker()) return resolve();
    const existing = document.querySelector(`script[src="${src}"]`);
    if(existing){
      existing.addEventListener('load', resolve);
      existing.addEventListener('error', reject);
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error(`Không tải được thư viện: ${src}`));
    document.head.appendChild(s);
  });
}

async function loadPdfJs(){
  await loadScriptOnce(
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
    () => Boolean(window.pdfjsLib)
  );
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  return window.pdfjsLib;
}

async function generatePdfPages(file,{maxWidth=1200,thumbWidth=260}={}){
  const pdfjs = await loadPdfJs();
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({data:buffer}).promise;
  const pages = [];
  let thumbnail = '';
  for(let i = 1; i <= pdf.numPages; i++){
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({scale:1});
    const scale = maxWidth / viewport.width;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const scaled = page.getViewport({scale});
    canvas.width = Math.floor(scaled.width);
    canvas.height = Math.floor(scaled.height);
    await page.render({canvasContext:ctx,viewport:scaled}).promise;
    const image = canvas.toDataURL('image/jpeg',0.82);
    pages.push({title:`Slide ${i}`,image});
    if(i === 1){
      const thumbScale = thumbWidth / viewport.width;
      const thumbCanvas = document.createElement('canvas');
      const thumbCtx = thumbCanvas.getContext('2d');
      const thumbVp = page.getViewport({scale:thumbScale});
      thumbCanvas.width = Math.floor(thumbVp.width);
      thumbCanvas.height = Math.floor(thumbVp.height);
      await page.render({canvasContext:thumbCtx,viewport:thumbVp}).promise;
      thumbnail = thumbCanvas.toDataURL('image/jpeg',0.76);
    }
  }
  return {pages,thumbnail,pageCount:pdf.numPages,generatedAt:new Date().toISOString(),renderSource:'pdf'};
}

export async function generatePresentationPages(file,opts={}){
  const fileName = opts.fileName || file?.name || '';
  try{
    if((file.type || '').includes('pdf') || /\.pdf$/i.test(fileName)) return await generatePdfPages(file,opts);
    if(/\.(ppt|pptx)$/i.test(fileName) || /powerpoint|presentation/i.test(file.type || '')){
      return {pages:[],thumbnail:'',pageCount:0,error:'PPTX cần được export sang PDF để render slide chính xác.'};
    }
    return {pages:[],thumbnail:'',pageCount:0,error:'Định dạng này chưa hỗ trợ render slide.'};
  }catch(err){
    console.warn('Presentation render failed:',err);
    return {pages:[],thumbnail:'',pageCount:0,error:String(err?.message || err)};
  }
}

function openDb(){
  return new Promise((resolve,reject)=>{
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if(!db.objectStoreNames.contains(STORE)){
        db.createObjectStore(STORE, {keyPath:'id'});
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function assetPut(record){
  const db = await openDb();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    tx.oncomplete = () => resolve(record);
    tx.onerror = () => reject(tx.error);

    if(record.replacesOfficialAssetId || record.replacementSlot){
      const existing = store.getAll();
      existing.onsuccess = () => {
        (existing.result || []).forEach(asset => {
          if(asset.id === record.id) return;
          const sameOfficial = record.replacesOfficialAssetId && asset.replacesOfficialAssetId === record.replacesOfficialAssetId;
          const sameSlot = record.replacementSlot && asset.replacementSlot === record.replacementSlot;
          if(sameOfficial || sameSlot) store.delete(asset.id);
        });
        store.put(record);
      };
      existing.onerror = () => reject(existing.error);
      return;
    }

    store.put(record);
  });
}

export async function assetGet(id){
  const db = await openDb();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve(req.result || OFFICIAL_ASSETS.find(asset => asset.id === id));
    req.onerror = () => reject(req.error);
  });
}

export async function assetDelete(id){
  if(OFFICIAL_ASSETS.some(asset => asset.id === id)) return false;
  const db = await openDb();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(STORE, 'readwrite');
    const req = tx.objectStore(STORE).delete(id);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

export async function allAssets(){
  try{
    const db = await openDb();
    return new Promise((resolve,reject)=>{
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => resolve(mergeOfficialAssets(req.result || []));
      req.onerror = () => reject(req.error);
    });
  }catch(err){
    console.warn('Asset database is unavailable. Falling back to official assets.', err);
    return mergeOfficialAssets([]);
  }
}

let lastObjectUrl = null;
export function assetObjectUrl(record){
  if(record?.url) return record.url;
  if(lastObjectUrl) URL.revokeObjectURL(lastObjectUrl);
  if(!record?.blob) return '';
  lastObjectUrl = URL.createObjectURL(record.blob);
  return lastObjectUrl;
}

export function assetIcon(t){
  return ({
    presentation:'📘',
    userGuide:'📖',
    datasheet:'📄',
    video:'🎬',
    image:'🖼️',
    logo:'🏷️',
    api:'📚',
    caseStudy:'💬',
    other:'📎'
  }[t] || '📎');
}

const ASSET_PRODUCT_SHORTCUTS = [
  {id:'oncallcx', title:'OnCallCX CCaaS'},
  {id:'prod-oncallcx-ucaas-inherited', title:'OnCallCX UCaaS'}
];

const OFFICIAL_ASSETS = [
  {
    id: 'official-oncallcx-ccaas-presentation',
    replacementSlot: 'oncallcx-ccaas-presentation',
    product: 'oncallcx',
    type: 'presentation',
    title: 'OnCallCX CCaaS Presentation',
    description: 'Presentation mặc định cho OnCallCX CCaaS / Contact Center as a Service.',
    fileName: 'oncallcx.pdf',
    mimeType: 'application/pdf',
    size: 10491577,
    createdAt: '2026-07-01T00:00:02.000Z',
    url: 'assets/presentation/oncallcx.pdf',
    official: true
  },
  {
    id: 'official-oncallcx-ucaas-presentation',
    replacementSlot: 'oncallcx-ucaas-presentation',
    product: 'prod-oncallcx-ucaas-inherited',
    type: 'presentation',
    title: 'OnCallCX UCaaS Presentation',
    description: 'Presentation mặc định cho OnCallCX UCaaS / Cloud PBX Platform.',
    fileName: 'oncallcx-ucaas.pdf',
    mimeType: 'application/pdf',
    size: 2096171,
    createdAt: '2026-07-01T00:00:03.000Z',
    url: 'assets/presentation/oncallcx-ucaas.pdf',
    official: true
  },
  {
    id: 'official-oncallcx-ccaas-user-guide-outbound-2025',
    replacementSlot: 'oncallcx-ccaas-user-guide-outbound',
    product: 'oncallcx',
    type: 'userGuide',
    title: 'OnCallCX User Guide - Outbound 2025',
    description: 'Tài liệu hướng dẫn sử dụng luồng gọi ra, chiến dịch, danh sách khách hàng, agent và báo cáo Outbound.',
    fileName: 'OnCallCX-UserGuide-Outbound-2025.pdf',
    mimeType: 'application/pdf',
    size: 3773236,
    createdAt: '2026-07-01T00:00:00.000Z',
    url: 'assets/user-guide/oncallcx/OnCallCX-UserGuide-Outbound-2025.pdf',
    official: true
  },
  {
    id: 'official-oncallcx-ccaas-user-guide-inbound-2025',
    replacementSlot: 'oncallcx-ccaas-user-guide-inbound',
    product: 'oncallcx',
    type: 'userGuide',
    title: 'OnCallCX User Guide - Inbound 2025',
    description: 'Tài liệu hướng dẫn cấu hình và vận hành tiếp nhận cuộc gọi, IVR, hàng đợi, agent, ticket, SLA và báo cáo Inbound.',
    fileName: 'OnCallCX-UserGuide-Inbound-2025.pdf',
    mimeType: 'application/pdf',
    size: 5050550,
    createdAt: '2026-07-01T00:00:01.000Z',
    url: 'assets/user-guide/oncallcx/OnCallCX-UserGuide-Inbound-2025.pdf',
    official: true
  }
];

function mergeOfficialAssets(records = []){
  const map = new Map();
  const replacedOfficialIds = new Set(records.map(asset => asset.replacesOfficialAssetId).filter(Boolean));
  const replacedSlots = new Set(records.map(asset => asset.replacementSlot).filter(Boolean));
  OFFICIAL_ASSETS.forEach(asset => {
    if(replacedOfficialIds.has(asset.id)) return;
    if(asset.replacementSlot && replacedSlots.has(asset.replacementSlot)) return;
    map.set(asset.id, asset);
  });
  records.forEach(asset => map.set(asset.id, asset));
  return Array.from(map.values());
}

function productOptions(data, selected = 'oncallcx'){
  const products = data?.products || [];
  const byId = new Map();
  ASSET_PRODUCT_SHORTCUTS.forEach(p => byId.set(p.id, p));
  products.forEach(p => byId.set(p.id, {id:p.id, title:p.title || p.id}));
  if(!byId.size) byId.set('oncallcx', {id:'oncallcx', title:'OnCallCX'});
  return Array.from(byId.values()).map(p => `<option value="${esc(p.id)}" ${p.id === selected ? 'selected' : ''}>${esc(p.title || p.id)}</option>`).join('');
}

export function renderAssetManager(data = null, description = ''){
  return `<section class="cms-asset-hero">
    <div>
      <span class="eyebrow">📂 Product Asset Manager</span>
      <h2>Quản lý tài liệu theo sản phẩm</h2>
      <p>${esc(description || 'Upload và gắn file theo sản phẩm: Presentation, User Guide, Datasheet, Demo Video, Image, API Spec, Case Study.')}</p>
    </div>
  </section>

  <section class="asset-guide">
    <div>
      <b>Upload file Presentation / User Guide / Datasheet ở đâu?</b>
      <p>Upload tại tab này. Chọn đúng sản phẩm, chọn <code>Loại asset</code> phù hợp, sau đó chọn file cần gắn cho bài viết.</p>
    </div>
    <div class="asset-guide-grid">
      <span><b>OnCallCX CCaaS</b><small>Chọn sản phẩm: OnCallCX CCaaS / OnCallCX</small></span>
      <span><b>OnCallCX UCaaS</b><small>Chọn sản phẩm: OnCallCX UCaaS</small></span>
      <span><b>User Guide</b><small>Chọn Loại asset = User Guide. Product Center sẽ tự hiển thị ở tab User Guide.</small></span>
      <span><b>Lưu ý publish</b><small>Upload trong CMS lưu ở trình duyệt hiện tại. Khi xuất bản static, vẫn cần đưa file thật vào thư mục assets hoặc dùng file export.</small></span>
    </div>
  </section>

  <section class="asset-layout">
    <aside class="asset-upload-card">
      <h3>Upload Asset</h3>
      <label>Gắn vào sản phẩm</label>
      <select id="assetProduct">${productOptions(data)}</select>

      <label>Loại asset</label>
      <select id="assetType">${Object.entries(ASSET_TYPES).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select>

      <label>File</label>
      <input type="file" id="assetFile" accept="${assetAccept('presentation')}">

      <label>Title</label>
      <input id="assetTitle" placeholder="Tên hiển thị">

      <label>Description</label>
      <textarea id="assetDescription" placeholder="Mô tả ngắn"></textarea>

      <input type="hidden" id="assetReplaceOfficialId">
      <input type="hidden" id="assetReplacementSlot">
      <div id="assetReplaceNotice" class="asset-replace-notice" hidden></div>

      <button class="btn btn-primary" id="assetUploadBtn">Upload & Link Asset</button>
      <small>Lưu ở IndexedDB trình duyệt. Gắn asset theo Product ID để hiển thị ở trang chi tiết.</small>
    </aside>

    <main class="asset-main">
      <div class="asset-toolbar">
        <input id="assetSearch" placeholder="Tìm asset...">
        <select id="assetFilter">
          <option value="all">All types</option>
          ${Object.entries(ASSET_TYPES).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}
        </select>
        <select id="assetProductFilter">
          <option value="all">All products</option>
          ${productOptions(data, '')}
        </select>
        <button class="btn btn-soft" id="assetRefresh">Refresh</button>
      </div>

      <div id="assetList" class="asset-list"></div>

      <div class="asset-preview">
        <div class="asset-preview-head">
          <strong id="assetPreviewTitle">Preview</strong>
          <small>Chọn một asset để xem trước</small>
        </div>
        <div id="assetPreviewBody" class="asset-preview-body"></div>
      </div>
    </main>
  </section>`;
}

export async function renderAssetList(){
  const root = $('#assetList');
  if(!root) return;

  const q = ($('#assetSearch')?.value || '').toLowerCase().trim();
  const typeFilter = $('#assetFilter')?.value || 'all';
  const productFilter = $('#assetProductFilter')?.value || 'all';

  const assets = mergeOfficialAssets(await allAssets())
    .sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)))
    .filter(a => typeFilter === 'all' || a.type === typeFilter)
    .filter(a => productFilter === 'all' || a.product === productFilter)
    .filter(a => !q || [a.title,a.description,a.fileName,a.product,assetTypeLabel(a.type)].join(' ').toLowerCase().includes(q));

  root.innerHTML = assets.length ? assets.map(a => `<article class="asset-item">
    <div class="asset-icon">${assetIcon(a.type)}</div>
    <div class="asset-info">
      <b>${esc(a.title)}</b>
      <span>${esc(assetTypeLabel(a.type))} · ${esc(a.fileName)} · ${formatBytes(a.size)}${a.official ? ' · Mặc định' : ''}</span>
      <small>Product: <code>${esc(a.product || 'oncallcx')}</code> · ${new Date(a.createdAt).toLocaleString('vi-VN')}</small>
      ${a.description ? `<em>${esc(a.description)}</em>` : ''}
    </div>
    <div class="asset-actions">
      <button class="btn btn-soft" data-asset-view="${a.id}">Xem</button>
      <button class="btn btn-soft" data-asset-download="${a.id}">Tải</button>
      ${a.official ? `<button class="btn btn-soft" data-asset-replace="${a.id}">Thay thế</button><span class="auth-badge">Mặc định</span>` : `<button class="btn btn-danger" data-asset-delete="${a.id}">Xóa</button>`}
    </div>
  </article>`).join('') : `<div class="cms-empty-state">Chưa có asset nào.</div>`;

  bindAssetActions();
}

function previewMarkup(record,u){
  if(Array.isArray(record.pages) && record.pages.length){
    return `<div class="asset-rendered-preview">
      <img class="asset-preview-img" src="${record.pages[0].image}" alt="${esc(record.pages[0].title || record.title)}">
      <p>Đã render ${record.pages.length} slide. Mở trang Presentation để xem đầy đủ dạng trình chiếu.</p>
    </div>`;
  }
  if(record.mimeType?.startsWith('image/')) return `<img class="asset-preview-img" src="${u}" alt="${esc(record.title)}">`;
  if(record.mimeType?.startsWith('video/')) return `<video class="asset-preview-video" src="${u}" controls></video>`;
  if(record.mimeType === 'application/pdf' || record.fileName.toLowerCase().endsWith('.pdf')) return `<iframe class="asset-preview-frame" src="${u}"></iframe>`;
  if(/\.(ppt|pptx)$/i.test(record.fileName || '') || /powerpoint|presentation/i.test(record.mimeType || '')){
    return `<div class="asset-code-note asset-powerpoint-note">
      <b>File PowerPoint đã được upload và gắn vào sản phẩm.</b>
      <p>Để trình chiếu đẹp và đúng layout trong portal, hãy export PPTX sang PDF rồi upload bản PDF. File PPTX vẫn được lưu để tải xuống/chỉnh sửa nguồn.</p>
      <a class="btn btn-primary btn-link" href="${u}" download="${esc(record.fileName || 'presentation.pptx')}">Tải PowerPoint</a>
    </div>`;
  }
  return `<div class="asset-code-note">Không có preview. Vui lòng tải file.</div>`;
}

function bindAssetActions(){
  $$('[data-asset-view]').forEach(btn => btn.onclick = async () => {
    const rec = await assetGet(btn.dataset.assetView);
    if(!rec) return;
    const u = assetObjectUrl(rec);
    $('#assetPreviewTitle').textContent = `${rec.title} — ${rec.fileName}`;
    $('#assetPreviewBody').innerHTML = previewMarkup(rec, u);
    $('.asset-preview')?.scrollIntoView({behavior:'smooth',block:'start'});
  });

  $$('[data-asset-download]').forEach(btn => btn.onclick = async () => {
    const rec = await assetGet(btn.dataset.assetDownload);
    if(!rec) return;
    const u = assetObjectUrl(rec);
    const a = document.createElement('a');
    a.href = u;
    a.download = rec.fileName || rec.title || 'asset';
    a.click();
  });

  $$('[data-asset-delete]').forEach(btn => btn.onclick = async () => {
    if(!confirm('Xóa asset này?')) return;
    await assetDelete(btn.dataset.assetDelete);
    toast('Đã xóa asset.');
    renderAssetList();
  });

  $$('[data-asset-replace]').forEach(btn => btn.onclick = async () => {
    const rec = await assetGet(btn.dataset.assetReplace);
    if(!rec) return;

    const product = $('#assetProduct');
    const type = $('#assetType');
    const file = $('#assetFile');
    const title = $('#assetTitle');
    const description = $('#assetDescription');
    const replaceId = $('#assetReplaceOfficialId');
    const replacementSlot = $('#assetReplacementSlot');
    const notice = $('#assetReplaceNotice');

    if(product) product.value = rec.product || 'oncallcx';
    if(type) type.value = rec.type || 'userGuide';
    if(file) file.accept = assetAccept(type?.value || rec.type || 'userGuide');
    if(title) title.value = rec.title || '';
    if(description) description.value = rec.description || '';
    if(replaceId) replaceId.value = rec.id || '';
    if(replacementSlot) replacementSlot.value = rec.replacementSlot || '';
    if(notice){
      notice.hidden = false;
      notice.innerHTML = `<b>Đang thay thế:</b> ${esc(rec.title || rec.fileName)}<small>Upload file mới, bản mới sẽ ưu tiên hiển thị. Xóa bản upload mới thì file Official sẽ tự hiện lại.</small>`;
    }

    $('.asset-upload-card')?.scrollIntoView({behavior:'smooth',block:'start'});
    toast('Đã chọn tài liệu cần thay thế. Vui lòng chọn file mới và upload.');
  });
}

export function bindAssetManager(data = null){
  const type = $('#assetType');
  const file = $('#assetFile');

  if(type && file){
    type.onchange = () => file.accept = assetAccept(type.value);
  }

  $('#assetUploadBtn')?.addEventListener('click', async () => {
    const f = file?.files?.[0];
    if(!f){ toast('Vui lòng chọn file.'); return; }

    const product = $('#assetProduct')?.value || 'oncallcx';
    const shouldRender = (type.value === 'presentation');
    let generated = {pages:[],thumbnail:'',pageCount:0,generatedAt:'',renderSource:'',error:''};
    if(shouldRender){
      toast('Đang upload và render slide...');
      generated = await generatePresentationPages(f);
    }
    const record = {
      id:`asset-${product}-${type.value}-${Date.now()}`,
      product,
      type:type.value,
      title:$('#assetTitle')?.value || f.name,
      description:$('#assetDescription')?.value || '',
      replacesOfficialAssetId: $('#assetReplaceOfficialId')?.value || '',
      replacementSlot: $('#assetReplacementSlot')?.value || '',
      fileName:f.name,
      mimeType:f.type || 'application/octet-stream',
      size:f.size,
      createdAt:new Date().toISOString(),
      blob:f,
      pages:generated.pages || [],
      thumbnail:generated.thumbnail || '',
      pageCount:generated.pageCount || 0,
      generatedAt:generated.generatedAt || '',
      renderSource:generated.renderSource || '',
      generationError:generated.error || ''
    };

    await assetPut(record);
    toast(record.pageCount ? `Đã upload và render ${record.pageCount} slide.` : 'Đã upload và gắn asset vào sản phẩm.');

    if(file) file.value = '';
    if($('#assetTitle')) $('#assetTitle').value = '';
    if($('#assetDescription')) $('#assetDescription').value = '';
    if($('#assetReplaceOfficialId')) $('#assetReplaceOfficialId').value = '';
    if($('#assetReplacementSlot')) $('#assetReplacementSlot').value = '';
    if($('#assetReplaceNotice')){
      $('#assetReplaceNotice').hidden = true;
      $('#assetReplaceNotice').innerHTML = '';
    }
    renderAssetList();
  });

  $('#assetSearch')?.addEventListener('input', renderAssetList);
  $('#assetFilter')?.addEventListener('change', renderAssetList);
  $('#assetProductFilter')?.addEventListener('change', renderAssetList);
  $('#assetRefresh')?.addEventListener('click', renderAssetList);
  renderAssetList();
}

export async function getProductAssets(productId){
  const assets = await allAssets();
  return assets
    .filter(a => (a.product || 'oncallcx') === productId)
    .sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
}
