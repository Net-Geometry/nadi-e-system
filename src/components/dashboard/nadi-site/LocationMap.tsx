import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const LocationMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Set the Mapbox access token
    mapboxgl.accessToken =
      "pk.eyJ1IjoiZGV2bmV0Z2VvIiwiYSI6ImNtOWJnZGd0ajBjcXQya3M3YzhyM25wcG0ifQ.wX1oaZ5GF0Pztse1Cd2hhQ";

    try {
      console.log("Initializing map...");

      // Initialize the map with Cyberjaya, Malaysia coordinates
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [101.6567, 2.9231], // Cyberjaya coordinates
        zoom: 12,
        attributionControl: true,
      });

      // Log when map loads
      map.current.on("load", () => {
        console.log("Map loaded successfully!");
        setMapLoaded(true);
      });

      // Log any map errors
      map.current.on("error", (e) => {
        console.error("Map error:", e);
      });

      // Add a marker for the specific location
      new mapboxgl.Marker({ color: "#FF0000" })
        .setLngLat([101.6567, 2.9231]) // Cyberjaya coordinates
        .addTo(map.current);

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    } catch (error) {
      console.error("Error creating map:", error);
    }

    // Cleanup on unmount
    return () => {
      if (map.current) {
        console.log("Removing map...");
        map.current.remove();
      }
    };
  }, []);

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
                  <p className="text-sm text-primary-foreground">
                    123 Persiaran Multimedia, Cyberjaya
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    State
                  </label>
                  <p className="text-sm text-green-700">Selangor</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    District
                  </label>
                  <p className="text-sm text-blue-700">Sepang</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Parliament
                  </label>
                  <p className="text-sm text-purple-700">P123</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Latitude
                  </label>
                  <p className="text-sm text-teal-700">2.9231</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Longitude
                  </label>
                  <p className="text-sm text-orange-700">101.6567</p>
                </div>
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
