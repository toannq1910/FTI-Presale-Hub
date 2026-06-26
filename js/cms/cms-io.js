/* v9.4.0 CMS IO */
import { CMS_KEY } from './cms-core.js';

export function downloadJson(data){
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cms-content-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
export function downloadBackup(data){
  const backup = {meta:{type:'FTI Collaboration Hub CMS Backup',version:'v9.4.0',exportedAt:new Date().toISOString()},cms:data,localStorage:{key:CMS_KEY}};
  const blob = new Blob([JSON.stringify(backup, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fti-cms-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
export function readJsonFile(file){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader();
    reader.onload = () => { try { resolve(JSON.parse(reader.result)); } catch(e) { reject(e); } };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file, 'utf-8');
  });
}
export async function importCmsFile(file){
  const raw = await readJsonFile(file);
  const data = raw.cms || raw;
  if(!data || typeof data !== 'object') throw new Error('Invalid CMS JSON');
  data.products = Array.isArray(data.products) ? data.products : [];
  data.faqs = Array.isArray(data.faqs) ? data.faqs : [];
  data.pricingPlans = Array.isArray(data.pricingPlans) ? data.pricingPlans : [];
  data.presalesChecklist = Array.isArray(data.presalesChecklist) ? data.presalesChecklist : [];
  data.assets = Array.isArray(data.assets) ? data.assets : [];
  data.meta = data.meta || {};
  data.meta.importedAt = new Date().toISOString();
  return data;
}
