import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSiteCode = (siteProfileId: string) => {
  const [siteCode, setSiteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSiteCode = async () => {
      try {
        const { data, error } = await supabase
          .from("nd_site")
          .select("standard_code")
          .eq("site_profile_id", siteProfileId)
          .single();
        if (error) throw error;
        setSiteCode(data?.standard_code || null);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSiteCode();
  }, [siteProfileId]);

  return { siteCode, loading, error };
};
