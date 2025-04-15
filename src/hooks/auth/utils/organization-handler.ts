
import { supabase } from "@/lib/supabase";

export const fetchOrganizationDetails = async (
  userId: string,
  profile: any
) => {
  let organizationName = null;
  let organizationId = profile?.organization_id || null;
  console.log("Fetching organization details for user:", userId);
  console.log("User profile:", profile);
  
  // Check if user group is one of the allowed values: 1, 2, 5, 6, 7
  if (
    (profile?.user_group === 1 ||
     profile?.user_group === 2 ||
     profile?.user_group === 5 ||
     profile?.user_group === 6 ||
     profile?.user_group === 7) &&
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
      console.log("Found organization ID:", organizationId);

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
    } else if (orgAdminError) {
      console.error("Error fetching organization user data:", orgAdminError);
    }

    // Fetch organization name if we have an organization_id
    if (organizationId) {
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .select("name")
        .eq("id", organizationId)
        .maybeSingle();

      if (!orgError && orgData) {
        organizationName = orgData.name;
        console.log("Found organization name:", organizationName);
      } else if (orgError) {
        console.error("Error fetching organization:", orgError);
      }
    }
  } else {
    console.log("User not in allowed groups or profile missing");
  }

  console.log("Returning organization details:", { organizationId, organizationName });
  return { organizationId, organizationName };
};
