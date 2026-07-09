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

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
