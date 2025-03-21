import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { DashboardMap } from "@/components/dashboard/DashboardMap";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { LayoutDashboard } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const StaffDashboard = () => {
  const { data: stats, isLoading, error } = useDashboardData();
  const { user } = useAuth();

  // Fetch user profile for welcome message
  const { data: profile } = useQuery({
    queryKey: ['staff-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
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
    console.error("Staff dashboard data error:", error);
  }

  // Get first letter of name for avatar
  const getNameInitial = () => {
    if (profile?.full_name) {
      return profile.full_name.charAt(0).toUpperCase();
    }
    return 'S'; // Default to 'S' for Staff if no name is available
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src="/lovable-uploads/31e9f7ec-175a-48af-9ad7-eefda1ea40db.png" alt="Staff" />
          <AvatarFallback className="bg-primary/10 text-primary">
            {getNameInitial()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="text-3xl font-bold">{profile?.full_name || 'Staff'}</h1>
        </div>
      </div>

      <DashboardStats stats={stats} isLoading={isLoading} />
      <DashboardMap />
      <DashboardCharts />
    </div>
  );
};
