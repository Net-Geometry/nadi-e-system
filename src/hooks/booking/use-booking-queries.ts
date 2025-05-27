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

    const useTpsSites = (dusp_tp_id: string) => 
        useQuery({
            queryKey: ["tpsSites", dusp_tp_id],
            queryFn: () => bookingClient.getAllTpsSites(dusp_tp_id),
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
            queryKey: ["bookingInTpsSites", tps_site_ids],
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
            queryFn: () => {
                try {
                    return bookingClient.getSitesSpaceBookings(siteId)
                } catch (error) {
                    console.log(error.message)
                }
            },
            enabled: !!siteId
        })

    const useBookingSpacesInTpsSites = (siteIds: number[]) =>
        useQuery({
            queryKey: ["BookingSpaceInTpsSites", siteIds],
            queryFn: () => bookingClient.getAllPcBookingInTpsSites(siteIds),
            enabled: siteIds.length > 0
        })

    const useSpacesBySite = (site_id: number) =>
        useQuery({
            queryKey: ["sitesSpaces", site_id],
            queryFn: () => bookingClient.getSitesSpaces(site_id),
            enabled: !!site_id
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
        useAllState
    };
};
