import { Eye, EyeOff, Users, UserCheck, UserCog, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSiteProfile } from "./hook/use-site-profile";
import { useSiteCode } from "./hook/use-site-code";
import useSiteGeneralData from "@/hooks/use-site-general-data";
import { StatsCard } from "./component/StatsCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import OverviewPage from "./component/OverviewPage";
import StaffPage from "./component/StaffPage";
import BillingPage from "./component/BillingPage";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import InsurancePage from "./component/InsurancePage.tsx";

interface SiteDetailProps {
  siteId: string;
}

const SiteDetail: React.FC<SiteDetailProps> = ({ siteId }) => {
  const { data, socioeconomics, space, address, loading, error } = useSiteProfile(siteId); // Pass address
  const { siteCode, loading: codeLoading, error: codeError } = useSiteCode(siteId);
  const { siteStatus } = useSiteGeneralData();

  const stats = [
    {
      title: "Total Members",
      value: 1200,
      icon: Users,
      iconBgColor: "bg-blue-100",
      iconTextColor: "text-blue-600",
    },
    {
      title: "Active Members",
      value: 850,
      icon: UserCheck,
      iconBgColor: "bg-green-100",
      iconTextColor: "text-green-600",
    },
    {
      title: "Staff Members",
      value: 2,
      icon: UserCog,
      iconBgColor: "bg-purple-100",
      iconTextColor: "text-purple-600",
    },
    {
      title: "Total Revenue",
      value: "$45,000",
      icon: DollarSign,
      iconBgColor: "bg-yellow-100",
      iconTextColor: "text-yellow-600",
    },
  ];

  if (loading || codeLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{data?.fullname ?? "Site Name"}</h1>
          <h3 className="text-muted-foreground">
            Site Code: <span className="font-bold">{siteCode ?? "N/A"}</span>
          </h3>
          <div className="font-medium flex items-center gap-2">
            <span className="text-muted-foreground">Status: </span>
            <span className="font-medium flex items-center gap-2">
              {data?.active_status?.eng ?? "N/A"}
              {data?.is_active ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </span>
          </div>
        </div>
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

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="border-b dark:border-gray-700 w-full justify-start bg-transparent p-0 h-auto overflow-x-auto mb-6">
          <TabsTrigger value="overview" className="px-4 py-2 text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">Overview</TabsTrigger>
          <TabsTrigger value="billing" className="px-4 py-2 text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">Billing</TabsTrigger>
          <TabsTrigger value="insurance" className="px-4 py-2 text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">Insurance</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="h-full mt-0">
          <Card className="h-full">
            <div className="p-6 h-full">
              <OverviewPage site={data} socioeconomics={socioeconomics} space={space} address={address} /> {/* Pass address */}
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="billing" className="h-full mt-0">
          <Card className="h-full">
            <div className="p-6 h-full">
              <BillingPage siteId={siteId} />
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="insurance" className="h-full mt-0">
          <Card className="h-full">
            <div className="p-6 h-full">
              <InsurancePage siteId={siteId} />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SiteDetail;