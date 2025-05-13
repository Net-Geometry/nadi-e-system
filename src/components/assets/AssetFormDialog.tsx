import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAssets } from "@/hooks/use-assets";
import { useBrand } from "@/hooks/use-brand";
import { useOrganizations } from "@/hooks/use-organizations";
import { useToast } from "@/hooks/use-toast";
import { useUserMetadata } from "@/hooks/use-user-metadata";
import { supabase } from "@/integrations/supabase/client";
import { Asset } from "@/types/asset";
import { Site, Space } from "@/types/site";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import { fetchSiteBySiteId, fetchSites } from "../site/hook/site-utils";
import { Textarea } from "../ui/textarea";

export interface AssetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset?: Asset | null;
  defaultSiteId?: string | null; // default site id passed from parent componenet in site.id form not site_profile.id
}

export const AssetFormDialog = ({
  open,
  onOpenChange,
  asset,
  defaultSiteId,
}: AssetFormDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userMetadata = useUserMetadata();
  const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;
  const isSuperAdmin = parsedMetadata?.user_type === "super_admin";
  const isTPUser =
    parsedMetadata?.user_group_name === "TP" &&
    !!parsedMetadata?.organization_id;
  const isDUSPUser =
    parsedMetadata?.user_group_name === "DUSP" &&
    !!parsedMetadata?.organization_id;
  const organizationId =
    parsedMetadata?.user_type !== "super_admin" &&
    (isTPUser || isDUSPUser) &&
    parsedMetadata?.organization_id
      ? parsedMetadata.organization_id
      : null;
  const isStaffUser = parsedMetadata?.user_group_name === "Centre Staff";

  const { useOrganizationsByTypeQuery } = useOrganizations();

  const { data: dusps = [], isLoading: duspsIsLoading } =
    useOrganizationsByTypeQuery("dusp", isSuperAdmin);

  const { data: tps = [], isLoading: tpsIsLoading } =
    useOrganizationsByTypeQuery(
      "tp",
      isSuperAdmin || isDUSPUser,
      organizationId
    );

  const { data: sites = [], isLoading: sitesIsLoading } = useQuery({
    queryKey: ["sites", organizationId],
    queryFn: () => fetchSites(organizationId, isTPUser, isDUSPUser),
    enabled: !!organizationId || isSuperAdmin || isDUSPUser || isTPUser,
  });

  // TODO: use real data
  const retail_types = [
    { id: 1, name: "Retail Type 1" },
    { id: 2, name: "Retail Type 2" },
    { id: 3, name: "Retail Type 3" },
  ];

  const [assetId, setAssetId] = useState<string>(String(asset?.id) || null);
  const [assetName, setAssetName] = useState("");
  const [assetType, setAssetType] = useState("");
  const [assetBrandId, setAssetBrandId] = useState("");
  const [assetDescription, setAssetDescription] = useState("");
  const [assetSerialNumber, setAssetSerialNumber] = useState("");
  const [assetRetailType, setAssetRetailType] = useState("");
  const [assetQuantity, setAssetQuantity] = useState("");
  const [assetLocationId, setAssetLocationId] = useState("");

  const [duspId, setDuspId] = useState("");
  const [tpId, setTpId] = useState("");
  const [siteId, setSiteId] = useState<string>(
    String(defaultSiteId) || String(asset?.site_id) || ""
  );
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [locations, setLocations] = useState<Space[]>([]);

  const { useAssetTypesQuery } = useAssets();

  const {
    data: assetTypes = [],
    isLoading: assetTypeIsLoading,
    error: assetTypeError,
  } = useAssetTypesQuery();

  const {
    data: brands,
    isLoading: brandIsLoading,
    error: brandError,
  } = useBrand();

  useEffect(() => {
    if (asset) {
      setAssetName(asset.name);
      setAssetDescription(asset.remark);
      setAssetSerialNumber(asset.serial_number);
      setAssetQuantity(String(asset.qty_unit));
      setLocations(
        (asset.site?.nd_site_space ?? []).map((s): Space => s.nd_space)
      );
      setAssetRetailType(String(asset.retail_type));
      if (!brandIsLoading && !assetTypeIsLoading) {
        setAssetType(String(asset.type_id));
        setAssetBrandId(String(asset.brand_id));
        setAssetLocationId(String(asset.location_id));
      }
      if (!duspsIsLoading && !tpsIsLoading && !sitesIsLoading) {
        setDuspId(String(asset.site?.dusp_tp?.parent?.id));
        setTpId(String(asset.site?.dusp_tp_id));
        setSiteId(String(asset.site_id));
      }
    }
  }, [
    asset,
    brandIsLoading,
    assetTypeIsLoading,
    duspsIsLoading,
    tpsIsLoading,
    sitesIsLoading,
  ]);

  useEffect(() => {
    if (duspId) {
      tps?.filter((tp) => tp?.parent_id?.toString() === duspId);
    }

    if (tpId) {
      sites?.filter((site) => site?.dusp_tp_id?.toString() === tpId);
    }
  }, [duspId, tps, tpId, sites]);

  useEffect(() => {
    if (!open) {
      setAssetId("");
      setAssetName("");
      setAssetType("");
      setAssetBrandId("");
      setAssetDescription("");
      setAssetQuantity("");
      setAssetLocationId("");
      setAssetSerialNumber("");
      setAssetRetailType("");
      setDuspId("");
      setTpId("");
      setSiteId("");
    }
  }, [open]);

  useEffect(() => {
    const fetchSite = async () => {
      const site = await fetchSiteBySiteId(siteId!); // this in nd_site.id form
      if (site) {
        setSelectedSite(site);
        if (!isStaffUser) {
          const locations = (site.nd_site_space ?? []).map(
            (s): Space => s.nd_space
          );
          setLocations(locations);
        }

        if (asset) {
          const match = (site.nd_site_space ?? []).find(
            (s) => String(s.nd_space.id) === String(asset.location_id)
          );
          setAssetLocationId(match ? String(asset.location_id) : "");
        }
      }
    };

    if (siteId) {
      if (!isStaffUser) {
        setLocations([]);
      }
      fetchSite();
    }
  }, [siteId, isStaffUser, asset]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    setIsSubmitting(true);

    if (!siteId && !isStaffUser) {
      toast({
        title: "Error",
        description: "Please select a Site.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const asset = {
      name: formData.get("name"),
      type_id: assetType,
      brand_id: assetBrandId,
      remark: formData.get("description"),
      serial_number: assetSerialNumber,
      retail_type: assetRetailType,
      qty_unit: formData.get("quantity"),
      location_id: assetLocationId,
      site_id: String(selectedSite?.nd_site?.[0]?.id),
    };

    try {
      if (assetId) {
        console.log("Updating asset:", asset);
        const { error: updateError } = await supabase
          .from("nd_asset")
          .update({
            ...asset,
            updated_at: new Date().toISOString(),
          })
          .eq("id", assetId);

        if (updateError) throw updateError;

        toast({
          title: "Asset updated successfully",
          description: "The asset has been updated in the system.",
        });
      } else {
        console.log("Creating new asset:", asset);
        const { error: insertError } = await supabase.from("nd_asset").insert([
          {
            ...asset,
            created_at: new Date().toISOString(),
          },
        ]);

        if (insertError) throw insertError;

        toast({
          title: "Asset added successfully",
          description: "The new asset has been added to the system.",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["asset-stats"] });
      onOpenChange(false);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: `Failed to ${
          assetId ? "update" : "add"
        } the asset. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (assetTypeError) {
    console.error("Error fetching asset types:", assetTypeError);
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        Failed to load asset types
      </Dialog>
    );
  }

  if (brandError) {
    console.error("Error fetching brands:", brandError);
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        Failed to load brands
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2/3 max-h-[90vh] overflow-y-auto">
        {brandIsLoading || assetTypeIsLoading ? (
          <DialogTitle>
            <LoadingSpinner />
          </DialogTitle>
        ) : (
          <div>
            <DialogHeader className="mb-2">
              <DialogTitle>
                {asset ? "Edit Asset" : "Add New Asset"}
              </DialogTitle>
              <DialogDescription>
                {asset
                  ? "Update asset details"
                  : "Fill in the details to create a new asset"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Asset Name</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Enter asset name"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                />
              </div>

              {isSuperAdmin && (
                <div className="space-y-2">
                  <Label htmlFor="type">DUSP</Label>
                  <Select
                    name="dusp"
                    required
                    value={duspId}
                    onValueChange={setDuspId}
                    disabled={dusps ? false : true}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select DUSP" />
                    </SelectTrigger>
                    <SelectContent>
                      {dusps.map((dusp, index) => (
                        <SelectItem key={index} value={dusp.id.toString()}>
                          {dusp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(isSuperAdmin || isDUSPUser) && (
                <div className="space-y-2">
                  <Label htmlFor="type">TP</Label>
                  <Select
                    name="tp"
                    required
                    value={tpId}
                    onValueChange={setTpId}
                    disabled={tps ? false : true}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select TP" />
                    </SelectTrigger>
                    <SelectContent>
                      {tps.map((tp, index) => (
                        <SelectItem key={index} value={tp.id.toString()}>
                          {tp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(isSuperAdmin || isDUSPUser || isTPUser) && (
                <div className="space-y-2">
                  <Label htmlFor="type">Site</Label>
                  <Select
                    name="site"
                    required
                    value={siteId}
                    onValueChange={setSiteId}
                    disabled={sites ? false : true}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select site" />
                    </SelectTrigger>
                    <SelectContent>
                      {sites.map((site, index) => (
                        <SelectItem
                          key={index}
                          value={site.nd_site[0].id.toString()}
                        >
                          {site.sitename}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="type">Brand</Label>
                <Select
                  name="brand"
                  required
                  value={assetBrandId}
                  onValueChange={setAssetBrandId}
                  disabled={brandIsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand, index) => (
                      <SelectItem key={index} value={brand.id.toString()}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Enter asset description"
                  value={assetDescription}
                  onChange={(e) => setAssetDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Barcode / SKU</Label>
                <Input
                  id="serial_number"
                  name="serial_number"
                  placeholder="Enter barcode / sku"
                  value={assetSerialNumber}
                  onChange={(e) => setAssetSerialNumber(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Quantity</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  required
                  placeholder="Enter asset quantity"
                  value={assetQuantity}
                  onChange={(e) => setAssetQuantity(e.target.value)}
                  min={0}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Asset Location</Label>
                <Select
                  name="location"
                  required
                  value={assetLocationId}
                  onValueChange={setAssetLocationId}
                  disabled={locations && locations.length > 0 ? false : true}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        locations && locations.length > 0
                          ? "Select asset location"
                          : "No locations found for this site"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {locations &&
                      locations.map((location, index) => (
                        <SelectItem key={index} value={location.id.toString()}>
                          {location.eng}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Asset Type</Label>
                <Select
                  name="type"
                  required
                  value={assetType}
                  onValueChange={setAssetType}
                  disabled={assetTypeIsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select asset type" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetTypes.map((type, index) => (
                      <SelectItem key={index} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Retail Category / Type</Label>
                <Select
                  name="retail_type"
                  value={assetRetailType}
                  onValueChange={setAssetRetailType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select retail type" />
                  </SelectTrigger>
                  <SelectContent>
                    {retail_types.map((type, index) => (
                      <SelectItem key={index} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting
                  ? asset
                    ? "Updating..."
                    : "Adding..."
                  : asset
                  ? "Update Asset"
                  : "Add Asset"}
              </Button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
