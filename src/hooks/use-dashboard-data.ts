import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardStatsData } from "@/types/dashboard";

export const useDashboardData = () => {
  const fetchDashboardData = async (): Promise<DashboardStatsData> => {
    console.log("Fetching dashboard data...");

    try {
      const [profilesResponse, rolesResponse, activityResponse] =
        await Promise.all([
          supabase.from("profiles").select("*", { count: "exact" }),
          supabase.from("roles").select("*", { count: "exact" }),
          supabase
            .from("audit_logs")
            .select("created_at")
            .order("created_at", { ascending: false })
            .limit(1),
        ]);

      if (profilesResponse.error) throw profilesResponse.error;
      if (rolesResponse.error) throw rolesResponse.error;
      if (activityResponse.error) throw activityResponse.error;

      const activeUsers =
        profilesResponse.data?.filter((profile) => profile.user_type !== null)
          .length || 0;

      return {
        totalUsers: profilesResponse.count || 0,
        totalRoles: rolesResponse.count || 0,
        activeUsers,
        lastActivity:
          activityResponse.data[0]?.created_at || new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw error;
    }
  };

  return useQuery({
    queryKey: ["dashboard-data"],
    queryFn: fetchDashboardData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
