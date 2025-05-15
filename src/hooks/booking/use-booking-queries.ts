import { useQuery } from "@tanstack/react-query";
import { useSiteId } from "@/hooks/use-site-id";
import { useUserMetadata } from "@/hooks/use-user-metadata";
import { bookingClient } from "./booking-client";

export const useBookingQueries = () => {
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

    const useBookingQuery = (bookingAssetTypeId: number) =>
        useQuery({
            queryKey: ["booking", organizationId, siteId],
            queryFn: () => bookingClient.getBooking(bookingAssetTypeId),
            // enabled:
            //     (!!organizationId && !isStaffUser) ||
            //     (isStaffUser && !!siteId),
        });

    const useBookingAssetBrandQuery = () =>
        useQuery({
            queryKey: ["brand"],
            queryFn: () => bookingClient.getBrands()
        })

    const useTpsSites = (dusp_tp_id: string) => 
        useQuery({
            queryKey: ["tpsSites"],
            queryFn: () => bookingClient.getAllTpsSites(dusp_tp_id),
            enabled: !!dusp_tp_id
        })

    const useBookingAssetInTpsSites = (tps_site_ids: number[], bookingAssetType: number) => 
        useQuery({
            queryKey: ["bookingInTpsSites", tps_site_ids, bookingAssetType],
            queryFn: () => bookingClient.getAllPcBoookingInTpsSites(tps_site_ids, bookingAssetType),
            enabled: tps_site_ids.length > 0
        })

    return {
        useBookingQuery,
        useBookingAssetBrandQuery,
        useTpsSites,
        useBookingAssetInTpsSites
    };
};
