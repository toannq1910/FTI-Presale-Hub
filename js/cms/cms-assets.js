/* v9.7.0 Product Asset Binding */
import { $, $$, esc, toast, loadCms } from './cms-core.js';

const DB = 'fti_unified_asset_manager_v1';
const STORE = 'assets';

export const ASSET_TYPES = {
  presentation:'Presentation',
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
    const req = tx.objectStore(STORE).put(record);
    req.onsuccess = () => resolve(record);
    req.onerror = () => reject(req.error);
  });
}

export async function assetGet(id){
  const db = await openDb();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function assetDelete(id){
  const db = await openDb();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(STORE, 'readwrite');
    const req = tx.objectStore(STORE).delete(id);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

export async function allAssets(){
  const db = await openDb();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

let lastObjectUrl = null;
export function assetObjectUrl(record){
  if(lastObjectUrl) URL.revokeObjectURL(lastObjectUrl);
  lastObjectUrl = URL.createObjectURL(record.blob);
  return lastObjectUrl;
}

export function assetIcon(t){
  return ({
    presentation:'📘',
    datasheet:'📄',
    video:'🎬',
    image:'🖼️',
    logo:'🏷️',
    api:'📚',
    caseStudy:'💬',
    other:'📎'
  }[t] || '📎');
}

function productOptions(data, selected = 'oncallcx'){
  const products = data?.products || [];
  if(!products.length){
    return `<option value="oncallcx">OnCallCX</option>`;
  }
  return products.map(p => `<option value="${esc(p.id)}" ${p.id === selected ? 'selected' : ''}>${esc(p.title || p.id)}</option>`).join('');
}

export function renderAssetManager(data = null){
  return `<section class="cms-asset-hero">
    <div>
      <span class="eyebrow">📂 Product Asset Manager</span>
      <h2>Quản lý tài liệu theo sản phẩm</h2>
      <p>Upload tài liệu và gắn trực tiếp vào sản phẩm. Product Detail sẽ tự hiển thị tài liệu liên quan.</p>
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

  const assets = (await allAssets())
    .sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)))
    .filter(a => typeFilter === 'all' || a.type === typeFilter)
    .filter(a => productFilter === 'all' || a.product === productFilter)
    .filter(a => !q || [a.title,a.description,a.fileName,a.product,assetTypeLabel(a.type)].join(' ').toLowerCase().includes(q));

  root.innerHTML = assets.length ? assets.map(a => `<article class="asset-item">
    <div class="asset-icon">${assetIcon(a.type)}</div>
    <div class="asset-info">
      <b>${esc(a.title)}</b>
      <span>${esc(assetTypeLabel(a.type))} · ${esc(a.fileName)} · ${formatBytes(a.size)}</span>
      <small>Product: <code>${esc(a.product || 'oncallcx')}</code> · ${new Date(a.createdAt).toLocaleString('vi-VN')}</small>
      ${a.description ? `<em>${esc(a.description)}</em>` : ''}
    </div>
    <div class="asset-actions">
      <button class="btn btn-soft" data-asset-view="${a.id}">Xem</button>
      <button class="btn btn-soft" data-asset-download="${a.id}">Tải</button>
      <button class="btn btn-danger" data-asset-delete="${a.id}">Xóa</button>
    </div>
  </article>`).join('') : `<div class="cms-empty-state">Chưa có asset nào.</div>`;

  bindAssetActions();
}

function previewMarkup(record,u){
  if(record.mimeType?.startsWith('image/')) return `<img class="asset-preview-img" src="${u}" alt="${esc(record.title)}">`;
  if(record.mimeType?.startsWith('video/')) return `<video class="asset-preview-video" src="${u}" controls></video>`;
  if(record.mimeType === 'application/pdf' || record.fileName.toLowerCase().endsWith('.pdf')) return `<iframe class="asset-preview-frame" src="${u}"></iframe>`;
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
    const record = {
      id:`asset-${product}-${type.value}-${Date.now()}`,
      product,
      type:type.value,
      title:$('#assetTitle')?.value || f.name,
      description:$('#assetDescription')?.value || '',
      fileName:f.name,
      mimeType:f.type || 'application/octet-stream',
      size:f.size,
      createdAt:new Date().toISOString(),
      blob:f
    };

    await assetPut(record);
    toast('Đã upload và gắn asset vào sản phẩm.');

    if(file) file.value = '';
    if($('#assetTitle')) $('#assetTitle').value = '';
    if($('#assetDescription')) $('#assetDescription').value = '';
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
