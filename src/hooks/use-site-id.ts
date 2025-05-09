import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export const useSiteId = (isStaffUser?: boolean) => {
  const [siteId, setSiteId] = useState<string | null>(null);

  useEffect(() => {
    if (!isStaffUser) return;

    const fetchSiteId = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          console.error("User ID is undefined");
          return;
        }

        const { data, error } = await supabase
          .from("nd_staff_contract")
          .select("site_profile_id")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;

        setSiteId(data.site_profile_id.toString());
      } catch (error) {
        console.error("Error fetching site ID:", error);
      }
    };

    fetchSiteId();
  }, [isStaffUser]);

  return isStaffUser ? siteId : null;
};
