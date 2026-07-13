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
// exporting the flag is the only way to reliably know whether the page was
// loaded from an invite/recovery email link.
export const hadAuthCallbackHash = /access_token=|type=invite|type=recovery/.test(location.hash);

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
