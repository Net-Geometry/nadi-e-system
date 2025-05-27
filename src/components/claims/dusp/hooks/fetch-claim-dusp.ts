import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserMetadata } from "@/hooks/use-user-metadata";

export const useFetchClaimDUSP = () => {
  const userMetadata = useUserMetadata();
  const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;
  const organizationId = parsedMetadata?.organization_id;

  return useQuery({
    queryKey: ["fetchClaimDUSP", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      try {
        // Fetch TpDuspIds from the organizations table
        const { data: organizations, error: orgError } = await supabase
          .from("organizations")
          .select(`id`)
          .eq("parent_id", organizationId);

        if (orgError) {
          console.error("Error fetching organizations:", orgError);
          throw orgError;
        }

        const tpDuspIds = organizations.map((org) => org.id); // Extract TpDuspIds

        if (tpDuspIds.length === 0) {
          return []; // Return empty if no TpDuspIds are found
        }

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
          .in("tp_dusp_id", tpDuspIds) // Filter by TpDuspIds
          .in("claim_status", [2, 3, 4]) // Filter by claim status
          .order("year", { ascending: false })
          .order("quarter", { ascending: false })
          .order("month", { ascending: false });

        if (claimAppError) {
          console.error("Error fetching nd_claim_application:", claimAppError);
          throw new Error("Failed to fetch claim applications");
        }

        return claimApplications;
      } catch (error) {
        console.error("Error in useFetchClaimDUSP function:", error);
        throw error;
      }
    },
    enabled: !!organizationId,
  });
};