import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GeneralInformation from "./GeneralInformation";
import TechnicalBuilding from "./TechnicalBuilding";

const OverviewPage = ({ site, socioeconomics, space }: { site: any; socioeconomics: any[]; space: any[] }) => {
  return (
    <div className="w-full lg:w-3/4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Site Details</h3>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General Information</TabsTrigger>
          <TabsTrigger value="technical">Technical & Building</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="space-y-6">
          <GeneralInformation site={site} />
        </TabsContent>
        <TabsContent value="technical" className="space-y-6">
          <TechnicalBuilding site={site} socioeconomics={socioeconomics} space={space} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OverviewPage;