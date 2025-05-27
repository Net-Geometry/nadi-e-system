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
      parsedUserMetaData?.user_group_name === "TP" || parsedUserMetaData?.user_group_name === "MSD" &&
      parsedUserMetaData?.organization_id
        ? parsedUserMetaData.organization_id
        : null;

    const useBookingPcMutation = (isBookingAllowed: boolean) => 
        useMutation({
            mutationKey: ["assets", siteId, organizationId],
            mutationFn: (
              newBooking: Booking
            ) => bookingClient.postNewBooking(newBooking, isBookingAllowed)
        });

    return {
      useBookingPcMutation
    }
}