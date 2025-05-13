import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSiteId = () => {
  const [siteId, setSiteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSiteId = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.error("User ID is undefined");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("nd_staff_contract")
          .select("site_profile_id")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;
        setSiteId(data.site_profile_id);
      } catch (error) {
        console.error("Error fetching site ID:", error);
      }
    };

    fetchSiteId();
  }, []);

  return siteId;
};
