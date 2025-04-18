import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { BUCKET_NAME_PROFILEIMAGE, SUPABASE_URL } from "@/integrations/supabase/client";

export const useMemberProfile = () => {
  const fetchMemberProfile = async () => {
    // Fetch the user ID
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      throw new Error(userError?.message || "No user found.");
    }

    const userId = userData.user.id;

    // Fetch the member profile data
    const { data: profile, error: profileError } = await supabase
      .from("nd_member_profile")
      .select(`
      *, ref_id (id, sitename, fullname),
      gender (id, bm, eng),
      race_id (id, bm, eng),
      ethnic_id (id, bm, eng),
      occupation_id (id, bm, eng),
      type_sector (id, bm, eng),
      socio_id (id, bm, eng),
      ict_knowledge (id, bm, eng),
      education_level (id, bm, eng),
      income_range (id, bm, eng)
    `)
      .eq("user_id", userId)
      .single();

    if (profileError) {
      throw new Error(profileError.message);
    }

    // Fetch the member photo
    const { data: photoData, error: photoError } = await supabase
      .from("nd_member_photo")
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
    queryKey: ["memberProfile"],
    queryFn: fetchMemberProfile,
  });

  return { data, isLoading, isError, error, refetch };
};

// Function to update the member profile
export const updateMemberProfile = async (updatedData: any) => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    throw new Error(userError?.message || "No user found.");
  }

  const userId = userData.user.id;

  const { error: updateError } = await supabase
    .from("nd_member_profile")
    .update(updatedData)
    .eq("user_id", userId);

  if (updateError) {
    throw new Error(updateError.message);
  }
};