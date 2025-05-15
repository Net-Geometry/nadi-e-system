import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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

export const useSiteBillingDynamic = (siteIds: string[], refresh: boolean) => {
  const [data, setData] = useState<BillingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        setLoading(true);

        // Fetch utilities data
        let utilitiesQuery = supabase
          .from("nd_utilities")
          .select(
            "id, site_id, year, month, type_id, reference_no, amount_bill, remark"
          )
          .order("year", { ascending: false })
          .order("month", { ascending: false });

        utilitiesQuery = utilitiesQuery.in("site_id", siteIds);

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
  }, [siteIds, refresh]); // Add refresh to dependency array

  return { data, loading, error };
};