import { DashboardMap } from "@/components/dashboard/DashboardMap";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ChartCard from "@/components/dashboard/ChartCard";
import UserGrowthChart from "@/components/dashboard/UserGrowthChart";
import DailyActivityChart from "@/components/dashboard/DailyActivityChart";
import TopPerformingSites from "@/components/dashboard/TopPerformingSites";

export const DuspDashboard = () => {
  const { data: stats, isLoading, error } = useDashboardData();
  const { user } = useAuth();

  // Fetch user profile for welcome message
  const { data: profile } = useQuery({
    queryKey: ["staff-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }

      return data;
    },
    enabled: !!user?.id,
  });

  if (error) {
    console.error("DUSP dashboard data error:", error);
  }

  return (
    <div className="p-8 dark:bg-gray-900 dark:text-white">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <p className="text-gray-500 dark:text-gray-400">
            Welcome back, {profile?.full_name || "DUSP"}
          </p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <ChartCard title="User Growth" detailsPath="/report/usage-sessions">
          <UserGrowthChart />
        </ChartCard>

        <ChartCard title="Daily Activity" detailsPath="/admin/activity">
          <DailyActivityChart />
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <ChartCard
          title="Global Activity Map"
          detailsPath="/report/internet-access"
        >
          <DashboardMap />
        </ChartCard>

        {/* Top Performing Sites is already included */}
        <TopPerformingSites />
      </div>
    </div>
  );
};
