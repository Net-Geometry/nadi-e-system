import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  BUCKET_NAME_PROFILEIMAGE,
  SUPABASE_URL,
} from "@/integrations/supabase/client";

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
      .select(
        `
      *, ref_id (id, sitename, fullname),
      gender (id, bm, eng),
      race_id (id, bm, eng),
      nationality_id (id, bm, eng),
      ethnic_id (id, bm, eng),
      occupation_id (id, bm, eng),
      type_sector (id, bm, eng),
      socio_id (id, bm, eng),
      ict_knowledge (id, bm, eng),
      education_level (id, bm, eng),
      income_range (id, bm, eng),
      status_membership (id, name)
    `
      )
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
export const updateMemberProfile = async (userId: string, updatedData: any) => {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const { error: updateError } = await supabase
    .from("nd_member_profile")
    .update(updatedData)
    .eq("user_id", userId);

  if (updateError) {
    throw new Error(updateError.message);
  }
};

export const useMemberProfileByUserId = (userId: string) => {
  const fetchMemberProfile = async () => {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    // Fetch the member profile data
    const { data: profile, error: profileError } = await supabase
      .from("nd_member_profile")
      .select(
        `
      *, ref_id (id, sitename, fullname),
      gender (id, bm, eng),
      race_id (id, bm, eng),
      nationality_id (id, bm, eng),
      ethnic_id (id, bm, eng),
      occupation_id (id, bm, eng),
      type_sector (id, bm, eng),
      socio_id (id, bm, eng),
      ict_knowledge (id, bm, eng),
      education_level (id, bm, eng),
      income_range (id, bm, eng),
      status_membership (id, name)
    `
      )
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
    queryKey: ["memberProfileByUserId", userId],
    queryFn: fetchMemberProfile,
    enabled: !!userId, // Only run the query if userId is provided
  });

  return { data, isLoading, isError, error, refetch };
};

export const useMemberAddress = (memberId: string) => {
  const fetchMemberAddress = async () => {
    if (!memberId) {
      throw new Error("Member ID is required.");
    }

    // Fetch the member address data using the provided memberId
    const { data: address, error: addressError } = await supabase
      .from("nd_member_address")
      .select(
        `
        id, address1, address2, 
        city, 
        postcode,
        state_id (id, abbr, name ),
        district_id (id, code, name)
      `
      )
      .eq("member_id", memberId)
      .single();

    if (addressError) {
      throw new Error(addressError.message);
    }

    return address;
  };

  // Use React Query's useQuery to fetch the data
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["memberAddress", memberId],
    queryFn: fetchMemberAddress,
    enabled: !!memberId, // Only run the query if memberId is provided
  });

  return { data, isLoading, isError, error, refetch };
};

export const updateMemberAddress = async (
  memberId: string,
  updatedData: any
) => {
  if (!memberId) {
    throw new Error("MemberId is required.");
  }

  const { error: updateError } = await supabase
    .from("nd_member_address")
    .update(updatedData)
    .eq("member_id", memberId);

  if (updateError) {
    throw new Error(updateError.message);
  }
};
