import { useMutation } from "@tanstack/react-query";
import { useSiteId } from "../use-site-id";
import { useUserMetadata } from "../use-user-metadata"
import { bookingClient } from "./booking-client";
import type { Booking } from "@/types/booking";

export const useBookingMutation = () => {
    const userMetaData = useUserMetadata();
    const parsedUserMetaData = userMetaData ? JSON.parse(userMetaData) : null;
    const siteId = useSiteId();
    const organizationId =
      parsedUserMetaData?.user_type !== "super_admin" &&
      parsedUserMetaData?.user_group_name === "TP" &&
      parsedUserMetaData?.organization_id
        ? parsedUserMetaData.organization_id
        : null;
    const isBookingAllowed = parsedUserMetaData?.user_group_name === "Centre Staff";

    const useAssetMutation = (newBooking: Booking) => 
        useMutation({
            mutationKey: ["assets", siteId, organizationId],
            mutationFn: () => bookingClient.postNewBooking(newBooking, isBookingAllowed)
        });

    return {
      useAssetMutation
    }
}