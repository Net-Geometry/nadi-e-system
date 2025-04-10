import { useQuery } from "@tanstack/react-query";

import { assetClient } from "./asset-client";

import { useUserMetadata } from "@/hooks/use-user-metadata";

export const useAssetQueries = () => {
  const userMetadata = useUserMetadata();
  const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;
  const organizationId =
    parsedMetadata?.user_type !== "super_admin" &&
    parsedMetadata?.user_group_name === "TP" &&
    parsedMetadata?.organization_id
      ? parsedMetadata.organization_id
      : null;
  const useAssetsQuery = () =>
    useQuery({
      queryKey: ["assets", organizationId],
      queryFn: () => assetClient.fetchAssets(organizationId),
      enabled: !!organizationId || parsedMetadata?.user_type === "super_admin", // Disable query if no access
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
