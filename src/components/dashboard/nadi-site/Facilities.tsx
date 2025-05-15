import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Workflow } from "lucide-react";

type FacilitiesProps = {
  site: any;
  socioeconomics: Array<{ eng?: string }>;
  space: Array<{ eng?: string }>;
};

const Facilities: React.FC<FacilitiesProps> = ({ site, socioeconomics, space }) => {
  return (
    <Card className="mb-6" id="facilities">
      <CardHeader>
        <CardTitle>Facilities & Accessibility</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Accessibility Features */}
          <div>
            <h3 className="font-medium mb-2">Accessibility Features</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">OKU Friendly:</span>
              {site?.oku_friendly === true ? (
                <span className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" /> Yes
                </span>
              ) : site?.oku_friendly === false ? (
                <span className="flex items-center text-red-600">
                  <XCircle className="h-4 w-4 mr-1" /> No
                </span>
              ) : (
                <span className="text-gray-400">N/A</span>
              )}
            </div>
          </div>

          {/* Socioeconomics */}
          <div>
            <h3 className="font-medium mb-2 flex items-center">
              <Workflow className="h-4 w-4 mr-1 text-gray-500" />
              Socioeconomics
            </h3>
            <ul className="list-disc pl-6">
              {socioeconomics && socioeconomics.length > 0 ? (
                socioeconomics.map((item, index) => (
                  <li key={index}>{item.eng || "Not specified"}</li>
                ))
              ) : (
                <li>No socioeconomic data available</li>
              )}
            </ul>
          </div>

          {/* Space */}
          <div className="md:col-span-2">
            <h3 className="font-medium mb-2 flex items-center">
              <Workflow className="h-4 w-4 mr-1 text-gray-500" />
              Space
            </h3>
            <ul className="list-disc pl-6">
              {space && space.length > 0 ? (
                space.map((item, index) => (
                  <li key={index}>{item.eng || "Not specified"}</li>
                ))
              ) : (
                <li>No space data available</li>
              )}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Facilities;