import { supabase } from "@/integrations/supabase/client";

export const fetchUserProfile = async (userId: string) => {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*, nd_user_group(group_name)")
    .eq("id", userId)
    .single();

  // If no profile exists, create one
  if (!profile && !profileError) {
    console.log("No profile found, creating one...");
    const { data: userData } = await supabase.auth.getUser();
    const { error: createProfileError } = await supabase
      .from("profiles")
      .insert([
        {
          id: userId,
          email: userData.user?.email,
          user_type: "member",
        },
      ]);

    if (createProfileError) {
      console.error("Error creating profile:", createProfileError);
      return { profile: null, profileError: createProfileError };
    }

    const { data: newProfile, error: newProfileError } = await supabase
      .from("profiles")
      .select("*, nd_user_group(group_name)")
      .eq("id", userId)
      .single();

    if (newProfileError) {
      return { profile: null, profileError: newProfileError };
    }

    return await appendGroupProfileData(newProfile);
  }

  // Profile exists, append group-specific data
  return await appendGroupProfileData(profile);

  // Helper: Appends additional data from group-specific profile tables
  async function appendGroupProfileData(profile: any) {
    const groupName = profile.nd_user_group?.group_name;

    let groupProfile = null;
    let groupError = null;

    switch (groupName) {
      case "Centre Staff":
        ({ data: groupProfile, error: groupError } = await supabase
          .from("nd_staff_profile")
          .select("*")
          .eq("user_id", profile.id)
          .single());
        break;
      case "SSO":
        ({ data: groupProfile, error: groupError } = await supabase
          .from("nd_sso_profile")
          .select("*")
          .eq("user_id", profile.id)
          .single());
        break;
      case "Vendor":
        ({ data: groupProfile, error: groupError } = await supabase
          .from("nd_vendor_staff")
          .select("*")
          .eq("user_id", profile.id)
          .single());
        break;
      case "DUSP":
        ({ data: groupProfile, error: groupError } = await supabase
          .from("nd_dusp_profile")
          .select("*")
          .eq("user_id", profile.id)
          .single());
        break;
      case "MCMC":
        ({ data: groupProfile, error: groupError } = await supabase
          .from("nd_mcmc_profile")
          .select("*")
          .eq("user_id", profile.id)
          .single());
        break;
      case "TP":
        ({ data: groupProfile, error: groupError } = await supabase
          .from("nd_tech_partner_profile")
          .select("*")
          .eq("user_id", profile.id)
          .single());
        break;
      case "Site":
        ({ data: groupProfile, error: groupError } = await supabase
          .from("nd_site_user")
          .select("*")
          .eq("user_id", profile.id)
          .single());
        break;
      case "Member":
        ({ data: groupProfile, error: groupError } = await supabase
          .from("nd_member_profile")
          .select("*")
          .eq("user_id", profile.id)
          .single());
        break;
      default:
        console.warn(`Unknown group: ${groupName}`);
    }

    return {
      profile: {
        ...profile,
        group_profile: groupProfile || null,
      },
      profileError: groupError || null,
    };
  }
};

export const fetchUserProfileNameById = async (
  userId: string
): Promise<string> => {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", userId)
    .single();

  if (!profile && !profileError) {
    console.error("Error fetching inventories:", profileError);
    throw profileError;
  }

  return profile?.full_name || "";
};
