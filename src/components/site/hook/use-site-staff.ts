import { useState, useEffect } from "react";
import { BUCKET_NAME_PROFILEIMAGE, supabase, SUPABASE_URL } from "@/integrations/supabase/client";

export const useSiteStaff = (siteId: string) => {
  const [staffData, setStaffData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSiteStaff = async () => {
      try {
        // Fetch staff contracts for the given siteId
        const { data: contractData, error: contractError } = await supabase
          .from("nd_staff_contract")
          .select(
            `
            staff_id,
            contract_start,
            contract_end,
            duration,
            remark,
            phase_id (id, name),
            contract_type (id, name)
          `
          )
          .eq("site_profile_id", siteId)
          .eq("is_active", true);

        if (contractError) throw contractError;

        // Map through each contract and fetch the corresponding staff profile and photo
        const staffPromises = contractData.map(async (contract) => {
          const staffId = contract.staff_id;

          // Fetch the staff profile data
          const { data: profile, error: profileError } = await supabase
            .from("nd_staff_profile")
            .select(
              `
              *,
              marital_status (id, bm, eng),
              race_id (id, bm, eng),
              religion_id (id, bm, eng),
              nationality_id (id, bm, eng),
              gender_id (id, bm, eng),
              position_id (id, name)
            `
            )
            .eq("id", staffId)
            .eq("is_active", true)
            .single();

          if (profileError) throw new Error(profileError.message);

          // Fetch the staff photo
          const { data: photoData, error: photoError } = await supabase
            .from("nd_staff_photo")
            .select("photo")
            .eq("staff_id", staffId)
            .single();

          if (photoError) throw new Error(photoError.message);

          // Construct the file_path
          const file_path = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME_PROFILEIMAGE}/${photoData.photo}`;

          // Combine the profile data with the file_path and contract details
          return { ...profile, file_path, contract };
        });

        // Resolve all promises and set the staff data
        const resolvedStaffData = await Promise.all(staffPromises);
        setStaffData(resolvedStaffData);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSiteStaff();
  }, [siteId]);

  return { staffData, loading, error };
};