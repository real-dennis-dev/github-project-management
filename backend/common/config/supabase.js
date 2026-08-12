const { createClient } = require("@supabase/supabase-js"); // note: usually @supabase/supabase-js, not @supabase/server
const dotenv = require("dotenv");

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY; // formerly called ANON key
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY; // formerly SERVICE_ROLE key
const supabaseAnonymousKey = process.env.SUPABASE_ANON_KEY;

// if (!supabasePublishableKey) {
//   throw new Error("Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY");
// } else {
//   console.log(supabasePublishableKey);
// }

// Client for public / user-scoped operations (safe for browser or non-privileged server use)
const supabaseAdmin = createClient(supabaseUrl, supabasePublishableKey);

// Admin client for privileged operations (server-side only – never expose this key)
const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

module.exports = {
  supabase,
  supabaseAdmin,
  supabaseUrl,
  supabasePublishableKey,
};
