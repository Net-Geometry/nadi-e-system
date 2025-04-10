import { Button, buttonVariants } from "@/components/ui/button";
import { useInventories } from "@/hooks/use-inventories";
import { History, Settings } from "lucide-react";
import { Link } from "react-router-dom";

export const InventoryList = () => {
  const { useInventoriesQuery } = useInventories();
  const { data: inventories, isLoading, error } = useInventoriesQuery();

  if (error) {
    console.error("Error fetching inventories:", error);
    return <div>Error fetching inventories</div>;
  }

  if (isLoading) {
    return <div>Loading inventories...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border p-4">
        <h1 className="text-2xl font-bold mb-4">Inventory List</h1>
        <div className="flex flex-col gap-2">
          {inventories &&
            inventories.map((inventory) => {
              return (
                <div
                  key={inventory.id}
                  className="flex justify-between rounded-sm border bg-slate-50 p-2"
                >
                  <div className="flex flex-col p-1">
                    <h2 className="text-md font-semibold">{inventory.name}</h2>
                    <p className="text-xs text-muted-foreground">
                      {inventory.type.name}
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
                        pathname: "/inventory/detail/" + inventory.id,
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
    </div>
  );
};
