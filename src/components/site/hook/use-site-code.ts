import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSiteCode = (siteProfileId: string) => {
  const [siteCodeData, setSiteCodeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSiteCode = async () => {
      try {
        const { data, error } = await supabase
          .from("nd_site_profile_name")
          .select("id, sitename, fullname, standard_code, dusp_tp_id, refid_tp, refid_mcmc")
          .eq("id", siteProfileId)
          .single();
        if (error) throw error;
        setSiteCodeData(data || null); // Set all data, not just standard_code
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSiteCode();
  }, [siteProfileId]);

  return { siteCodeData, loading, error }; // Return all data
};