import { useQuery } from "@tanstack/react-query";

import { assetClient } from "./asset-client";

export const useAssetTypeQueries = () => {
  const useAssetTypesQuery = () =>
    useQuery({
      queryKey: ["asset-types"],
      queryFn: assetClient.fetchAssetTypes,
    });

  const useAssetCategoriesQuery = () =>
    useQuery({
      queryKey: ["asset-categories"],
      queryFn: assetClient.fetchAssetCategories,
    });

  const useAssetTypeWithCategoryQuery = () =>
    useQuery({
      queryKey: ["asset-types-with-category"],
      queryFn: assetClient.fetchAssetTypesWithCategory,
    });

  return {
    useAssetTypesQuery,
    useAssetCategoriesQuery,
    useAssetTypeWithCategoryQuery,
  };
};
