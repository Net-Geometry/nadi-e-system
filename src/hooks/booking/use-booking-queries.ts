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

    let site_id: string | null = null;
    if (isStaffUser) {
        site_id = siteId;
    }

    const useBookingQuery = (bookingAssetTypeId: number) =>
        useQuery({
            queryKey: ["booking", organizationId, site_id],
            queryFn: () => bookingClient.getBooking(bookingAssetTypeId),
            enabled:
                (!!organizationId && !isStaffUser) ||
                parsedMetadata?.user_type === "super_admin" ||
                (isStaffUser && !!siteId),
        });

    return {
        useBookingQuery
    };
};
