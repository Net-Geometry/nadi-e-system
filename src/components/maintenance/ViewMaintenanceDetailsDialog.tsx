import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { fetchUserProfileNameById } from "@/hooks/auth/utils/profile-handler";
import { useMaintenance } from "@/hooks/use-maintenance";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  getMaintenanceStatus,
  humanizeMaintenanceStatus,
  MaintenanceRequest,
  MaintenanceStatus,
  MaintenanceUpdate,
} from "@/types/maintenance";
import { format } from "date-fns";
import { CalendarDays, CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AttachmentUploadField } from "./AttachmentUploadField";
import { useAttachment } from "./hooks/use-attachment";
import {
  getMaintenanceStatusClass,
  getMaintenanceStatusIcon,
  getSLACategoryClass,
} from "./MaintenanceStatusBadge";

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
    maintenanceRequest?.status == MaintenanceStatus.Submitted &&
    maintenanceRequest?.sla?.min_day >= 15;

  const isVendorAssigned =
    userMetadata?.user_group_name == "TP" &&
    (maintenanceRequest?.status == MaintenanceStatus.Approved ||
      (maintenanceRequest?.status == MaintenanceStatus.Submitted &&
        maintenanceRequest?.sla?.min_day < 15) ||
      maintenanceRequest?.status == MaintenanceStatus.Rejected ||
      maintenanceRequest?.status == MaintenanceStatus.Incompleted);

  const isVendorApproval =
    userMetadata?.user_group_name == "Vendor" &&
    maintenanceRequest?.status == MaintenanceStatus.Issued;

  const isVendorProgressUpdate =
    userMetadata?.user_group_name == "Vendor" &&
    maintenanceRequest?.status == MaintenanceStatus.InProgress;

  const isDefferedFlow =
    userMetadata?.user_group_name == "TP" &&
    maintenanceRequest?.status == MaintenanceStatus.Deffered;

  const isTPCloseRequest =
    userMetadata?.user_group_name == "TP" &&
    maintenanceRequest?.status == MaintenanceStatus.InProgress;

  const [activeTab, setActiveTab] = useState("details");

  const [requestedByName, setRequestedByName] = useState("N/A");

  useEffect(() => {
    if (!open) {
      setRequestedByName("N/A");
      return;
    }
    const fetchName = async () => {
      if (maintenanceRequest?.requester_by) {
        try {
          const name = await fetchUserProfileNameById(
            maintenanceRequest.requester_by
          );
          setRequestedByName(name);
        } catch (error) {
          console.error("Failed to fetch user name:", error);
          setRequestedByName("Error fetching name");
        }
      }
    };

    fetchName();
  }, [maintenanceRequest?.requester_by, open]);

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
    const [estimatedCompletionDate, setEstimatedCompletionDate] =
      useState<Date | null>(null);

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
            maintenance_date: estimatedCompletionDate,
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
          <Label className="text-sm font-medium text-gray-500">SLA</Label>
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
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-500">
            Estimated Completion Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !estimatedCompletionDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {estimatedCompletionDate ? (
                  format(estimatedCompletionDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 bg-white shadow-md border"
              align="start"
            >
              <Calendar
                mode="single"
                selected={estimatedCompletionDate}
                onSelect={setEstimatedCompletionDate}
                initialFocus
                className="pointer-events-auto"
                disabled={(date) =>
                  date <= new Date(new Date().setHours(0, 0, 0, 0))
                } // disable dates before today
              />
            </PopoverContent>
          </Popover>
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

  function ProcessDefferedRequest() {
    const handleUpdateStatus = async (status?: MaintenanceStatus) => {
      const data: Partial<MaintenanceRequest> = {
        status: status ?? MaintenanceStatus.Submitted,
        updated_at: new Date().toISOString(),
      };

      if (status === MaintenanceStatus.Submitted) {
        data.updates = null;
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
          onClick={() => handleUpdateStatus()}
        >
          Decline
        </Button>
      </div>
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

        if (status === MaintenanceStatus.Completed) {
          const { error: updateAssetError } = await supabase
            .from("nd_asset")
            .update({ is_active: true })
            .eq("id", maintenanceRequest?.asset_id);

          if (updateAssetError) throw updateAssetError;
        }

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
                  Asset
                </Label>
                <div className="mt-1">{maintenanceRequest?.asset?.name}</div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">SLA</Label>
                <div className="mt-1">
                  <Badge
                    className={getSLACategoryClass(maintenanceRequest?.sla)}
                  >
                    {maintenanceRequest?.sla?.name || "Not set"}{" "}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Requested By
                </Label>
                <div className="mt-1">{requestedByName}</div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">
                  {maintenanceRequest?.maintenance_date
                    ? "Estimated Completion"
                    : "No Estimated Date"}
                </Label>
                <div className="mt-1 flex items-center">
                  {maintenanceRequest?.maintenance_date && (
                    <>
                      <CalendarDays className="h-4 w-4 text-gray-400 mr-2" />
                      {format(
                        maintenanceRequest?.maintenance_date,
                        "dd/MM/yyyy"
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-500">
                Description
              </Label>
              <p className="mt-1 text-sm text-gray-700">
                {maintenanceRequest?.description}
              </p>
            </div>

            <div className="flex flex-col">
              <Label className="text-sm font-medium text-gray-500">
                Attachment
              </Label>
              {maintenanceRequest?.attachment ? (
                <Link
                  to={maintenanceRequest?.attachment}
                  target="_blank"
                  className="mt-1 text-sm text-blue-500 hover:underline"
                >
                  {attachmentFileName}
                </Link>
              ) : (
                <p>No attachment</p>
              )}
            </div>

            {isUpdateSLA && <UpdateSLACategory />}
            {isVendorAssigned && <UpdateVendor />}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Label className="text-sm font-medium text-gray-500">
              Updates History
            </Label>
            {maintenanceRequest?.updates ? (
              <div>
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
                        {format(update.created_at, "dd/MM/yyyy h:mm a")}
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
            ) : (
              <p>No updates</p>
            )}

            {isVendorProgressUpdate && <VendorProgressUpdate />}
          </TabsContent>
        </Tabs>

        {isDUSPApproval && <UpdateDUSP />}
        {isDefferedFlow && <ProcessDefferedRequest />}
        {isVendorApproval && <VendorApproval />}
        {isTPCloseRequest && <TPCloseRequest />}
      </DialogContent>
    </Dialog>
  );
};
