import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import { useSiteProfile } from "../site/hook/use-site-profile";
import { useUserMetadata } from "@/hooks/use-user-metadata";

const SiteProfileSettings = () => {
  // Get user metadata and extract siteId, userGroup, userType
  const userMetadata = useUserMetadata();
  const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;
  const siteId = parsedMetadata?.group_profile?.site_profile_id;

  // Fetch site profile data
  const { data: site, loading, organization } = useSiteProfile(siteId);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!site) {
    return <div className="text-center">This account does not have a profile yet.</div>;
  }


  // Helper to capitalize
  const capitalize = (str?: string) => (str ? str.toUpperCase() : "");

  return (
    <Tabs defaultValue="overview" className="mt-6">
      <TabsList className="border-b dark:border-gray-700 w-full justify-start bg-transparent p-0 h-auto overflow-x-auto mb-6">
        <TabsTrigger value="overview" className="px-4 py-2 text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
          Overview
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="h-full mt-0">
        <Card className="h-full">
          <div className="p-6 h-full w-full">
            {/* <pre>{JSON.stringify(site, null, 2)}</pre> */}

            {/* Top: Organization and Site Image */}
            <div className="flex justify-between items-center mb-6 mt-4 gap-6">
              {/* Site Organization */}
              <div className="flex flex-col items-center flex-1 border rounded-lg p-4 bg-white shadow-sm">
                <div className="text-xs text-muted-foreground mb-2">
                  {site?.dusp_tp_id?.type ? capitalize(site.dusp_tp_id.type) : "TP"}
                </div>
                <img
                  src={site?.dusp_tp_id?.logo_url || "/user-solid.svg"}
                  alt={site?.dusp_tp_id?.name || "Logo"}
                  className="h-12 w-12 object-contain mb-2"
                />
                <div className="font-semibold">
                  {site?.dusp_tp_id?.name || "N/A"}
                </div>
              </div>
              {/* Site Profile Image */}
              {/* <div className="flex flex-col items-center flex-1 border rounded-lg p-4 bg-white shadow-sm">
                <div className="text-xs text-muted-foreground mb-2">Site Image</div>
                <img
                  src={site.file_path || "/user-solid.svg"}
                  alt={site.fullname || "Profile Image"}
                  className="h-24 w-24 object-cover rounded-full mb-2"
                />
                <div className="font-semibold">{site.fullname || "N/A"}</div>
              </div> */}
              {/* Parent Organization */}
              <div className="flex flex-col items-center flex-1 border rounded-lg p-4 bg-white shadow-sm">
                <div className="text-xs text-muted-foreground mb-2">
                  {organization?.parent?.type ? capitalize(organization.parent.type) : "DUSP"}
                </div>
                <img
                  src={organization?.parent?.logo_url || "/user-solid.svg"}
                  alt={organization?.parent?.name || "Logo"}
                  className="h-12 w-12 object-contain mb-2"
                />
                <div className="font-semibold">
                  {organization?.parent?.name || "N/A"}
                </div>
              </div>
            </div>

            {/* Site Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
              <div>
                <div className="text-sm text-muted-foreground">Site Name</div>
                <div>{site?.sitename ?? "N/A"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Full Name</div>
                <div>{site?.fullname ?? "N/A"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Phase</div>
                <div>{site?.phase_id?.name ?? "N/A"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Status</div>
                <div>{site?.active_status?.eng ?? "N/A"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Operate Date</div>
                <div>
                  {site?.operate_date
                    ? new Date(site.operate_date).toLocaleDateString()
                    : "N/A"}
                </div>
              </div>
              {/* Add more fields as needed */}
            </div>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default SiteProfileSettings;