import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserMetadata } from "@/hooks/use-user-metadata";

export const useDuspName = () => {
  const userMetadata = useUserMetadata();
  const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;
  const organizationId = parsedMetadata?.organization_id;

  const { data: duspName, isLoading, error } = useQuery({
    queryKey: ["duspName", organizationId],
    queryFn: async () => {
      if (!organizationId) return null;

      // Fetch the parent_id from the organizations table
      const { data: parentOrg, error: parentError } = await supabase
        .from("organizations")
        .select("parent_id")
        .eq("id", organizationId)
        .single();

      if (parentError) {
        console.error("Error fetching parent_id:", parentError);
        throw parentError;
      }

      const parentId = parentOrg?.parent_id;
      if (!parentId) return null;

      // Fetch the name of the parent organization
      const { data: parentName, error: nameError } = await supabase
        .from("organizations")
        .select("name")
        .eq("id", parentId)
        .single();

      if (nameError) {
        console.error("Error fetching parent organization name:", nameError);
        throw nameError;
      }

      return parentName?.name || null;
    },
    enabled: !!organizationId, // Only run the query if organizationId exists
  });

  return { duspName, isLoading, error };
};

