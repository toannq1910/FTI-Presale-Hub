/* v9.9.0 Visual Page Builder */
import { $, $$, esc, cloneData, saveCms, toast } from './cms-core.js';

const SECTION_TYPES = {
  hero: 'Hero',
  text: 'Text Block',
  cards: 'Card Grid',
  faq: 'FAQ',
  cta: 'Call To Action',
  table: 'Table'
};

function defaultPages(){
  return [
    {
      id: 'page-oncallcx-overview',
      title: 'OnCallCX Product Page',
      route: '#oncallcx-product-center',
      status: 'draft',
      description: 'Trang mẫu được dựng bằng Page Builder.',
      sections: [
        {
          type: 'hero',
          title: 'OncallCX - Contact Center As A Service',
          subtitle: 'Product Center',
          content: 'Nền tảng Contact Center as a Service do FPT phát triển, hỗ trợ omnichannel, AI, dashboard, recording và API integration.'
        },
        {
          type: 'cards',
          title: 'Nội dung chính',
          items: [
            {title: 'Overview', content: 'Tổng quan giải pháp OnCallCX.'},
            {title: 'Presentation', content: 'Tài liệu trình chiếu sản phẩm.'},
            {title: 'Demo Video', content: 'Kịch bản demo cho khách hàng.'},
            {title: 'API Reference', content: 'Tài liệu API/Webhook tích hợp.'}
          ]
        }
      ]
    }
  ];
}

export function ensurePages(data){
  data.pages = Array.isArray(data.pages) && data.pages.length ? data.pages : defaultPages();
  return data.pages;
}

function activePage(data){
  const pages = ensurePages(data);
  const activeId = sessionStorage.getItem('fti_active_page_id') || pages[0]?.id || '';
  return pages.find(p => p.id === activeId) || pages[0] || null;
}

function pageList(pages, activeId){
  return pages.map(p => `<button class="pb-page-item ${p.id === activeId ? 'active' : ''}" data-page-id="${esc(p.id)}">
    <b>${esc(p.title || 'Untitled')}</b>
    <span>${esc(p.route || '')}</span>
    <em>${esc(p.status || 'draft')}</em>
  </button>`).join('') || `<div class="cms-empty-state">Chưa có page nào.</div>`;
}

function sectionPreview(section, index){
  const items = Array.isArray(section.items) ? section.items : [];
  const body = {
    hero: `<p>${esc(section.subtitle || '')}</p><strong>${esc(section.content || '')}</strong>`,
    text: `<p>${esc(section.content || '')}</p>`,
    cards: `<div class="pb-mini-grid">${items.map(x => `<span><b>${esc(x.title || '')}</b>${esc(x.content || '')}</span>`).join('')}</div>`,
    faq: `<div class="pb-mini-grid">${items.map(x => `<span><b>${esc(x.q || x.title || '')}</b>${esc(x.a || x.content || '')}</span>`).join('')}</div>`,
    cta: `<p>${esc(section.content || '')}</p><button class="btn btn-soft" type="button">${esc(section.buttonText || 'CTA')}</button>`,
    table: `<p>${items.length} dòng dữ liệu</p>`
  }[section.type] || `<p>${esc(section.content || '')}</p>`;

  return `<article class="pb-section" data-section-index="${index}">
    <div class="pb-section-head">
      <div>
        <span>${esc(SECTION_TYPES[section.type] || section.type || 'Section')}</span>
        <h3>${esc(section.title || 'Untitled Section')}</h3>
      </div>
      <div class="pb-section-actions">
        <button class="btn btn-soft" data-edit-section="${index}">Sửa</button>
        <button class="btn btn-soft" data-up-section="${index}">↑</button>
        <button class="btn btn-soft" data-down-section="${index}">↓</button>
        <button class="btn btn-danger" data-remove-section="${index}">Xóa</button>
      </div>
    </div>
    <div class="pb-section-body">${body}</div>
  </article>`;
}

