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

// Captured BEFORE createClient() runs and BEFORE any manual parsing below
// mutates anything, since these raw strings are read only once here.
const hash = location.hash;
const search = location.search;

// A failed/expired/already-used link comes back as #error=...&error_description=...
// -- surfaced separately so the app can show a real explanation instead of
// silently landing on Overview with no session and no clue why.
export const authCallbackError = (() => {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const description = params.get('error_description');
  return description ? decodeURIComponent(description.replace(/\+/g, ' ')) : null;
})();

// Whether this page load is an auth callback at all (invite/recovery link,
// success or failure) -- used by enterprise-auth-runtime.js to decide
// whether to redirect to #change-password once a session is confirmed.
export const hadAuthCallbackHash = /access_token=|type=invite|type=recovery|error=/.test(hash);

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Deliberately OFF: relying on this to auto-parse the URL asynchronously
    // in the background creates a race condition against our own code below
    // (and against enterprise-auth-runtime.js's initAuth(), which needs to
    // know definitively whether a session exists before deciding what to
    // render) -- there's no way to await "detectSessionInUrl finished".
    // Instead, everything below establishes the session explicitly and
    // synchronously (well, as an awaited promise) so callers can just
    // `await ensureAuthCallbackSession()` and know for certain it's done.
    detectSessionInUrl: false
  }
});

// Two different shapes can show up in an auth callback link, depending on
// Supabase's configured Auth flow type:
//   - Implicit flow: tokens land in the HASH, e.g. #access_token=...&type=recovery
//   - PKCE flow (Supabase's current default for new projects): a `code`
//     lands in the QUERY STRING instead, e.g. ?code=xxxx
// Call this once, early, and await it before checking supabase.auth.getUser()
// anywhere else -- guarantees the session (if any) is fully established
// first, removing any timing race with detectSessionInUrl's own internal
// (otherwise unawaitable) async processing.
export async function ensureAuthCallbackSession() {
  const hashParams = new URLSearchParams(hash.replace(/^#/, ''));
  const accessToken = hashParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token');
  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    if (error) console.warn('[supabase-client] setSession from hash tokens failed:', error);
    // Scrub the raw tokens out of the visible URL/history immediately --
    // otherwise they'd sit there in plain sight (address bar, browser
    // history) after this point serves no further purpose. Preserves the
    // 'type=recovery' bit for enterprise-auth-runtime.js's redirect-to-
    // change-password check, dropping only the sensitive token values.
    const cleaned = hashParams.get('type') ? `#type=${hashParams.get('type')}` : '';
    history.replaceState(null, '', location.pathname + location.search + cleaned);
    return;
  }

  const searchParams = new URLSearchParams(search);
  const code = searchParams.get('code');
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) console.warn('[supabase-client] exchangeCodeForSession failed:', error);
    history.replaceState(null, '', location.pathname + hash);
  }
}
