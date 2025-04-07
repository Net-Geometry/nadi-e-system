import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

// Expected request body type
interface ClockOutRequest {
  staff_id: number;
  photo_path: string;
  updated_by: string;
}

serve(async (req) => {
  // Handle preflight request
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

    let payload: ClockOutRequest;

    try {
      payload = JSON.parse(body);
    } catch (err) {
      console.error("Invalid JSON:", err);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const { staff_id, photo_path, updated_by } = payload;

    if (!staff_id || !photo_path || !updated_by) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const today = new Date().toISOString().split("T")[0];

    // 1. Find today's attendance record without clock_out
    const { data: record, error: fetchError } = await supabase
      .from("nd_staff_attendance")
      .select("*")
      .eq("staff_id", staff_id)
      .eq("attend_date", today)
      .is("check_out", null)
      .maybeSingle();

    if (!record) {
      return new Response(
        JSON.stringify({ error: "No valid clock-in record found for today." }),
        { status: 404, headers: corsHeaders }
      );
    }

    const now = new Date();
    const checkIn = new Date(record.check_in);

    // 2. Calculate total working hours (float)
    const totalHours = parseFloat(
      ((now.getTime() - checkIn.getTime()) / (1000 * 60 * 60)).toFixed(2)
    );

    // 3. Update the record
    const { error: updateError } = await supabase
      .from("nd_staff_attendance")
      .update({
        check_out: now.toISOString(),
        total_working_hour: totalHours,
        photo_path,
        updated_by,
        updated_at: now.toISOString(),
      })
      .eq("id", record.id);

    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(
        JSON.stringify({
          error: "Failed to clock out",
          details: updateError.message,
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Clock-out successful",
        total_working_hour: totalHours,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
