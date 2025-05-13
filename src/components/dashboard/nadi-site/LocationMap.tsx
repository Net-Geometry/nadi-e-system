import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

type Site = {
  latitude?: string | number | null;
  longtitude?: string | number | null;
  state_id?: { abbr?: string; name?: string };
  parliament_rfid?: { fullname?: string };
  dun_rfid?: { full_name?: string };
  region_id?: { bm?: string; eng?: string };
  // phase_id?: { name?: string };
  // ...other fields as needed
};

type Address = {
  address1?: string;
  address2?: string;
  city?: string | null;
  postcode?: string;
  district_id?: { code?: number; name?: string };
  state_id?: { abbr?: string; name?: string } | null;
};

interface LocationMapProps {
  site: Site;
  address: Address;
}

const LocationMap: React.FC<LocationMapProps> = ({ site, address }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Parse latitude and longitude as numbers, fallback to Cyberjaya if missing
  const latitude = site?.latitude ? parseFloat(site.latitude as string) : 2.9231;
  const longitude = site?.longitude ? parseFloat(site.longitude as string) : 101.6567;

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken =
      "pk.eyJ1IjoiZGV2bmV0Z2VvIiwiYSI6ImNtOWJnZGd0ajBjcXQya3M3YzhyM25wcG0ifQ.wX1oaZ5GF0Pztse1Cd2hhQ";

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [longitude, latitude],
        zoom: 12,
        attributionControl: true,
      });

      map.current.on("load", () => setMapLoaded(true));
      map.current.on("error", (e) => console.error("Map error:", e));

      new mapboxgl.Marker({ color: "#FF0000" })
        .setLngLat([longitude, latitude])
        .addTo(map.current);

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    } catch (error) {
      console.error("Error creating map:", error);
    }

    return () => {
      if (map.current) map.current.remove();
    };
  }, [latitude, longitude]);

  return (
    <Card
      className="mb-6 bg-gradient-to-br from-soft-peach/20 to-soft-green/20"
      id="location"
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Location & Maps
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 bg-accent/10 p-4 rounded-lg">
            <h3 className="font-medium text-primary">NADI Location Details</h3>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Address
                  </label>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {address?.address1 ?? "N/A"}
                    {address?.address2 ? `, ${address.address2}` : ""}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    State
                  </label>
                  <p className="text-sm text-green-700">
                    {site?.state_id?.name ?? "N/A"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    District
                  </label>
                  <p className="text-sm text-blue-700">
                    {address?.district_id?.name ?? "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Parliament
                  </label>
                  <p className="text-sm text-purple-700">
                    {site?.parliament_rfid?.fullname ?? "N/A"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    DUN
                  </label>
                  <p className="text-sm text-pink-700">
                    {site?.dun_rfid?.full_name ?? "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Latitude / Longitude
                  </label>
                  <p className="text-sm text-teal-700">
                    {latitude ?? "N/A"} / {longitude ?? "N/A"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Region
                  </label>
                  <p className="text-sm text-orange-700">
                    {site?.region_id?.eng ?? "N/A"}
                  </p>
                </div>
                {/* <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Phase
                  </label>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {site?.phase_id?.name ?? "N/A"}
                  </p>
                </div> */}
              </div>
            </div>
          </div>
          <div className="bg-accent/20 h-[350px] rounded-lg shadow-md">
            <div
              ref={mapContainer}
              className="w-full h-full rounded-lg"
              style={{ position: "relative" }}
            >
              {!mapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-accent/30 rounded-lg">
                  <div className="text-muted-foreground animate-pulse">
                    Loading map...
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationMap;