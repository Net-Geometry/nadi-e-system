import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

// Define the expected request body type
interface ClockInRequest {
  staff_id: number;
  latitude: number;
  longitude: number;
  address: string;
  photo_path: string;
  created_by: string;
}

serve(async (req) => {
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.text();

    if (!body || body.trim() === "") {
      return new Response(JSON.stringify({ error: "Request body is empty" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    let payload: ClockInRequest;

    try {
      payload = JSON.parse(body);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr);
      return new Response(JSON.stringify({ error: "Invalid JSON format" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const { staff_id, latitude, longitude, address, photo_path, created_by } =
      payload;

    if (
      !staff_id ||
      !latitude ||
      !longitude ||
      !address ||
      !photo_path ||
      !created_by
    ) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const today = new Date().toISOString().split("T")[0];

    // 1. Check for existing clock-in today
    const { data: existingAttendance, error: existingError } = await supabase
      .from("nd_staff_attendance")
      .select("id")
      .eq("staff_id", staff_id)
      .eq("attend_date", today)
      .maybeSingle();

    if (existingAttendance) {
      return new Response(
        JSON.stringify({ error: "Staff has already clocked in today." }),
        { status: 400, headers: corsHeaders }
      );
    }

    // 2. Get staff's current active site_id from nd_staff_job
    const { data: staffJob, error: jobError } = await supabase
      .from("nd_staff_job")
      .select("site_id")
      .eq("staff_id", staff_id)
      .eq("is_active", true)
      .maybeSingle();

    if (!staffJob || jobError) {
      return new Response(
        JSON.stringify({ error: "No active site/job found for this staff." }),
        { status: 404, headers: corsHeaders }
      );
    }

    // 3. Insert clock-in record
    const { error: insertError } = await supabase
      .from("nd_staff_attendance")
      .insert([
        {
          staff_id,
          attend_date: today,
          site_id: staffJob.site_id,
          attendance_type: 1,
          latitude,
          longtitude: longitude, // support typo column
          longitude,
          address,
          photo_path,
          check_in: new Date().toISOString(),
          status: true,
          created_by,
          created_at: new Date().toISOString(),
        },
      ]);

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({
          error: "Failed to clock in",
          details: insertError.message,
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(JSON.stringify({ message: "Clock-in successful" }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unexpected server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
