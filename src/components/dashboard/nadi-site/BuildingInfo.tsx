import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type BuildingInfoProps = {
  building_type_id?: { bm?: string; eng?: string } | null;
  zone_id?: { area?: string; zone?: string } | null;
  area_id?: { name?: string } | null;
  building_area_id?: number | null;
  building_rental_id?: boolean | null;
  level_id?: { eng?: string } | null;
};

const BuildingInfo: React.FC<BuildingInfoProps> = ({
  building_type_id,
  zone_id,
  area_id,
  building_area_id,
  building_rental_id,
  level_id,
}) => {
  return (
    <Card className="mb-6" id="building-info">
      <CardHeader>
        <CardTitle>Building Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <label className="text-sm font-medium text-muted-foreground">Building Type</label>
              <p className="text-base">{building_type_id?.eng ?? "N/A"}</p>
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium text-muted-foreground">Zone</label>
              <p className="text-base">{zone_id?.zone ?? "N/A"}</p>
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium text-muted-foreground">Zone Area</label>
              <p className="text-base">{zone_id?.area ?? "N/A"}</p>
            </div>
          </div>
          <div>
            <div className="mb-4">
              <label className="text-sm font-medium text-muted-foreground">Area Name</label>
              <p className="text-base">{area_id?.name ?? "N/A"}</p>
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium text-muted-foreground">Building Size (sqft)</label>
              <p className="text-base">{building_area_id ?? "N/A"}</p>
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium text-muted-foreground">Rental</label>
              <p className="text-base">
                {building_rental_id === true
                  ? "Yes"
                  : building_rental_id === false
                  ? "No"
                  : "N/A"}
              </p>
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium text-muted-foreground">Level</label>
              <p className="text-base">{level_id?.eng ?? "N/A"}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BuildingInfo;