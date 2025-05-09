import { DashboardLayout } from "@/components/layout/DashboardLayout";
import RainGauge from "@/components/dashboard/iot/RainGauge";
import Temperature from "@/components/dashboard/iot/Temperature";
import Humidity from "@/components/dashboard/iot/Humidity";
import Pressure from "@/components/dashboard/iot/Pressure";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const IotDashboard = () => {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold">Dashboard IoT</h1>
          <Button variant="outline" className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            <span>Reference Link</span>
          </Button>
        </div>

        <Tabs defaultValue="rain" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="rain">Rain Gauge</TabsTrigger>
            <TabsTrigger value="temp">Temperature</TabsTrigger>
            <TabsTrigger value="humidity">Humidity</TabsTrigger>
            <TabsTrigger value="pressure">Pressure</TabsTrigger>
          </TabsList>

          <TabsContent value="rain" className="mt-6">
            <RainGauge />
          </TabsContent>

          <TabsContent value="temp" className="mt-6">
            <Temperature />
          </TabsContent>

          <TabsContent value="humidity" className="mt-6">
            <Humidity />
          </TabsContent>

          <TabsContent value="pressure" className="mt-6">
            <Pressure />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default IotDashboard;
