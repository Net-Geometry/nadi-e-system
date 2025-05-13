import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { Textarea } from "@/components/ui/textarea";
import { useMaintenance } from "@/hooks/use-maintenance";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  humanizeMaintenanceStatus,
  MaintenanceRequest,
  MaintenanceStatus,
  MaintenanceUpdate,
} from "@/types/maintenance";
import { formatDateTimeLocal } from "@/utils/date-utils";
import { useState } from "react";
import { Link } from "react-router-dom";
import { AttachmentUploadField } from "./AttachmentUploadField";
import { useAttachment } from "./hooks/use-attachment";

export interface ViewMaintenanceDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maintenanceRequest?: MaintenanceRequest;
  userMetadata?: Record<string, unknown>; // Use Record<string, any>
}

export const ViewMaintenanceDetailsDialog = ({
  open,
  onOpenChange,
  maintenanceRequest,
  userMetadata,
}: ViewMaintenanceDetailsDialogProps) => {
  let attachmentFileName = "";
  if (maintenanceRequest?.attachment) {
    const attachmenUrl = new URL(maintenanceRequest?.attachment);
    attachmentFileName = attachmenUrl.pathname.split("/").pop();
  }

  /**
   * CM process flow
   * 1. staff create maintenance request
   * 2. TP set SLA
   * 3. if SLA >= 15 days, DUSP need to approve
   * 4. TP assign Vendor
   * 5. Vendor accept / reject
   * 6. Vendor completing CM
   * 7. Vendor upload report
   * 8. TP approve / reject CM completion
   */

  const isUpdateSLA =
    userMetadata?.user_group_name == "TP" && maintenanceRequest?.sla_id == null;

  const isDUSPApproval =
    userMetadata?.user_group_name == "DUSP" &&
    maintenanceRequest?.status == null &&
    maintenanceRequest?.sla?.min_day >= 15;

  const isVendorAssigned =
    userMetadata?.user_group_name == "TP" &&
    (maintenanceRequest?.status == MaintenanceStatus.Approved ||
      (maintenanceRequest?.status == null &&
        maintenanceRequest?.sla?.min_day < 15) ||
      maintenanceRequest?.status == MaintenanceStatus.Rejected);

  const isVendorApproval =
    userMetadata?.user_group_name == "Vendor" &&
    maintenanceRequest?.status == MaintenanceStatus.Issued;

  const isVendorProgressUpdate =
    userMetadata?.user_group_name == "Vendor" &&
    maintenanceRequest?.status == MaintenanceStatus.InProgress;

  const isTPCloseRequest =
    userMetadata?.user_group_name == "TP" &&
    maintenanceRequest?.status == MaintenanceStatus.InProgress;

  function UpdateDUSP() {
    const updateStatus = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      setIsSubmitting(true);

      try {
        const { error: updateError } = await supabase
          .from("nd_maintenance_request")
          .update({
            status: MaintenanceStatus.Approved,
            updated_at: new Date().toISOString(),
          })
          .eq("id", maintenanceRequest.id);

        if (updateError) throw updateError;

        toast({
          title: "Success",
          description: `The maintenance request has been successfully approved.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: `Failed to update the maintenance request. Please try again.`,
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
        onOpenChange(false);
      }
    };
    const [isSubmitting, setIsSubmitting] = useState(false);
    return (
      <form onSubmit={updateStatus} className="space-y-4">
        <Button type="submit" disabled={isSubmitting} className="pt-2 w-full">
          {isSubmitting ? "Updating..." : "Approve"}
        </Button>
      </form>
    );
  }

  function UpdateSLACategory() {
    const { useSLACategoriesQuery } = useMaintenance();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: slaCategories = [], isLoading: isLoadingSLACategories } =
      useSLACategoriesQuery();

    const [buttonText, setButtonText] = useState("Update Request");

    const handleSLAChange = (value: string) => {
      if (Number(value) === 4) {
        setButtonText("Submit to DUSP");
      } else {
        setButtonText("Update Request");
      }
    };

    const handleSLAUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      setIsSubmitting(true);

      const formData = new FormData(e.currentTarget);
      const selectedSLA = formData.get("sla");

      try {
        const { error: updateError } = await supabase
          .from("nd_maintenance_request")
          .update({
            sla_id: Number(selectedSLA),
            updated_at: new Date().toISOString(),
          })
          .eq("id", maintenanceRequest.id);

        if (updateError) throw updateError;

        toast({
          title: "Maintenance Request updated successfully",
          description:
            "The maintenance request has been updated in the system.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: `Failed to update the maintenance request. Please try again.`,
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
        onOpenChange(false);
      }
    };

    return (
      <form onSubmit={handleSLAUpdate} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sla">SLA</Label>
          <Select name="sla" required onValueChange={handleSLAChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select SLA" />
            </SelectTrigger>
            <SelectContent>
              {slaCategories.map((type, index) => (
                <SelectItem key={index} value={type.id.toString()}>
                  {type?.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="submit"
          disabled={isSubmitting || isLoadingSLACategories}
          className="pt-2 w-full"
        >
          {isSubmitting ? "Updating..." : buttonText}
        </Button>
      </form>
    );
  }

  function UpdateVendor() {
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleUpdateVendor = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      setIsSubmitting(true);

      const formData = new FormData(e.currentTarget);
      const selectedVendor = formData.get("vendor");

      try {
        const { error: updateError } = await supabase
          .from("nd_maintenance_request")
          .update({
            // vendor_id: Number(selectedSLA),
            status: MaintenanceStatus.Issued,
            updated_at: new Date().toISOString(),
          })
          .eq("id", maintenanceRequest.id);

        if (updateError) throw updateError;

        toast({
          title: "Maintenance Request updated successfully",
          description:
            "The maintenance request has been updated in the system.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: `Failed to update the maintenance request. Please try again.`,
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
        onOpenChange(false);
      }
    };

    return (
      <form className="space-y-4" onSubmit={handleUpdateVendor}>
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
        <Button type="submit" disabled={isSubmitting} className="pt-2 w-full">
          {isSubmitting ? "Updating..." : "Assign to Vendor"}
        </Button>
      </form>
    );
  }

  function VendorApproval() {
    const handleUpdateStatus = async (status: MaintenanceStatus) => {
      try {
        const { error: updateError } = await supabase
          .from("nd_maintenance_request")
          .update({
            status: status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", maintenanceRequest.id);

        if (updateError) throw updateError;

        toast({
          title: "Maintenance Request updated successfully",
          description:
            "The maintenance request has been updated in the system.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: `Failed to update the maintenance request. Please try again.`,
          variant: "destructive",
        });
      } finally {
        onOpenChange(false);
      }
    };

    return (
      <div className="flex justify-center items-center gap-4">
        <Button
          type="button"
          className="w-full"
          onClick={() => handleUpdateStatus(MaintenanceStatus.InProgress)}
        >
          Accept
        </Button>
        <Button
          type="button"
          className="w-full"
          variant="destructive"
          onClick={() => handleUpdateStatus(MaintenanceStatus.Rejected)}
        >
          Decline
        </Button>
      </div>
    );
  }

  function VendorProgressUpdate() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { user } = useAuth();

    const {
      attachmentFile,
      attachmentPreviewUrl,
      isUploading,
      handleAttachmentChange,
      handleRemoveAttachment,
      uploadAttachment,
    } = useAttachment();

    const handleProgressUpdate = async (
      e: React.FormEvent<HTMLFormElement>
    ) => {
      e.preventDefault();

      setIsSubmitting(true);

      const formData = new FormData(e.currentTarget);

      let attachmentUrl = null;

      if (!attachmentFile) {
        toast({
          title: "Error",
          description: `Please upload an attachment for the maintenance request.`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      } else {
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

      const newUpdate: MaintenanceUpdate = {
        description: String(formData.get("description")),
        attachment: attachmentUrl,
        created_at: new Date().toISOString(),
        created_by: user.id,
      };

      const existingUpdates = maintenanceRequest?.updates || [];
      const updatedUpdates = [...existingUpdates, newUpdate];

      try {
        const { error: updateError } = await supabase
          .from("nd_maintenance_request")
          .update({
            updates: updatedUpdates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", maintenanceRequest.id);

        if (updateError) throw updateError;

        toast({
          title: "Maintenance Request updated successfully",
          description:
            "The maintenance request has been updated in the system.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: `Failed to update the maintenance request. Please try again.`,
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
        onOpenChange(false);
      }
    };
    return (
      <form className="space-y-4" onSubmit={handleProgressUpdate}>
        <h3 className="font-semibold mb-2">Provide Update</h3>
        <div className="border-2 p-2">
          <Textarea
            id="description"
            name="description"
            placeholder="Description"
            required
          />
          <div className="mt-2">
            <AttachmentUploadField
              previewUrl={attachmentPreviewUrl}
              isUploading={isUploading}
              onAttachmentChange={handleAttachmentChange}
              onRemoveAttachment={handleRemoveAttachment}
            />
          </div>
        </div>
        <Button type="submit" className="pt-2 w-full" disabled={isSubmitting}>
          Update Progress
        </Button>
      </form>
    );
  }

  function TPCloseRequest() {
    const handleUpdateStatus = async (status: MaintenanceStatus) => {
      try {
        const { error: updateError } = await supabase
          .from("nd_maintenance_request")
          .update({
            status: status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", maintenanceRequest.id);

        if (updateError) throw updateError;

        toast({
          title: "Maintenance Request updated successfully",
          description:
            "The maintenance request has been updated in the system.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: `Failed to update the maintenance request. Please try again.`,
          variant: "destructive",
        });
      } finally {
        onOpenChange(false);
      }
    };

    return (
      <div className="flex justify-center items-center gap-4">
        <Button
          type="button"
          className="w-full"
          onClick={() => handleUpdateStatus(MaintenanceStatus.Completed)}
        >
          Close Request
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2/3 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-2">
          <DialogTitle>Maintenance Request Details</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p>{maintenanceRequest?.description}</p>
          </div>
          {maintenanceRequest?.status && (
            <div>
              <h3 className="font-semibold mb-2">Status</h3>
              <p>{humanizeMaintenanceStatus(maintenanceRequest?.status)}</p>
            </div>
          )}
          <div>
            <h3 className="font-semibold mb-2">Asset</h3>
            <p>{maintenanceRequest?.asset?.name}</p>
            <p className="text-xs">
              {maintenanceRequest?.asset?.site?.sitename}
            </p>
          </div>
          {maintenanceRequest?.sla && (
            <div>
              <h3 className="font-semibold mb-2">SLA Category</h3>
              <p>{maintenanceRequest?.sla?.name}</p>
            </div>
          )}
          <div>
            <h3 className="font-semibold mb-2">Maintenance Type</h3>
            <p>{maintenanceRequest?.type?.name}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Attachment</h3>
            {maintenanceRequest?.attachment ? (
              <>
                <Link
                  to={maintenanceRequest?.attachment}
                  target="_blank"
                  className="text-blue-500 hover:underline"
                >
                  {attachmentFileName}
                </Link>
              </>
            ) : (
              <p>No attachment</p>
            )}
          </div>
          {maintenanceRequest?.updates && (
            <div>
              <h3 className="font-semibold mb-2">Updates History</h3>
              {maintenanceRequest.updates.map((update, index) => {
                let attachmentFileName: string | null = null;

                if (update.attachment) {
                  try {
                    const attachmentUrl = new URL(update.attachment);
                    attachmentFileName =
                      attachmentUrl.pathname.split("/").pop() || null;
                  } catch (e) {
                    console.error("Invalid attachment URL", e);
                  }
                }

                return (
                  <div
                    className="bg-gray-100 border-2 border-gray-300 p-2 mb-2"
                    key={index}
                  >
                    <p className="mb-2">{update.description}</p>
                    <p className="text-xs">
                      {formatDateTimeLocal(update.created_at)}
                    </p>
                    {attachmentFileName && (
                      <Link
                        to={update.attachment}
                        target="_blank"
                        className="text-blue-500 hover:underline text-xs"
                      >
                        {attachmentFileName}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {isUpdateSLA && <UpdateSLACategory />}
          {isDUSPApproval && <UpdateDUSP />}
          {isVendorAssigned && <UpdateVendor />}
          {isVendorApproval && <VendorApproval />}
          {isVendorProgressUpdate && <VendorProgressUpdate />}
          {isTPCloseRequest && <TPCloseRequest />}
        </div>
      </DialogContent>
    </Dialog>
  );
};
