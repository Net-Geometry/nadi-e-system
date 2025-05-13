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

  useEffect(() => {
    let isMounted = true;

    async function fetchProfiles() {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("nd_site_profile_name")
          .select("id, sitename, fullname, standard_code");

        if (error) throw error;

        // Only update state if component is still mounted
        if (isMounted) {
          // Ensure we always set a valid array
          setProfiles(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Error fetching site profiles:", err);
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load site profiles"
          );
          // Set empty array on error to prevent undefined errors
          setProfiles([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProfiles();

    // Cleanup function to prevent state updates after unmounting
    return () => {
      isMounted = false;
    };
  }, []);

  return { profiles, loading, error };
}
