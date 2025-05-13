import { useQuery } from "@tanstack/react-query";

import { MaintenanceStatus } from "@/types/maintenance";
import { useSiteId } from "../use-site-id";
import { useUserMetadata } from "../use-user-metadata";
import { maintenanceClient } from "./maintenance-client";

export const useMaintenanceQueries = () => {
  const userMetadata = useUserMetadata();
  const siteId = useSiteId();
  const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;
  const organizationId =
    parsedMetadata?.user_type !== "super_admin" &&
    parsedMetadata?.user_group_name === "TP" &&
    parsedMetadata?.organization_id
      ? parsedMetadata.organization_id
      : null;
  const isStaffUser = parsedMetadata?.user_group_name === "Centre Staff";
  const isVendor = parsedMetadata?.user_group_name === "Vendor";

  let statuses = [] as MaintenanceStatus[];

  if (isVendor) {
    statuses = Object.values(MaintenanceStatus); // This wouldn't getting status == null
  }

  let site_id: string | null = null;
  if (isStaffUser) {
    site_id = siteId;
  }
  const useMaintenanceRequestsQuery = (requestsType?: string) =>
    useQuery({
      queryKey: ["maintenance-requests", requestsType, statuses],
      queryFn: () =>
        maintenanceClient.fetchMaintenanceRequests(requestsType, statuses),
    });
  const useMaintenanceTypesQuery = () =>
    useQuery({
      queryKey: ["maintenance-types"],
      queryFn: () => maintenanceClient.fetchMaintenanceTypes(),
    });

  const useSLACategoriesQuery = () =>
    useQuery({
      queryKey: ["sla-categories"],
      queryFn: () => maintenanceClient.fetchSLACategories(),
    });

  return {
    useMaintenanceRequestsQuery,
    useMaintenanceTypesQuery,
    useSLACategoriesQuery,
  };
};
