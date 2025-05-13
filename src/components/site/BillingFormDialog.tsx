import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import {
  useFetchUtilityTypes,
  useInsertBillingData,
  useUpdateBillingData,
} from "./hook/use-utilities-data";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { SiteProfileSelect } from "../member/components/SiteProfileSelect";
import { useSiteProfiles } from "../member/hook/useSiteProfile";

interface BillingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any; // Optional for update
}

const BillingFormDialog: React.FC<BillingFormDialogProps> = ({
  open,
  onOpenChange,
  initialData,
}) => {
  const { toast } = useToast();
  const [formState, setFormState] = useState({
    site_id: "",
    type_id: "",
    year: "",
    month: "",
    reference_no: "",
    amount_bill: "",
    remark: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingFilePath, setExistingFilePath] = useState<string | null>(null);
  const { profiles = [], loading: siteProfilesLoading, error: siteProfilesError } = useSiteProfiles();
  const { data: utilityTypes } = useFetchUtilityTypes();
  const {
    insertBillingData,
    loading: insertLoading,
    error: insertError,
  } = useInsertBillingData();
  const {
    updateBillingData,
    loading: updateLoading,
    error: updateError,
  } = useUpdateBillingData();

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false); // Add a local loading state

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const utilityData = {
      site_id: Number(formState.site_id),
      type_id: Number(formState.type_id),
      year: Number(formState.year),
      month: Number(formState.month),
      reference_no: formState.reference_no,
      amount_bill: Number(formState.amount_bill),
      remark: formState.remark,
    };

    let result;
    try {
      if (initialData) {
        // Update the record
        result = await updateBillingData(
          initialData.id,
          utilityData,
          selectedFile,
          utilityTypes,
          formState.site_id
        );
      } else {
        // Insert a new record
        result = await insertBillingData(
          utilityData,
          selectedFile,
          utilityTypes,
          formState.site_id
        );
      }

      if (result.success) {
        toast({
          title: "Success",
          description: `Billing Form ${initialData ? "updated" : "submitted"
            } successfully.`,
        });
        onOpenChange(false); // Close dialog
      } else {
        toast({
          title: "Error",
          description: `Error ${initialData ? "updating" : "submitting"
            } billing form. Please try again.`,
          variant: "destructive",
        });
        console.error("Error submitting form:", result.error);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false); // Stop loading
    }
  };

  const setField = (field: string, value: any) => {
    setFormState((prevState) => ({ ...prevState, [field]: value }));
  };

  useEffect(() => {
    if (open && initialData) {
      setFormState({
        site_id: initialData.site_id?.toString() || "",
        type_id: initialData.type_id.toString(),
        year: initialData.year.toString(),
        month: initialData.month.toString(),
        reference_no: initialData.reference_no || "",
        amount_bill: initialData.amount_bill
          ? initialData.amount_bill.toString()
          : "",
        remark: initialData.remark || "",
      });
      setExistingFilePath(initialData.file_path || null);
    } else if (open && profiles.length === 1) {
      setFormState({
        site_id: profiles[0].id.toString(),
        type_id: "",
        year: "",
        month: "",
        reference_no: "",
        amount_bill: "",
        remark: "",
      });
      setSelectedFile(null);
      setExistingFilePath(null);
    } else if (!open) {
      setFormState({
        site_id: "",
        type_id: "",
        year: "",
        month: "",
        reference_no: "",
        amount_bill: "",
        remark: "",
      });
      setSelectedFile(null);
      setExistingFilePath(null);
    }
  }, [open, initialData, profiles]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Update Billing" : "Add Billing"}
          </DialogTitle>
          <DialogDescription>
            Enter billing details and upload a file.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSubmitting ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              {/* Site Select */}
              <div className="space-y-2">
                <Label className="flex items-center">
                  NADI Site (Registered Location)
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <SiteProfileSelect
                  profiles={profiles}
                  value={formState.site_id ? parseInt(formState.site_id) : null}
                  onValueChange={(value) => setField("site_id", value.toString())}
                  disabled={siteProfilesLoading}
                />
                {siteProfilesLoading && (
                  <p className="text-sm text-muted-foreground">Loading NADI site...</p>
                )}
                {siteProfilesError && (
                  <p className="text-sm text-destructive">{siteProfilesError}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="type_id">Type</Label>
                <Select
                  name="type_id"
                  value={formState.type_id}
                  onValueChange={(value) => setField("type_id", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {utilityTypes?.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-4">
                <div className="w-1/2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    value={formState.year}
                    onChange={(e) => setField("year", e.target.value)}
                    required
                  />
                </div>

                <div className="w-1/2">
                  <Label htmlFor="month">Month</Label>
                  <Select
                    name="month"
                    value={formState.month}
                    onValueChange={(value) => setField("month", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        { id: 1, name: "January" },
                        { id: 2, name: "February" },
                        { id: 3, name: "March" },
                        { id: 4, name: "April" },
                        { id: 5, name: "May" },
                        { id: 6, name: "June" },
                        { id: 7, name: "July" },
                        { id: 8, name: "August" },
                        { id: 9, name: "September" },
                        { id: 10, name: "October" },
                        { id: 11, name: "November" },
                        { id: 12, name: "December" },
                      ].map((month) => (
                        <SelectItem key={month.id} value={month.id.toString()}>
                          {month.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference_no">Reference No</Label>
                <Input
                  id="reference_no"
                  name="reference_no"
                  value={formState.reference_no}
                  onChange={(e) => setField("reference_no", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount_bill">Amount Bill</Label>
                <Input
                  id="amount_bill"
                  name="amount_bill"
                  type="number"
                  value={formState.amount_bill}
                  onChange={(e) => setField("amount_bill", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="remark">Remark</Label>
                <Textarea
                  id="remark"
                  name="remark"
                  value={formState.remark}
                  onChange={(e) => setField("remark", e.target.value)}
                />
              </div>
              <FileUpload
                maxFiles={1}
                acceptedFileTypes=".pdf"
                maxSizeInMB={2}
                buttonText="Choose File"
                onFilesSelected={handleFilesSelected}
                existingFile={
                  initialData
                    ? {
                      url: existingFilePath,
                      name: existingFilePath?.split("/").pop(), // Extract the file name from the path
                    }
                    : null // No existing file for new billing data
                }
              />
            </>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || insertLoading || updateLoading}
            >
              {isSubmitting
                ? "Submitting..."
                : initialData
                  ? "Update"
                  : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BillingFormDialog;
