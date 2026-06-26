/* v9.4.0 CMS Backup */
import { $, toast, resetCms, saveCms } from './cms-core.js';
import { downloadJson, downloadBackup, importCmsFile } from './cms-io.js';

export function renderBackupPanel(){
  return `<div class="cms-backup-layout">
    <div class="cms-form-card"><h3>Export / Backup</h3><p>Export JSON hoặc backup toàn bộ CMS.</p><div class="cms-save-row"><button class="btn btn-primary" id="backupExportJson">Export CMS JSON</button><button class="btn btn-soft" id="backupFull">Download Backup</button></div></div>
    <div class="cms-form-card"><h3>Import / Restore</h3><input type="file" id="cmsImportFile" accept="application/json,.json"><div class="cms-save-row"><button class="btn btn-primary" id="cmsImportBtn">Import & Preview</button><button class="btn btn-soft" id="cmsImportSaveBtn">Import + Lưu Local</button></div></div>
    <div class="cms-form-card danger-zone"><h3>Danger Zone</h3><button class="btn btn-danger" id="backupResetLocal">Reset Local CMS</button></div>
  </div>`;
}
export function bindBackupPanel(currentCms, renderCms){
  $('#backupExportJson')?.addEventListener('click',()=> downloadJson(currentCms));
  $('#backupFull')?.addEventListener('click',()=> downloadBackup(currentCms));
  $('#cmsImportBtn')?.addEventListener('click',async()=>{ const f=$('#cmsImportFile')?.files?.[0]; if(!f){toast('Vui lòng chọn file JSON.');return;} try{renderCms(await importCmsFile(f),'preview');toast('Đã import Preview.')}catch(e){toast('File không hợp lệ.')} });
  $('#cmsImportSaveBtn')?.addEventListener('click',async()=>{ const f=$('#cmsImportFile')?.files?.[0]; if(!f){toast('Vui lòng chọn file JSON.');return;} try{const d=await importCmsFile(f);saveCms(d);renderCms(d,'preview');toast('Đã import và lưu Local.')}catch(e){toast('File không hợp lệ.')} });
  $('#backupResetLocal')?.addEventListener('click',()=>{ if(confirm('Reset toàn bộ CMS local?')){resetCms();location.reload();} });
}
