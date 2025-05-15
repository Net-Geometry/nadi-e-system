import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

const Events = () => {
  return (
    <Card
      className="mb-6 bg-gradient-to-br from-soft-orange/20 to-soft-pink/20"
      id="events"
    >
      <CardHeader>
        <CardTitle>Events Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <h4 className="text-xl font-bold text-purple-700">50</h4>
                <p className="text-sm text-muted-foreground">This Year</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-teal-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Participants
                </p>
                <h4 className="text-xl font-bold text-teal-700">5,000</h4>
                <p className="text-sm text-muted-foreground">All Events</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg. Attendance</p>
                <h4 className="text-xl font-bold text-orange-700">100</h4>
                <p className="text-sm text-muted-foreground">Per Event</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Smart Services NADI4U</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {[
                "NADI x Entrepreneur",
                "NADI x Lifelong Learning",
                "NADI x Wellbeing",
                "NADI x Awareness",
                "NADI x Government",
              ].map((pillar, index) => (
                <div
                  key={pillar}
                  className={`p-2 text-center rounded text-xs md:text-sm 
                    ${
                      index % 2 === 0
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                >
                  {pillar}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Smart Services NADI2U</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {[
                "NADI x Entrepreneur",
                "NADI x Lifelong Learning",
                "NADI x Wellbeing",
                "NADI x Awareness",
                "NADI x Government",
              ].map((pillar, index) => (
                <div
                  key={pillar}
                  className={`p-2 text-center rounded text-xs md:text-sm
                    ${
                      index % 2 === 0
                        ? "bg-purple-100 text-purple-800"
                        : "bg-teal-100 text-teal-800"
                    }`}
                >
                  {pillar}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Other Services</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {["Activity", "Training", "Services"].map((service, index) => (
                <div
                  key={service}
                  className={`p-2 text-center rounded 
                    ${
                      index === 0
                        ? "bg-orange-100 text-orange-800"
                        : index === 1
                        ? "bg-pink-100 text-pink-800"
                        : "bg-indigo-100 text-indigo-800"
                    }`}
                >
                  {service}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Events;
