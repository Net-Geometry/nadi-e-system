import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Box, Package, Settings, DollarSign, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { AssetList } from "@/components/assets/AssetList";
import { useState } from "react";
import { AssetFormDialog } from "@/components/assets/AssetFormDialog";

const InventoryDashboard = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    data: assetStats = { total: 0, active: 0, maintenance: 0, value: 0 },
    isLoading,
  } = useQuery({
    queryKey: ["asset-stats"],
    queryFn: async () => {
      console.log("Fetching asset statistics...");
      try {
        const { data: assets, error } = await supabase
          .from("assets")
          .select("status, current_value");

        if (error) throw error;

        const stats = {
          total: assets.length,
          active: assets.filter((a) => a.status === "active").length,
          maintenance: assets.filter((a) => a.status === "in_maintenance")
            .length,
          value: assets.reduce(
            (sum, asset) => sum + (Number(asset.current_value) || 0),
            0
          ),
        };

        return stats;
      } catch (error) {
        console.error("Error fetching asset stats:", error);
        throw error;
      }
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Asset Management</h1>
            <p className="text-muted-foreground mt-2">
              Track and manage company assets, inventory, and maintenance
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Asset
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Assets
              </CardTitle>
              <Box className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assetStats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Assets
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assetStats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                In Maintenance
              </CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assetStats.maintenance}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${assetStats.value.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        <AssetList />
        <AssetFormDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      </div>
    </DashboardLayout>
  );
};

export default InventoryDashboard;
