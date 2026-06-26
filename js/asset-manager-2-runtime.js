/* v10.4.0 Asset Manager 2.0 Runtime */
import { esc } from './cms/cms-core.js';

function ensureStyle(){
  if(document.getElementById('asset2Style')) return;
  const style = document.createElement('style');
  style.id = 'asset2Style';
  style.textContent = `
  .asset2-hero{display:flex;justify-content:space-between;gap:18px;align-items:flex-end;background:linear-gradient(135deg,rgba(249,115,22,.16),rgba(168,85,247,.10));border:1px solid rgba(249,115,22,.28);border-radius:28px;padding:30px;margin-bottom:18px}.asset2-hero h2{font-size:36px;margin:10px 0}.asset2-hero p{color:#c4d3ea;line-height:1.65;max-width:980px}
  .asset2-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.asset2-card{background:var(--card,#111c31);border:1px solid var(--line,#263754);border-radius:20px;padding:18px}.asset2-card h3{margin:8px 0}.asset2-card p,.asset2-card li{color:#c4d3ea;line-height:1.6}.asset2-icon{width:52px;height:52px;border-radius:18px;display:grid;place-items:center;background:rgba(249,115,22,.14);font-size:26px}.asset2-flow{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin-top:18px}.asset2-flow span{background:rgba(255,255,255,.04);border:1px solid var(--line,#263754);border-radius:14px;padding:14px;color:#c4d3ea}.asset2-flow b{display:block;color:#fdba74}
  @media(max-width:1100px){.asset2-grid,.asset2-flow{grid-template-columns:1fr}.asset2-hero{flex-direction:column;align-items:flex-start}.asset2-hero h2{font-size:30px}}
  `;
  document.head.appendChild(style);
}
function render(){
  const cards = [
    ['📂','Metadata-first Asset','Mỗi asset có Product, Type, Sidebar, Tag, Version, Owner, Status, Description.'],
    ['🖼️','Preview & Thumbnail','Chuẩn bị nền cho preview PDF, image, video và tự sinh thumbnail.'],
    ['🏷️','Version History','Chuẩn bị versioning cho tài liệu: v1.0, v1.1, v2.0, deprecated, latest.'],
    ['🔗','Multi-place Publishing','Upload một lần, xuất hiện ở Product, Document Center, Download Center, Search.'],
    ['⬇️','Download Center','Chuẩn bị UI phân phối tài liệu cho khách hàng/presales.'],
    ['🛡️','Governance','Owner, status, review, publish workflow và rollback.']
  ];
  return `<section class="asset2-hero"><div><span class="eyebrow">📂 Asset Manager 2.0 v10.4</span><h2>Asset Manager 2.0</h2><p>Nâng cấp Asset Manager theo hướng SharePoint/Confluence: metadata-first, versioning, preview, download và governance.</p></div><a class="btn btn-primary" href="#document-center">Document Center</a></section>
  <section class="asset2-grid">${cards.map(c=>`<article class="asset2-card"><div class="asset2-icon">${c[0]}</div><h3>${esc(c[1])}</h3><p>${esc(c[2])}</p></article>`).join('')}</section>
  <section class="asset2-card" style="margin-top:18px"><h3>Operational Flow</h3><div class="asset2-flow"><span><b>1</b>Upload Asset</span><span><b>2</b>Add Metadata</span><span><b>3</b>Preview / Review</span><span><b>4</b>Publish</span><span><b>5</b>Index Search</span></div></section>`;
}
function open(){ if(location.hash !== '#asset-manager-2') return; ensureStyle(); const root=document.querySelector('#pageRoot'); if(!root)return; document.querySelector('#pageTitle').textContent='Asset Manager 2.0'; document.querySelector('#pageSubtitle').textContent='Metadata-first asset governance'; root.innerHTML=render(); }
window.addEventListener('hashchange',()=>setTimeout(open,80)); window.addEventListener('DOMContentLoaded',()=>setTimeout(open,150));
