import { Eye, EyeOff, Users, UserCheck, UserCog, DollarSign, Printer } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSiteOperationHours, useSiteProfile, useSiteProfileImages, useSiteStats } from "./hook/use-site-profile";
import { useSiteStaff } from "./hook/use-site-staff"; // Add this import
import { useSiteCode } from "./hook/use-site-code";
import { StatsCard } from "./component/StatsCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import OverviewPage from "./component/OverviewPage";
import StaffPage from "./component/StaffPage";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import Membership from "@/components/dashboard/nadi-site/Membership";
import Events from "@/components/dashboard/nadi-site/Events";
import LocationMap from "@/components/dashboard/nadi-site/LocationMap";
import OperationHours from "@/components/dashboard/nadi-site/OperationHours";
import ServiceProvider from "@/components/dashboard/nadi-site/ServiceProvider";
import ContactInfo from "@/components/dashboard/nadi-site/ContactInfo";
import React from "react";
import BuildingInfo from "../dashboard/nadi-site/BuildingInfo";
import Facilities from "../dashboard/nadi-site/Facilities";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import SiteImage from "../dashboard/nadi-site/SiteImage";


interface SiteDetailProps {
  siteId: string;
}

const SiteDetail: React.FC<SiteDetailProps> = ({ siteId }) => {
  const { data, socioeconomics, space, address, organization, loading, error } = useSiteProfile(siteId); // Pass address
  const { siteCodeData, loading: codeLoading, error: codeError } = useSiteCode(siteId);
  const { totalMembers, activeMembers, staffMembers, totalRevenue, loading: statsLoading, error: statsError } = useSiteStats(siteId);
  const { staffData, loading: staffLoading, error: staffError } = useSiteStaff(siteId); // Fetch staff data here
  const { operationHours, loading: opLoading, error: opError } = useSiteOperationHours(siteId);
  const { file_path: images, loading: imagesLoading, error: imagesError } = useSiteProfileImages(siteId);


  const stats = [
    {
      title: "Total Members",
      value: totalMembers,
      icon: Users,
      iconBgColor: "bg-blue-100",
      iconTextColor: "text-blue-600",
    },
    {
      title: "Active Members",
      value: activeMembers,
      icon: UserCheck,
      iconBgColor: "bg-green-100",
      iconTextColor: "text-green-600",
    },
    {
      title: "Staff Members",
      value: staffMembers,
      icon: UserCog,
      iconBgColor: "bg-purple-100",
      iconTextColor: "text-purple-600",
    },
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      iconBgColor: "bg-yellow-100",
      iconTextColor: "text-yellow-600",
    },
  ];

  const handlePrint = async () => {
    const printContent = document.getElementById("printable-content");
    const originalContent = document.body.innerHTML;

    if (printContent) {
      // Get all TabsTrigger elements
      const tabsTriggers = document.querySelectorAll('[role="tab"]');
      const tabsContents = document.querySelectorAll(".tabs-content");

      // Temporarily make all TabsContent visible
      tabsContents.forEach((tab) => {
        tab.classList.add("block");
        tab.classList.remove("hidden");
      });

      // Simulate clicking all tabs to ensure content is rendered
      for (const trigger of tabsTriggers) {
        (trigger as HTMLElement).click();
        await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for rendering
      }

      // Replace body content with printable content
      document.body.innerHTML = printContent.innerHTML;
      window.print();

      // Restore original content and visibility
      document.body.innerHTML = originalContent;
      window.location.reload(); // Reload to restore the original state
    }
  };

  if (loading || codeLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>);
  }

  return (
    <div className="space-y-6" id="printable-content">
      <div className="flex justify-between items-center">

        <div>
          <h1 className="text-2xl font-bold">{siteCodeData?.fullname ?? "Site Name"}</h1>
          <div className="font-medium flex items-center gap-2">
            <span className="text-muted-foreground">Site Code:</span>
            <span className="font-bold">{siteCodeData?.standard_code ?? "N/A"}</span>
          </div>
          <div className="font-medium flex items-center gap-2">
            <span className="text-muted-foreground">Ref ID TP:</span>
            <span className="font-bold">{siteCodeData?.refid_tp ?? "N/A"}</span>
          </div>
          <div className="font-medium flex items-center gap-2">
            <span className="text-muted-foreground">Ref ID MCMC:</span>
            <span className="font-bold">{siteCodeData?.refid_mcmc ?? "N/A"}</span>
          </div>
          <div className="font-medium flex items-center gap-2">
            <span className="text-muted-foreground">Status: </span>
            <span className="font-medium flex items-center gap-2">
              {data?.active_status?.eng ?? "N/A"}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    {data?.is_active ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {data?.is_active ? "Active" : "Inactive"}
                </TooltipContent>
              </Tooltip>
            </span>
          </div>
        </div>
        <Button
          onClick={handlePrint}
          className="bg-primary text-white p-4 rounded-md hover:bg-primary-dark print:hidden" // Add print:hidden to exclude from print
        >
          <Printer className="h-5 w-5" /> {/* Replace text with Printer icon */}
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            iconBgColor={stat.iconBgColor}
            iconTextColor={stat.iconTextColor}
          />
        ))}
      </div>

      <Tabs defaultValue="overview" className="mt-6 tabs-print">
        <TabsList className="border-b dark:border-gray-700 w-full justify-start bg-transparent p-0 h-auto overflow-x-auto mb-6 print:hidden">
          <TabsTrigger value="overview" className="px-4 py-2 text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">Overview</TabsTrigger>
          <TabsTrigger value="image">Site Images</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="building">Building Info</TabsTrigger>
          <TabsTrigger value="connectivity">Connectivity</TabsTrigger>
          <TabsTrigger value="facilities">Facilities</TabsTrigger>
          <TabsTrigger value="operation">Operation Hours</TabsTrigger>
          {/* <TabsTrigger value="staff" className="px-4 py-2 text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">Staff</TabsTrigger> */}
          {/* <TabsTrigger value="membership">Membership</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger> */}
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="h-full mt-0">
          <Card className="h-full">
            <div className="p-6 h-full">
              <OverviewPage site={data} organization={organization} />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="image" className="h-full mt-0">
          <Card className="h-full flex justify-center items-center">
            <div className="p-6 w-[700px] h-[500px] ">
              <SiteImage
                images={images?.map((image) => ({ url: image }))}
                loading={imagesLoading}
                error={imagesError}
              />
            </div>
          </Card>
        </TabsContent>



        <TabsContent value="location" className="h-full mt-0">
          <Card className="h-full">
            <div className="p-6 h-full">
              <LocationMap site={data} address={address} /> {/* Pass site and address */}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="building" className="h-full mt-0">
          <Card className="h-full">
            <div className="p-6 h-full">
              <BuildingInfo
                building_type_id={data?.building_type_id}
                zone_id={data?.zone_id}
                area_id={data?.area_id}
                building_area_id={data?.building_area_id}
                building_rental_id={data?.building_rental_id}
                level_id={data?.level_id}
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="connectivity" className="h-full mt-0">
          <Card className="h-full">
            <div className="p-6 h-full">
              <ServiceProvider
                technology={data?.technology}
                bandwidth={data?.bandwidth}
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="facilities" className="h-full mt-0">
          <Card className="h-full">
            <div className="p-6 h-full">
              <Facilities site={data} socioeconomics={socioeconomics} space={space} />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="operation" className="h-full mt-0">
          <Card className="h-full">
            <div className="p-6 h-full">
              <OperationHours
                operationHours={operationHours}
                loading={opLoading}
                error={opError}
              />
            </div>
          </Card>
        </TabsContent>
        {/* <TabsContent value="staff" className="h-full mt-0">
          <Card className="h-full">
            <div className="p-6 h-full">
              <StaffPage
                staffData={staffData}
                loading={staffLoading}
                error={staffError}
              />
            </div>
          </Card>
        </TabsContent> */}
        {/* <TabsContent value="membership" className="h-full mt-0">
          <Card className="h-full">
            <div className="p-6 h-full">
              <Membership />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="h-full mt-0">
          <Card className="h-full">
            <div className="p-6 h-full">
              <Events />
            </div>
          </Card>
        </TabsContent> */}


        <TabsContent value="contact" className="h-full mt-0">
          <Card className="h-full">
            <div className="p-6 h-full">
              <ContactInfo site={data} staffData={staffData} />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div >
  );
};

export default SiteDetail;