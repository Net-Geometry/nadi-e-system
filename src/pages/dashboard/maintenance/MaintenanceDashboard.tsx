import { MaintenanceList } from "@/components/maintenance/MaintenanceList";
import { MaintenanceRequestFormDialog } from "@/components/maintenance/MaintenanceRequestFormDialog";
import { Button } from "@/components/ui/button";
import { useMaintenance } from "@/hooks/use-maintenance";
import { useSiteId } from "@/hooks/use-site-id";
import { useUserMetadata } from "@/hooks/use-user-metadata";
import { Plus } from "lucide-react";

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

  const { useMaintenanceRequestsQuery } = useMaintenance();

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

  if (errorMaintenanceRequests) {
    console.error(errorMaintenanceRequests);
    return <div>Error fetching maintenance requests</div>;
  }

  const displayRequests = isStaffUser && !siteId ? [] : maintenanceRequests;

  return (
    <div>
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
          <MaintenanceList
            maintenanceRequests={displayRequests}
            isLoadingMaintenanceRequests={isLoadingMaintenanceRequests}
            refetch={refetchMaintenanceRequests}
          />
        </CardContent>
      </Card>

      <MaintenanceRequestFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
};

export default MaintenanceDashboard;
