import { MaintenanceFormDialog } from "@/components/assets/MaintenanceFormDialog";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAssets } from "@/hooks/use-assets";
import { ArrowLeft, Calendar, Wrench } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const AssetDetails = () => {
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useAssetQuery } = useAssets();
  const { data: asset, isLoading, error } = useAssetQuery(id!);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">Loading asset details...</div>
    );
  }

  if (error || !asset) {
    return (
      <div className="flex flex-col items-center p-8">
        <p className="text-destructive">Error loading asset details</p>
        <Button variant="outline" onClick={() => navigate("/asset")}>
          Back to Asset List
        </Button>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link to="/asset">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold">Asset Details</h1>
        </div>
        <div className="flex gap-2">
          <Card className="w-1/2">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-col gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">Asset ID</p>
                  <p className="text-sm font-medium leading-none">{asset.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="text-sm font-medium leading-none">
                    {asset.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="text-sm font-medium leading-none">
                    {asset.type.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-sm font-medium leading-none">
                    {asset.is_active ? "Active" : "Inactive"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="text-sm font-medium leading-none">
                    {asset.site ? asset.site.standard_code : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="w-1/2">
            <CardHeader>
              <CardTitle>Technical Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-col gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Specifications
                  </p>
                  <p className="text-sm font-medium leading-none">
                    Intel i7, 16GB RAM, 512GB SSD
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Purchase Date</p>
                  <p className="text-sm font-medium leading-none">
                    {asset.date_install}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Last Maintenance
                  </p>
                  <p className="text-sm font-medium leading-none">N/A</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Next Maintenance
                  </p>
                  <p className="text-sm font-medium leading-none">N/A</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="w-1/2"
            variant="outline"
            onClick={() => setIsMaintenanceDialogOpen(true)}
          >
            <Wrench className="h-6 w-6" />
            <p>Make Maintenance</p>
          </Button>
          <Button className="w-1/2" variant="outline" onClick={() => {}}>
            <Calendar className="h-6 w-6" />
            <p>View History</p>
          </Button>
        </div>
      </div>
      <MaintenanceFormDialog
        open={isMaintenanceDialogOpen}
        onOpenChange={setIsMaintenanceDialogOpen}
        asset={asset}
      />
    </DashboardLayout>
  );
};

export default AssetDetails;
