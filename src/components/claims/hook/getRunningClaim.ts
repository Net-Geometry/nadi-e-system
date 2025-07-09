import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const useClaimRunningNum = (year: number, tpDuspId: string) => {
    return useQuery({
        queryKey: ["nd-running-claim"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("nd_running_claim")
                .select("id, year, running_number, tp_dusp_id")
                .eq("year", year)
                .eq("tp_dusp_id", tpDuspId)
                .maybeSingle();

            if (error) {
                console.error("Error fetching nd_running_claim data:", error);
                throw error;
            }

            return (data?.running_number ?? 0) + 1;
        },
        enabled: !!year && !!tpDuspId,
    });
};

