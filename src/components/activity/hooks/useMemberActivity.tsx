import { useActivityLogs } from "@/hooks/use-activity-logs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useMemberActivity = () => {
  // Fetch member profiles first to get their IDs
  const { data: memberProfiles = [] } = useQuery({
    queryKey: ["member-profiles-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_type", "member");

      if (error) {
        console.error("Error fetching member profiles:", error);
        throw error;
      }
      return data;
    },
  });

  // Get member IDs
  const memberIds = memberProfiles.map((profile) => profile.id);

  // Use the shared hook with member IDs as filter
  const activityData = useActivityLogs({
    userFilter: memberIds,
  });

  return {
    ...activityData,
  };
};
