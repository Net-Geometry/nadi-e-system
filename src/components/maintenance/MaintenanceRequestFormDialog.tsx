import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAssets } from "@/hooks/use-assets";
import { useMaintenance } from "@/hooks/use-maintenance";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Asset } from "@/types/asset";
import { MaintenanceDocketType, MaintenanceStatus } from "@/types/maintenance";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { AttachmentUploadField } from "./AttachmentUploadField";
import { useAttachment } from "./hooks/use-attachment";

export interface MaintenanceRequestFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MaintenanceRequestFormDialog = ({
  open,
  onOpenChange,
}: MaintenanceRequestFormDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();

  const maintenanceDocketTypes = Object.values(MaintenanceDocketType);

  const [maintenanceDocketType, setMaintenanceDocketType] = useState<
    "" | MaintenanceDocketType
  >("");
  const [description, setDescription] = useState("");

  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetsFilter, setAssetsFilter] = useState("");
  const { useAssetsByNameQuery } = useAssets();
  const { data: assets = [], isLoading: isLoadingAssets } =
    useAssetsByNameQuery(assetsFilter, true); // get only active assets

  const vendors = [
    {
      id: 1,
      name: "Vendor 1",
    },
    {
      id: 2,
      name: "Vendor 2",
    },
  ];

  const {
    attachmentFile,
    attachmentPreviewUrl,
    isUploading,
    handleAttachmentChange,
    handleRemoveAttachment,
    uploadAttachment,
  } = useAttachment();

  useEffect(() => {
    if (open) {
      setMaintenanceDocketType("");
      setSelectedAsset(null);
      setAssetsFilter("");
      setDescription("");
    }
  }, [open]);

  const { useMaintenanceTypesQuery } = useMaintenance();

  const { data: maintenanceTypes = [], isLoading: isLoadingMaintenanceTypes } =
    useMaintenanceTypesQuery();

  const generateDocketNumber = (now: Date, formData: FormData) => {
    /**
     * Docket number generation
     * Format: XYYYYMMDDHHMMSSTT
     *
     * X: 1 -> cm, 2 -> pm
     * YYYY: year
     * MM: month
     * DD: day
     * HH: hour
     * MM: minute
     * SS: second
     * TT: type_id
     */

    const docketNumber =
      (maintenanceDocketType === MaintenanceDocketType.Corrective ? "1" : "2") +
      now.getFullYear() +
      ("0" + (now.getMonth() + 1)).slice(-2) +
      ("0" + now.getDate()).slice(-2) +
      ("0" + now.getHours()).slice(-2) +
      ("0" + now.getMinutes()).slice(-2) +
      ("0" + now.getSeconds()).slice(-2) +
      ("0" + Number(formData.get("maintenanceType") ?? "")).slice(-2);

    return docketNumber;
  };

  const handleSubmitCM = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    setIsSubmitting(true);

    if (!selectedAsset) {
      toast({
        title: "Error",
        description: `Please select an asset for the maintenance request.`,
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    let attachmentUrl = null;

    if (attachmentFile) {
      const url = await uploadAttachment();

      if (url) {
        attachmentUrl = url;
      } else {
        toast({
          title: "Error",
          description: `Failed to add the maintenance request. Please try again.`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
    }
    const now = new Date();
    const docketNumber = generateDocketNumber(now, formData);

    const request = {
      no_docket: docketNumber,
      description: description,
      asset_id: selectedAsset?.id as number,
      type_id: Number(formData.get("maintenanceType")),
      requester_by: user.id,
      attachment: attachmentUrl,
      status: MaintenanceStatus.Submitted,
    };

    try {
      const { error: insertError } = await supabase
        .from("nd_maintenance_request")
        .insert([
          {
            ...request,
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
          },
        ]);

      if (insertError) throw insertError;

      const { error: updateError } = await supabase
        .from("nd_asset")
        .update({ is_active: false })
        .eq("id", selectedAsset?.id);

      if (updateError) throw updateError;

      toast({
        title: "Maintenance Request added successfully",
        description:
          "The new maintenance request has been added to the system.",
      });
    } catch (error) {
      console.error("Error adding maintenance request:", error);
      toast({
        title: "Error",
        description: `Failed to add the maintenance request. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      onOpenChange(false);
    }
  };

  const handleSubmitPM = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    setIsSubmitting(true);

    const now = new Date();
    const docketNumber = generateDocketNumber(now, formData);

    const request = {
      no_docket: docketNumber,
      description: description,
      type_id: Number(formData.get("maintenanceType")),
      requester_by: user.id,
    };

    try {
      const { error: insertError } = await supabase
        .from("nd_maintenance_request")
        .insert([
          {
            ...request,
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
          },
        ]);

      if (insertError) throw insertError;

      toast({
        title: "Maintenance Request added successfully",
        description:
          "The new maintenance request has been added to the system.",
      });
    } catch (error) {
      console.error("Error adding maintenance request:", error);
      toast({
        title: "Error",
        description: `Failed to add the maintenance request. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      onOpenChange(false);
    }
  };

  const AssetCard = ({ asset }: { asset: Asset }) => (
    <div
      className="border-2 rounded-md m-2 p-2 cursor-pointer hover:bg-gray-100"
      onClick={() => {
        setSelectedAsset(asset);
        setAssetsFilter("");
      }}
    >
      <p className="font-semibold text-sm">{asset.name}</p>
      <p className="text-sm text-muted-foreground">{asset.id}</p>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2/3 max-h-[90vh] overflow-y-auto">
        {isLoadingMaintenanceTypes && isLoadingMaintenanceTypes ? (
          <DialogTitle>
            <LoadingSpinner />
          </DialogTitle>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Add New Maintenance Request</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new maintenance request
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="maintenanceDocketType">Request Type</Label>
              <Select
                name="maintenanceDocketType"
                required
                onValueChange={(value) =>
                  setMaintenanceDocketType(value as MaintenanceDocketType)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {maintenanceDocketTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {maintenanceDocketType === MaintenanceDocketType.Corrective && (
              <form onSubmit={handleSubmitCM} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="maintenanceType">Maintenance Type</Label>
                  <Select name="maintenanceType" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select maintenance type" />
                    </SelectTrigger>
                    <SelectContent>
                      {maintenanceTypes.map((type, index) => (
                        <SelectItem key={index} value={type.id.toString()}>
                          {type?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="asset">Asset</Label>
                  <div className="relative flex space-x-4">
                    <Input
                      placeholder="Search and add asset"
                      value={assetsFilter}
                      onChange={(e) => {
                        setAssetsFilter(e.target.value);
                      }}
                      className="pl-10"
                    />
                    <Search className="absolute top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>

                  <div className="mt-2">
                    {isLoadingAssets ? (
                      <LoadingSpinner />
                    ) : assetsFilter && assets.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No assets found
                      </p>
                    ) : (
                      assets.map((asset) => (
                        <AssetCard key={asset.id} asset={asset} />
                      ))
                    )}

                    {selectedAsset && (
                      <div className="relative mt-4 p-4 border rounded bg-gray-50">
                        <button
                          onClick={() => setSelectedAsset(null)}
                          className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
                          aria-label="Clear selection"
                        >
                          <X className="w-5 h-5" />
                        </button>

                        <div className="mt-2 bg-gray-50">
                          <p className="font-semibold text-sm">
                            {selectedAsset.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {selectedAsset.id}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attachment">Attachment</Label>
                  <AttachmentUploadField
                    previewUrl={attachmentPreviewUrl}
                    isUploading={isUploading}
                    onAttachmentChange={handleAttachmentChange}
                    onRemoveAttachment={handleRemoveAttachment}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || !maintenanceDocketType}
                  className="pt-2 w-full"
                >
                  {isSubmitting ? "Adding..." : "Open Request"}
                </Button>
              </form>
            )}

            {maintenanceDocketType === MaintenanceDocketType.Preventive && (
              <form onSubmit={handleSubmitPM} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="maintenanceType">Maintenance Type</Label>
                  <Select name="maintenanceType" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select maintenance type" />
                    </SelectTrigger>
                    <SelectContent>
                      {maintenanceTypes.map((type, index) => (
                        <SelectItem key={index} value={type.id.toString()}>
                          {type?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vendor">Vendor</Label>
                  <Select name="vendor" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map((type, index) => (
                        <SelectItem key={index} value={type.id.toString()}>
                          {type?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || !maintenanceDocketType}
                  className="pt-2 w-full"
                >
                  {isSubmitting ? "Adding..." : "Open Request"}
                </Button>
              </form>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
