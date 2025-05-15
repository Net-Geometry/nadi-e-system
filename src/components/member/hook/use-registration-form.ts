import { supabase } from "@/integrations/supabase/client";

export const insertMemberData = async (formData: {
  identity_no_type: string;
  identity_no: string;
  isIcNumberValid: boolean; // check if valid
  isUnder12: boolean;
  parent_fullname: string;
  parent_ic_no: string;
  parent_relationship_id: string;
  parent_mobile_no: string;
  parent_address1: string;
  parent_address2: string;
  parent_district_id: string;
  parent_state_id: string;
  parent_city: string;
  parent_postcode: string;

  fullname: string;
  ref_id: number | string; // bigint
  community_status: boolean | string;
  dob: string; // ISO date string
  mobile_no: string;
  email: string;
  gender: number | string;
  status_membership: number | string;
  status_entrepreneur: boolean | string;
  register_method: number | string;
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

  password: string; // Password for the user
}) => {
  let userId, memberId;

  try {
    // Create the user account
    const { data: userData, error: createUserError } = await supabase.functions.invoke("create-user", {
      body: {
        email: formData.email,
        fullName: formData.fullname,
        userType: "member",
        userGroup: 7,
        phoneNumber: formData.mobile_no,
        icNumber: formData.identity_no,
        password: formData.password,
      },
    });

    if (createUserError || !userData) {
      throw new Error(createUserError?.message || "Failed to create user");
    }

    userId = userData.id;

    // Insert into nd_member_profile
    const { data: memberProfileData, error: memberProfileError } = await supabase
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
        supervision: formData.parent_ic_no,
        nationality_id: formData.nationality_id,
        registration_status: formData.registration_status,
        user_id: userId,
      })
      .select("id")
      .single();

    if (memberProfileError || !memberProfileData) {
      throw new Error(memberProfileError?.message || "Failed to insert into nd_member_profile.");
    }

    memberId = memberProfileData.id;

    // Upsert into nd_member_address (unique: member_id)
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
      );

    if (memberAddressError) {
      throw new Error(memberAddressError.message || "Failed to upsert into nd_member_address.");
    }

    // Upsert into nd_member_photo (unique: member_id)
    const { error: memberPhotoError } = await supabase
      .from("nd_member_photo")
      .upsert(
        {
          user_id: userId,
          member_id: memberId,
        },
        { onConflict: "member_id" }
      );

    if (memberPhotoError) {
      throw new Error(memberPhotoError.message || "Failed to upsert into nd_member_photo.");
    }

    // If under 12, upsert into nd_member_parents (unique: ic_no)
    if (formData.isUnder12) {
      const { error: memberParentError } = await supabase
        .from("nd_member_parents")
        .upsert(
          {
            member_id: memberId,
            fullname: formData.parent_fullname,
            ic_no: formData.parent_ic_no,
            relationship_id: formData.parent_relationship_id,
            mobile_no: formData.parent_mobile_no,
            address1: formData.parent_address1,
            address2: formData.parent_address2,
            city: formData.parent_city,
            postcode: formData.parent_postcode,
            district_id: formData.parent_district_id,
            state_id: formData.parent_state_id,
          },
          { onConflict: "ic_no" }
        );

      if (memberParentError) {
        throw new Error(memberParentError.message || "Failed to upsert into nd_member_parents.");
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error inserting member data:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};