function renderPageForm(page){
  if(!page) return `<div class="cms-empty-state">Chưa có page.</div>`;
  return `<section class="pb-editor">
    <div class="pb-editor-head">
      <div>
        <h3>${esc(page.title || 'Page')}</h3>
        <p>ID: <code>${esc(page.id || '')}</code></p>
      </div>
      <div class="pb-actions">
        <a class="btn btn-soft" id="pbPreviewPage" href="#page-preview:${esc(page.id || '')}">Preview</a>
        ${page.route ? `<a class="btn btn-soft" id="pbOpenPage" href="${esc(page.route)}">Mở route</a>` : ''}
        <button class="btn btn-soft" id="pbDuplicatePage">Nhân bản</button>
        <button class="btn btn-danger" id="pbDeletePage">Xóa page</button>
        <button class="btn btn-primary" id="pbSavePage">Lưu page</button>
      </div>
    </div>

    <div class="pm-form-grid">
      <label>Page ID</label><input id="pbPageId" value="${esc(page.id || '')}">
      <label>Title</label><input id="pbPageTitle" value="${esc(page.title || '')}">
      <label>Route</label><div><input id="pbPageRoute" value="${esc(page.route || '')}" placeholder="#custom-page"><small class="pb-route-help">Không dùng route đã thuộc sidebar chính như #crm, #api-reference, #demo. Dùng route riêng như #page-oncallcx.</small></div>
      <label>Status</label>
      <select id="pbPageStatus">
        <option value="draft" ${page.status === 'draft' ? 'selected' : ''}>Draft</option>
        <option value="active" ${page.status === 'active' ? 'selected' : ''}>Active</option>
        <option value="archived" ${page.status === 'archived' ? 'selected' : ''}>Archived</option>
      </select>
      <label>Description</label><textarea id="pbPageDescription">${esc(page.description || '')}</textarea>
    </div>

    <div class="pb-add-section">
      <select id="pbSectionType">
        ${Object.entries(SECTION_TYPES).map(([k,v]) => `<option value="${k}">${v}</option>`).join('')}
      </select>
      <button class="btn btn-soft" id="pbAddSection">+ Thêm section</button>
    </div>

    <div id="pbSectionList" class="pb-section-list">
      ${(page.sections || []).map(sectionPreview).join('') || `<div class="cms-empty-state">Page chưa có section.</div>`}
    </div>

    <section id="pbSectionEditor"></section>
  </section>`;
}

function defaultSection(type){
  if(type === 'hero') return {type, title:'Hero title', subtitle:'Subtitle', content:'Nội dung hero.'};
  if(type === 'cards') return {type, title:'Card Grid', items:[{title:'Card 1', content:'Nội dung card 1'}, {title:'Card 2', content:'Nội dung card 2'}]};
  if(type === 'faq') return {type, title:'FAQ', items:[{q:'Câu hỏi?', a:'Câu trả lời.'}]};
  if(type === 'cta') return {type, title:'CTA', content:'Kêu gọi hành động.', buttonText:'Liên hệ', buttonUrl:'#cms'};
  if(type === 'table') return {type, title:'Table', items:[{col1:'Tên', col2:'Mô tả'}]};
  return {type:'text', title:'Text Block', content:'Nội dung văn bản.'};
}

function collectPage(oldPage = {}){
  return {
    ...oldPage,
    id: $('#pbPageId')?.value || oldPage.id || `page-${Date.now()}`,
    title: $('#pbPageTitle')?.value || '',
    route: $('#pbPageRoute')?.value || '',
    status: $('#pbPageStatus')?.value || 'draft',
    description: $('#pbPageDescription')?.value || '',
    sections: Array.isArray(oldPage.sections) ? oldPage.sections : []
  };
}

