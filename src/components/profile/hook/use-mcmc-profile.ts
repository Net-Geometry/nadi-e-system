import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useMCMCProfile = () => {
  const fetchMCMCProfile = async () => {
    // Fetch the user ID
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      throw new Error(userError?.message || "No user found.");
    }

    const userId = userData.user.id;
    console.log("User ID:", userId); // Log the user ID for debugging

    // Fetch the MCMC profile data
    const { data: profile, error: profileError } = await supabase
      .from("nd_mcmc_profile")
      .select(
        `
      *, position_id (id, name)
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
    queryKey: ["mcmcProfile"],
    queryFn: fetchMCMCProfile,
  });

  return { data, isLoading, isError, error, refetch };
};

// Function to update the MCMC profile
export const updateMCMCProfile = async (updatedData: any) => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    throw new Error(userError?.message || "No user found.");
  }

  const userId = userData.user.id;

  const { error: updateError } = await supabase
    .from("nd_mcmc_profile")
    .update(updatedData)
    .eq("user_id", userId);

  if (updateError) {
    throw new Error(updateError.message);
  }
};
