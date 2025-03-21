import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { History, Settings } from "lucide-react";
import { useState } from "react";
import { MaintenanceFormDialog } from "./MaintenanceFormDialog";

interface Asset {
  id: string;
  name: string;
  category: string;
  status: "active" | "in_maintenance" | "retired" | "disposed";
  purchase_date: string;
  current_value: number;
  purchase_cost: number;
  depreciation_rate: number;
  next_maintenance_date: string | null;
  location: string;
}

export const AssetList = () => {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ["assets"],
    queryFn: async () => {
      console.log("Fetching assets...");
      try {
        const { data, error } = await supabase
          .from("assets")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data as Asset[];
      } catch (error) {
        console.error("Error fetching assets:", error);
        throw error;
      }
    },
  });

  const handleMaintenanceClick = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsMaintenanceDialogOpen(true);
  };

  if (isLoading) {
    return <div>Loading assets...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border p-4">
        <h1 className="text-2xl font-bold mb-4">Asset List</h1>
        <div className="flex flex-col gap-2">
          {assets.map((asset) => {
            return (
              <div className="flex justify-between rounded-sm border bg-slate-50 p-2">
                <div className="flex flex-col p-1">
                  <h2 className="text-md font-semibold">{asset.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {asset.category}
                  </p>
                </div>
                <div className="flex space-x-2 p-1">
                  <Button variant="outline" size="icon">
                    <History className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleMaintenanceClick(asset)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <MaintenanceFormDialog
        open={isMaintenanceDialogOpen}
        onOpenChange={setIsMaintenanceDialogOpen}
        asset={selectedAsset}
      />
    </div>
  );
};
