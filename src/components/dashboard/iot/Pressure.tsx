import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

const Pressure = () => {
  return (
    <Card className="mb-6 bg-gradient-to-br from-indigo-50 to-purple-50 hover:shadow-lg transition-all duration-300">
      <CardHeader className="border-b bg-white/50 backdrop-blur-sm">
        <CardTitle className="flex items-center gap-2 text-indigo-600">
          <Activity className="h-5 w-5" />
          Barometric Pressure
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center items-center mb-6">
          <div className="text-center">
            <p className="text-5xl font-bold text-indigo-700">1013.2</p>
            <p className="text-lg text-muted-foreground mt-1">hPa</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-muted-foreground">Low Pressure</span>
            <span className="text-xs text-muted-foreground">High Pressure</span>
          </div>
          <div className="h-3 w-full bg-gradient-to-r from-blue-200 via-green-200 to-red-200 rounded-full relative">
            <div
              className="absolute h-5 w-1 bg-indigo-700 rounded-full -top-1"
              style={{ left: "60%" }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-muted-foreground">990 hPa</span>
            <span className="text-xs text-muted-foreground">1030 hPa</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-lg border border-indigo-200">
            <p className="text-sm text-muted-foreground mb-1">Today's Trend</p>
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              <p className="text-base">Rising slowly</p>
            </div>
          </div>
          <div className="p-4 bg-white rounded-lg border border-indigo-200">
            <p className="text-sm text-muted-foreground mb-1">Forecast</p>
            <p className="text-base">Fair weather expected</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Pressure;
