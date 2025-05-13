import { DashboardLayout } from "@/components/layout/DashboardLayout";
import NADIInfo from "@/components/dashboard/nadi-site/NadiInfo";
import Membership from "@/components/dashboard/nadi-site/Membership";
import Events from "@/components/dashboard/nadi-site/Events";
import LocationMap from "@/components/dashboard/nadi-site/LocationMap";
import OperationHours from "@/components/dashboard/nadi-site/OperationHours";
import ServiceProvider from "@/components/dashboard/nadi-site/ServiceProvider";
import ContactInfo from "@/components/dashboard/nadi-site/ContactInfo";
import OtherDetails from "@/components/dashboard/nadi-site/OtherDetails";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const NadiDashboard = () => {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-6">NADI Dashboard</h1>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
            <TabsTrigger value="info">Information</TabsTrigger>
            <TabsTrigger value="membership">Membership</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="contact">Contact & Others</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-6">
            <div className="grid grid-cols-1 gap-6">
              <NADIInfo />
            </div>
          </TabsContent>

          <TabsContent value="membership" className="mt-6">
            <div className="grid grid-cols-1 gap-6">
              <Membership />
            </div>
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <div className="grid grid-cols-1 gap-6">
              <Events />
            </div>
          </TabsContent>

          <TabsContent value="location" className="mt-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="mb-6">
                <LocationMap />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <OperationHours />
                <ServiceProvider />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="mt-6">
            <div className="grid grid-cols-1 gap-6">
              <ContactInfo />
              <OtherDetails />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default NadiDashboard;
