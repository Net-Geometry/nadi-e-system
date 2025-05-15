import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardHover,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import AttendanceRecords from "@/components/hr/AttendanceRecords";
import { format } from "date-fns";
import { Building, Clock, UserCheck, Users } from "lucide-react";
import useStaffID from "@/hooks/use-staff-id";
import { useUserMetadata } from "@/hooks/use-user-metadata";

const Attendance = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState("daily");
  const { staffID } = useStaffID();
  const userMetadataString = useUserMetadata();
  const [siteId, setSiteId] = useState<number | undefined>(undefined);
  const [organizationId, setOrganizationId] = useState<string | undefined>(
    undefined
  );

  // Extract organization info from metadata
  useEffect(() => {
    if (userMetadataString) {
      try {
        const metadata = JSON.parse(userMetadataString);
        if (metadata.site_id) {
          setSiteId(Number(metadata.site_id));
        }
        if (metadata.organization_id) {
          setOrganizationId(metadata.organization_id);
          console.log("Organization ID set:", metadata.organization_id);
        }
      } catch (error) {
        console.error("Error parsing user metadata:", error);
      }
    }
  }, [userMetadataString]);

  const attendanceStats = {
    presentToday: 32,
    onTime: 30,
    late: 2,
    absent: 3,
    totalStaff: 35,
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-xl font-bold mb-6">Attendance Management</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <CardHover>
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="bg-green-100 p-2 rounded-full">
                <UserCheck className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Present Today
                </p>
                <h3 className="text-2xl font-bold">
                  {attendanceStats.presentToday}
                </h3>
              </div>
            </CardContent>
          </CardHover>

          <CardHover>
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="bg-amber-100 p-2 rounded-full">
                <Clock className="h-6 w-6 text-amber-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  On Time
                </p>
                <h3 className="text-2xl font-bold">{attendanceStats.onTime}</h3>
              </div>
            </CardContent>
          </CardHover>

          <CardHover>
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="bg-red-100 p-2 rounded-full">
                <Clock className="h-6 w-6 text-red-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Late
                </p>
                <h3 className="text-2xl font-bold">{attendanceStats.late}</h3>
              </div>
            </CardContent>
          </CardHover>

          <CardHover>
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="bg-blue-100 p-2 rounded-full">
                <Users className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Staff
                </p>
                <h3 className="text-2xl font-bold">
                  {attendanceStats.totalStaff}
                </h3>
              </div>
            </CardContent>
          </CardHover>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-6">
            <TabsTrigger value="daily">Daily Attendance</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Report</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="daily">
            <AttendanceRecords siteId={siteId} />
          </TabsContent>

          <TabsContent value="monthly">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Attendance Report</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  View and export monthly attendance reports for all staff
                  members.
                </p>
                <div className="p-6 text-center text-muted-foreground">
                  Monthly attendance report feature coming soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  View detailed attendance statistics and trends.
                </p>
                <div className="p-6 text-center text-muted-foreground">
                  Attendance statistics feature coming soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Attendance;
