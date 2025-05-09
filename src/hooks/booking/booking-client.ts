import { supabase } from "@/lib/supabase";
import type { Booking } from "@/types/booking";

export const bookingClient = {
    postNewBooking: async (bookingData: Booking, isBookingAllowed: boolean) => {
        if (!isBookingAllowed) {
            throw new Error("Access denied: You do not have permission to create a booking.")
        }

        const { error, statusText, status } = await supabase
            .from("nd_booking")
            .insert(bookingData);

        if (error) {
            console.error("Failed add new booking", error);
            throw error;
        }

        return {
            statusText,
            status
        }
    },

    getBooking: async (bookingAssetTypeId: number): Promise<Booking[]> => {
        const { data, error } = await supabase
            .from("nd_booking")
            .select("*")
            .eq("asset_id", bookingAssetTypeId);

        if (error) {
            console.error("Error fetching booking", error);
            throw error;
        }

        return data;
    },

    getFilteredBookingList: async (filterType: string = "status", filterValue: string): Promise<Booking[]> => {

        // filter status handler
        if (filterType === "status") {
            const { data, error } = await supabase
                .from("nd_booking")
                .select("*")
                .eq("status", filterValue);

            if (error) {
                console.error("error fetching filtered booking");
                throw error;
            }

            return data;
        } else {
            // filter booking (pc or facility) type handler

        }
    },

    searchBookingList: async (input: string): Promise<Booking[]> => {
        const { data, error } = await supabase
            .from("nd_booking")
            .select("*")
            .textSearch("name", input);

        if (error) {
            console.error("Error search booking name", error);
            throw error;
        }

        return data;
    }
}