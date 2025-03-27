import { Button, buttonVariants } from "@/components/ui/button";
import { useAssets } from "@/hooks/use-assets";
import { Asset } from "@/types/asset";
import { History, Settings } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export const AssetList = () => {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);

  const { useAssetsQuery } = useAssets();
  const { data: assets, isLoading, error } = useAssetsQuery();

  if (error) {
    console.error("Error fetching assets:", error);
    return <div>Error fetching assets</div>;
  }

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
                    {asset.type.name}
                  </p>
                </div>
                <div className="flex space-x-2 p-1">
                  <Button variant="outline" size="icon">
                    <History className="h-4 w-4" />
                  </Button>
                  <Link
                    className={buttonVariants({
                      variant: "outline",
                      size: "icon",
                    })}
                    to={{
                      pathname: "/asset/detail/" + asset.id,
                    }}
                  >
                    <Settings className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* <MaintenanceFormDialog
        open={isMaintenanceDialogOpen}
        onOpenChange={setIsMaintenanceDialogOpen}
        asset={selectedAsset}
      /> */}
    </div>
  );
};
