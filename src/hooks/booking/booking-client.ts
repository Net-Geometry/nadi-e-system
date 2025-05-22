import { selectCode } from "@/components/ui-showcase/SelectExamples";
import { supabase } from "@/lib/supabase";
import type { Booking } from "@/types/booking";
import { Brand } from "@/types/brand";

export const bookingClient = {
    postNewBooking: async (bookingData: Booking, isBookingAllowed: boolean): Promise<Booking> => {
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

    getAllBookings: async (isSuperAdmin: boolean) => {
        if (!isSuperAdmin) {
            throw new Error("Error denied: you don't have permission to get all booking data!")
        }

        const { data, error } = await supabase
            .from("nd_booking")
            .select(`
                *,
                nd_asset!inner (
                    name,
                    nd_asset_type (
                        category_id
                    )
                ),
                profiles (
                    full_name
                )
            `)

        if (error) throw error;

        return data;
    },

    getBooking: async (siteProfileId: number | string): Promise<Booking[]> => {
        const { data, error } = await supabase
            .from("nd_booking")
            .select(`
                *,
                nd_asset!inner (
                    *
                ),
                profiles (
                    *
                )
            `)
            .eq("site_id", siteProfileId)

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

    getBrandById: async (brandId: string) => {
        const { data, error } = await supabase
            .from("nd_brand")
            .select("*")
            .single()

        if (error) throw error;

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

    getAllRegion: async (stateId: number) => {
        const query = supabase
            .from("nd_region")
            .select(`
                id,
                eng,
                nd_state!inner (
                    id
                )
            `)

        if (stateId !== 0) {
            query.eq("nd_state.id", stateId)
        }

        const { data, error } = await query;

        if (error) throw error;

        return data;
    },

    getAllState: async (regionId: number) => {
        const query = supabase
            .from("nd_state")
            .select(`
                id,
                name
            `)

        if (regionId !== 0) {
            query.eq("region_id", regionId)
        }

        const { data, error } = await query;

        if (error) throw error;

        return data;
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
            .from("nd_site_profile")
            .select(`
                *,
                id
            `)
            .eq("dusp_tp_id", dusp_tp_id)

        if (error) throw error;

        return data;
    },

    getAllTpsSitesWithPagination: async (dusp_tp_id: string, page: number, perPage: number, searchInput: string, region: number, state: number) => {
        const from = (page - 1) * perPage;
        const to = from + perPage - 1;

        const query = supabase
            .from("nd_site_profile")
            .select(`
                *,
                nd_site (
                    *,
                    nd_asset (
                        id,
                        nd_booking (
                            id,
                            is_using
                        )
                    )
                ),
                nd_state (
                    id,
                    name
                ),
                nd_region (
                    eng,
                    bm
                )
            `)
            .range(from, to)
            .eq("dusp_tp_id", dusp_tp_id)

        if (searchInput.trim() !== "") {
            query.textSearch("sitename", searchInput)
        }

        if (region !== 0 && state !== 0) {
            query.eq("region_id", region).eq("state_id", state);
        } else if (state !== 0) {
            query.eq("state_id", state);
        } else if (region !== 0) {
            query.eq("region_id", region);
        }

        const { data, error } = await query;

        if (error) throw error;

        return data ?? [];
    },

    getTotalTpsSites: async (dusp_tp_id: string) => {

        const { data, error } = await supabase
            .from("nd_site")
            .select(`
                id,
                nd_site_profile!inner (
                    *
                )`
            )
            .eq("nd_site_profile.dusp_tp_id", dusp_tp_id)

        if (error) throw error;

        return data;
    },

    getBookingBySiteId: async (siteId: number) => {
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

        if (error) throw error;

        const filtered = data.filter(item => item?.nd_asset?.site_id === siteId);

        return filtered;
    },

    getAllPcBookingInTpsSites: async (tps_site_ids: number[]) => {
        try {
            const results = await Promise.all(
                tps_site_ids.map(async (id) => {
                    const asset = await bookingClient.getBookingBySiteId(id);
                    return asset;
                })
            );

            return results.flat();
        } catch (error) {
            console.error("Failed to fetch bookings:", error);
            return [];
        }
    },

    getAllSpaces: async (isSuperAdmin: boolean) => {
        if (!isSuperAdmin) {
            throw new Error("Error dannied: you don't have permission to get all booking data!")
        }

        const { data, error } = await supabase
            .from("nd_site_space")
            .select(`
                *,
                nd_space (
                    *
                ),
                nd_site_profile (
                    *
                )
            `)

        if (error) throw error;

        return data;
    },

    getSitesSpaces: async (siteId: string | number) => {
        const { data, error } = await supabase
            .from("nd_site_space")
            .select(`
                *,
                nd_space (
                    *
                ),
                nd_site_profile (
                    *
                )
            `)
            .eq("site_id", siteId)

        if (error) throw error;

        return data;
    },

    getAllSpaceBookings: async (isSuperAdmin: boolean) => {
        if (!isSuperAdmin) {
            throw new Error("Error dannied: you don't have permission to get all booking data!")
        }

        const { data, error } = await supabase
            .from("nd_booking")
            .select(`
                *,
                nd_site_space (
                    *,
                    nd_site_profile (*),
                    nd_space (*)
                )
            `)
            .not("site_space_id", "is", null);

        if (error) throw error;

        return data;
    },

    getSitesSpaceBookings: async (siteId: string | number) => {
        const { data: siteData, error: siteError } = await supabase
            .from("nd_site_profile")
            .select(`
                id    
            `)
            .eq("id", siteId)
            .single()

        if (siteError) throw siteError;

        const { data, error } = await supabase
            .from("nd_booking")
            .select(`
                *,
                nd_site_space (
                    *,
                    nd_site_profile (*),
                    nd_space (*)
                )
            `)

        if (error) throw error;

        const filtered = data?.map((space) => space?.nd_site_space?.site_id === siteData?.id);

        return filtered;
    },

    getAllSpaceBookingsInTpsSites: async (siteIds: number[]) => {
        try {
            const results = await Promise.all(
                siteIds.map(async (id) => {
                    const asset = await bookingClient.getSitesSpaceBookings(id);
                    return asset;
                })
            );

            return results.flat();
        } catch (error) {
            console.error("Failed to fetch bookings:", error);
            return [];
        }
    },

    getBookingBySiteSpaceId: async (id: number) => {
        const { data, error } = await supabase
            .from("nd_booking")
            .select("*")
            .eq("site_space_id", id)
            .maybeSingle()

        if (error) {
            throw error;
        }

        return data;
    },

    getSpaceByName: async (spaceName: string, siteId: number) => {
        const { data: space, error: spaceError } = await supabase
            .from("nd_space")
            .select("id")
            .eq("eng", spaceName)
            .single()

        if (spaceError) throw spaceError;

        const { data, error } = await supabase
            .from("nd_site_space")
            .select("*")
            .eq("space_id", space?.id)
            .eq("site_id", siteId)
            .single()

        if (error) throw error;

        return data;
    }
}