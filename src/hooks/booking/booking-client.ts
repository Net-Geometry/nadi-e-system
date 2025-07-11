import { selectCode } from "@/components/ui-showcase/SelectExamples";
import { supabase } from "@/lib/supabase";
import type { Booking } from "@/types/booking";
import { Brand } from "@/types/brand";
import { MaintenanceRequest } from "@/types/maintenance";

export const bookingClient = {
    postNewPcBooking: async (bookingData: Booking, isBookingAllowed: boolean): Promise<Booking> => {
        if (!isBookingAllowed) {
            throw Error("Error dannied: you don't have permission to create a book!")
        }

        const { error, data } = await supabase
            .from("nd_booking")
            .insert(bookingData)
            .select(`*,
                nd_asset (*),
                profiles (*),
                nd_site_profile (*),
                nd_site_space (*, nd_space (*))`)
            .maybeSingle()

        if (error) {
            console.error("Failed add new booking", error);
            throw error;
        }

        if (!data) {
            throw new Error("No booking data returned from Supabase.");
        }

        return data;
    },

    deleteBooking: async (bookingId: string, isFacility: boolean) => {
        if (isFacility) {
            const { data: facilitiesBooking, error: facilitiesBookingError } = await supabase
                .from("nd_booking")
                .select("*")
                .eq("id", bookingId)
                .maybeSingle();
            console.log("facilitiesBooking", facilitiesBooking);
            if (facilitiesBookingError) throw facilitiesBookingError;

            const { data: siteSpaceBooking, error: siteSpaceBookingError } = await supabase
                .from("nd_booking")
                .select("*")
                .eq("site_space_id", facilitiesBooking.site_space_id);

            console.log("siteSpaceBooking", siteSpaceBooking);

            if (siteSpaceBookingError) throw siteSpaceBookingError;

            const { data, error } = await supabase
                .from("nd_booking")
                .delete()
                .in("id", siteSpaceBooking.map((booking) => booking.id))
                .select("*");

            if (error) {
                console.error("Failed delete booking", error);
                throw error;
            }

            console.log("deleted data", data);

            return { site_space_id: facilitiesBooking.site_space_id };
        };

        const { error } = await supabase
            .from("nd_booking")
            .delete()
            .eq("id", bookingId);

        if (error) {
            console.error("Failed delete booking", error);
            throw error;
        }

        return { site_space_id: null };
    },

    postNewSpaceBooking: async (bookingData: Booking, isBookingAllowed: boolean): Promise<Booking> => {
        if (!isBookingAllowed) {
            throw Error("Error dannied: you don't have permission to create a book!")
        }

        const siteSpaceId = bookingData.site_space_id;
        const { data: siteSpace, error: siteSpaceError } = await supabase
            .from("nd_site_space")
            .select("*")
            .eq("id", siteSpaceId)
            .single();

        if (siteSpaceError) throw siteSpaceError;

        const { data: assetType, error: assetTypeError } = await supabase
            .from("nd_asset_type")
            .select("*")
            .eq("name", "PC")
            .single();

        if (assetTypeError) throw assetTypeError;

        const { data: assetData, error: assetError } = await supabase
            .from("nd_asset")
            .select("*")
            .eq("site_id", siteSpace.site_id)
            .eq("location_id", siteSpace.space_id)
            .eq("type_id", assetType.id)

        if (assetError) throw assetError;

        let pcsBookingData = [];

        for (const asset of assetData) {
            // create new booking for each pc
            const bookingId = crypto.randomUUID();
            const submittedNewBookingPcData: Booking = {
                site_space_id: siteSpaceId,
                asset_id: asset.id,
                booking_start: bookingData.booking_start,
                booking_end: bookingData.booking_end,
                created_by: bookingData.created_by,
                requester_id: bookingData.requester_id,
                id: bookingId,
                created_at: new Date().toISOString(),
                is_active: true,
                purpose: bookingData.purpose,
                site_id: bookingData.site_id
            }
            const { error, data } = await supabase
                .from("nd_booking")
                .insert(submittedNewBookingPcData)
                .select(`*,
                    nd_asset (*),
                    profiles (*),
                    nd_site_profile (*),
                    nd_site_space (*, nd_space (*))`)
                .maybeSingle()

            if (error) {
                console.error("Failed add new booking", error);
                throw error;
            }

            pcsBookingData.push(data);
        }

        const { error, data } = await supabase
            .from("nd_booking")
            .insert(bookingData)
            .select(`*,
                nd_asset (*),
                profiles (*),
                nd_site_profile (*),
                nd_site_space (*, nd_space (*))`)
            .maybeSingle()

        if (error) {
            console.error("Failed add new booking", error);
            throw error;
        }

        if (!data) {
            throw new Error("No booking data returned from Supabase.");
        }

        return {
            ...data,
            pcsBookingData
        };
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

    getAllTpsSites: async (dusp_tp_id: string, isdusp?: boolean) => {
        let query = supabase
            .from("nd_site_profile")
            .select("*")

        if (isdusp) {
            const { data: childOrganizations, error: childError } = await supabase
                .from("organizations")
                .select("id")
                .eq("parent_id", dusp_tp_id);

            if (childError) throw childError;

            const childOrganizationIds = childOrganizations.map((org) => org.id);

            query = query.in("dusp_tp_id", [
                dusp_tp_id,
                ...childOrganizationIds,
            ]);
        } else {
            query = query.eq("dusp_tp_id", dusp_tp_id)
        }

        const { data, error } = await query;

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
        const { data, error } = await supabase
            .from("nd_booking")
            .select(`
                *,
                nd_asset (
                    site_id,
                    name
                ),
                profiles (
                    full_name
                )    
            `);

        if (error) throw error;

        const filtered = data.filter((site) => tps_site_ids.includes(site?.nd_asset?.site_id));

        return filtered;
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

        const filtered = data.filter((space) => space?.nd_space?.is_enable_book === true);

        return filtered;
    },

    getSpace: async () => {
        const { data, error } = await supabase
            .from("nd_space")
            .select("id, eng");
        if (error) {
            console.error("Error fetching space", error);
            throw error;
        }
        return data;
    },

    getSitesSpaces: async (siteProfileId: number | null, siteId?: number) => {
        let selectedSiteId = siteProfileId;

        if (siteId) {
            const { data: siteProfile, error: errorSiteProfile } = await supabase
                .from("nd_site")
                .select("site_profile_id")
                .eq("id", siteId)
                .single()
            if (errorSiteProfile) throw errorSiteProfile;
            selectedSiteId = siteProfile?.site_profile_id
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
                ),
                nd_booking (*)
            `)
            .eq("site_id", selectedSiteId)

        if (error) throw error;

        const filtered = data.filter((space) => space?.nd_space?.is_enable_book === true);

        return filtered;
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
            .not("site_space_id", "is", null)
            .is("asset_id", null)

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
            .is("asset_id", null)

        if (error) throw error;

        const filtered = data?.filter((space) => space?.nd_site_space?.site_id === siteData?.id);

        return filtered;
    },

    getAllSpaceBookingsInTpsSites: async (siteIds: number[]) => {
        const { data, error } = await supabase
            .from("nd_booking")
            .select(`
                *,
                nd_site_space (
                    *
                )
            `)
            .is("asset_id", null)

        if (error) throw error;

        const filtered = data.filter((space) => siteIds.includes(space?.nd_site_space?.site_id));

        return filtered;
    },

    getBookingBySiteSpaceId: async (id: number) => {
        const { data, error } = await supabase
            .from("nd_booking")
            .select(`*,
                profiles (*)`)
            .eq("site_space_id", id)
            .eq("is_active", true)

        if (error) {
            throw error;
        }

        const selectedSpace = data?.find((book) => book?.is_active === true);

        return selectedSpace ? selectedSpace : data;
    },

    getSpaceByName: async (spaceName: string, siteId: number) => {
        const { data: space, error: spaceError } = await supabase
            .from("nd_space")
            .select("*")
            .eq("eng", spaceName)
            .single()

        if (spaceError) throw spaceError;

        const { data, error } = await supabase
            .from("nd_site_space")
            .select("*")
            .eq("space_id", space.id)
            .eq("site_id", siteId)
            .single()

        if (error) throw error;

        return data;
    },

    getUserProfilesByName: async (full_name: string) => {
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .textSearch("full_name", full_name)
            .or("user_type.eq.member, user_type.eq.tp_site")

        if (error) throw error;

        return data;
    },

    triggerPcCommands: async (asset_id: string, command: string) => {
        const { data, error } = await supabase.functions.invoke("trigger-pc-command",
            {
                body: { asset_id, command },
                method: "POST"
            }
        );

        if (error) throw error;

        return data;
    },

    getMaintenancePc: async () => {
        const { data, error } = await supabase
            .from("nd_maintenance_request")
            .select(`
              asset_id  
            `)
            .eq("status", "submitted");

        if (error) throw error;

        return data;
    },

    postSpaceMaintenance: async (maintenanceData: MaintenanceRequest) => {
        const { error, data } = await supabase
            .from("nd_maintenance_request")
            .insert(maintenanceData)
            .select(`*`)
            .maybeSingle()

        if (error) {
            console.error("Failed to add new maintenance request", error);
            throw error;
        }

        if (!data) {
            throw new Error("No maintenance data returned from Supabase.");
        }

        return data;
    },

    getMaintenanceBySpaceId: async (spaceId: number) => {
        const { data, error } = await supabase
            .from("nd_maintenance_request")
            .select("*")
            .eq("space_id", spaceId);

        if (error) throw error;

        return data;
    },

    getSpaceBookingBySiteProfileIdAndSpaceName: async (siteProfileId: number, spaceName: string) => {
        const { data: space, error: spaceError } = await supabase
            .from("nd_space")
            .select("*")
            .eq("eng", spaceName)
            .single()

        if (spaceError) throw spaceError;
        const { data: siteSpace, error: siteSpaceError } = await supabase
            .from("nd_site_space")
            .select("id")
            .eq("site_id", siteProfileId)
            .eq("space_id", space.id)
            .single()

        if (siteSpaceError) throw siteSpaceError;

        const { data, error } = await supabase
            .from("nd_booking")
            .select(`*, nd_site_space(*)`)
            .eq("site_space_id", siteSpace.id)
            .eq("is_active", true)

        if (error) throw error;

        return data;
    }
}