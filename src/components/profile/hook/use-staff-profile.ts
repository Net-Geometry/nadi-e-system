import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  BUCKET_NAME_PROFILEIMAGE,
  SUPABASE_URL,
} from "@/integrations/supabase/client";

export const useStaffProfile = () => {
  const fetchStaffProfile = async () => {
    // Fetch the user ID
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      throw new Error(userError?.message || "No user found.");
    }

    const userId = userData.user.id;

    // Fetch the staff profile data
    const { data: profile, error: profileError } = await supabase
      .from("nd_staff_profile")
      .select(
        `
        *, marital_status (id, bm, eng),
        race_id (id, bm, eng),
        religion_id (id, bm, eng),
        nationality_id (id, bm, eng),
        gender_id (id, bm, eng),
        position_id (id, name)
      `
      )
      .eq("user_id", userId)
      .single();

    if (profileError) {
      throw new Error(profileError.message);
    }

    // Fetch the staff photo
    const { data: photoData, error: photoError } = await supabase
      .from("nd_staff_photo")
      .select("photo")
      .eq("user_id", userId)
      .single();

    if (photoError) {
      throw new Error(photoError.message);
    }

    // Construct the file_path
    const file_path = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME_PROFILEIMAGE}/${photoData.photo}`;

    // Combine the profile data with the file_path
    return { ...profile, file_path };
  };

  // Use React Query's useQuery to fetch the data
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["staffProfile"],
    queryFn: fetchStaffProfile,
  });

  return { data, isLoading, isError, error, refetch };
};

// Function to update the staff profile
export const updateStaffProfile = async (updatedData: any) => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    throw new Error(userError?.message || "No user found.");
  }

  const userId = userData.user.id;

  const { error: updateError } = await supabase
    .from("nd_staff_profile")
    .update(updatedData)
    .eq("user_id", userId);

  if (updateError) {
    throw new Error(updateError.message);
  }
};
