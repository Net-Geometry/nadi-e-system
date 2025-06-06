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
import { FileUpload } from "@/components/ui/file-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInventories } from "@/hooks/use-inventories";
import { useOrganizations } from "@/hooks/use-organizations";
import { useToast } from "@/hooks/use-toast";
import { useUserMetadata } from "@/hooks/use-user-metadata";
import { useInventoryImage  } from "./hooks/use-inventory-image";
import { supabase } from "@/integrations/supabase/client";
import { Inventory } from "@/types/inventory";
import { Site } from "@/types/site";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import { fetchSiteBySiteId, fetchSites } from "../site/hook/site-utils";
import { useTpManagerSiteId } from "@/hooks/use-site-id";
import { Textarea } from "../ui/textarea";
import { X, Upload, Loader2 } from "lucide-react";

export interface InventoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventory?: Inventory | null;
  defaultSiteId?: string | null;
}

export const InventoryFormDialog = ({
  open,
  onOpenChange,
  inventory,
  defaultSiteId,
}: InventoryFormDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    imageFile,
    previewUrl,
    isUploading,
    handleImageChange,
    handleRemoveImage,
    uploadImage
  } = useInventoryImage();

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
  const isTpSiteUser = parsedMetadata?.user_type === "tp_site";
  const { siteId: tpSiteId } = useTpManagerSiteId(isTpSiteUser);

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
    enabled: !!organizationId || isSuperAdmin || isDUSPUser || isTPUser || isStaffUser,
  });

  // TODO: use real data
  const retail_types = [
    { id: 1, name: "Retail Type 1" },
    { id: 2, name: "Retail Type 2" },
    { id: 3, name: "Retail Type 3" },
  ];

  const [inventoryId, setInventoryId] = useState<string | null>(
    inventory?.id || null
  );
  const [inventoryName, setInventoryName] = useState<string>(
    String(inventory?.name || "")
  );
  const [inventoryType, setInventoryType] = useState<string>(
    String(inventory?.type_id || "")
  );
  const [retailType, setRetailType] = useState<string>(
    String(inventory?.retail_type || "")
  );
  const [inventoryPrice, setInventoryPrice] = useState<string>(
    String(inventory?.price || "")
  );
  const [inventoryQuantity, setInventoryQuantity] = useState<string>(
    String(inventory?.quantity || "")
  );
  const [inventoryDescription, setInventoryDescription] = useState<string>(
    String(inventory?.description || "")
  );
  const [inventoryBarcode, setInventoryBarcode] = useState<string>(
    String(inventory?.barcode || "")
  );
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  const [duspId, setDuspId] = useState("");
  const [tpId, setTpId] = useState("");
  const [siteId, setSiteId] = useState<string>("");

  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  const { useInventoryTypesQuery } = useInventories();

  const {
    data: inventoryTypes = [],
    isLoading: isLoadingInventoryType,
    error,
  } = useInventoryTypesQuery();

  useEffect(() => {
    if (inventory) {
      setInventoryId(inventory.id);
      setInventoryName(String(inventory.name || ""));
      setRetailType(String(inventory.retail_type || ""));
      setInventoryPrice(String(inventory.price || ""));
      setInventoryQuantity(String(inventory.quantity || ""));
      setInventoryDescription(String(inventory.description || ""));
      setInventoryBarcode(String(inventory.barcode || ""));
      
      if (!isLoadingInventoryType) {
        setInventoryType(String(inventory.type_id || ""));
      }
      
      // Set site-related data for editing
      if (!duspsIsLoading && !tpsIsLoading && !sitesIsLoading && sites.length > 0) {
        
        let duspIdToSet = "";
        let tpIdToSet = "";
        
        if (inventory.site?.dusp_tp_id_display) {
          // Find matching TP by name from dusp_tp_id_display
          const matchingTP = tps.find(tp => tp.name === inventory.site.dusp_tp_id_display);
          if (matchingTP) {
            tpIdToSet = String(matchingTP.id);
            // Find the parent DUSP
            const matchingDUSP = dusps.find(dusp => dusp.id === matchingTP.parent_id);
            if (matchingDUSP) {
              duspIdToSet = String(matchingDUSP.id);
            }
          }
        }
        
        if (!duspIdToSet && inventory.site?.dusp_tp_id) {
          tpIdToSet = String(inventory.site.dusp_tp_id);
          // Find the TP and its parent DUSP
          const matchingTP = tps.find(tp => tp.id.toString() === tpIdToSet);
          if (matchingTP && matchingTP.parent_id) {
            duspIdToSet = String(matchingTP.parent_id);
          }
        }
        
        if (!duspIdToSet && !tpIdToSet && inventory.site_id) {
          // Find the site and get its TP relationship
          const siteData = sites?.find(site => site.nd_site[0].id.toString() === String(inventory.site_id));
          if (siteData?.dusp_tp_id) {
            tpIdToSet = String(siteData.dusp_tp_id);
            // Find the TP and its parent DUSP
            const matchingTP = tps.find(tp => tp.id.toString() === tpIdToSet);
            if (matchingTP && matchingTP.parent_id) {
              duspIdToSet = String(matchingTP.parent_id);
            }
          }
        }
                
        if (duspIdToSet) {
          setDuspId(duspIdToSet);
        }
        
        if (tpIdToSet) {
          setTpId(tpIdToSet);
        }
        
        if (inventory.site_id) {
          const siteIdStr = String(inventory.site_id);
          setSiteId(siteIdStr);
          
          // Find and set the selected site
          const siteData = sites?.find(site => site.nd_site[0].id.toString() === siteIdStr);
          if (siteData) {
            setSelectedSite(siteData);
          }
        }
      }
    }
  }, [
    inventory,
    isLoadingInventoryType,
    duspsIsLoading,
    tpsIsLoading,
    sitesIsLoading,
    sites,
    dusps,
    tps
  ]);

  useEffect(() => {
    if (duspId) {
      // Filter TPs based on selected DUSP
      const filteredTPs = tps?.filter((tp) => tp?.parent_id?.toString() === duspId);
      // Reset TP and Site if DUSP changes
      if (tpId && !filteredTPs?.find(tp => tp.id.toString() === tpId)) {
        setTpId("");
        setSiteId("");
        setSelectedSite(null);
      }
    }

    if (tpId) {
      // Filter sites based on selected TP
      const filteredSites = sites?.filter((site) => site?.dusp_tp_id?.toString() === tpId);
      // Reset Site if TP changes
      if (siteId && !filteredSites?.find(site => site.nd_site[0].id.toString() === siteId)) {
        setSiteId("");
        setSelectedSite(null);
      }
    }
  }, [duspId, tps, tpId, sites, siteId]);

  useEffect(() => {
    // Handle site selection for non-tp_site users
    if (siteId && !isTpSiteUser) {
      const selectedSiteData = sites?.find(site => site.nd_site[0].id.toString() === siteId);
      if (selectedSiteData) {
        setSelectedSite(selectedSiteData);
      }
    }
  }, [siteId, sites, isTpSiteUser]);

  useEffect(() => {
    if (!open) {
      setInventoryId(null);
      setInventoryName("");
      setInventoryType("");
      setInventoryDescription("");
      setInventoryBarcode("");
      setRetailType("");
      setInventoryPrice("");
      setInventoryQuantity("");
      setDuspId("");
      setTpId("");
      setSiteId("");
      setSelectedSite(null);
      setExistingImageUrl(null);
      handleRemoveImage();
    }
  }, [open, handleRemoveImage]);

  useEffect(() => {
    const fetchSite = async () => {
      if (!siteId) return;
      
      try {
        // For tp_site users, fetch site info using nd_site.id
        const { data: siteData, error } = await supabase
          .from('nd_site')
          .select(`
            id,
            nd_site_profile!site_profile_id(
              id,
              sitename
            )
          `)
          .eq('id', siteId)
          .single();
        
        if (!error && siteData) {
          setSelectedSite({
            sitename: siteData.nd_site_profile?.sitename || 'Unknown Site',
            nd_site: [{ id: siteData.id }]
          } as unknown as Site);
          console.log("Fetched site for TP site user:", siteData.nd_site_profile?.sitename);
        } else {
          console.warn("No site found for siteId:", siteId);
        }
      } catch (error) {
        console.error("Error fetching site:", error);
      }
    };

    if (siteId && isTpSiteUser) {
      fetchSite();
    }
  }, [siteId, isTpSiteUser]);

  useEffect(() => {
    // Initialize siteId based on context - only run when dialog opens and inventory data is set
    if (!open) return;
    
    if (inventory?.site_id) {
      // If editing existing inventory, use its site_id
      setSiteId(String(inventory.site_id));
    } else if (isTpSiteUser && parsedMetadata?.group_profile?.site_profile_id && !inventory) {
      // For tp_site users creating new inventory
      const fetchUserSite = async () => {
        try {
          const { data: siteData, error } = await supabase
            .from('nd_site')
            .select('id, nd_site_profile!site_profile_id(sitename)')
            .eq('site_profile_id', parsedMetadata.group_profile.site_profile_id)
            .single();
          
          if (!error && siteData) {
            setSiteId(String(siteData.id));
            setSelectedSite({
              sitename: siteData.nd_site_profile?.sitename || 'Unknown Site',
              nd_site: [{ id: siteData.id }]
            } as unknown as Site);
          }
        } catch (error) {
          console.error("Error fetching user's site:", error);
        }
      };
      
      fetchUserSite();
    } else if (defaultSiteId && !inventory) {
      // For other users with default site (creating new inventory)
      setSiteId(String(defaultSiteId));
    }
  }, [open, isTpSiteUser, parsedMetadata?.group_profile?.site_profile_id, defaultSiteId, inventory?.site_id, inventory]);

  useEffect(() => {
    if (inventory && open) {
      setExistingImageUrl(inventory.image_url || null);
    } else if (!open) {
      setExistingImageUrl(null);
    }
  }, [inventory, open]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    setIsSubmitting(true);

    if (!inventoryType) {
      toast({
        title: "Error",
        description: "Please select an Inventory Type.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!siteId && !isTpSiteUser) {
      toast({
        title: "Error",
        description: "Please select a Site.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (isTpSiteUser && !selectedSite && siteId) {
      try {
        const site = await fetchSiteBySiteId(siteId);
        if (site) {
          setSelectedSite(site);
        }
      } catch (error) {
        console.error("Error fetching site for tp_site user:", error);
        toast({
          title: "Error",
          description: "Unable to fetch site information.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
    }

    // const inventory = {
    //   name: formData.get("name"),
    //   type_id: inventoryType,
    //   description: formData.get("description"),
    //   retail_type: retailType,
    //   price: formData.get("price"),
    //   quantity: formData.get("quantity"),
    //   site_id: String(selectedSite?.nd_site?.[0]?.id),
    //   barcode: formData.get("barcode"),
    // };

    const inventoryData: Partial<Inventory> = {
      name: String(formData.get("name") || ""),
      // Convert string values to numbers for numeric fields
      type_id: inventoryType ? parseInt(inventoryType) : null,
      description: String(formData.get("description") || ""),
      retail_type: retailType ? parseInt(retailType) : null,
      price: formData.get("price") ? parseFloat(String(formData.get("price"))) : null,
      quantity: formData.get("quantity") ? parseInt(String(formData.get("quantity"))) : null,
      site_id: selectedSite?.nd_site?.[0]?.id ? parseInt(String(selectedSite.nd_site[0].id)) : null,
      barcode: String(formData.get("barcode") || ""),
    };

    try {
      let inventoryRecordId: string | null = inventoryId;
      
      if (inventoryId) {
        console.log("Updating existing inventory:", inventoryData);
        const { error: updateError } = await supabase
          .from("nd_inventory")
          .update({ ...inventoryData, updated_at: new Date().toISOString() })
          .eq("id", inventoryId);

        if (updateError) throw updateError;
      } else {
        console.log("Creating new inventory:", inventoryData);
        const { data: insertData, error: insertError } = await supabase
          .from("nd_inventory")
          .insert([{ ...inventoryData, created_at: new Date().toISOString() }])
          .select("id")
          .single();

        if (insertError) throw insertError;
        inventoryRecordId = insertData.id;
      }

      // Handle image upload and attachment record
      if (imageFile && inventoryRecordId) {
        console.log("Uploading new image...");
        const imageUrl = await uploadImage();
        
        if (imageUrl) {
          const { data: userData } = await supabase.auth.getUser();
          const userId = userData.user?.id;

          // If updating existing inventory, first delete old attachment
          if (inventoryId) {
            await supabase
              .from("nd_inventory_attachment")
              .delete()
              .eq("inventory_id", inventoryId);
          }

          // Insert new attachment record
          const { error: attachmentError } = await supabase
            .from("nd_inventory_attachment")
            .insert([{
              inventory_id: inventoryRecordId,
              file_path: imageUrl,
              created_by: userId,
              created_at: new Date().toISOString()
            }]);

          if (attachmentError) {
            console.error("Error saving attachment:", attachmentError);
            throw attachmentError;
          }

          console.log("Image attachment saved successfully");
        }
      }
      // If image was removed in edit mode
      else if (!previewUrl && inventoryId) {
        await supabase
          .from("nd_inventory_attachment")
          .delete()
          .eq("inventory_id", inventoryId);
      }

      toast({
        title: inventoryId ? "Inventory updated successfully" : "Inventory added successfully",
        description: inventoryId 
          ? "The inventory has been updated in the system." 
          : "The new inventory has been added to the system.",
      });

      queryClient.invalidateQueries({ queryKey: ["inventories"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-stats"] });
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding inventory:", error);
      toast({
        title: "Error",
        description: `Failed to ${
          inventoryId ? "update" : "add"
        } the inventory. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingInventoryType) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        Loading...
      </Dialog>
    );
  }

  if (error) {
    console.error("Error fetching inventory types:", error);
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        Failed to load inventory types
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2/3 max-h-[90vh] overflow-y-auto">
        {isLoadingInventoryType ? (
          <DialogTitle>
            <LoadingSpinner />
          </DialogTitle>
        ) : (
          <>
            <DialogHeader className="mb-2">
              <DialogTitle>
                {inventory ? "Update Inventory" : "Add New Inventory"}
              </DialogTitle>
              <DialogDescription>
                {inventory
                  ? "Update inventorty details"
                  : "Fill in the details to create a new inventory"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Inventory Name</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Enter inventory name"
                  value={inventoryName}
                  onChange={(e) => setInventoryName(e.target.value)}
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
                    disabled={(isSuperAdmin && !duspId) || tps.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select TP" />
                    </SelectTrigger>
                    <SelectContent>
                      {tps
                        .filter((tp) => !duspId || tp?.parent_id?.toString() === duspId)
                        .map((tp, index) => (
                          <SelectItem key={index} value={tp.id.toString()}>
                            {tp.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(isSuperAdmin || isDUSPUser || isTPUser || isStaffUser) && !isTpSiteUser && (
                <div className="space-y-2">
                  <Label htmlFor="type">Site</Label>
                  <Select
                    name="site"
                    required
                    value={siteId}
                    onValueChange={setSiteId}
                    disabled={(isSuperAdmin || isDUSPUser) && !tpId || sites.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select site" />
                    </SelectTrigger>
                    <SelectContent>
                      {sites
                        .filter((site) => (isSuperAdmin || isDUSPUser) ? (!tpId || site?.dusp_tp_id?.toString() === tpId) : true)
                        .map((site, index) => (
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

              {isTpSiteUser && selectedSite && (
                <div className="space-y-2">
                  <Label htmlFor="assigned-site">Assigned Site</Label>
                  <Input
                    id="assigned-site"
                    value={selectedSite.sitename || "Loading..."}
                    disabled
                    className="bg-muted"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Enter asset description"
                  value={inventoryDescription}
                  onChange={(e) => setInventoryDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Barcode</Label>
                <Input
                  id="barcode"
                  name="barcode"
                  placeholder="Enter inventory barcode"
                  value={inventoryBarcode}
                  onChange={(e) => setInventoryBarcode(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Unit / Stock</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  required
                  placeholder="Enter asset quantity"
                  value={inventoryQuantity}
                  onChange={(e) => setInventoryQuantity(e.target.value)}
                  min={0}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Price per Unit</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  required
                  placeholder="Enter price per unit"
                  value={inventoryPrice}
                  onChange={(e) => setInventoryPrice(e.target.value)}
                  min={0}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Inventory Type</Label>
                <Select 
                  name="type" 
                  required
                  value={inventoryType}
                  onValueChange={setInventoryType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select inventory type" />
                  </SelectTrigger>
                  <SelectContent>
                    {inventoryTypes.map((type, index) => (
                      <SelectItem key={index} value={type.id.toString()}>
                        {type?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Retail Category / Type</Label>
                <Select
                  name="retail_type"
                  value={retailType}
                  onValueChange={setRetailType}
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

              <div className="space-y-2">
                <Label>Inventory Image</Label>
                {(previewUrl || existingImageUrl) ? (
                  <div className="relative w-40 h-40 border rounded-md overflow-hidden bg-muted/30 flex items-center justify-center group">
                    <img
                      src={previewUrl || existingImageUrl || ''}
                      alt="Inventory preview"
                      className="object-contain w-full h-full p-2"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        handleRemoveImage();
                        setExistingImageUrl(null);
                      }}
                      className="absolute top-2 right-2 bg-background/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <FileUpload
                    acceptedFileTypes="image/png,image/jpeg,image/webp,image/svg+xml"
                    maxFiles={1}
                    maxSizeInMB={2}
                    onFilesSelected={handleImageChange}
                    buttonText={isUploading ? "Uploading..." : "Upload Image"}
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      "Upload Inventory Image"
                    )}
                  </FileUpload>
                )}
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting
                  ? inventory
                    ? "Updating..."
                    : "Adding..."
                  : inventory
                  ? "Update Inventory"
                  : "Add Inventory"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
