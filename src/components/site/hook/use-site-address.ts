import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSiteAddress = (site_id: string) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSiteAddress = async () => {
      try {
        const { data, error } = await supabase
          .from("nd_site_address")
          .select("*")
          .eq("site_id", site_id)
          .single();
        if (error) throw error;
        setData(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSiteAddress();
  }, [site_id]);

  return { data, loading, error };
};
