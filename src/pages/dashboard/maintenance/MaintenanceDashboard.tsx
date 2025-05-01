import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MaintenanceList } from "@/components/maintenance/MaintenanceList";
import { MaintenanceRequestFormDialog } from "@/components/maintenance/MaintenanceRequestFormDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMaintennance } from "@/hooks/use-maintenance";
import { useSiteId } from "@/hooks/use-site-id";
import { useUserMetadata } from "@/hooks/use-user-metadata";
import { Plus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";

const MaintenanceDashboard = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const siteId = useSiteId();
  const userMetadata = useUserMetadata();
  const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;
  const isStaffUser = parsedMetadata?.user_group_name === "Centre Staff";

  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const typeParam = searchParams.get("type") || "cm"; // Default to CM

  const handleTabChange = (value: string) => {
    searchParams.set("type", value);
    navigate({
      pathname: location.pathname,
      search: searchParams.toString(),
    });
  };

  const { useMaintenanceRequestsQuery } = useMaintennance();

  const {
    data: maintenanceRequests,
    isLoading: isLoadingMaintenanceRequests,
    error: errorMaintenanceRequests,
    refetch: refetchMaintenanceRequests,
  } = useMaintenanceRequestsQuery();

  useEffect(() => {
    if (!isDialogOpen) {
      refetchMaintenanceRequests();
    }
  }, [isDialogOpen, refetchMaintenanceRequests]);

  useEffect(() => {
    if (typeParam) {
      refetchMaintenanceRequests();
    }
  }, [typeParam, refetchMaintenanceRequests]);

  if (errorMaintenanceRequests) {
    console.error(errorMaintenanceRequests);
    return <div>Error fetching maintenance requests</div>;
  }

  const displayAssets = isStaffUser && !siteId ? [] : maintenanceRequests;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Asset Maintenance</h1>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>

        <Tabs value={typeParam} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="cm">Corrective Maintenance</TabsTrigger>
            <TabsTrigger value="pm">Preventive Maintenance</TabsTrigger>
          </TabsList>
          <TabsContent value="cm">
            <>
              Corrective Maintenance Content
              <MaintenanceList
                maintenanceRequests={displayAssets}
                isLoadingMaintenanceRequests={isLoadingMaintenanceRequests}
                refetch={refetchMaintenanceRequests}
              />
            </>
          </TabsContent>
          <TabsContent value="pm">Preventive Maintenance Content</TabsContent>
        </Tabs>

        <MaintenanceRequestFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      </div>
    </DashboardLayout>
  );
};

export default MaintenanceDashboard;
