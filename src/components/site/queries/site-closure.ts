import { supabase } from "@/integrations/supabase/client";
import { Closure_Status, SiteClosureRequest } from "../types/site-closure";

export const fetchSiteClosureRequests = async (
  organizationId: string | null,
  isDUSPUser: boolean = false
): Promise<SiteClosureRequest[]> => {
  let query = supabase
    .from("nd_site_closure")
    .select(
      `
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
                    parent_id(id, name)
                )
            ),
            created_by,
            created_at
        `
    )
    .order("created_at", { ascending: false }); // Order by created_at in descending order

  if (organizationId) {
    if (isDUSPUser) {
      // Fetch all TP organizations under the given DUSP organization
      const { data: childOrganizations, error: childError } = await supabase
        .from("organizations")
        .select("id")
        .eq("parent_id", organizationId);

      if (childError) throw childError;

      const childOrganizationIds = childOrganizations.map((org) => org.id);

      // Filter sites where dusp_tp_id matches any child TP organization
      query = query.in(
        "nd_site_profile.organizations.id",
        childOrganizationIds
      );
    } else {
      // Filter by organizationId for TP users
      query = query.eq("nd_site_profile.organizations.id", organizationId);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching site closure requests:", error.message); // Log detailed error
    throw new Error("Failed to fetch site closure requests.");
  }

  console.log("Fetched Site Closure Requests:", data); // Debugging: Log the fetched data
  return data as unknown as SiteClosureRequest[]; // Explicitly cast to match the updated interface
};

export const updateSiteClosureRequest = async (
  id: string,
  status_id: number
): Promise<void> => {
  const { error } = await supabase
    .from("nd_site_closure")
    .update({ status: status_id }) // Ensure the status field is updated correctly
    .eq("id", id);

  if (error) {
    console.error("Error updating site closure request:", error.message); // Log detailed error
    throw new Error(
      "Failed to update site closure request. Please check the provided data and try again."
    );
  }
};

// Lookuptable for status
export const fetchClosure_Status = async (): Promise<Closure_Status[]> => {
  try {
    const { data, error } = await supabase
      .from("nd_closure_status")
      .select("id,name");

    if (error) throw error;
    return data as Closure_Status[];
  } catch (error) {
    console.error("Error fetching Closure Status:", error);
    throw error;
  }
};

export const fetchActionableRequestCount = async (
  organizationId: string | null,
  isTPUser: boolean,
  isDUSPUser: boolean
): Promise<number> => {
  if (!organizationId) {
    console.warn("Organization ID is null. Returning count as 0.");
    return 0;
  }

  let query = supabase.from("nd_site_closure").select(
    `
            id,
            status,
             nd_site_profile:nd_site_profile!inner(
                id,
                dusp_tp_id,
                organizations:organizations!inner(
                    id,
                    parent_id
                )
            )
            `,
    { count: "exact" } // Fetch only the count of actionable requests
  );

  if (isTPUser) {
    query = query
      .eq("nd_site_profile.organizations.id", organizationId) // Filter by organization ID for TP users
      .eq("status", 2); // Status 2 (SUBMITTED)
  } else if (isDUSPUser) {
    query = query
      .eq("nd_site_profile.organizations.parent_id", organizationId) // Filter by parent organization ID for DUSP users
      .eq("status", 5); // Status 5 (RECOMMENDED)
  }

  const { data, count, error } = await query;

  // Debugging: Log the raw data and count
  console.log("Raw data fetched for actionable request count:", data);
  console.log("Count fetched for actionable request count:", count);

  if (error) {
    console.error("Error fetching actionable request count:", error.message);
    throw new Error("Failed to fetch actionable request count.");
  }

  return count || 0; // Return the count or 0 if none
};
