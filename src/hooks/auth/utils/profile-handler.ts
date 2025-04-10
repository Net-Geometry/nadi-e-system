import { supabase } from "@/lib/supabase";

export const fetchUserProfile = async (userId: string) => {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*, nd_user_group(group_name)")
    .eq("id", userId)
    .single();

  // If no profile exists, create one
  if (!profile && !profileError) {
    console.log("No profile found, creating one...");
    const { error: createProfileError } = await supabase
      .from("profiles")
      .insert([
        {
          id: userId,
          email: (await supabase.auth.getUser()).data.user?.email,
          user_type: "member",
        },
      ]);

    if (createProfileError) {
      console.error("Error creating profile:", createProfileError);
      return { profile: null, profileError: createProfileError };
    }

    // Fetch the newly created profile
    const { data: newProfile, error: newProfileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    return { profile: newProfile, profileError: newProfileError };
  }

  return { profile, profileError };
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
