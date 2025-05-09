import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface AttendanceRecord {
  id: string;
  staff_id: string;
  site_id: string;
  time_in: string;
  time_out: string | null;
  created_at: string;
}

interface Site {
  id: string;
  sitename: string;
  organization_id: string;
}

interface StaffAttendance {
  attendance: AttendanceRecord[];
  sites: Site[];
  loading: boolean;
  error: string | null;
  recordAttendance: (siteId: string) => Promise<void>;
  updateAttendance: () => Promise<void>;
}

export const useStaffAttendance = (): StaffAttendance => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      setError(null);

      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Get the organization ID of the user
        const { data: userProfile, error: profileError } = await supabase
          .from("profiles")
          .select("organization_id")
          .eq("id", user.id)
          .single();

        if (profileError) {
          throw new Error(
            `Error fetching user profile: ${profileError.message}`
          );
        }

        const organizationId = userProfile?.organization_id;

        if (!organizationId) {
          throw new Error("Organization ID not found for the user.");
        }

        // Get all sites under the organization
        const { data: sitesData } = await supabase
          .from("sites")
          .select("id, sitename, organization_id")
          .eq("organization_id", organizationId);

        const sites = sitesData || [];

        setSites(sites);

        // Fetch attendance records for the staff and the sites
        const { data: attendanceData, error: attendanceError } = await supabase
          .from("staff_attendance")
          .select("*")
          .eq("staff_id", user.id)
          .in(
            "site_id",
            sites.map((site) => site.id)
          );

        if (attendanceError) {
          throw new Error(
            `Error fetching attendance: ${attendanceError.message}`
          );
        }

        setAttendance(attendanceData || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [user?.id]);

  const recordAttendance = async (siteId: string) => {
    setLoading(true);
    setError(null);

    if (!user?.id) {
      setError("User ID not found.");
      setLoading(false);
      return;
    }

    try {
      const { data, error: insertError } = await supabase
        .from("staff_attendance")
        .insert([
          {
            staff_id: user.id,
            site_id: siteId,
            time_in: new Date().toISOString(),
          },
        ])
        .select();

      if (insertError) {
        throw new Error(`Error recording attendance: ${insertError.message}`);
      }

      setAttendance((prevAttendance) => [...prevAttendance, data![0]]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateAttendance = async () => {
    setLoading(true);
    setError(null);

    if (!user?.id) {
      setError("User ID not found.");
      setLoading(false);
      return;
    }

    try {
      // Find the latest attendance record without a time_out
      const latestRecord = attendance.find(
        (record) => record.staff_id === user.id && record.time_out === null
      );

      if (!latestRecord) {
        throw new Error("No attendance record found to update.");
      }

      const { data, error: updateError } = await supabase
        .from("staff_attendance")
        .update({ time_out: new Date().toISOString() })
        .eq("id", latestRecord.id)
        .select();

      if (updateError) {
        throw new Error(`Error updating attendance: ${updateError.message}`);
      }

      // Update the attendance state with the updated record
      setAttendance((prevAttendance) =>
        prevAttendance.map((record) =>
          record.id === latestRecord.id ? data![0] : record
        )
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    attendance,
    sites,
    loading,
    error,
    recordAttendance,
    updateAttendance,
  };
};
