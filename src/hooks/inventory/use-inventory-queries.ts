import { useQuery } from "@tanstack/react-query";

import { useUserMetadata } from "../use-user-metadata";
import { inventoryClient } from "./inventory-client";

export const useInventoryQueries = () => {
  const userMetadata = useUserMetadata();
  const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;
  const organizationId =
    parsedMetadata?.user_type !== "super_admin" &&
    parsedMetadata?.user_group_name === "TP" &&
    parsedMetadata?.organization_id
      ? parsedMetadata.organization_id
      : null;
  const useInventoriesQuery = () =>
    useQuery({
      queryKey: ["inventories", organizationId],
      queryFn: () => inventoryClient.fetchInventories(organizationId),
      enabled: !!organizationId || parsedMetadata?.user_type === "super_admin", // Disable query if no access
    });

  const useInventoryQuery = (id: string) =>
    useQuery({
      queryKey: ["inventories", id],
      queryFn: () => inventoryClient.fetchInventoryById(id),
      enabled: !!id,
    });

  return {
    useInventoriesQuery,
    useInventoryQuery,
  };
};
