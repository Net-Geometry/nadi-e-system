import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const useDUSPID = () => {
  const [duspID, setDUSPID] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDUSPID = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: dusp, error: duspError } = await supabase
          .from("nd_dusp_profile")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (duspError) throw duspError;
        if (!dusp) {
          throw new Error("No DUSP data found");
        }

        setDUSPID(dusp.id);
      } catch (error) {
        console.error("Error fetching DUSP ID:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDUSPID();
  }, []);

  return { duspID, loading, error };
};

export default useDUSPID;
