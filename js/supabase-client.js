/* Supabase client init — FTI Collaboration Hub
   Project: fti-collaboration-hub (Southeast Asia / Singapore)

   The values below are the PROJECT URL and PUBLISHABLE (anon/public) key.
   Both are safe to ship in client-side code by design — they only allow
   what Row Level Security policies on the database explicitly permit.
   NEVER put the "secret" / service_role key here or in any file that ships
   to the browser; that key belongs only inside the Supabase Edge Function,
   set as a server-side secret.
*/
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://bhjfwptspbgxskambgpz.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_IFniZpwqDxne-sdIVSPODg_EkftlJzf';

// Must be captured BEFORE createClient() runs: with detectSessionInUrl:true,
// the client can read/consume/rewrite location.hash as a side effect of
// being created, so checking this from an importing module (after the
// `import` line has already fully evaluated this file) can be too late --
// the hash may already be gone by then. Capturing it here, first, and
// exporting the flags is the only way to reliably know whether the page
// was loaded from an invite/recovery email link.
//
// Two different shapes can show up here depending on Supabase's configured
// Auth flow type:
//   - Implicit flow: tokens land in the HASH, e.g. #access_token=...&type=recovery
//   - PKCE flow (Supabase's current default): a `code` lands in the QUERY
//     string instead, e.g. ?code=xxxx -- detectSessionInUrl only auto-handles
//     this on some supabase-js versions, so this is checked explicitly too.
// A failed/expired/already-used link comes back as #error=...&error_code=...
// instead of either of the above -- surfaced separately so the app can show
// a real explanation instead of silently landing on Overview.
const hash = location.hash;
const search = location.search;
export const hadAuthCallbackHash = /access_token=|type=invite|type=recovery/.test(hash);
export const hadAuthCallbackCode = /[?&]code=/.test(search);
export const authCallbackError = (() => {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const description = params.get('error_description');
  return description ? decodeURIComponent(description.replace(/\+/g, ' ')) : null;
})();

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Safety net for the PKCE (?code=) shape: if detectSessionInUrl didn't
// already consume it (behavior differs slightly by supabase-js version),
// explicitly exchange it for a session so the rest of the app doesn't have
// to know which flow type is configured.
if (hadAuthCallbackCode) {
  const codeMatch = search.match(/[?&]code=([^&]+)/);
  if (codeMatch) {
    supabase.auth.exchangeCodeForSession(decodeURIComponent(codeMatch[1])).catch(err => {
      console.warn('[supabase-client] exchangeCodeForSession failed:', err);
    });
  }
}
