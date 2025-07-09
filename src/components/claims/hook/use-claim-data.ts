import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserMetadata } from "@/hooks/use-user-metadata";

export const useDuspTpData = () => {
  const userMetadata = useUserMetadata();
  const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;
  const organizationId = parsedMetadata?.organization_id;

  const { data: duspTpData, isLoading, error } = useQuery({
    queryKey: ["duspTpData", organizationId],
    queryFn: async () => {
      if (!organizationId) return null;

      // Fetch data from the organizations table
      const { data: organizationData, error: orgError } = await supabase
        .from("organizations")
        .select(`
          id,
          type,
          name,
          parent_id (id, type, name, logo_url, description)
        `)
        .eq("id", organizationId)
        .single();

      if (orgError) {
        console.error("Error fetching organization data:", orgError);
        throw orgError;
      }

      return organizationData;
    },
    enabled: !!organizationId, // Only run the query if organizationId exists
  });

  return { duspTpData, isLoading, error };
};


export const useSiteByPhase = () => {
  const userMetadata = useUserMetadata();
  const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;
  const organizationId = parsedMetadata?.organization_id;

  // Fetch all unique phases
  const {
    data: phases,
    isLoading: isPhasesLoading,
    error: phasesError,
  } = useQuery({
    queryKey: ["phases", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("nd_site_profile")
        .select(`phase_id (id, name)`)
        .eq("dusp_tp_id", organizationId);

      if (error) {
        console.error("Error fetching phases:", error);
        throw error;
      }

      // ✅ Filter out null phase_id entries before mapping
      const filtered = data.filter((item) => item.phase_id && item.phase_id.id);

      // ✅ Deduplicate using Map on phase_id.id
      const uniquePhases = [
        ...new Map(
          filtered.map((item) => [item.phase_id.id, item.phase_id])
        ).values(),
      ];

      return uniquePhases;
    },
    enabled: !!organizationId,
  });

  // Fetch site profiles by a given phase ID
  const fetchSitesByPhase = async (phaseId: number) => {
    const { data, error } = await supabase
      .from("nd_site_profile")
      .select("id, fullname, refid_mcmc, refid_tp")
      .eq("phase_id", phaseId);

    if (error) {
      console.error("Error fetching site profiles:", error);
      throw error;
    }

    return data;
  };

  return {
    phases,
    isPhasesLoading,
    phasesError,
    fetchSitesByPhase,
  };
};