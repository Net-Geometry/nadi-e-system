import { useQuery } from "@tanstack/react-query";

import { assetClient } from "./asset-client";

import { useSiteId } from "@/hooks/use-site-id";
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
  const isStaffUser = parsedMetadata?.user_group_name === "Centre Staff";

  const site_id = useSiteId(isStaffUser);

  const useAssetsQuery = () =>
    useQuery({
      queryKey: ["assets", organizationId, site_id],
      queryFn: () => assetClient.fetchAssets(organizationId, site_id),
      enabled:
        (!!organizationId && !isStaffUser) ||
        parsedMetadata?.user_type === "super_admin" ||
        (isStaffUser && !!site_id),
    });

  const useAssetsByNameQuery = (name: string, isActive?: boolean) =>
    useQuery({
      queryKey: ["assets", organizationId, site_id, name],
      queryFn: () =>
        assetClient.fetchAssetsByName(organizationId, site_id, name, isActive),
      enabled:
        !!name &&
        (!!organizationId || parsedMetadata?.user_type === "super_admin") &&
        (!isStaffUser || !!site_id),
    });

  const useAssetsByTypeQuery = (typeId: number) => 
    useQuery({
      queryKey: ["assets", typeId],
      queryFn: () => assetClient.fetchAssetsByType(typeId),
      enabled: !!typeId
    });

  const useAssetQuery = (id: string) =>
    useQuery({
      queryKey: ["assets", id],
      queryFn: () => assetClient.fetchAssetById(id),
      enabled: !!id,
    });

  return {
    useAssetsQuery,
    useAssetsByNameQuery,
    useAssetQuery,
    useAssetsByTypeQuery,
  };
};
