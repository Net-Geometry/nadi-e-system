import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

const OperationHours = () => {
  const operationHours = [
    { day: "Monday", start: "09:00", end: "18:00", status: "Open" },
    { day: "Tuesday", start: "09:00", end: "18:00", status: "Open" },
    { day: "Wednesday", start: "09:00", end: "18:00", status: "Open" },
    { day: "Thursday", start: "09:00", end: "18:00", status: "Open" },
    { day: "Friday", start: "09:00", end: "18:00", status: "Open" },
    { day: "Saturday", start: "10:00", end: "15:00", status: "Open" },
    { day: "Sunday", start: "-", end: "-", status: "Closed" },
  ];

  return (
    <Card className="mb-6" id="operation">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Operation Hours
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-accent">
              <tr>
                <th className="px-4 py-2">Day</th>
                <th className="px-4 py-2">Time Start</th>
                <th className="px-4 py-2">Time End</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {operationHours.map((hour) => (
                <tr key={hour.day} className="border-b">
                  <td className="px-4 py-2 font-medium">{hour.day}</td>
                  <td className="px-4 py-2">{hour.start}</td>
                  <td className="px-4 py-2">{hour.end}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        hour.status === "Open"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {hour.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default OperationHours;
