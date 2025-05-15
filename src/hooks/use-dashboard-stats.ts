import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardStatsData } from "@/types/dashboard";

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async (): Promise<DashboardStatsData> => {
      console.log("Fetching dashboard stats...");

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("count");

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      const { data: roles, error: rolesError } = await supabase
        .from("roles")
        .select("count");

      if (rolesError) {
        console.error("Error fetching roles:", rolesError);
        throw rolesError;
      }

      console.log("Stats fetched:", { profiles, roles });

      return {
        totalUsers: profiles?.[0]?.count || 0,
        totalRoles: roles?.[0]?.count || 0,
        activeUsers: 0,
        lastActivity: new Date().toISOString(),
      };
    },
  });
};
