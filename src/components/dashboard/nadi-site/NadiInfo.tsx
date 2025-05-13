import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Globe, Hash, CheckCircle2 } from "lucide-react";

const NADIInfo = () => {
  return (
    <Card
      className="mb-6 bg-gradient-to-br from-soft-purple/20 to-soft-blue/20 hover:shadow-lg transition-all duration-300"
      id="info"
    >
      <CardHeader>
        <CardTitle className="text-zinc-950 flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          NADI Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          {/* Primary Information */}
          <div className="p-4 bg-white/80 rounded-lg border border-primary/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">
                  NADI Sitename & REFID
                </label>
                <p className="text-lg font-semibold text-primary">
                  NADI Cyberjaya #REF001
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">
                  REFID MCMC
                </label>
                <p className="text-lg font-semibold text-primary">
                  MCMC-2023-001
                </p>
              </div>
            </div>
          </div>

          {/* Secondary Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white/80 rounded-lg border border-primary/20 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm font-medium text-muted-foreground">
                  Date of Operation
                </label>
              </div>
              <p className="text-lg font-semibold mt-auto">13 March 2022</p>
            </div>

            <div className="p-4 bg-white/80 rounded-lg border border-primary/20 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm font-medium text-muted-foreground">
                  Year of Services
                </label>
              </div>
              <p className="text-lg font-semibold mt-auto">
                3 years 2 months 12 days
              </p>
            </div>

            <div className="p-4 bg-white/80 rounded-lg border border-primary/20 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm font-medium text-muted-foreground">
                  Status
                </label>
              </div>
              <div className="mt-auto">
                <Badge
                  variant="default"
                  className="bg-green-500 hover:bg-green-600"
                >
                  Active
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NADIInfo;
