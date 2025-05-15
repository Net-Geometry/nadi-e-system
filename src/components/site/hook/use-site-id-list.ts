import { supabase } from "@/integrations/supabase/client";


// Function 2: Get site IDs for userGroup === 1
const getSiteIdsForGroup1 = async (organizationId: string): Promise<string[]> => {
    try {
        // Fetch the DUSP TP ID
        const { data: organization, error: organizationError } = await supabase
            .from("organizations")
            .select("id")
            .eq("parent_id", organizationId)
            .single();

        if (organizationError || !organization?.id) {
            throw new Error(organizationError?.message || "DUSP TP ID not found.");
        }

        const dusp_tp_id = organization.id;

        // Fetch site IDs from nd_site_profile
        const { data: siteProfiles, error: siteProfilesError } = await supabase
            .from("nd_site_profile")
            .select("id")
            .eq("dusp_tp_id", dusp_tp_id);

        if (siteProfilesError || !siteProfiles || siteProfiles.length === 0) {
            throw new Error(siteProfilesError?.message || "No site IDs found for the DUSP TP ID.");
        }

        return siteProfiles.map((profile) => profile.id);
    } catch (error: any) {
        console.error("Error in getSiteIdsForGroup1:", error.message);
        return [];
    }
};

// Function 3: Get site IDs for userGroup === 3
const getSiteIdsForGroup3 = async (organizationId: string): Promise<string[]> => {
    try {
        const dusp_tp_id = organizationId;

        // Fetch site IDs from nd_site_profile
        const { data: siteProfiles, error: siteProfilesError } = await supabase
            .from("nd_site_profile")
            .select("id")
            .eq("dusp_tp_id", dusp_tp_id);

        if (siteProfilesError || !siteProfiles || siteProfiles.length === 0) {
            throw new Error(siteProfilesError?.message || "No site IDs found for the DUSP TP ID.");
        }

        return siteProfiles.map((profile) => profile.id);
    } catch (error: any) {
        console.error("Error in getSiteIdsForGroup3:", error.message);
        return [];
    }
};

// Function 4: Get site IDs for userGroup === 6
// const getSiteIdsForGroup = (siteId: string): string[] => {
//   return [siteId]; // Return siteId as an array
// };

// Function 5: Get all site IDs
const getSiteIdsAll = async (): Promise<string[]> => {
    try {

        // Fetch site IDs from nd_site_profile
        const { data: siteProfiles, error: siteProfilesError } = await supabase
            .from("nd_site_profile")
            .select("id");

        if (siteProfilesError || !siteProfiles || siteProfiles.length === 0) {
            throw new Error(siteProfilesError?.message);
        }

        return siteProfiles.map((profile) => profile.id);

    } catch (error: any) {
        console.error("Error retuning all site Ids:", error.message);
        return [];
    }
};

export const getSiteIdsByUserGroup = async (userType: string, userGroup: number, organizationId: string, siteId?: string): Promise<string[]> => {
    if (userGroup === 1) { //DUSP
        return await getSiteIdsForGroup1(organizationId);
    }
    if (userGroup === 3) { // TP
        return await getSiteIdsForGroup3(organizationId);
    }
    if (userGroup === 9) { // SITE
        return [siteId]; // Return siteId as an array for userGroup 9
    }
    if (userGroup === 2 || userType === "super_admin") { // TP_SITE
        return await getSiteIdsAll();
    }
    // if (userGroup === 6) { // STAFF
    //   return await getSiteIdsForGroup6(organizationId);
    // }
    return [];
};