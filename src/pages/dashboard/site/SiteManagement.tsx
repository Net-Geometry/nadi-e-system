import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Box, Package, Settings, DollarSign, Plus, CheckCircle, Clock, PauseCircle, XCircle, Building2, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { SiteList } from "@/components/site/SiteList";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { SiteFormDialog } from "@/components/site/SiteFormDialog";
import { fetchSites } from "@/components/site/component/site-utils";
import { useUserMetadata } from "@/hooks/use-user-metadata";
import { useNavigate } from 'react-router-dom';
import { fetchActionableRequestCount } from "@/components/site/queries/site-closure"; // Import the new query
import { Badge } from "@/components/ui/badge"; // Import Badge component

const SiteDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userMetadata = useUserMetadata();
  const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;
  const isTPUser = parsedMetadata?.user_group_name === "TP" && !!parsedMetadata?.organization_id;
  const isDUSPUser = parsedMetadata?.user_group_name === "DUSP" && !!parsedMetadata?.organization_id;
  const organizationId =
    parsedMetadata?.user_type !== "super_admin" &&
    (isTPUser || isDUSPUser) &&
    parsedMetadata?.organization_id
      ? parsedMetadata.organization_id
      : null;

  // Hooks must be called unconditionally
  const { data: siteStats, isLoading } = useQuery({
    queryKey: ['site-stats', organizationId],
    queryFn: () => fetchSites(organizationId, isTPUser, isDUSPUser), // Pass isTPUser and isDUSPUser flags
    enabled: !!organizationId || parsedMetadata?.user_type === "super_admin", // Disable query if no access
  });

  const { data: actionableCount = 0, isLoading: isActionableLoading, refetch: refetchActionableCount } = useQuery({
    queryKey: ["actionable-request-count", organizationId],
    queryFn: () => fetchActionableRequestCount(organizationId, isTPUser, isDUSPUser),
    enabled: !!organizationId || parsedMetadata?.user_type === "super_admin", // Enable only if organizationId or super admin
  });

  useEffect(() => {
    // if (!organizationId) return; // Ensure organizationId is available before subscribing

    console.log("Subscribing to actionable request count changes");
    const channel = supabase
      .channel("actionable_request_changes") // Create a channel for real-time updates
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "nd_site_closure"
        },
        (payload) => {
          console.log("Database change detected for actionable requests:", payload); // Log the payload for debugging
          refetchActionableCount(); // Refetch the actionable request count
        }
      )
      .subscribe();

    return () => {
      console.log("Unsubscribing from actionable request count changes");
      supabase.removeChannel(channel); // Cleanup the subscription when the component unmounts
    };
  }, [organizationId, refetchActionableCount]); // Ensure dependencies are correct

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Access control logic moved to the return statement
  if (parsedMetadata?.user_type !== "super_admin" && !organizationId) {
    return <div>You do not have access to this dashboard.</div>;
  }

  const handleViewDetailsClick = () => {
    navigate(`/site/approval`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Site Management</h1>
            <p className="text-muted-foreground mt-2">Track and manage site</p>
          </div>
          <div className="flex justify-between items-center gap-4">
            <Button onClick={() => handleViewDetailsClick()} variant="secondary">
              <Bell className="h-4 w-4 mr-2" /> Closure Approval
              {!isActionableLoading && actionableCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {actionableCount}
                </Badge>
              )}
            </Button>
            {!isDUSPUser && ( // Hide "Add Site" button for DUSP users
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Site
              </Button>
            )}
          </div>
        </div>
        <div className="flex flex-col md:flex-row flex-wrap gap-4">
          <Card className="flex-1 min-w-[200px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Site
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{siteStats?.length || 0}</div>
            </CardContent>
          </Card>
          <Card className="flex-1 min-w-[200px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                In Operation
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{siteStats?.filter(site => site.active_status === 1).length || 0}</div>
            </CardContent>
          </Card>
          <Card className="flex-1 min-w-[200px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                In Progress
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{siteStats?.filter(site => site.active_status === 2).length || 0}</div>
            </CardContent>
          </Card>
          <Card className="flex-1 min-w-[200px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Temporarily Close
              </CardTitle>
              <PauseCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{siteStats?.filter(site => site.active_status === 3).length || 0}</div>
            </CardContent>
          </Card>
          <Card className="flex-1 min-w-[200px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Permanently Close
              </CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{siteStats?.filter(site => site.active_status === 4).length || 0}</div>
            </CardContent>
          </Card>
        </div>

        <SiteList />
        {isDialogOpen && ( // Render SiteFormDialog only when isDialogOpen is true
          <SiteFormDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default SiteDashboard;
