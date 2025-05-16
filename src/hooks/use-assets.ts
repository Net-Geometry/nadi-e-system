import { useAssetQueries } from "./assets/use-asset-queries";
import { useAssetTypeQueries } from "./assets/use-asset-type-queries";

/**
 * Main hook for all asset-related functionality
 */
export const useAssets = () => {
  // Get all query hooks
  
const {
    useAssetsQuery,
    useAssetQuery,
    useAssetsByTypeQuery,
    useAssetsByNameQuery,
    useAssetBySite,
    useAllAssets
  } = useAssetQueries();

  const {
    useAssetTypesQuery,
    useAssetCategoriesQuery,
    useAssetTypeWithCategoryQuery,
  } = useAssetTypeQueries();

  // Export everything together
  return {
    // Query hooks
    useAssetsQuery,
    useAssetsByNameQuery,
    useAssetQuery,
    useAssetsByTypeQuery,
    useAssetTypesQuery,
    useAssetCategoriesQuery,
    useAssetTypeWithCategoryQuery,
    useAssetBySite,
    useAllAssets
  };
};
