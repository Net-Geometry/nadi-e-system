import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudRain } from "lucide-react";

const Humidity = () => {
  return (
    <Card className="mb-6 bg-gradient-to-br from-teal-50 to-green-50 hover:shadow-lg transition-all duration-300">
      <CardHeader className="border-b bg-white/50 backdrop-blur-sm">
        <CardTitle className="flex items-center gap-2 text-teal-600">
          <CloudRain className="h-5 w-5" />
          Humidity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center items-center mb-6">
          <div className="relative flex items-center justify-center">
            <svg className="w-40 h-40" viewBox="0 0 100 100">
              <circle
                className="text-teal-100 stroke-current"
                strokeWidth="10"
                cx="50"
                cy="50"
                r="40"
                fill="none"
              ></circle>
              <circle
                className="text-teal-600 stroke-current"
                strokeWidth="10"
                strokeLinecap="round"
                cx="50"
                cy="50"
                r="40"
                fill="none"
                strokeDasharray="251.2"
                strokeDashoffset="63"
                transform="rotate(-90 50 50)"
              ></circle>
            </svg>
            <div className="absolute flex flex-col justify-center items-center">
              <p className="text-4xl font-bold text-teal-700">75%</p>
              <p className="text-xs text-muted-foreground">Relative Humidity</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-lg border border-teal-200 text-center">
            <p className="text-sm text-muted-foreground mb-1">Dew Point</p>
            <p className="text-xl font-semibold text-teal-600">23°C</p>
          </div>
          <div className="p-4 bg-white rounded-lg border border-teal-200 text-center">
            <p className="text-sm text-muted-foreground mb-1">Daily Average</p>
            <p className="text-xl font-semibold text-teal-600">68%</p>
          </div>
          <div className="p-4 bg-white rounded-lg border border-teal-200 text-center">
            <p className="text-sm text-muted-foreground mb-1">Trend</p>
            <p className="text-xl font-semibold text-teal-600">+2%/hr</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Humidity;
