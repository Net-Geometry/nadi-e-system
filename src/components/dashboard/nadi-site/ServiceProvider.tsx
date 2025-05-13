import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wifi, Network, WifiHigh } from "lucide-react";

const ServiceProvider = () => {
  return (
    <Card className="mb-6 bg-gradient-to-br from-blue-50 to-purple-50 hover:shadow-lg transition-all duration-300">
      <CardHeader className="border-b bg-white/50 backdrop-blur-sm">
        <CardTitle className="flex items-center gap-2 text-blue-600">
          <Network className="h-5 w-5" />
          Network Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border bg-white hover:border-blue-300 hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-2">
              <Network className="h-5 w-5 text-blue-500 group-hover:text-blue-600 transition-colors" />
              <h3 className="font-medium">Network</h3>
            </div>
            <p className="text-sm text-muted-foreground">NADI Staff Network</p>
          </div>

          <div className="p-4 rounded-lg border bg-white hover:border-blue-300 hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-2">
              <WifiHigh className="h-5 w-5 text-green-500 group-hover:text-green-600 transition-colors" />
              <h3 className="font-medium">Internet Speed (Mbps)</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Download: 500 Mbps
              <br />
              Upload: 200 Mbps
            </p>
          </div>

          <div className="p-4 rounded-lg border bg-white hover:border-blue-300 hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-2">
              <Wifi className="h-5 w-5 text-purple-500 group-hover:text-purple-600 transition-colors" />
              <h3 className="font-medium">Internet Provider</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Unifi Business Fiber
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceProvider;
