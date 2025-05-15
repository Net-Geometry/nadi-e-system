import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "lucide-react";

const Membership = () => {
  return (
    <Card
      className="mb-6 bg-gradient-to-br from-purple-50 to-blue-50 hover:shadow-lg transition-all duration-300"
      id="membership"
    >
      <CardHeader className="border-b bg-white/50 backdrop-blur-sm">
        <CardTitle className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Membership Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-lg border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-100 group-hover:bg-purple-200 transition-colors">
                <BarChart className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Membership
                </p>
                <h3 className="text-2xl font-bold text-purple-700">1,234</h3>
              </div>
            </div>
          </div>
          <div className="p-6 bg-white rounded-lg border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                <BarChart className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  New Members (This Month)
                </p>
                <h3 className="text-2xl font-bold text-blue-700">56</h3>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Membership;
