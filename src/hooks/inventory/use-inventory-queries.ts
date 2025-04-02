import { useQuery } from "@tanstack/react-query";

import { inventoryClient } from "./inventory-client";

export const useInventoryQueries = () => {
  const useInventoriesQuery = () =>
    useQuery({
      queryKey: ["inventories"],
      queryFn: inventoryClient.fetchInventories,
    });

  const useInventoryQuery = (id: string) =>
    useQuery({
      queryKey: ["inventories", id],
      queryFn: () => inventoryClient.fetchInventoryById(id),
      enabled: !!id,
    });

  return {
    useInventoriesQuery,
    useInventoryQuery,
  };
};
