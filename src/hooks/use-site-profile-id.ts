import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export const useSiteProfileId = () => {
  const [siteProfileId, setSiteProfileId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSiteProfileId = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.error("User ID is undefined");
        return;
      }

      try {
        const { data: site, error: siteError } = await supabase
          .from("nd_staff_contract")
          .select("site_id")
          .eq("user_id", user.id)
          .single();

        if (siteError) throw siteError;

        const { data: siteProfile, error: siteProfileError } = await supabase
          .from("nd_site")
          .select("site_profile_id")
          .eq("id", site.site_id)
          .single();

        if (siteProfileError) throw siteProfileError;

        setSiteProfileId(siteProfile.site_profile_id);
      } catch (error) {
        console.error("Error fetching site profile ID:", error);
      }
    };

    fetchSiteProfileId();
  }, []);

  return siteProfileId;
};
