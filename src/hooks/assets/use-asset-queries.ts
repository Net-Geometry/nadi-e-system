import { useQuery } from "@tanstack/react-query";

import { assetClient } from "./asset-client";

export const useAssetQueries = () => {
  const useAssetsQuery = () =>
    useQuery({
      queryKey: ["assets"],
      queryFn: assetClient.fetchAssets,
    });

  const useAssetQuery = (id: string) =>
    useQuery({
      queryKey: ["assets", id],
      queryFn: () => assetClient.fetchAssetById(id),
      enabled: !!id,
    });

  return {
    useAssetsQuery,
    useAssetQuery,
  };
};
