import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const useSSOID = () => {
  const [ssoID, setSSOID] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSSOID = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: sso, error: ssoError } = await supabase
          .from("nd_sso_profile")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (ssoError) throw ssoError;
        if (!sso) {
          throw new Error("No sso data found");
        }

        setSSOID(sso.id);
      } catch (error) {
        console.error("Error fetching sso ID:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSSOID();
  }, []);

  return { ssoID, loading, error };
};

export default useSSOID;
