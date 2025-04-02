import { AssetFormDialog } from "@/components/assets/AssetFormDialog";
import { AssetList } from "@/components/assets/AssetList";
import { AssetStatsCard } from "@/components/dashboard/asset/AssetStatsCard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { AssetStatsCardProps } from "@/types/asset";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { useState } from "react";

const AssetDashboard = () => {
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

  const items: AssetStatsCardProps[] = [
    {
      title: "Total Assets",
      value: isLoading ? "Loading..." : assetStats?.total.toString() || "0",
      description: "Asset registered",
    },
    {
      title: "Active Assets",
      value: isLoading ? "Loading..." : assetStats?.active.toString() || "0",
      color: "green-600",
      description: "Currently in use",
    },
    {
      title: "Under Maintenance",
      value: isLoading
        ? "Loading..."
        : assetStats?.maintenance.toString() || "0",
      color: "red-600",
      description: "Being serviced",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Asset Management</h1>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Asset
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <AssetStatsCard key={item.title} {...item} />
          ))}
        </div>

        <AssetList />
        <AssetFormDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      </div>
    </DashboardLayout>
  );
};

export default AssetDashboard;
