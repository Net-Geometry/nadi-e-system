import { useInventoryQueries } from "./inventory/use-inventory-queries";
import { useInventoryTypeQueries } from "./inventory/use-inventory-type-queries";

/**
 * Main hook for all inventory-related functionality
 */
export const useInventories = () => {
  // Get all query hooks
  const { useInventoriesQuery, useInventoryQuery } = useInventoryQueries();

  const { useInventoryTypesQuery } = useInventoryTypeQueries();

  // Export everything together
  return {
    // Query hooks
    useInventoriesQuery,
    useInventoryQuery,
    useInventoryTypesQuery,
  };
};
