import { useAssetQueries } from "./assets/use-asset-queries";
import { useAssetTypeQueries } from "./assets/use-asset-type-queries";

/**
 * Main hook for all asset-related functionality
 */
export const useAssets = () => {
  // Get all query hooks
  const { useAssetsQuery, useAssetQuery } = useAssetQueries();

  const {
    useAssetTypesQuery,
    useAssetCategoriesQuery,
    useAssetTypeWithCategoryQuery,
  } = useAssetTypeQueries();

  // Export everything together
  return {
    // Query hooks
    useAssetsQuery,
    useAssetQuery,
    useAssetTypesQuery,
    useAssetCategoriesQuery,
    useAssetTypeWithCategoryQuery,
  };
};
