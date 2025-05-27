import { useQuery } from "@tanstack/react-query";
import { BUCKET_NAME_SITE_CLAIM, supabase, SUPABASE_BUCKET_URL } from "@/integrations/supabase/client";
import { useUserMetadata } from "@/hooks/use-user-metadata";



export const useFetchClaimTP = () => {
  const userMetadata = useUserMetadata();
  const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;
  const organizationId = parsedMetadata?.organization_id;

  return useQuery({
    queryKey: ["fetchClaimTP", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      try {
        // Fetch data from nd_claim_application
        const { data: claimApplications, error: claimAppError } = await supabase
          .from("nd_claim_application")
          .select(`
            id,
            phase_id (id, name),
            claim_type,
            claim_status (id, name),
            year,
            quarter,
            month,
            ref_no,
            date_paid,
            payment_status,
            tp_dusp_id (id, name, parent_id (id, name))
          `)
          .eq("tp_dusp_id", organizationId)
          .order("year", { ascending: false })
          .order("quarter", { ascending: false })
          .order("month", { ascending: false });

        if (claimAppError) {
          console.error("Error fetching nd_claim_application:", claimAppError);
          throw new Error("Failed to fetch claim applications");
        }

        return claimApplications;
      } catch (error) {
        console.error("Error in useFetchClaimTP function:", error);
        throw error;
      }
    },
    enabled: !!organizationId,
  });
};