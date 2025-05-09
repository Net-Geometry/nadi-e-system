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
import { useMaintenance } from "@/hooks/use-maintenance";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  humanizeMaintenanceStatus,
  MaintenanceRequest,
  MaintenanceStatus,
} from "@/types/maintenance";
import { useState } from "react";
import { Link } from "react-router-dom";
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
  const {
    attachmentFile,
    attachmentPreviewUrl,
    isUploading,
    handleAttachmentChange,
    handleRemoveAttachment,
    uploadAttachment,
  } = useAttachment();

  let attachmentFileName = "";
  if (maintenanceRequest?.attachment) {
    const attachmenUrl = new URL(maintenanceRequest?.attachment);
    attachmentFileName = attachmenUrl.pathname.split("/").pop();
  }

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
                  className="hover:underline"
                >
                  {attachmentFileName}
                </Link>
              </>
            ) : (
              <p>No attachment</p>
            )}
          </div>
          {maintenanceRequest?.sla_id == null && <UpdateSLACategory />}
          {maintenanceRequest?.sla?.min_day >= 15 &&
            userMetadata?.user_group_name == "DUSP" && <UpdateDUSP />}
        </div>
      </DialogContent>
    </Dialog>
  );
};
