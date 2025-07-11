import { useQuery } from "@tanstack/react-query";
import { useSiteId } from "@/hooks/use-site-id";
import { useUserMetadata } from "@/hooks/use-user-metadata";
import { bookingClient } from "./booking-client";

export const useBookingQueries = () => {
    const userMetadata = useUserMetadata();
    const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;
    const organizationId =
        parsedMetadata?.user_type !== "super_admin" &&
        parsedMetadata?.user_group_name === "TP" &&
        parsedMetadata?.organization_id
        ? parsedMetadata.organization_id
        : null;

    const useBookingQuery = (siteId: number) =>
        useQuery({
            queryKey: ["booking", siteId],
            queryFn: () => bookingClient.getBooking(siteId),
            enabled:
                !!siteId
        });

    const useBookingAssetBrandQuery = () =>
        useQuery({
            queryKey: ["brand"],
            queryFn: () => bookingClient.getBrands()
        })

    const useTpsSites = (dusp_tp_id: string, isdusp?: boolean) => 
        useQuery({
            queryKey: ["tpsSites", dusp_tp_id],
            queryFn: () => bookingClient.getAllTpsSites(dusp_tp_id, isdusp),
            enabled: !!dusp_tp_id
        })

    const useTpsSitesWithPagination = (
        dusp_tp_id: string, 
        page: number, 
        perPage: number, 
        {searchInput, region, state}
    ) =>
        useQuery({
            queryKey:["sites", page, perPage, dusp_tp_id, searchInput, region, state],
            queryFn: async () => {
                try {
                    return await bookingClient.getAllTpsSitesWithPagination(dusp_tp_id, page, perPage, searchInput, region, state)
                } catch (error) {
                    console.error(error);
                    throw error;
                }
            },
            enabled: page !== undefined && 
                perPage !== undefined && 
                !!dusp_tp_id
        })

    const useBookingAssetInTpsSites = (tps_site_ids: number[]) => 
        useQuery({
            queryKey: ["bookingInTpsSites", ...tps_site_ids],
            queryFn: () => bookingClient.getAllPcBookingInTpsSites(tps_site_ids),
            enabled: tps_site_ids.length > 0
        })

    const useAllBookings = (isSuperAdmin: boolean) =>
        useQuery({
            queryKey: ["allBookings"],
            queryFn: () => bookingClient.getAllBookings(isSuperAdmin),
            enabled: isSuperAdmin
        })

    const useAllSpaces = (isSuperAdmin: boolean) =>
        useQuery({
            queryKey: ["allSPaces"],
            queryFn: () => bookingClient.getAllSpaces(isSuperAdmin),
            enabled: isSuperAdmin
        })

    const useSpaces = () => 
        useQuery({
            queryKey: ["spaces"],
            queryFn: () => bookingClient.getSpace()
        })

    const useSitesSpaces = (siteId: number) =>
        useQuery({
            queryKey: ["sitesSpaces", siteId],
            queryFn: () => bookingClient.getSitesSpaces(siteId),
            enabled: !!siteId
        })

    const useAllSpacesBookings = (isSuperAdmin: boolean) =>
        useQuery({
            queryKey: ["allSpacesBookings"],
            queryFn: () => bookingClient.getAllSpaceBookings(isSuperAdmin),
            enabled: isSuperAdmin
        })

    const usesitesSpacesBookings = (siteId: number) =>
        useQuery({
            queryKey: ["sitesSpaceBookings", siteId],
            queryFn: () => bookingClient.getSitesSpaceBookings(siteId),
            enabled: !!siteId
        })

    const useBookingSpacesInTpsSites = (siteIds: number[]) =>
        useQuery({
            queryKey: ["BookingSpaceInTpsSites", ...siteIds],
            queryFn: () => bookingClient.getAllSpaceBookingsInTpsSites(siteIds),
            enabled: siteIds.length > 0
        })

    const useSpacesBySite = (siteProfileId: number | null, siteId?: number) =>
        useQuery({
            queryKey: (!siteProfileId ? ["sitesSpaces", siteId] : !siteId ? ["sitesSpaces", siteProfileId] : ["sitesSpaces", siteProfileId, siteId]),
            queryFn: () => bookingClient.getSitesSpaces(siteProfileId, siteId),
            enabled: !!siteProfileId || !!siteId
        })

    const useAllRegion = (stateId: number) => 
        useQuery({
            queryKey: ["allRegion", stateId],
            queryFn: () => bookingClient.getAllRegion(stateId)
        })

    const useAllState = (regionId: number) => 
        useQuery({
            queryKey: ["allState", regionId],
            queryFn: () => bookingClient.getAllState(regionId)
        })

    const useUserProfileByName = (full_name: string) =>
        useQuery({
            queryKey: ["userProfile", full_name],
            queryFn: () => bookingClient.getUserProfilesByName(full_name),
            enabled: full_name.trim().length > 0
        })

    const useTriggerPcCommands = (asset_id: string, command: string) =>
        useQuery({
            queryKey: ["triggerCmd", asset_id, command],
            queryFn: () => bookingClient.triggerPcCommands(asset_id, command),
            enabled: asset_id !== null && command !== null
        })

    const useMaintenancePc = () => 
        useQuery({
            queryKey: ["maintenancePc"],
            queryFn: () => bookingClient.getMaintenancePc()
        });

    const useSpaceMaintenanceById = (spaceId: number) =>
        useQuery({
            queryKey: ["spaceMaintenance", spaceId],
            queryFn: () => bookingClient.getMaintenanceBySpaceId(spaceId),
            enabled: !!spaceId
        })

    return {
        useBookingQuery,
        useBookingAssetBrandQuery,
        useTpsSites,
        useBookingAssetInTpsSites,
        useAllBookings,
        useAllSpaces,
        useSitesSpaces,
        useAllSpacesBookings,
        usesitesSpacesBookings,
        useBookingSpacesInTpsSites,
        useSpacesBySite,
        useAllRegion,
        useTpsSitesWithPagination,
        useAllState,
        useUserProfileByName,
        useTriggerPcCommands,
        useMaintenancePc,
        useSpaces,
        useSpaceMaintenanceById
    };
};
