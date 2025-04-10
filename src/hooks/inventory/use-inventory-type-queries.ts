import { useQuery } from "@tanstack/react-query";

import { inventoryClient } from "./inventory-client";

export const useInventoryTypeQueries = () => {
  const useInventoryTypesQuery = () =>
    useQuery({
      queryKey: ["inventory-types"],
      queryFn: inventoryClient.fetchInventoryTypes,
    });

  return {
    useInventoryTypesQuery,
  };
};
