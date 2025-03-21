import { supabase } from "@/lib/supabase";
import { Closure_Status, SiteClosureRequest } from "../types/site-closure";

export const fetchSiteClosureRequests = async (organizationId: string | null): Promise<SiteClosureRequest[]> => {
    const query = supabase
        .from("nd_site_closure")
        .select(`
            id,
            nd_closure_categories:nd_closure_categories(
                id,
                bm,
                eng
            ),
            nd_closure_subcategories:nd_closure_subcategories(
                id,
                bm,
                eng
            ),
            nd_closure_affect_areas:nd_closure_affect_areas(
                bm,
                eng
            ),
            close_start,
            close_end,
            session,
            duration,
            nd_closure_status:nd_closure_status(
                id,
                name
            ),
            remark,
            nd_site_profile:nd_site_profile(
                id,
                sitename,
                nd_site:nd_site(standard_code),
                organizations:organizations(
                    id,
                    name,
                    type,
                    parent_id(name)
                )
            ),
            created_by
        `);

    if (organizationId) {
        query.eq("nd_site_profile.organizations.id", organizationId); // Filter by organizationId for TP users
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching site closure requests:", error.message); // Log detailed error
        throw new Error("Failed to fetch site closure requests.");
    }

    console.log("Fetched Site Closure Requests:", data); // Debugging: Log the fetched data
    return data as unknown as SiteClosureRequest[]; // Explicitly cast to match the updated interface
};

export const updateSiteClosureRequest = async (id: string, status_id: number): Promise<void> => {
    const { error } = await supabase
        .from("nd_site_closure")
        .update({ status: status_id }) // Ensure the status field is updated correctly
        .eq("id", id);

    if (error) {
        console.error("Error updating site closure request:", error.message); // Log detailed error
        throw new Error("Failed to update site closure request. Please check the provided data and try again.");
    }
};

// Lookuptable for status
export const fetchClosure_Status = async (): Promise<Closure_Status[]> => {
    try {
        const { data, error } = await supabase
            .from('nd_closure_status')
            .select('id,name')

        if (error) throw error;
        return data as Closure_Status[];
    } catch (error) {
        console.error('Error fetching Closure Status:', error);
        throw error;
    }
};