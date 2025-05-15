import { supabase } from "@/lib/supabase";
import type { Booking } from "@/types/booking";
import { Brand } from "@/types/brand";

export const bookingClient = {
    postNewBooking: async (bookingData: Booking, isBookingAllowed: boolean) => {
        if (!isBookingAllowed) {
            throw Error("Error dannied: you don't have permission to create a book!")
        }

        const { error, data } = await supabase
            .from("nd_booking")
            .insert(bookingData)
            .select("*")
            .maybeSingle()

        if (error) {
            console.error("Failed add new booking", error);
            throw error;
        }

        return data;
    },

    getBooking: async (bookingAssetTypeId: number): Promise<Booking[]> => {
        const { data, error } = await supabase
            .from("nd_booking")
            .select(`
                *,
                nd_asset!inner (
                    name
                ),
                profiles (
                    full_name
                )
            `)
            .eq("nd_asset.type_id", bookingAssetTypeId);

        if (error) {
            console.error("Error fetching booking", error);
            throw error;
        }

        return data;
    },

    getBrands: async (): Promise<Brand[]> => {
        const { data, error } = await supabase
            .from("nd_brand")
            .select("*")

        if (error) {
            console.error("Error fetching brand", error);
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
                .eq("is_using", filterValue);

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
    },

    getAllTpsSites: async (dusp_tp_id: string) => {
        const { data, error } = await supabase
            .from("nd_site")
            .select(`
                id,
                nd_site_profile!inner (
                    *
                )
            `)
            .eq("nd_site_profile.dusp_tp_id", dusp_tp_id);

        if (error) throw error;

        return data;
    },

    getBookingBySiteId: async (siteId: number, bookingAssetTypeId: number) => {
        const { data, error } = await supabase
            .from("nd_booking")
            .select(`
                *,
                nd_asset!inner (
                    site_id,
                    name
                ),
                profiles (
                    full_name
                )    
            `)
            .eq("nd_asset.type_id", bookingAssetTypeId)
            .eq("nd_asset.site_id", siteId)

        if (error) throw error;

        return data;
    },

    getAllPcBoookingInTpsSites: async (tps_site_ids: number[], bookingAssetTypeId: number) => {
        try {
            const results = await Promise.all(
                tps_site_ids.map(async (id) => {
                    const asset = await bookingClient.getBookingBySiteId(id, bookingAssetTypeId);
                    return asset;
                })
            );

            return results.flat();
        } catch (error) {
            console.error("Failed to fetch bookings:", error);
            return [];
        }
    }
}