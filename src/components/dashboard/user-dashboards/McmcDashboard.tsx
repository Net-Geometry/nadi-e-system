import { DashboardMap } from "@/components/dashboard/DashboardMap";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Home,
  Users,
  Calendar,
  FileText,
  MapPin,
  LineChart,
} from "lucide-react";
import MapComponent from "@/components/dashboard/user-dashboards/mcmc/MapComponent";
import StatCard from "@/components/dashboard/user-dashboards/mcmc/StatCard";
import EventList from "@/components/dashboard/user-dashboards/mcmc/EventList";
import NewsList from "@/components/dashboard/user-dashboards/mcmc/NewsList";
import OperationCard from "@/components/dashboard/user-dashboards/mcmc/OperationCard";
import { ScrollArea } from "@/components/ui/scroll-area-dashboard";

export const McmcDashboard = () => {
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
  const events = [
    {
      title: "NADI PPR Desa Tun Razak Launch",
      date: "April 30, 2025",
      location: "Kuala Lumpur",
    },
    {
      title: "NADI Seri Menanti Meeting",
      date: "May 15, 2025",
      location: "Negeri Sembilan",
    },
    {
      title: "Community Outreach Program",
      date: "May 22, 2025",
      location: "Johor Bahru",
    },
  ];

  const news = [
    {
      title: "NADI Initiative Receives Government Funding",
      date: "April 28, 2025",
    },
    {
      title: "New Training Programs Announced",
      date: "April 25, 2025",
    },
    {
      title: "Partnership with Local Universities Established",
      date: "April 22, 2025",
    },
  ];

  const operationItems = [
    { label: "Active", value: "24", color: "text-green-500" },
    { label: "Pending", value: "12", color: "text-yellow-500" },
    { label: "Completed", value: "156", color: "text-blue-500" },
  ];
  if (error) {
    console.error("MCMC dashboard data error:", error);
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div>
        {/* Map fills the entire page as background */}
        <MapComponent />

        {/* Overlay content */}
        {/* <div className="absolute inset-0 grid grid-cols-12 gap-4 p-4 pointer-events-none">
          <p className="text-gray-500 dark:text-gray-400">
            Welcome back, {profile?.full_name || "MCMC"}
          </p>
          Left side stats
          <div className="col-span-3 space-y-4 pointer-events-auto">
            <ScrollArea className="h-[calc(100vh-2rem)] pr-2">
              <StatCard
                icon={<Users size={24} />}
                title="Total Members"
                value="24,316"
                subValue="+2.5% from last month"
                bgColor="bg-nadi-blue"
                className="card-dashboard"
              />
              <StatCard
                icon={<MapPin size={24} />}
                title="Active Locations"
                value="128"
                subValue="Across Malaysia"
                bgColor="bg-nadi-purple"
                className="card-dashboard mt-4"
              />
              <OperationCard title="Operation Status" items={operationItems} />
              <EventList events={events} />
            </ScrollArea>
          </div>

          Center space - empty to show map
          <div className="col-span-6"></div>

          Right side stats
          <div className="col-span-3 space-y-4 pointer-events-auto">
            <ScrollArea className="h-[calc(100vh-2rem)] pr-2">
              <StatCard
                icon={<LineChart size={24} />}
                title="Growth Rate"
                value="18.2%"
                subValue="Year over year"
                bgColor="bg-nadi-green"
                className="card-dashboard"
              />
              <StatCard
                icon={<Calendar size={24} />}
                title="Programs This Month"
                value="42"
                subValue="12 more than last month"
                bgColor="bg-nadi-orange"
                className="card-dashboard mt-4"
              />
              <NewsList news={news} />
            </ScrollArea>
          </div>
        </div> */}
      </div>
    </div>
  );
};
