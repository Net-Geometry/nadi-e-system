import { useMutation } from "@tanstack/react-query";
import { useSiteId } from "../use-site-id";
import { useUserMetadata } from "../use-user-metadata"
import { bookingClient } from "./booking-client";
import type { Booking } from "@/types/booking";
import { MaintenanceRequest } from "@/types/maintenance";

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
            ) => bookingClient.postNewBooking(newBooking, isBookingAllowed),
            onSuccess: (data) => {
                // Optionally handle success, e.g., show a notification
                console.log("Booking created successfully:", data);
            }
        });

    const useMaintenanceSpaceMutation = () =>
        useMutation({
            mutationKey: ["maintenanceSpace", siteId, organizationId],
            mutationFn: (
              maintenanceData: MaintenanceRequest
            ) => bookingClient.postSpaceMaintenance(maintenanceData),
            onSuccess: (data) => {
                // Optionally handle success, e.g., show a notification
                console.log("Maintenance space booking created successfully:", data);
            }
        });

    return {
      useBookingPcMutation,
      useMaintenanceSpaceMutation
    }
}