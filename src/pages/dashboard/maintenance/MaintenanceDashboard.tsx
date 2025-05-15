import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MaintenanceList } from "@/components/maintenance/MaintenanceList";
import { MaintenanceRequestFormDialog } from "@/components/maintenance/MaintenanceRequestFormDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMaintenance } from "@/hooks/use-maintenance";
import { useSiteId } from "@/hooks/use-site-id";
import { useUserMetadata } from "@/hooks/use-user-metadata";
import { Plus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";

const MaintenanceDashboard = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const siteId = useSiteId();
  const userMetadata = useUserMetadata();
  const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;
  const isStaffUser = parsedMetadata?.user_group_name === "Centre Staff";
  const isVendor = parsedMetadata?.user_group_name === "Vendor";

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

  const { useMaintenanceRequestsQuery } = useMaintenance();

  const {
    data: maintenanceRequests,
    isLoading: isLoadingMaintenanceRequests,
    error: errorMaintenanceRequests,
    refetch: refetchMaintenanceRequests,
  } = useMaintenanceRequestsQuery(typeParam);

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

  const displayRequests = isStaffUser && !siteId ? [] : maintenanceRequests;

  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <div>Asset Maintenance</div>
            {!isVendor && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            )}
          </CardTitle>
          <CardDescription>
            View and manage all asset maintenance in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={typeParam} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="cm">Corrective Maintenance</TabsTrigger>
              <TabsTrigger value="pm">Preventive Maintenance</TabsTrigger>
            </TabsList>
            <TabsContent value="cm">
              <MaintenanceList
                maintenanceRequests={displayRequests}
                isLoadingMaintenanceRequests={isLoadingMaintenanceRequests}
                refetch={refetchMaintenanceRequests}
                type="cm"
              />
            </TabsContent>
            <TabsContent value="pm">
              <MaintenanceList
                maintenanceRequests={displayRequests}
                isLoadingMaintenanceRequests={isLoadingMaintenanceRequests}
                refetch={refetchMaintenanceRequests}
                type="pm"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <MaintenanceRequestFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </DashboardLayout>
  );
};

export default MaintenanceDashboard;
