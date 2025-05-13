import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gauge } from "lucide-react";

const RainGauge = () => {
  return (
    <Card className="mb-6 bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-lg transition-all duration-300">
      <CardHeader className="border-b bg-white/50 backdrop-blur-sm">
        <CardTitle className="flex items-center gap-2 text-blue-600">
          <Gauge className="h-5 w-5" />
          Rain Gauge
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border border-blue-200 hover:shadow-md">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Current Rainfall
            </h3>
            <p className="text-4xl font-bold text-blue-700">2.5 mm</p>
            <p className="text-sm text-muted-foreground mt-1">
              Last updated: 10 min ago
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border border-blue-200 hover:shadow-md">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Today's Total
            </h3>
            <p className="text-4xl font-bold text-blue-700">12.7 mm</p>
            <p className="text-sm text-muted-foreground mt-1">
              Updated: May 8, 2025
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
          <h3 className="font-medium mb-3">Recent Readings</h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { time: "12:00 PM", value: "1.2 mm" },
              { time: "1:00 PM", value: "0.5 mm" },
              { time: "2:00 PM", value: "0.8 mm" },
            ].map((reading, idx) => (
              <div key={idx} className="p-2 bg-blue-50 rounded-md text-center">
                <p className="text-xs text-muted-foreground">{reading.time}</p>
                <p className="text-sm font-medium text-blue-600">
                  {reading.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RainGauge;
