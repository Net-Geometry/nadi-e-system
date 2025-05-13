import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Profile,
  AuditLog,
  Session,
  createProfileMap,
  processAuditLogs,
  processSessions,
  filterLogs,
  filterSessions,
} from "@/components/activity/utils/activity-utils";

type FilterType = "all" | "login" | "logout" | "actions";

interface UseActivityLogsProps {
  userFilter?: string[]; // Optional array of user IDs to filter by
  defaultFilter?: FilterType;
}

export const useActivityLogs = ({
  userFilter,
  defaultFilter = "all",
}: UseActivityLogsProps = {}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState<FilterType>(defaultFilter);

  // Fetch profiles
  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles", userFilter],
    queryFn: async () => {
      let query = supabase.from("profiles").select("id, email, user_type");

      // If userFilter is provided, only fetch those profiles
      if (userFilter && userFilter.length > 0) {
        query = query.in("id", userFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching profiles:", error);
        throw error;
      }
      return data as Profile[];
    },
  });

  // Create a lookup map for profiles
  const profileMap = createProfileMap(profiles);

  // Get array of profile IDs if needed
  const profileIds = profiles.map((profile) => profile.id);

  // Fetch audit logs
  const {
    data: logsRaw = [],
    isLoading: isLoadingLogs,
    refetch: refetchLogs,
  } = useQuery({
    queryKey: ["audit-logs", filterBy, userFilter],
    queryFn: async () => {
      let query = supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false });

      // Apply user filter if provided
      if (userFilter && userFilter.length > 0) {
        query = query.in("user_id", userFilter);
      }

      // Apply action type filter
      if (filterBy === "login") {
        query = query.eq("action", "login");
      } else if (filterBy === "logout") {
        query = query.eq("action", "logout");
      } else if (filterBy === "actions") {
        query = query.not("action", "in", '("login", "logout")');
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching audit logs:", error);
        throw error;
      }

      return data;
    },
  });

  // Fetch sessions
  const {
    data: sessionsRaw = [],
    isLoading: isLoadingSessions,
    refetch: refetchSessions,
  } = useQuery({
    queryKey: ["sessions", userFilter],
    queryFn: async () => {
      let query = supabase
        .from("usage_sessions")
        .select("*")
        .order("start_time", { ascending: false });

      // Apply user filter if provided
      if (userFilter && userFilter.length > 0) {
        query = query.in("user_id", userFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching sessions:", error);
        throw error;
      }

      return data;
    },
  });

  // Process logs and sessions with profile data
  const logs = processAuditLogs(logsRaw, profileMap);
  const sessions = processSessions(sessionsRaw, profileMap);

  // Filter logs and sessions based on search term
  const filteredLogs = filterLogs(logs as AuditLog[], searchTerm);
  const filteredSessions = filterSessions(sessions as Session[], searchTerm);

  // Handle refresh
  const handleRefresh = () => {
    refetchLogs();
    refetchSessions();
  };

  return {
    searchTerm,
    setSearchTerm,
    filterBy,
    setFilterBy,
    logs: filteredLogs,
    sessions: filteredSessions,
    isLoadingLogs,
    isLoadingSessions,
    handleRefresh,
    profileMap,
  };
};
