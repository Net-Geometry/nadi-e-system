import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface StaffSite {
  id: string;
  sitename: string;
}

export const useStaffSites = () => {
  // Fetch staff sites
  const staffSitesQuery = useQuery({
    queryKey: ["staffSites"],
    queryFn: async () => {
      // First get current user profile to determine user type
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError) throw userError;

      const userId = userData?.user?.id;

      if (!userId) {
        throw new Error("User not logged in");
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;

      // Different queries based on user type
      switch (profile.user_type) {
        case "super_admin":
        case "tp_management":
        case "tp_admin":
        case "tp_hr":
        case "dusp_admin":
        case "mcmc_admin": {
          // These roles can see all sites
          const { data, error } = await supabase
            .from("nd_site_profile")
            .select("id, sitename")
            .eq("is_active", true)
            .order("sitename");

          if (error) throw error;
          return data as StaffSite[];
        }

        case "staff_manager":
        case "staff_assistant_manager": {
          // Managers can see sites they are assigned to
          const { data: staffData, error: staffError } = await supabase
            .from("nd_staff_profile")
            .select("id")
            .eq("user_id", userId)
            .single();

          if (staffError) throw staffError;

          const { data: jobData, error: jobError } = await supabase
            .from("nd_staff_job")
            .select("site_id")
            .eq("staff_id", staffData.id)
            .eq("is_active", true);

          if (jobError) throw jobError;

          // If no specific sites, show all sites
          if (!jobData || jobData.length === 0) {
            const { data, error } = await supabase
              .from("nd_site_profile")
              .select("id, sitename")
              .eq("is_active", true)
              .order("sitename");

            if (error) throw error;
            return data as StaffSite[];
          }

          // Get list of sites
          const siteIds = jobData.map((job) => job.site_id);

          const { data: siteData, error } = await supabase
            .from("nd_site_profile")
            .select("id, sitename")
            .in("id", siteIds)
            .eq("is_active", true)
            .order("sitename");

          if (error) throw error;
          return siteData as StaffSite[];
        }

        default: {
          // Default to showing all sites
          const { data, error } = await supabase
            .from("nd_site_profile")
            .select("id, sitename")
            .eq("is_active", true)
            .order("sitename");

          if (error) throw error;
          return data as StaffSite[];
        }
      }
    },
  });

  return {
    staffSites: staffSitesQuery.data ?? [],
    isLoading: staffSitesQuery.isLoading,
    error: staffSitesQuery.error,
  };
};
