import { supabase } from "@/integrations/supabase/client";

export const insertMemberData = async (formData: {
  identity_no: string;
  fullname: string;
  ref_id: number | string; // bigint
  community_status: boolean | string;
  dob: string; // ISO date string
  mobile_no: string;
  email: string;
  gender: number | string;
  supervision: string;
  status_membership: number | string;
  status_entrepreneur: boolean | string;
  register_method: string;
  join_date: string; // ISO timestamp string
  registration_status: boolean | string;

  nationality_id: number | string;
  race_id: number | string;
  ethnic_id: number | string;
  occupation_id: number | string;
  type_sector: number | string;
  socio_id: number | string;
  ict_knowledge: number | string;
  education_level: number | string;
  oku_status: boolean | string;
  income_range: number | string;

  distance: number | string;
  address1: string;
  address2: string;
  district_id: number | string;
  state_id: number | string;
  city: string;
  postcode: string;

  pdpa_declare: boolean | string;
  agree_declare: boolean | string;
}) => {
  let userId, memberId;

  try {
    // Fetch the user_id using the identity_no from the "profiles" table
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("ic_number", formData.identity_no)
      .single();

    if (profileError || !profileData) {
      throw new Error(
        `This user does not have an account with the same IC number: ${
          profileError?.message || "User not found in profiles table."
        }`
      );
    }

    userId = profileData.id;

    // Check if the identity_no already exists in the nd_member_profile table
    const { data: existingmember, error: existingmemberError } = await supabase
      .from("nd_member_profile")
      .select("id")
      .eq("identity_no", formData.identity_no)
      .single();

    if (existingmemberError && existingmemberError.code !== "PGRST116") {
      // PGRST116 indicates no rows found; ignore this error
      throw new Error(
        existingmemberError?.message ||
          "Error checking existing member profile."
      );
    }

    if (existingmember) {
      // If the member already exists, update the record
      memberId = existingmember.id;

      const { error: updatememberError } = await supabase
        .from("nd_member_profile")
        .update({
          fullname: formData.fullname,
          ref_id: formData.ref_id,
          community_status: formData.community_status,
          dob: formData.dob,
          mobile_no: formData.mobile_no,
          email: formData.email,
          gender: formData.gender,
          race_id: formData.race_id,
          ethnic_id: formData.ethnic_id,
          occupation_id: formData.occupation_id,
          type_sector: formData.type_sector,
          socio_id: formData.socio_id,
          ict_knowledge: formData.ict_knowledge,
          education_level: formData.education_level,
          oku_status: formData.oku_status,
          income_range: formData.income_range,
          distance: formData.distance,
          join_date: formData.join_date,
          register_method: formData.register_method,
          pdpa_declare: formData.pdpa_declare,
          agree_declare: formData.agree_declare,
          status_membership: formData.status_membership,
          status_entrepreneur: formData.status_entrepreneur,
          supervision: formData.supervision,
          nationality_id: formData.nationality_id,
          registration_status: formData.registration_status,
        })
        .eq("id", memberId);

      if (updatememberError) {
        throw new Error(
          updatememberError?.message || "Failed to update nd_member_profile."
        );
      }
    } else {
      // If the member does not exist, insert a new record
      const { data: memberProfileData, error: memberProfileError } =
        await supabase
          .from("nd_member_profile")
          .insert({
            identity_no: formData.identity_no,
            fullname: formData.fullname,
            ref_id: formData.ref_id,
            community_status: formData.community_status,
            dob: formData.dob,
            mobile_no: formData.mobile_no,
            email: formData.email,
            gender: formData.gender,
            race_id: formData.race_id,
            ethnic_id: formData.ethnic_id,
            occupation_id: formData.occupation_id,
            type_sector: formData.type_sector,
            socio_id: formData.socio_id,
            ict_knowledge: formData.ict_knowledge,
            education_level: formData.education_level,
            oku_status: formData.oku_status,
            income_range: formData.income_range,
            distance: formData.distance,
            join_date: formData.join_date,
            register_method: formData.register_method,
            pdpa_declare: formData.pdpa_declare,
            agree_declare: formData.agree_declare,
            status_membership: formData.status_membership,
            status_entrepreneur: formData.status_entrepreneur,
            supervision: formData.supervision,
            nationality_id: formData.nationality_id,
            registration_status: formData.registration_status,

            user_id: userId,
          })
          .select("id")
          .single();

      if (memberProfileError || !memberProfileData) {
        throw new Error(
          memberProfileError?.message ||
            "Failed to insert into nd_member_profile."
        );
      }

      memberId = memberProfileData.id;
    }

    // Update or insert into nd_member_address
    const { error: memberAddressError } = await supabase
      .from("nd_member_address")
      .upsert(
        {
          member_id: memberId,
          address1: formData.address1,
          address2: formData.address2,
          district_id: formData.district_id,
          state_id: formData.state_id,
          city: formData.city,
          postcode: formData.postcode,
        },
        { onConflict: "member_id" }
      ); // Use upsert to handle insert or update

    if (memberAddressError) {
      throw new Error(
        memberAddressError.message ||
          "Failed to update/insert nd_member_address."
      );
    }

    // Update or insert into nd_member_photo
    const { error: memberPhotoError } = await supabase
      .from("nd_member_photo")
      .upsert(
        {
          user_id: userId,
          member_id: memberId,
        },
        { onConflict: "member_id" }
      ); // Use upsert to handle insert or update

    if (memberPhotoError) {
      throw new Error(
        memberPhotoError.message || "Failed to update/insert nd_member_photo."
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Error inserting/updating member data:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

/**
 * Function to check if the identity_no exists in the profiles table.
 * @param identity_no - The IC number to validate.
 * @returns The user ID if the IC number exists.
 * @throws Error if the IC number does not exist in the profiles table.
 */
export const validateIdentityNo = async (identity_no: string) => {
  try {
    // Fetch the user_id using the identity_no from the "profiles" table
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("ic_number", identity_no) // Use the raw identity_no directly
      .single();

    if (profileError || !profileData) {
      throw new Error("This IC number does not register to this system.");
    }

    return profileData.id; // Return the user ID if found
  } catch (error) {
    console.error("Error validating identity_no:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};
