import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OffDaysManager } from "@/components/hr/settings/OffDaysManager";
import { EntitlementManager } from "@/components/hr/settings/EntitlementManager";
import { WorkHourManager } from "@/components/hr/settings/WorkHourManager";
import { Calendar, Clock, Award } from "lucide-react";

const HRSettings = () => {
  const [activeTab, setActiveTab] = useState("offdays");

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold">HR Settings</h1>
          <p className="text-muted-foreground">
            Configure off days, leave entitlements, and work hours
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="offdays" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Off Days Management</span>
            </TabsTrigger>
            <TabsTrigger
              value="entitlement"
              className="flex items-center gap-2"
            >
              <Award className="h-4 w-4" />
              <span>Leave Entitlements</span>
            </TabsTrigger>
            <TabsTrigger value="workhours" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Work Hours</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="offdays">
            <Card>
              <CardHeader>
                <CardTitle>Off Days Management</CardTitle>
                <CardDescription>
                  Manage holidays, weekends, and special off days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OffDaysManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="entitlement">
            <Card>
              <CardHeader>
                <CardTitle>Leave Entitlements</CardTitle>
                <CardDescription>
                  Configure leave types and entitlement settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EntitlementManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workhours">
            <Card>
              <CardHeader>
                <CardTitle>Work Hours Configuration</CardTitle>
                <CardDescription>
                  Configure standard work hours and schedules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WorkHourManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default HRSettings;
