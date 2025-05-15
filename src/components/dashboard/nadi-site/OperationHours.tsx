import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

type OperationHour = {
  days_of_week: string;
  open_time: string | null;
  close_time: string | null;
  is_close: boolean;
};

type OperationHoursProps = {
  operationHours: OperationHour[];
  loading?: boolean;
  error?: string | null;
};

const OperationHours: React.FC<OperationHoursProps> = ({ operationHours, loading, error }) => {
  return (
    <Card className="mb-6" id="operation">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Operation Hours
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-muted-foreground">Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
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
                {operationHours.length > 0 ? (
                  operationHours.map((hour) => (
                    <tr key={hour.days_of_week} className="border-b">
                      <td className="px-4 py-2 font-medium">{hour.days_of_week}</td>
                      <td className="px-4 py-2">{hour.is_close ? "-" : hour.open_time ?? "-"}</td>
                      <td className="px-4 py-2">{hour.is_close ? "-" : hour.close_time ?? "-"}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            hour.is_close
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {hour.is_close ? "Closed" : "Open"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-muted-foreground">
                      No operation hours data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OperationHours;