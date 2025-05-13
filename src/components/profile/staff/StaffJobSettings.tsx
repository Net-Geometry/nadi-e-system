import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import usePositionData from "@/hooks/use-position-data";
import useStaffID from "@/hooks/use-staff-id";
import { Skeleton } from "@/components/ui/skeleton";

export const StaffJobSettings = () => {
  const [staffJob, setStaffJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { positions } = usePositionData();
  const {
    staffID,
    loading: staffIDLoading,
    error: staffIDError,
  } = useStaffID();

  useEffect(() => {
    if (staffIDLoading || !staffID) return;

    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from("nd_staff_job")
          .select(
            "id, staff_id, site_id, position_id, join_date, resign_date, is_active"
          )
          .eq("staff_id", staffID)
          .single();
        if (error) throw error;
        setStaffJob(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [staffID, staffIDLoading]);

  if (loading || staffIDLoading) {
    return <Skeleton>Loading Data...</Skeleton>;
  }

  if (!staffJob) {
    return (
      <Card className="overflow-hidden border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600">
          <CardTitle className="text-white">Job</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div>No data available.</div>
        </CardContent>
      </Card>
    );
  }

  const getPositionName = (positionId: number) => {
    const position = positions.find((pos) => pos.id === positionId);
    return position ? position.name : "Unknown Position";
  };

  return (
    <Card className="overflow-hidden border-none shadow-lg">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600">
        <CardTitle className="text-white">Job</CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-8 mt-6">
          <h2 className="text-lg font-semibold">Current Job</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                id: "position",
                label: "Position",
                value: getPositionName(staffJob.position_id),
              },
              {
                id: "join_date",
                label: "Join Date",
                type: "date",
                value: staffJob.join_date,
              },
              {
                id: "resign_date",
                label: "Resign Date",
                type: "date",
                value: staffJob.resign_date,
              },
              {
                id: "is_active",
                label: "Job Status",
                value: staffJob.is_active ? "Active" : "Inactive",
              },
            ].map((field) => (
              <div
                key={field.id}
                className={
                  field.id === "join_date" || field.id === "resign_date"
                    ? ""
                    : "col-span-2"
                }
              >
                <Label htmlFor={field.id}>{field.label}</Label>
                <Input
                  id={field.id}
                  type={field.type || "text"}
                  placeholder={`Enter ${field.label}`}
                  value={field.value || ""}
                  readOnly
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StaffJobSettings;
