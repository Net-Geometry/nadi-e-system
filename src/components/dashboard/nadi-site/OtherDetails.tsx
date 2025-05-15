import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Info } from "lucide-react";

const OtherDetails = () => {
  return (
    <Card className="mb-6" id="others">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Other Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Building className="h-4 w-4" />
              Building Information
            </h3>
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Building Type
                </label>
                <p className="text-base">MSC Malaysia Status Building</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Building Level
                </label>
                <p className="text-base">Ground Floor</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Building Area
                </label>
                <p className="text-base">140 m²</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Building Rental
                </label>
                <p className="text-base">RM 5,000/month</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-medium">Additional Information</h3>
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  OKU Friendly
                </label>
                <p className="text-base">Yes</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Total Population (3KM Radius)
                </label>
                <p className="text-base">25,000</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Economic Activity
                </label>
                <p className="text-base">Technology Hub</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Number of Entrepreneurs
                </label>
                <p className="text-base">150</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OtherDetails;
