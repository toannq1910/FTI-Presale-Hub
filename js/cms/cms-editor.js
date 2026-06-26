/* v9.4.0 CMS Editor */
import { $, $$, esc, cloneData, linesToArray, csvToArray, toast, saveCms } from './cms-core.js';
import { downloadJson } from './cms-io.js';

export function visualEditor(data){
  const p = data.products?.[0] || {};
  return `<div class="cms-visual-editor">
    <div class="cms-form-card">
      <h3>Product Content</h3>
      <div class="cms-form-grid">
        <label>Title</label><input id="veProductTitle" value="${esc(p.title)}">
        <label>Subtitle</label><input id="veProductSubtitle" value="${esc(p.subtitle)}">
        <label>Category</label><input id="veProductCategory" value="${esc(p.category)}">
        <label>Summary</label><textarea id="veProductSummary">${esc(p.summary)}</textarea>
        <label>Tags</label><input id="veProductTags" value="${esc((p.tags||[]).join(', '))}">
        <label>Highlights</label><textarea id="veProductHighlights">${esc((p.highlights||[]).join('\n'))}</textarea>
      </div>
    </div>
    <div class="cms-save-row">
      <button class="btn btn-primary" id="veApply">Apply Preview</button>
      <button class="btn btn-soft" id="veApplySave">Apply + Save Local</button>
      <button class="btn btn-soft" id="veExport">Export JSON</button>
    </div>
  </div>`;
}
export function collectVisualData(data){
  const next = cloneData(data);
  next.meta = next.meta || {};
  next.meta.version = 'v9.4.0';
  next.meta.updatedAt = new Date().toISOString().slice(0,10);
  next.products = next.products?.length ? next.products : [{id:'oncallcx'}];
  const p = next.products[0];
  p.title = $('#veProductTitle')?.value || '';
  p.subtitle = $('#veProductSubtitle')?.value || '';
  p.category = $('#veProductCategory')?.value || '';
  p.summary = $('#veProductSummary')?.value || '';
  p.tags = csvToArray($('#veProductTags')?.value || '');
  p.highlights = linesToArray($('#veProductHighlights')?.value || '');
  return next;
}
export function bindVisualEditor(currentCms, renderCms){
  $('#veApply')?.addEventListener('click',()=>{ const next = collectVisualData(currentCms); toast('Đã apply vào Preview.'); renderCms(next, 'preview'); });
  $('#veApplySave')?.addEventListener('click',()=>{ const next = collectVisualData(currentCms); saveCms(next); toast('Đã lưu LocalStorage.'); renderCms(next, 'preview'); });
  $('#veExport')?.addEventListener('click',()=> downloadJson(collectVisualData(currentCms)));
}
