import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useFetchClaimMCMC = () => {
  return useQuery({
    queryKey: ["fetchClaimMCMC"],
    queryFn: async () => {
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
          .in("claim_status", [3, 4]) // Filter by claim status
          .order("year", { ascending: false })
          .order("month", { ascending: false });

        if (claimAppError) {
          console.error("Error fetching nd_claim_application:", claimAppError);
          throw new Error("Failed to fetch claim applications");
        }

        return claimApplications;
      } catch (error) {
        console.error("Error in useFetchClaimMCMC function:", error);
        throw error;
      }
    },
  });
};