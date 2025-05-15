import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://ruanewybqxrdfvrdyeqr.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1YW5ld3licXhyZGZ2cmR5ZXFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1NDU3MzAsImV4cCI6MjA1NDEyMTczMH0.Sy_h_BHoN23rzRFpVc9ARN2wimJ8lRPEVh_hpw_7tlY";

// Initialize the Supabase client with additional options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Test the connection and log the status
(async () => {
  try {
    const { data, error } = await supabase.from("assets").select("count");
    if (error) {
      console.error("Supabase connection error:", error);
    } else {
      console.log("Supabase connection successful");
    }
  } catch (err) {
    console.error("Failed to test Supabase connection:", err);
  }
})();
