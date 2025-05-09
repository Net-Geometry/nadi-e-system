import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTPProfile = () => {
  const fetchTPProfile = async () => {
    // Fetch the user ID
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      throw new Error(userError?.message || "No user found.");
    }

    const userId = userData.user.id;

    // Fetch the TP profile data
    const { data: profile, error: profileError } = await supabase
      .from("nd_tech_partner_profile")
      .select(
        `
      *, position_id (id, name),
      marital_status (id, bm, eng),
      tech_partner_id (id, code, name),
      nationality_id (id, bm, eng),
      religion_id (id, bm, eng),
      race_id (id, bm, eng)
    `
      )
      .eq("user_id", userId)
      .single();

    if (profileError) {
      throw new Error(profileError.message);
    }

    return profile;
  };

  // Use React Query's useQuery to fetch the data
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["tpProfile"],
    queryFn: fetchTPProfile,
  });

  return { data, isLoading, isError, error, refetch };
};

// Function to update the TP profile
export const updateTPProfile = async (updatedData: any) => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    throw new Error(userError?.message || "No user found.");
  }

  const userId = userData.user.id;

  const { error: updateError } = await supabase
    .from("nd_tech_partner_profile")
    .update(updatedData)
    .eq("user_id", userId);

  if (updateError) {
    throw new Error(updateError.message);
  }
};
