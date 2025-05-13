import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserMetadata } from "@/hooks/use-user-metadata";

interface BillingData {
  id: string;
  site_id: string;
  year: number;
  month: number;
  type_id: string;
  type_name: string;
  reference_no: string;
  amount_bill: number;
  remark: string;
  file_path: string;
  sitename?: string;
  fullname?: string;
  standard_code?: string;
}

export const useSiteBillingDynamic = () => {
  const [data, setData] = useState<BillingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userMetadata = useUserMetadata();
  const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;
  const userGroup = parsedMetadata?.user_group;
  const userType = parsedMetadata?.user_type;
  const organizationId = parsedMetadata?.organization_id;

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        setLoading(true);

        let siteIds: string[] = [];
        let dusp_tp_id: string | null = null;

        // If userGroup === 6, fetch multiple site IDs from nd_staff_contract
        if (userGroup === 6) {
          const { data: userData, error: userError } =
            await supabase.auth.getUser();
          if (userError || !userData?.user) {
            throw new Error(userError?.message || "User not found.");
          }

          const userId = userData.user.id;

          const { data: staffContracts, error: staffError } = await supabase
            .from("nd_staff_contract")
            .select("site_profile_id")
            .eq("user_id", userId);

          if (staffError || !staffContracts || staffContracts.length === 0) {
            throw new Error(
              staffError?.message || "No site IDs found for the user."
            );
          }

          siteIds = staffContracts.map((contract) => contract.site_profile_id);
        }

        if (userGroup === 1) {
          const { data: organization, error: organizationError } =
            await supabase
              .from("organizations")
              .select("id")
              .eq("parent_id", organizationId)
              .single();

          if (organizationError || !organization?.id) {
            throw new Error(
              organizationError?.message || "DUSP TP ID not found."
            );
          }

          dusp_tp_id = organization.id;

          // Fetch site IDs from nd_site_profile where dusp_tp_id matches
          const { data: siteProfiles, error: siteProfilesError } =
            await supabase
              .from("nd_site_profile")
              .select("id")
              .eq("dusp_tp_id", dusp_tp_id);

          if (siteProfilesError || !siteProfiles || siteProfiles.length === 0) {
            throw new Error(
              siteProfilesError?.message ||
                "No site IDs found for the DUSP TP ID."
            );
          }

          siteIds = siteProfiles.map((profile) => profile.id);
        }

        if (userGroup === 3 && userType !== "tp_site") {
          dusp_tp_id = organizationId;

          // Fetch site IDs from nd_site_profile where dusp_tp_id matches
          const { data: siteProfiles, error: siteProfilesError } =
            await supabase
              .from("nd_site_profile")
              .select("id")
              .eq("dusp_tp_id", dusp_tp_id);

          if (siteProfilesError || !siteProfiles || siteProfiles.length === 0) {
            throw new Error(
              siteProfilesError?.message ||
                "No site IDs found for the DUSP TP ID."
            );
          }

          siteIds = siteProfiles.map((profile) => profile.id);
        }

        // Fetch utilities data
        let utilitiesQuery = supabase
          .from("nd_utilities")
          .select(
            "id, site_id, year, month, type_id, reference_no, amount_bill, remark"
          )
          .order("year", { ascending: false })
          .order("month", { ascending: false });

        if (userGroup === 6 && siteIds.length > 0) {
          utilitiesQuery = utilitiesQuery.in("site_id", siteIds);
        }

        if (userGroup === 1 && siteIds.length > 0) {
          utilitiesQuery = utilitiesQuery.in("site_id", siteIds);
        }

        if (userGroup === 3 && userType !== "tp_site" && siteIds.length > 0) {
          utilitiesQuery = utilitiesQuery.in("site_id", siteIds);
        }

        const { data: utilities, error: utilitiesError } = await utilitiesQuery;

        if (utilitiesError) throw utilitiesError;
        if (!utilities || utilities.length === 0) {
          setData([]);
          return;
        }

        // Fetch utility types
        const typeIds = utilities.map((utility) => utility.type_id);
        const { data: types, error: typesError } = await supabase
          .from("nd_type_utilities")
          .select("id, name")
          .in("id", typeIds);

        if (typesError) throw typesError;

        // Map utilities with types
        const utilitiesWithTypes = utilities.map((utility) => ({
          ...utility,
          type_name:
            types.find((type) => type.id === utility.type_id)?.name || "N/A",
        }));

        // Fetch attachments
        const utilitiesIds = utilities.map((utility) => utility.id);
        const { data: attachments, error: attachmentsError } = await supabase
          .from("nd_utilities_attachment")
          .select("utilities_id, file_path")
          .in("utilities_id", utilitiesIds);

        if (attachmentsError) throw attachmentsError;

        // Map utilities with attachments
        const utilitiesWithAttachments = utilitiesWithTypes.map((utility) => ({
          ...utility,
          file_path:
            attachments.find(
              (attachment) => attachment.utilities_id === utility.id
            )?.file_path || "",
        }));

        // Fetch site profile names
        const siteIdSet = new Set(utilities.map((utility) => utility.site_id));
        const uniqueSiteIds = Array.from(siteIdSet);
        const { data: siteProfiles, error: siteProfilesError } = await supabase
          .from("nd_site_profile_name")
          .select("id, sitename, fullname, standard_code")
          .in("id", uniqueSiteIds);

        if (siteProfilesError) throw siteProfilesError;

        // Map utilities with site profile details
        const finalData = utilitiesWithAttachments.map((utility) => {
          const siteInfo = siteProfiles.find(
            (site) => site.id === utility.site_id
          );
          return {
            ...utility,
            sitename: siteInfo?.sitename || "N/A",
            fullname: siteInfo?.fullname || "N/A",
            standard_code: siteInfo?.standard_code || "N/A",
          };
        });

        setData(finalData);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, [userType, userGroup]);

  return { data, loading, error };
};
