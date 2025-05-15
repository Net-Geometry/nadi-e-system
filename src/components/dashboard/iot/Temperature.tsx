import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Thermometer } from "lucide-react";

const Temperature = () => {
  return (
    <Card className="mb-6 bg-gradient-to-br from-orange-50 to-red-50 hover:shadow-lg transition-all duration-300">
      <CardHeader className="border-b bg-white/50 backdrop-blur-sm">
        <CardTitle className="flex items-center gap-2 text-orange-600">
          <Thermometer className="h-5 w-5" />
          Temperature
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center items-center mb-6">
          <div className="text-center p-6 bg-white rounded-full border-4 border-orange-200 w-40 h-40 flex flex-col items-center justify-center">
            <p className="text-5xl font-bold text-orange-600">28°C</p>
            <p className="text-sm text-muted-foreground mt-1">Current</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white p-3 rounded-lg border border-orange-200 text-center">
            <p className="text-xs text-muted-foreground">Min Today</p>
            <p className="text-lg font-semibold text-blue-600">22°C</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-orange-200 text-center">
            <p className="text-xs text-muted-foreground">Max Today</p>
            <p className="text-lg font-semibold text-red-600">31°C</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-orange-200 text-center">
            <p className="text-xs text-muted-foreground">Avg Today</p>
            <p className="text-lg font-semibold text-purple-600">27°C</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-orange-200 text-center">
            <p className="text-xs text-muted-foreground">Feels Like</p>
            <p className="text-lg font-semibold text-orange-600">30°C</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Temperature;
