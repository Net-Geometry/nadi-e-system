import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  getMaintenanceStatus,
  humanizeMaintenanceStatus,
  MaintenanceRequest,
  MaintenanceStatus,
  MaintenanceUpdate,
} from "@/types/maintenance";
import { format } from "date-fns";
import { useState } from "react";
import { Link } from "react-router-dom";
import { AttachmentUploadField } from "./AttachmentUploadField";
import { useAttachment } from "./hooks/use-attachment";
import {
  getMaintenanceStatusClass,
  getMaintenanceStatusIcon,
} from "./MaintenanceStatusBadge";

export interface ViewMaintenanceDetailsDialogPMProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maintenanceRequest?: MaintenanceRequest;
  userMetadata?: Record<string, unknown>;
}

export const ViewMaintenanceDetailsDialogPM = ({
  open,
  onOpenChange,
  maintenanceRequest,
  userMetadata,
}: ViewMaintenanceDetailsDialogPMProps) => {
  let attachmentFileName = "";
  if (maintenanceRequest?.attachment) {
    const attachmenUrl = new URL(maintenanceRequest?.attachment);
    attachmentFileName = attachmenUrl.pathname.split("/").pop();
  }

  const isVendorAssigned =
    userMetadata?.user_group_name == "TP" &&
    (maintenanceRequest?.status == null ||
      maintenanceRequest?.status == MaintenanceStatus.Rejected ||
      maintenanceRequest?.status == MaintenanceStatus.Incompleted);

  const isVendorApproval =
    userMetadata?.user_group_name == "Vendor" &&
    maintenanceRequest?.status == MaintenanceStatus.Issued;

  const isVendorProgressUpdate =
    userMetadata?.user_group_name == "Vendor" &&
    maintenanceRequest?.status == MaintenanceStatus.InProgress;

  const isTPCloseRequest =
    userMetadata?.user_group_name == "TP" &&
    maintenanceRequest?.status == MaintenanceStatus.InProgress;

  const [activeTab, setActiveTab] = useState("details");

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
            updates: null,
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
          <Label className="text-sm font-medium text-gray-500">Vendor</Label>
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
    const [status, setStatus] = useState(null);

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

      let data: Partial<MaintenanceRequest> = {
        updates: updatedUpdates,
        updated_at: new Date().toISOString(),
      };

      if (status === MaintenanceStatus.Deffered) {
        data = {
          ...data,
          status: MaintenanceStatus.Deffered,
        };
      }

      try {
        const { error: updateError } = await supabase
          .from("nd_maintenance_request")
          .update(data)
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
        <Label className="text-sm font-medium text-gray-500">
          Provide Update
        </Label>
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
        <div className="flex justify-center items-center gap-4">
          <Button
            type="submit"
            className="pt-2 w-full"
            onClick={() => setStatus(MaintenanceStatus.InProgress)}
          >
            Update Progress
          </Button>
          <Button
            type="submit"
            className="w-full"
            onClick={() => setStatus(MaintenanceStatus.Deffered)}
            variant="destructive"
          >
            Incomplete
          </Button>
        </div>
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
        <Button
          type="button"
          className="w-full"
          onClick={() => handleUpdateStatus(MaintenanceStatus.Incompleted)}
          variant="destructive"
        >
          Reject Completion
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            {getMaintenanceStatusIcon(
              getMaintenanceStatus(maintenanceRequest?.status)
            )}
            <span>Docket No: {maintenanceRequest?.no_docket}</span>
          </DialogTitle>
          <DialogDescription>
            View and update maintenance docket details
          </DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Status
                </Label>
                <div className="mt-1">
                  <Badge
                    className={getMaintenanceStatusClass(
                      getMaintenanceStatus(maintenanceRequest?.status)
                    )}
                  >
                    {maintenanceRequest?.status
                      ? humanizeMaintenanceStatus(maintenanceRequest?.status)
                      : "No status"}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Maintenance Type
                </Label>
                <div className="mt-1">{maintenanceRequest?.type?.name}</div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Description
                </Label>
                <p className="mt-1 text-sm text-gray-700">
                  {maintenanceRequest?.description}
                </p>
              </div>
            </div>

            {isVendorAssigned && <UpdateVendor />}
            {isVendorApproval && <VendorApproval />}
          </TabsContent>
          <TabsContent value="history" className="space-y-4">
            <Label className="text-sm font-medium text-gray-500">
              Updates History
            </Label>
            {maintenanceRequest?.updates &&
              maintenanceRequest.updates.map((update, index) => {
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
                      {format(update.created_at, "dd-MM-yyyy")}
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

            {isVendorProgressUpdate && <VendorProgressUpdate />}
          </TabsContent>
        </Tabs>

        {isTPCloseRequest && <TPCloseRequest />}
      </DialogContent>
    </Dialog>
  );
};
