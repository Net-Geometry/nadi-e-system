import { useUserMetadata } from "@/hooks/use-user-metadata";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export type SiteProfile = {
  id: number;
  sitename: string | null;
  fullname: string | null;
  standard_code: string | null;
};

export function useSiteProfiles() {
  const [profiles, setProfiles] = useState<SiteProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userMetadata = useUserMetadata();
  const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;
  const userGroup = parsedMetadata?.user_group;
  const userType = parsedMetadata?.user_type;
  const organizationId = parsedMetadata?.organization_id;
  const siteId = parsedMetadata?.group_profile?.site_profile_id;

  useEffect(() => {
    let isMounted = true;

    async function fetchProfiles() {
      try {
        setLoading(true);

        // Super admin or group 2: return all
        if (userType === "super_admin" || userGroup === 2) {
          const { data, error } = await supabase
            .from("nd_site_profile_name")
            .select("id, sitename, fullname, standard_code, dusp_tp_id");
          if (error) throw error;
          if (isMounted) setProfiles(Array.isArray(data) ? data : []);
          return;
        }

        // Group 1: filter by parent organization's dusp_tp_id
        if (userGroup === 1) {
          // Get id(s) from organizations where parent_id = organizationId
          const { data: orgs, error: orgError } = await supabase
            .from("organizations")
            .select("id")
            .eq("parent_id", organizationId);
          if (orgError) throw orgError;
          // Use the id as dusp_tp_id for the next query
          const duspTpIds = orgs?.map((o: any) => o.id) ?? [];
          if (duspTpIds.length === 0) {
            if (isMounted) setProfiles([]);
            return;
          }
          // Get site profiles where dusp_tp_id in duspTpIds
          const { data, error } = await supabase
            .from("nd_site_profile_name")
            .select("id, sitename, fullname, standard_code, dusp_tp_id")
            .in("dusp_tp_id", duspTpIds);
          if (error) throw error;
          if (isMounted) setProfiles(Array.isArray(data) ? data : []);
          return;
        }

        // Group 3: filter by organizationId as dusp_tp_id
        if (userGroup === 3) {
          const { data, error } = await supabase
            .from("nd_site_profile_name")
            .select("id, sitename, fullname, standard_code, dusp_tp_id")
            .eq("dusp_tp_id", organizationId);
          if (error) throw error;
          if (isMounted) setProfiles(Array.isArray(data) ? data : []);
          return;
        }

        // Group 9: filter by siteId
        if (userGroup === 9) {
          const { data, error } = await supabase
            .from("nd_site_profile_name")
            .select("id, sitename, fullname, standard_code, dusp_tp_id")
            .eq("id", siteId);
          if (error) throw error;
          if (isMounted) setProfiles(Array.isArray(data) ? data : []);
          return;
        }

        // Default: empty
        if (isMounted) setProfiles([]);
      } catch (err) {
        console.error("Error fetching site profiles:", err);
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load site profiles"
          );
          setProfiles([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchProfiles();

    return () => {
      isMounted = false;
    };
  }, [userType, userGroup, organizationId, siteId]);

  return { profiles, loading, error };
}