import { useMutation, useQuery } from "@tanstack/react-query";

import { assetClient } from "./asset-client";

import { useSiteId, useTpManagerSiteId } from "@/hooks/use-site-id";
import { useUserMetadata } from "@/hooks/use-user-metadata";
import { useSiteIdFromSiteProfile } from "../use-site-profile-site-id";

export const useAssetQueries = () => {
  const userMetadata = useUserMetadata();
  const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;
  const organizationId =
    parsedMetadata?.user_type !== "super_admin" &&
    parsedMetadata?.organization_id
      ? parsedMetadata.organization_id
      : null;
  const isStaffUser = parsedMetadata?.user_group_name === "Centre Staff";
  const isTpSite = parsedMetadata?.user_group_name === "Site";

  const siteIdStaff = useSiteId(isStaffUser);
  const {
    siteId: siteProfileIdTpManager,
    isLoading: siteProfileIdTpManagerLoading,
  } = useTpManagerSiteId(isTpSite);
  const siteIdTpManager = useSiteIdFromSiteProfile(
    siteProfileIdTpManagerLoading ? null : siteProfileIdTpManager
  );
  let site_id: string | null = null;
  if (isStaffUser) {
    site_id = siteIdStaff;
  } else if (isTpSite) {
    site_id = siteIdTpManager;
  }

  const useAssetsQuery = () =>
    useQuery({
      queryKey: ["assets", organizationId, site_id],
      queryFn: () => assetClient.fetchAssets(organizationId, site_id),
      enabled:
        (!!organizationId && !isStaffUser && !isTpSite) ||
        parsedMetadata?.user_type === "super_admin" ||
        ((isStaffUser || isTpSite) && !!site_id),
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

  const useAssetsByTypeQuery = (siteId: number) =>
    useQuery({
      queryKey: ["assets", siteId],
      queryFn: () => assetClient.fetchAssetsByType(siteId),
      enabled: !!siteId,
    });

  const useAssetQuery = (id: number) =>
    useQuery({
      queryKey: ["assets", id],
      queryFn: () => assetClient.fetchAssetById(id),
      enabled: !!id,
    });

  const useAllAssets = (isSuperAdmin: boolean) =>
    useQuery({
      queryKey: ["allAssets"],
      queryFn: () => assetClient.fetchSuperAdminAsset(isSuperAdmin),
      enabled: isSuperAdmin,
    });

  const useAssetBySite = (tps_sites_id: number) =>
    useQuery({
      queryKey: ["tpsAssets", tps_sites_id],
      queryFn: () => assetClient.fetchAssetsBySiteId(tps_sites_id),
      enabled: !!tps_sites_id
    });

  const useAssetsInTpsSites = (tpOrgId: string) =>
    useQuery({
      queryKey: ["tpsAssets", tpOrgId],
      queryFn: () => assetClient.fetchAssetsInTpsSites(tpOrgId),
      enabled: !!tpOrgId
    });

  const useToggleAssetStatus = (assetId: string, currentStatus: boolean) =>
    useMutation({
      mutationKey: ["toggleStatus"],
      mutationFn: () => assetClient.toggleAssetActiveStatus(assetId, currentStatus)
    })

  return {
    useAssetsQuery,
    useAssetsByNameQuery,
    useAssetQuery,
    useAssetsByTypeQuery,
    useAssetBySite,
    useAllAssets,
    useAssetsInTpsSites,
    useToggleAssetStatus
  };
};
