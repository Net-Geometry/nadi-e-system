import { useParams } from "react-router-dom";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSiteProfile } from "./hook/use-site-profile";
import { useSiteCode } from "./hook/use-site-code";
import { useSiteAddress } from "./hook/use-site-address";
import {
  Table,
  TableBody,
  TableRow,
  TableHead,
  TableHeader,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Settings, Trash2, MapPin, Globe, Mail, Calendar, Users, Building, EyeOff, Eye, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useSiteGeneralData from "@/hooks/use-site-general-data";
import useGeoData from "@/hooks/use-geo-data";
import BillingFormDialog from "./BillingFormDialog";

interface SiteDetailProps {
  siteId: string;
}

const SiteDetail: React.FC<SiteDetailProps> = ({ siteId }) => {
  const { data, loading, error } = useSiteProfile(siteId);
  const { siteCode, loading: codeLoading, error: codeError } = useSiteCode(siteId);
  const { data: addressData, loading: addressLoading, error: addressError } = useSiteAddress(siteId);
  const { siteStatus, technology, bandwidth, buildingType, space, zone, categoryArea, buildingLevel, socioEconomics } = useSiteGeneralData();
  const { regions, states, parliaments, duns, mukims, phases } = useGeoData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  if (loading || codeLoading || addressLoading) return <Skeleton className="w-full h-96">Loading...</Skeleton>;
  if (error || codeError || addressError) return <div className="p-4 text-destructive">Error: {error || codeError || addressError}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="items-center">
          <h1 className="text-2xl font-bold">{data.fullname || "Site Name"}</h1>
          <h3 className="text-muted-foreground">Site Code: <span className="text-black font-bold">{siteCode || "N/A"}</span></h3>
          <div className="font-medium flex items-center gap-2">
            <span className="text-muted-foreground">Status:  </span>
            <span className="font-medium flex items-center gap-2">
              {siteStatus.find(status => status.id === data.active_status)?.eng || "N/A"}
              {data.is_active ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </span>
          </div>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Billing
        </Button>
      </div>

      <div className="flex border-b">
        <button
          className={`px-4 py-2 ${activeTab === "details" ? "border-b-2 border-blue-500" : ""}`}
          onClick={() => setActiveTab("details")}
        >
          Site Details
        </button>
        <button
          className={`px-4 py-2 ${activeTab === "billing" ? "border-b-2 border-blue-500" : ""}`}
          onClick={() => setActiveTab("billing")}
        >
          Billing
        </button>
      </div>

      {activeTab === "details" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Location Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Region:</span>
                  <span className="font-medium">{regions.find(region => region.id === data.region_id)?.eng || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">State:</span>
                  <span className="font-medium">{states.find(state => state.id === data.state_id)?.name || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mukim:</span>
                  <span className="font-medium">{mukims.find(mukim => mukim.id === data.mukim_id)?.name || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Coordinates:</span>
                  <span className="font-medium">
                    {data.latitude && data.longtitude
                      ? `${data.latitude}, ${data.longtitude}`
                      : "N/A"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  Contact & Online Presence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{data.email || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Website:</span>
                  <span className="font-medium">{data.website || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reference ID:</span>
                  <span className="font-medium">{data.ref_id || "N/A"}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Building Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Building Type:</span>
                  <span className="font-medium">{buildingType.find(type => type.id === data.building_type_id)?.eng || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Building Area:</span>
                  <span className="font-medium">
                    {data.building_area_id != null ? data.building_area_id.toLocaleString() + " sqft" : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rental:</span>
                  <span className="font-medium">{data.building_rental_id ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">OKU Friendly:</span>
                  <span className="font-medium">{data.oku_friendly ? "Yes" : "No"}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Demographic & Technical Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Technology</TableHead>
                      <TableHead>Bandwidth</TableHead>
                      <TableHead>Total Population</TableHead>
                      <TableHead>Socioeconomic ID</TableHead>
                      <TableHead>Phase ID</TableHead>
                      <TableHead>Cluster ID</TableHead>
                      <TableHead>Operation Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>{technology.find(tech => tech.id === data.technology)?.name || "N/A"}</TableCell>
                      <TableCell>{bandwidth.find(band => band.id === data.bandwidth)?.name || "N/A"}</TableCell>
                      <TableCell>{data.total_population?.toLocaleString() || "N/A"}</TableCell>
                      <TableCell>
                        {data.socioeconomic_id && data.socioeconomic_id.length > 0
                          ? data.socioeconomic_id.map(id => socioEconomics.find(se => se.id === id)?.eng || "N/A").join(", ")
                          : "N/A"}
                      </TableCell>
                      <TableCell>{phases.find(phase => phase.id === data.phase_id)?.name || "N/A"}</TableCell>
                      <TableCell>{data.cluster_id || "N/A"}</TableCell>
                      <TableCell>
                        {data.operate_date
                          ? new Date(data.operate_date).toLocaleDateString()
                          : "Not specified"}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableHead className="w-1/4">Parliament RFID</TableHead>
                      <TableCell>{parliaments.find(parliament => parliament.id === data.parliament_rfid)?.fullname || "N/A"}</TableCell>
                      <TableHead className="w-1/4">DUN RFID</TableHead>
                      <TableCell>{duns.find(dun => dun.id === data.dun_rfid)?.name || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableHead>UST ID</TableHead>
                      <TableCell>{data.ust_id || "N/A"}</TableCell>
                      <TableHead>DUSP TP ID</TableHead>
                      <TableCell>{data.dusp_tp_id || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableHead>Space ID</TableHead>
                      <TableCell>
                        {data.space_id && data.space_id.length > 0
                          ? data.space_id.map(id => space.find(s => s.id === id)?.eng || "N/A").join(", ")
                          : "N/A"}
                      </TableCell>
                      <TableHead>Zone ID</TableHead>
                      <TableCell>{zone.find(z => z.id === data.zone_id)?.area || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableHead>Area ID</TableHead>
                      <TableCell>{categoryArea.find(area => area.id === data.area_id)?.name || "N/A"}</TableCell>
                      <TableHead>Level ID</TableHead>
                      <TableCell>{buildingLevel.find(level => level.id === data.level_id)?.eng || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableHead>Created At</TableHead>
                      <TableCell>
                        {data.created_at
                          ? new Date(data.created_at).toLocaleString()
                          : "N/A"}
                      </TableCell>
                      <TableHead>Updated At</TableHead>
                      <TableCell>
                        {data.updated_at
                          ? new Date(data.updated_at).toLocaleString()
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Address Line 1:</span>
                <span className="font-medium">{addressData.address1 || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Address Line 2:</span>
                <span className="font-medium">{addressData.address2 || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">City:</span>
                <span className="font-medium">{addressData.city || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Postal Code:</span>
                <span className="font-medium">{addressData.postcode || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">State:</span>
                <span className="font-medium">{states.find(state => state.id === addressData.state_id)?.name || "N/A"}</span>
              </div>
            </CardContent>
          </Card>

          {data.remark && (
            <Card>
              <CardHeader>
                <CardTitle>Remarks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{data.remark}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "billing" && (
        <div>
          <BillingFormDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} siteId={siteId} />
        </div>
      )}
    </div>
  );
};

export default SiteDetail;