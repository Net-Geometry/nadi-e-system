import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GeneralInformation from "./GeneralInformation";
import TechnicalBuilding from "./TechnicalBuilding";
import Address from "./Address"; // Import Address component
import SiteBanner from "./SiteBanner";
import { SUPABASE_URL } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const OverviewPage = ({
  site,
  socioeconomics,
  space,
  address,
}: {
  site: any;
  socioeconomics: any[];
  space: any[];
  address: any;
}) => {
  // Add address prop
  const [bannerImages, setBannerImages] = useState<string[]>([
    "/nadi-site.jpg",
    "/nadi-site2.jpg",
    "/nadi-site3.jpg",
  ]);

  useEffect(() => {
    const fetchBannerImages = async () => {
      if (!site?.id) return;

      const { data, error } = await supabase
        .from("nd_site_image")
        .select("file_path")
        .eq("site_profile_id", site.id);

      if (error) {
        console.error("Error fetching site images:", error);
        return;
      }

      if (data && data.length > 0) {
        const filePaths = data[0].file_path || [];
        const publicUrls = filePaths.map(
          (path: string) => `${SUPABASE_URL}${path}`
        );
        setBannerImages(publicUrls);
      }
    };

    fetchBannerImages();
  }, [site?.id]);

  return (
    <div className="w-full">
      <SiteBanner
        name={site.sitename ? site.sitename : "N/A"}
        type={site.state_id?.name ? site.state_id.name : "N/A"}
        bannerImage={bannerImages}
      />
      <div className="flex justify-between items-center mb-6 mt-4">
        <h3 className="text-xl font-bold">Site Details</h3>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General Information</TabsTrigger>
          <TabsTrigger value="technical">Technical & Building</TabsTrigger>
          <TabsTrigger value="address">Address</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="space-y-6">
          <GeneralInformation site={site} />
        </TabsContent>
        <TabsContent value="technical" className="space-y-6">
          <TechnicalBuilding
            site={site}
            socioeconomics={socioeconomics}
            space={space}
          />
        </TabsContent>
        <TabsContent value="address" className="space-y-6">
          <Address address={address} /> {/* Pass address */}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OverviewPage;
