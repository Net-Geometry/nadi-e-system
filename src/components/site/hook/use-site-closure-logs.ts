import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Define types for closure logs
export type SiteClosureLogEntry = {
  id?: number;
  site_closure_id: number;
  remark: string;
  created_at?: string;
  created_by?: string;
  closure_status_id?: number; // Added new field
};

// Define closure status map
export const CLOSURE_STATUS_MAP = {
  DRAFT: 1,
  SUBMITTED: 2,
  APPROVED: 3,
  REJECTED: 4,
  RECOMMENDED: 5,
  AUTHORIZED: 6,
  DECLINED: 7,
  COMPLETED: 8,
};

// Define status change descriptions for automatic log generation
export const STATUS_CHANGE_DESCRIPTIONS: Record<number, string> = {
  1: "Request saved as draft",
  2: "Request submitted for approval",
  3: "Request approved by TP",
  4: "Request rejected by TP",
  5: "Request recommended and forwarded to DUSP for authorization",
  6: "Request authorized by DUSP",
  7: "Request declined by DUSP",
  8: "Request marked as completed",
};

/**
 * Hook for managing site closure logs
 */
export const useSiteClosureLogs = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  /**
   * Add a log entry for a site closure
   * @param siteClosureId - The ID of the site closure
   * @param remark - The remark to add to the log
   * @param statusId - Optional status ID to use for automatic remark generation and tracking
   */
  const addLog = async (
    siteClosureId: number,
    remark: string,
    statusId?: number
  ) => {
    setLoading(true);
    setError(null);

    try {
      // If status ID is provided, use a default remark based on status
      const effectiveRemark = statusId
        ? STATUS_CHANGE_DESCRIPTIONS[statusId] || remark
        : remark;

      const { error: insertError } = await supabase
        .from("nd_site_closure_logs")
        .insert({
          site_closure_id: siteClosureId,
          remark: effectiveRemark,
          closure_status_id: statusId || null, // Store the status ID in the new column
          // created_by and created_at will be automatically set by Supabase
        });

      if (insertError) throw new Error(insertError.message);
    } catch (err: any) {
      setError(err.message);
      console.error("Error adding site closure log:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get logs for a specific site closure
   * @param siteClosureId - The ID of the site closure to get logs for
   */
  const getLogs = async (siteClosureId: number) => {
    setLoading(true);
    setError(null);

    try {
      // First, fetch the logs
      const { data: logsData, error: fetchError } = await supabase
        .from("nd_site_closure_logs")
        .select(
          `
          id,
          site_closure_id,
          remark,
          created_at,
          created_by,
          closure_status_id
        `
        )
        .eq("site_closure_id", siteClosureId)
        .order("created_at", { ascending: true });

      if (fetchError) throw new Error(fetchError.message);

      if (!logsData || logsData.length === 0) {
        return [];
      }

      // Get the status information
      const statusIds = logsData
        .filter((log) => log.closure_status_id !== null)
        .map((log) => log.closure_status_id);

      let statusMap: Record<number, any> = {};
      if (statusIds.length > 0) {
        const { data: statusData, error: statusError } = await supabase
          .from("nd_closure_status")
          .select("id, name")
          .in("id", statusIds);

        if (statusError) {
          console.error("Error fetching status data:", statusError);
        } else if (statusData) {
          statusMap = statusData.reduce((acc, status) => {
            acc[status.id] = status;
            return acc;
          }, {} as Record<number, any>);
        }
      }

      // Get the profile information
      const userIds = logsData
        .filter((log) => log.created_by !== null)
        .map((log) => log.created_by);

      let profileMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name, user_type")
          .in("id", userIds);

        if (profileError) {
          console.error("Error fetching profile data:", profileError);
        } else if (profileData) {
          profileMap = profileData.reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
          }, {} as Record<string, any>);
        }
      }

      // Combine the data
      const enhancedLogs = logsData.map((log) => ({
        ...log,
        nd_closure_status: log.closure_status_id
          ? statusMap[log.closure_status_id] || null
          : null,
        profiles: log.created_by ? profileMap[log.created_by] || null : null,
      }));

      return enhancedLogs;
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching site closure logs:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log a status change
   * @param siteClosureId - The ID of the site closure
   * @param newStatusId - The new status ID
   * @param oldStatusId - Optional old status ID
   * @param customRemark - Optional custom remark to override the default
   */
  const logStatusChange = async (
    siteClosureId: number,
    newStatusId: number,
    oldStatusId?: number,
    customRemark?: string
  ) => {
    let remark = customRemark;

    if (!remark) {
      // Default remark based on status change
      remark =
        STATUS_CHANGE_DESCRIPTIONS[newStatusId] ||
        `Status changed to ${newStatusId}`;

      // Add information about the previous status if available
      if (oldStatusId) {
        const oldStatusDesc =
          STATUS_CHANGE_DESCRIPTIONS[oldStatusId] || `status ${oldStatusId}`;
        remark += ` from previous ${oldStatusDesc}`;
      }
    }

    return addLog(siteClosureId, remark, newStatusId);
  };

  /**
   * Update a site closure status and log the change
   * @param siteClosureId - The ID of the site closure
   * @param newStatusId - The new status ID
   * @param remark - Optional custom remark
   */
  const updateStatusWithLog = async (
    siteClosureId: number,
    newStatusId: number,
    remark?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      // First, get the current status
      const { data: currentData, error: fetchError } = await supabase
        .from("nd_site_closure")
        .select("status")
        .eq("id", siteClosureId)
        .single();

      if (fetchError) throw new Error(fetchError.message);

      const oldStatusId = currentData?.status;

      // Update the status
      const { error: updateError } = await supabase
        .from("nd_site_closure")
        .update({ status: newStatusId })
        .eq("id", siteClosureId);

      if (updateError) throw new Error(updateError.message);

      // Log the status change
      await logStatusChange(siteClosureId, newStatusId, oldStatusId, remark);

      return { success: true };
    } catch (err: any) {
      setError(err.message);
      console.error("Error updating status with log:", err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    addLog,
    getLogs,
    logStatusChange,
    updateStatusWithLog,
    loading,
    error,
  };
};

export default useSiteClosureLogs;
