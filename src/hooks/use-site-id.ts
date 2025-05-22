import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export const useSiteId = (isStaffUser?: boolean) => {
  const [siteId, setSiteId] = useState<string | null>(null);

  useEffect(() => {
    if (!isStaffUser) return;

    const fetchSiteId = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          console.error("User ID is undefined");
          return;
        }

        const { data, error } = await supabase
          .from("nd_staff_contract")
          .select("site_profile_id")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;

        setSiteId(data.site_profile_id.toString());
      } catch (error) {
        console.error("Error fetching site ID:", error);
      }
    };

    fetchSiteId();
  }, [isStaffUser]);

  return isStaffUser ? siteId : null;
};

export const useTpManagerSiteId = (isTpManager?: boolean) => {
  const getTpManagerSiteId = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User is not logged in.");
    }

    const { data, error } = await supabase
      .from("nd_site_user")
      .select("site_profile_id")
      .eq("user_id", user.id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data.site_profile_id.toString();
  };

  const enabled = !!isTpManager;

  const { data: siteId, isLoading, isError, error } = useQuery({
    queryKey: ["tpManagerSiteId"],
    queryFn: getTpManagerSiteId,
    enabled,
    staleTime: 1000 * 60 * 5, 
    retry: 1,
  });

  return {
    siteId: isTpManager ? siteId : null,
    isLoading,
    isError,
    error,
  };
};

export const useMemberSiteId = (isMember?: boolean) => {
  const getTpMemberSiteId = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("User is undefined", user)
      throw new Error("User is not logged in.");
    }

    const { data, error } = await supabase
      .from("nd_member_profile")
      .select("ref_id")
      .eq("user_id", user?.id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data.ref_id.toString();
  };

  const enabled = !!isMember;

  const { data: siteId, isLoading, isError, error } = useQuery({
    queryKey: ["tpMemberSiteId"],
    queryFn: getTpMemberSiteId,
    enabled,
    staleTime: 1000 * 60 * 5, 
    retry: 1,
  });

  return {
    siteId: isMember ? siteId : null,
    isLoading,
    isError,
    error,
  };
};
