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
import { FileUpload } from "@/components/ui/file-upload";
import {
  useFetchInsuranceTypes,
  useInsertInsuranceData,
  useUpdateInsuranceData,
} from "./hook/use-insurance-data";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "../ui/textarea";
import { useSiteProfiles } from "../member/hook/useSiteProfile";
import { SiteProfileSelect } from "../member/components/SiteProfileSelect";

interface InsuranceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
}

const InsuranceFormDialog: React.FC<InsuranceFormDialogProps> = ({
  open,
  onOpenChange,
  initialData,
}) => {
  const { toast } = useToast();
  const [formState, setFormState] = useState({
    site_id: "",
    description: "",
    type_id: "",
    insurance_type_id: "",
    report_detail: "",
    start_date: "", // New field
    end_date: "",   // New field
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { profiles = [], loading: siteProfilesLoading, error: siteProfilesError } = useSiteProfiles();
  const { incidentTypes, insuranceCoverageTypes, loading: typesLoading } = useFetchInsuranceTypes();
  const { insertInsuranceData, loading: insertLoading } = useInsertInsuranceData();
  const { updateInsuranceData, loading: updateLoading } = useUpdateInsuranceData();

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const [existingFilePath, setExistingFilePath] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const insuranceData = {
      site_id: Number(formState.site_id), // Use selected site_id
      description: formState.description,
      type_id: Number(formState.type_id),
      insurance_type_id: Number(formState.insurance_type_id),
      report_detail: formState.report_detail,
      start_date: formState.start_date, // Include start_date
      end_date: formState.end_date,     // Include end_date
    };

    let result;
    if (initialData) {
      result = await updateInsuranceData(initialData.id, insuranceData, selectedFile, formState.site_id);
    } else {
      result = await insertInsuranceData(insuranceData, selectedFile, formState.site_id);
    }
    if (result.success) {
      toast({
        title: "Success",
        description: `Insurance ${initialData ? "updated" : "added"} successfully.`,
      });
      onOpenChange(false);
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const setField = (field: string, value: any) => {
    setFormState((prevState) => ({ ...prevState, [field]: value }));
  };

  useEffect(() => {
    if (open && initialData) {
      setFormState({
        site_id: initialData.site_id?.toString() || "",
        description: initialData.description || "",
        type_id: initialData.type_id.toString(),
        insurance_type_id: initialData.insurance_type_id.toString(),
        report_detail: initialData.report_detail || "",
        start_date: initialData.start_date || "",
        end_date: initialData.end_date || "",
      });
      setExistingFilePath(initialData.file_path || null);
    } else if (open && profiles.length === 1) {
      setFormState({
        site_id: profiles[0].id.toString(),
        description: "",
        type_id: "",
        insurance_type_id: "",
        report_detail: "",
        start_date: "",
        end_date: "",
      });
      setSelectedFile(null);
      setExistingFilePath(null);
    } else if (!open) {
      setFormState({
        site_id: "",
        description: "",
        type_id: "",
        insurance_type_id: "",
        report_detail: "",
        start_date: "",
        end_date: "",
      });
      setSelectedFile(null);
      setExistingFilePath(null);
    }
  }, [open, initialData, profiles]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Update Insurance" : "Add Insurance"}</DialogTitle>
          <DialogDescription>Enter insurance details and upload a file.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formState.description}
              onChange={(e) => setField("description", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type_id">Incident Type</Label>
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
                {incidentTypes?.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="insurance_type_id">Insurance Type</Label>
            <Select
              name="insurance_type_id"
              value={formState.insurance_type_id}
              onValueChange={(value) => setField("insurance_type_id", value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select insurance type" />
              </SelectTrigger>
              <SelectContent>
                {insuranceCoverageTypes?.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="report_detail">Report Detail</Label>
            <Textarea
              id="report_detail"
              name="report_detail"
              value={formState.report_detail}
              onChange={(e) => setField("report_detail", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              name="start_date"
              type="date"
              value={formState.start_date}
              onChange={(e) => setField("start_date", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_date">End Date</Label>
            <Input
              id="end_date"
              name="end_date"
              type="date"
              value={formState.end_date}
              onChange={(e) => setField("end_date", e.target.value)}
              required
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
                  name: existingFilePath?.split("/").pop(),
                }
                : null
            }
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={insertLoading || updateLoading || typesLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={insertLoading || updateLoading || typesLoading}>
              {insertLoading || updateLoading ? "Submitting..." : initialData ? "Update" : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InsuranceFormDialog;