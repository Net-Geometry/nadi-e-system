import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface BillingData {
  id: string;
  year: number;
  month: number;
  type_id: string;
  type_name: string;
  reference_no: string;
  amount_bill: number;
  remark: string;
  file_path: string;
}

export const useSiteBilling = (siteId: string, refresh: boolean) => {
  // Add refresh parameter
  const [data, setData] = useState<BillingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        const { data: utilities, error: utilitiesError } = await supabase
          .from("nd_utilities")
          .select("id, year, month, type_id, reference_no, amount_bill, remark")
          .eq("site_id", siteId)
          .order("year", { ascending: false })
          .order("month", { ascending: false });

        if (utilitiesError) throw utilitiesError;

        const typeIds = utilities.map((utility) => utility.type_id);
        const { data: types, error: typesError } = await supabase
          .from("nd_type_utilities")
          .select("id, name")
          .in("id", typeIds);

        if (typesError) throw typesError;

        const utilitiesWithTypes = utilities.map((utility) => ({
          ...utility,
          type_name:
            types.find((type) => type.id === utility.type_id)?.name || "N/A",
        }));

        const utilitiesIds = utilities.map((utility) => utility.id);
        const { data: attachments, error: attachmentsError } = await supabase
          .from("nd_utilities_attachment")
          .select("utilities_id, file_path")
          .in("utilities_id", utilitiesIds);

        if (attachmentsError) throw attachmentsError;

        const utilitiesWithAttachments = utilitiesWithTypes.map((utility) => ({
          ...utility,
          file_path:
            attachments.find(
              (attachment) => attachment.utilities_id === utility.id
            )?.file_path || "",
        }));

        setData(utilitiesWithAttachments);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, [siteId, refresh]); // Add refresh to dependency array

  return { data, loading, error };
};