function renderSectionEditor(section, index){
  const itemText = Array.isArray(section.items)
    ? section.items.map(x => Object.entries(x).map(([k,v]) => `${k}: ${v}`).join(' | ')).join('\n')
    : '';

  return `<div class="pb-section-editor-card" data-editing-section="${index}">
    <div class="pb-editor-head">
      <div>
        <h3>Sửa section #${index + 1}</h3>
        <p>${esc(SECTION_TYPES[section.type] || section.type)}</p>
      </div>
      <button class="btn btn-soft" id="pbCloseSectionEditor">Đóng</button>
    </div>

    <div class="pm-form-grid">
      <label>Type</label>
      <select id="pbEditType">${Object.entries(SECTION_TYPES).map(([k,v]) => `<option value="${k}" ${section.type === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
      <label>Title</label><input id="pbEditTitle" value="${esc(section.title || '')}">
      <label>Subtitle</label><input id="pbEditSubtitle" value="${esc(section.subtitle || '')}">
      <label>Content</label><textarea id="pbEditContent">${esc(section.content || '')}</textarea>
      <label>Button text</label><input id="pbEditButtonText" value="${esc(section.buttonText || '')}">
      <label>Button URL</label><input id="pbEditButtonUrl" value="${esc(section.buttonUrl || '')}">
      <label>Items</label><textarea id="pbEditItems" placeholder="Mỗi dòng: title: Card 1 | content: Nội dung">${esc(itemText)}</textarea>
    </div>

    <div class="cms-save-row">
      <button class="btn btn-primary" id="pbSaveSection">Lưu section</button>
    </div>
  </div>`;
}

function parseItems(text){
  return String(text || '').split('\n').map(line => line.trim()).filter(Boolean).map(line => {
    const obj = {};
    line.split('|').forEach(part => {
      const [k, ...rest] = part.split(':');
      if(k && rest.length) obj[k.trim()] = rest.join(':').trim();
    });
    return Object.keys(obj).length ? obj : {title: line, content: ''};
  });
}

function collectSection(old = {}){
  return {
    ...old,
    type: $('#pbEditType')?.value || old.type || 'text',
    title: $('#pbEditTitle')?.value || '',
    subtitle: $('#pbEditSubtitle')?.value || '',
    content: $('#pbEditContent')?.value || '',
    buttonText: $('#pbEditButtonText')?.value || '',
    buttonUrl: $('#pbEditButtonUrl')?.value || '',
    items: parseItems($('#pbEditItems')?.value || '')
  };
}

export function renderPageBuilder(data){
  const pages = ensurePages(data);
  const page = activePage(data);

  return `<section class="pb-hero">
    <div>
      <span class="eyebrow">🧱 Visual Page Builder</span>
      <h2>Thiết kế trang bằng section</h2>
      <p>Tạo landing page, product page, trang tài liệu hoặc trang nội dung mà không sửa HTML trực tiếp.</p>
    </div>
    <button class="btn btn-primary" id="pbAddPage">+ Thêm page</button>
  </section>

  <section class="pb-layout">
    <aside class="pb-page-list">
      <input id="pbSearchPage" placeholder="Tìm page...">
      <div id="pbPages">${pageList(pages, page?.id)}</div>
    </aside>
    <main class="pb-main">
      ${renderPageForm(page)}
    </main>
  </section>`;
}

export function bindPageBuilder(data, renderCms){
  ensurePages(data);
  let pages = data.pages;
  let page = activePage(data);

  function rerender(nextData){
    renderCms(nextData, 'builder');
  }

  function bindPageList(){
    $$('[data-page-id]').forEach(btn => btn.onclick = () => {
      sessionStorage.setItem('fti_active_page_id', btn.dataset.pageId);
      renderCms(data, 'builder');
    });
  }
  bindPageList();

  $('#pbSearchPage')?.addEventListener('input', () => {
    const q = ($('#pbSearchPage')?.value || '').toLowerCase();
    const visible = pages.filter(p => !q || [p.title,p.route,p.description].join(' ').toLowerCase().includes(q));
    $('#pbPages').innerHTML = pageList(visible, page?.id);
    bindPageList();
  });

  $('#pbAddPage')?.addEventListener('click', () => {
    const next = cloneData(data);
    ensurePages(next);
    const newPage = {
      id: `page-${Date.now()}`,
      title: 'Page mới',
      route: '#new-page',
      status: 'draft',
      description: 'Mô tả page.',
      sections: [defaultSection('hero')]
    };
    next.pages.unshift(newPage);
    sessionStorage.setItem('fti_active_page_id', newPage.id);
    saveCms(next);
    toast('Đã tạo page mới.');
    rerender(next);
  });

  $('#pbSavePage')?.addEventListener('click', () => {
    if(!page) return;
    const next = cloneData(data);
    ensurePages(next);
    const idx = next.pages.findIndex(p => p.id === page.id);
    const updated = collectPage(page);
    next.pages[idx] = updated;
    next.meta = next.meta || {};
    next.meta.version = 'v9.9.1';
    next.meta.updatedAt = new Date().toISOString().slice(0,10);
    sessionStorage.setItem('fti_active_page_id', updated.id);
    saveCms(next);
    toast('Đã lưu page.');
    rerender(next);
  });

  $('#pbDeletePage')?.addEventListener('click', () => {
    if(!page || !confirm('Xóa page này?')) return;
    const next = cloneData(data);
    next.pages = ensurePages(next).filter(p => p.id !== page.id);
    sessionStorage.setItem('fti_active_page_id', next.pages[0]?.id || '');
    saveCms(next);
    toast('Đã xóa page.');
    rerender(next);
  });

  $('#pbDuplicatePage')?.addEventListener('click', () => {
    if(!page) return;
    const next = cloneData(data);
    const clone = {...collectPage(page), id:`${page.id}-copy-${Date.now()}`, title:`${page.title} Copy`, status:'draft'};
    next.pages.unshift(clone);
    sessionStorage.setItem('fti_active_page_id', clone.id);
    saveCms(next);
    toast('Đã nhân bản page.');
    rerender(next);
  });

  $('#pbAddSection')?.addEventListener('click', () => {
    if(!page) return;
    const next = cloneData(data);
    const idx = next.pages.findIndex(p => p.id === page.id);
    const current = collectPage(page);
    current.sections.push(defaultSection($('#pbSectionType')?.value || 'text'));
    next.pages[idx] = current;
    rerender(next);
  });

  $$('[data-edit-section]').forEach(btn => btn.onclick = () => {
    const i = Number(btn.dataset.editSection);
    $('#pbSectionEditor').innerHTML = renderSectionEditor(page.sections[i], i);
    $('#pbSectionEditor').scrollIntoView({behavior:'smooth', block:'start'});
    bindSectionEditor(data, renderCms, page, i);
  });

  $$('[data-remove-section]').forEach(btn => btn.onclick = () => {
    const i = Number(btn.dataset.removeSection);
    const next = cloneData(data);
    const idx = next.pages.findIndex(p => p.id === page.id);
    const current = collectPage(page);
    current.sections.splice(i,1);
    next.pages[idx] = current;
    rerender(next);
  });

  $$('[data-up-section]').forEach(btn => btn.onclick = () => {
    const i = Number(btn.dataset.upSection);
    if(i <= 0) return;
    const next = cloneData(data);
    const idx = next.pages.findIndex(p => p.id === page.id);
    const current = collectPage(page);
    [current.sections[i-1], current.sections[i]] = [current.sections[i], current.sections[i-1]];
    next.pages[idx] = current;
    rerender(next);
  });

  $$('[data-down-section]').forEach(btn => btn.onclick = () => {
    const i = Number(btn.dataset.downSection);
    if(i >= page.sections.length - 1) return;
    const next = cloneData(data);
    const idx = next.pages.findIndex(p => p.id === page.id);
    const current = collectPage(page);
    [current.sections[i+1], current.sections[i]] = [current.sections[i], current.sections[i+1]];
    next.pages[idx] = current;
    rerender(next);
  });
}

function bindSectionEditor(data, renderCms, page, sectionIndex){
  $('#pbCloseSectionEditor')?.addEventListener('click', () => {
    $('#pbSectionEditor').innerHTML = '';
  });

  $('#pbSaveSection')?.addEventListener('click', () => {
    const next = cloneData(data);
    const pageIndex = next.pages.findIndex(p => p.id === page.id);
    const current = collectPage(page);
    current.sections[sectionIndex] = collectSection(current.sections[sectionIndex]);
    next.pages[pageIndex] = current;
    saveCms(next);
    toast('Đã lưu section.');
    renderCms(next, 'builder');
  });
}
