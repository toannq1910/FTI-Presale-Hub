/* v9.4.0 CMS Core */
export const CMS_URL = 'data/cms-content.json';
export const CMS_KEY = 'fti_collaboration_hub_cms_v920';
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

export async function loadCms(){
  const local = localStorage.getItem(CMS_KEY);
  if(local){
    try { return JSON.parse(local); } catch(e) { console.warn('Invalid local CMS', e); }
  }
  const res = await fetch(CMS_URL, {cache:'no-store'});
  if(!res.ok) throw new Error('Cannot load CMS content');
  return await res.json();
}
export function saveCms(data){ localStorage.setItem(CMS_KEY, JSON.stringify(data, null, 2)); }
export function resetCms(){ localStorage.removeItem(CMS_KEY); }
export function cloneData(data){ return typeof structuredClone === 'function' ? structuredClone(data) : JSON.parse(JSON.stringify(data)); }
export function esc(v){ return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }
export function toast(msg){
  const root = document.querySelector('#toastRoot') || document.body;
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  root.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}
export function linesToArray(v){ return String(v || '').split('\n').map(x => x.trim()).filter(Boolean); }
export function csvToArray(v){ return String(v || '').split(',').map(x => x.trim()).filter(Boolean); }
