import { supabase } from "@/integrations/supabase/client";

export const fetchOrganizationDetails = async (
  userId: string,
  profile: any
) => {
  let organizationName = null;
  let organizationId = profile?.organization_id || null;
  console.log("Fetching organization details for user:", userId);
  console.log("User profile:", profile);
  // If user is tp_admin or has an organization_id, fetch organization details
  if (
    (profile?.nd_user_group?.group_name === "DUSP" ||
      profile?.nd_user_group?.group_name === "TP" ||
      profile?.nd_user_group?.group_name === "Site") &&
    profile
  ) {
    console.log(
      "Fetching organization details for user group:",
      profile.user_group
    );

    // Try to find organization where this user is an admin
    const { data: orgAdminData, error: orgAdminError } = await supabase
      .from("organization_users")
      .select("organization_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!orgAdminError && orgAdminData?.organization_id) {
      organizationId = orgAdminData.organization_id;

      // Update profile with organization_id if found
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ organization_id: organizationId })
        .eq("id", userId);

      if (updateError) {
        console.error(
          "Error updating profile with organization_id:",
          updateError
        );
      }
    }

    // Fetch organization name if we have an organization_id
    if (organizationId) {
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .select("name")
        .eq("id", organizationId)
        .single();

      if (!orgError && orgData) {
        organizationName = orgData.name;
      } else if (orgError) {
        console.error("Error fetching organization:", orgError);
      }
    }
  }

  return { organizationId, organizationName };
};
