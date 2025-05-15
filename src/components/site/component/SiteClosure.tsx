import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { useSiteCode } from "../hook/use-site-code";
import { SelectMany } from "@/components/ui/SelectMany";
import { SelectOne } from "@/components/ui/SelectOne";
import {
  fetchClosureCategories,
  fetchClosureSubCategories,
  fetchClosureAffectAreas,
  fetchClosureSession,
} from "../hook/use-siteclosure";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DateInput } from "../../ui/date-input";
import { useDateRangeValidation } from "@/hooks/useDateRangeValidation";
import { useSessionVisibility } from "../hook/use-session-visibility";
import TimeInput from "../../ui/TimePicker";
import { useUserGroup } from "@/hooks/use-user-group";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { SUPABASE_URL } from "@/integrations/supabase/client";
import { useSiteClosureForm } from "../hook/use-site-closure-form";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUserMetadata } from "@/hooks/use-user-metadata";

interface SiteClosureFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  siteId: string;
  onSuccess?: () => void;
  editData?: any;
  clearEditData?: () => void;
}

interface SiteOption {
  id: string;
  label: string;
}

// Function to fetch sites for a specific TP organization
const fetchTPSites = async (organizationId: string): Promise<SiteOption[]> => {
  if (!organizationId) return [];

  try {
    const { data, error } = await supabase
      .from("nd_site_profile")
      .select(
        `
        id,
        sitename,
        nd_site:nd_site(standard_code)
      `
      )
      .eq("dusp_tp_id", organizationId)
      .order("sitename", { ascending: true });

    if (error) throw error;

    return (data || []).map((site) => ({
      id: site.id,
      label: `${site.sitename} (${
        site.nd_site?.[0]?.standard_code || "No Code"
      })`,
    }));
  } catch (error) {
    console.error("Error fetching TP sites:", error);
    return [];
  }
};

// Function to fetch all sites for SuperAdmin
const fetchAllSites = async (): Promise<SiteOption[]> => {
  try {
    const { data, error } = await supabase
      .from("nd_site_profile")
      .select(
        `
        id,
        sitename,
        nd_site:nd_site(standard_code),
        organizations:dusp_tp_id(
          id, name, type,
          parent:parent_id(name)
        )
      `
      )
      .order("sitename", { ascending: true });

    if (error) throw error;

    return (data || []).map((site) => ({
      id: site.id,
      label: `${site.sitename} (${
        site.nd_site?.[0]?.standard_code || "No Code"
      }) - ${site.organizations?.name || "N/A"}`,
    }));
  } catch (error) {
    console.error("Error fetching all sites:", error);
    return [];
  }
};

const SiteClosureForm: React.FC<SiteClosureFormProps> = ({
  open,
  onOpenChange,
  siteId,
  onSuccess,
  editData,
  clearEditData,
}) => {
  // Get user metadata to check if user is TP
  const userMetadata = useUserMetadata();
  const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;
  const isTPUser =
    parsedMetadata?.user_group_name === "TP" &&
    !!parsedMetadata?.organization_id;
  const organizationId = isTPUser ? parsedMetadata?.organization_id : null;

  // Get user group information FIRST before using it
  const { isTP, isSuperAdmin } = useUserGroup();

  // Initialize the fileUploadRef
  const fileUploadRef = useRef<any>(null);

  // Add a ref to track whether initial site selection has been done
  const hasSetInitialSite = useRef(false);

  // Fetch sites for TP user
  const { data: tpSites = [], isLoading: isLoadingSites } = useQuery({
    queryKey: ["tpSites", organizationId],
    queryFn: () => fetchTPSites(organizationId || ""),
    enabled: !!organizationId && isTPUser && open,
  });

  // Fetch all sites for SuperAdmin
  const { data: allSites = [], isLoading: isLoadingAllSites } = useQuery({
    queryKey: ["allSites"],
    queryFn: fetchAllSites,
    enabled: isSuperAdmin && open,
  });

  // Pass necessary validation states to the form hook
  const {
    formState,
    setFormState,
    setField,
    validationErrors,
    isSubmitting,
    activeSubmission,
    selectedFiles,
    existingAttachments,
    showConfirmDialog,
    handleDateChange,
    resetForm,
    handleSubmitAsDraft,
    handleFormSubmit,
    processSubmit,
    handleAttachmentsChange,
    handleExistingAttachmentsChange,
    resetCleanupFlags,
    setShowConfirmDialog,
    validateForm,
    cleanupFormState,
  } = useSiteClosureForm(
    siteId,
    "",
    editData,
    isSuperAdmin,
    onSuccess,
    onOpenChange
  );

  // Now use the selected site ID from form state for the effective site ID
  // This is what we'll use for siteCode lookup and form submission
  const effectiveSiteId =
    isTPUser || isSuperAdmin ? formState?.selectedSiteId || "" : siteId;

  // Get site code for the effective site ID
  const { siteCode } = useSiteCode(effectiveSiteId);

  // Track whether to show subcategory field based on category selection
  const [showSubcategory, setShowSubcategory] = useState(false);

  // Data queries for form fields
  const { data: closureCategories = [], isLoading: isLoadingCategories } =
    useQuery({
      queryKey: ["closureCategories"],
      queryFn: fetchClosureCategories,
    });

  const { data: closureSubCategories = [], isLoading: isLoadingSubCategories } =
    useQuery({
      queryKey: ["closureSubCategories"],
      queryFn: fetchClosureSubCategories,
    });

  const { data: closureAffectAreas = [], isLoading: isLoadingAffectAreas } =
    useQuery({
      queryKey: ["closureAffectAreas"],
      queryFn: fetchClosureAffectAreas,
    });

  const { data: closureSessions = [], isLoading: isLoadingSessions } = useQuery(
    {
      queryKey: ["closureSessions"],
      queryFn: fetchClosureSession,
    }
  );

  // Update selected site when dialog opens - DISABLED auto-selection behavior
  useEffect(() => {
    // Reset the flag when the dialog closes (but don't auto-select)
    if (!open) {
      hasSetInitialSite.current = false;
    }
    // Auto-selection code has been removed as per requirements
  }, [open]);

  // Format existing attachments for FileUpload component
  const formattedExistingFiles = useMemo(() => {
    if (!existingAttachments || existingAttachments.length === 0) return null;

    return existingAttachments.map((path) => {
      const fileName = path.split("/").pop() || "File";
      const fullUrl = path.startsWith("http") ? path : `${SUPABASE_URL}${path}`;
      return {
        url: fullUrl,
        name: fileName,
      };
    });
  }, [existingAttachments]);

  // Date validation helpers
  const isDateRangeValid = useDateRangeValidation(
    formState.close_start,
    formState.close_end,
    0
  );

  // Show time inputs depending on selected session
  const { showTimeInputs, timeRange } = useSessionVisibility(formState.session);

  // Handle file upload component reset
  const handleReset = () => {
    resetForm();
    if (fileUploadRef.current && fileUploadRef.current.reset) {
      fileUploadRef.current.reset();
    }
    // Clear selected site ID
    if (isTPUser || isSuperAdmin) {
      setField("selectedSiteId", "");
      // Prevent auto-selection after clearing
      hasSetInitialSite.current = false;
    }
  };

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      resetCleanupFlags();
      cleanupFormState();
    }
  }, [open, resetCleanupFlags, cleanupFormState]);

  // Clear edit data when dialog closes
  useEffect(() => {
    if (!open && clearEditData) {
      clearEditData();
    }
  }, [open, clearEditData]);

  // Reset session when date range is invalid
  useEffect(() => {
    if (!isDateRangeValid) {
      setField("session", "");
    }
  }, [isDateRangeValid, setField]);

  // Update time fields based on session selection
  useEffect(() => {
    if (formState.session) {
      let updatedState = {
        ...formState,
        start_time: "",
        end_time: "",
      };

      if (timeRange) {
        if (formState.session === "3" && timeRange.isFixed) {
          updatedState.start_time = timeRange.defaultStart || "08:00";
          updatedState.end_time = timeRange.defaultEnd || "18:00";
        } else if (timeRange.defaultStart && timeRange.defaultEnd) {
          updatedState.start_time = timeRange.defaultStart;
          updatedState.end_time = timeRange.defaultEnd;
        }
      }

      setField("start_time", updatedState.start_time);
      setField("end_time", updatedState.end_time);
    }
  }, [formState.session, timeRange, setField]);

  // Update subcategory visibility based on category selection
  useEffect(() => {
    const isSpecialCategory = formState.category_id === "6";
    setShowSubcategory(isSpecialCategory);
    if (!isSpecialCategory && formState.subcategory_id) {
      setField("subcategory_id", "");
    }
  }, [formState.category_id, setField]);

  // Validate time logic
  useEffect(() => {
    if (
      formState.start_time &&
      formState.end_time &&
      formState.start_time > formState.end_time
    ) {
      setField("end_time", "");
    }
  }, [formState.start_time, formState.end_time, setField]);

  useEffect(() => {
    if (
      formState.start_time &&
      formState.end_time &&
      formState.end_time < formState.start_time
    ) {
      setField("start_time", "");
    }
  }, [formState.end_time, formState.start_time, setField]);

  // Filter categories based on user permissions
  const filteredCategories = useMemo(() => {
    if (!closureCategories) return [];

    if (isSuperAdmin || isTP) return closureCategories;

    return closureCategories.filter((category) => String(category.id) !== "1");
  }, [closureCategories, isTP, isSuperAdmin]);

  // Restrict category 1 to TP/SuperAdmin
  useEffect(() => {
    const selectedCategoryId = formState.category_id;
    if (selectedCategoryId === "1" && !(isTP || isSuperAdmin)) {
      setField("category_id", "");
      setField("subcategory_id", "");
    }
  }, [isTP, isSuperAdmin, formState.category_id, setField]);

  const today = new Date().toISOString().split("T")[0];

  const maxStartDate = useMemo(() => {
    if (isSuperAdmin) return undefined;

    const today = new Date();
    const oneWeekFromToday = new Date();
    oneWeekFromToday.setDate(today.getDate() + 6);
    return oneWeekFromToday.toISOString().split("T")[0];
  }, [isSuperAdmin]);

  // Update handleFormSubmit to include context information in validation
  const handleFormValidationSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Modify validation context based on current state
    const isValid = validateForm({
      showSubcategory,
      isDateRangeValid,
      showTimeInputs,
    });

    if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setShowConfirmDialog(true);
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            console.log("Dialog closing - cleaning up state");
            resetCleanupFlags();
            cleanupFormState();
            if (fileUploadRef.current && fileUploadRef.current.reset) {
              fileUploadRef.current.reset();
            }
            if (clearEditData) {
              clearEditData();
            }
            // Also reset selectedSiteId when dialog closes
            if (isTPUser || isSuperAdmin) {
              setField("selectedSiteId", "");
              hasSetInitialSite.current = false;
            }
          }
          onOpenChange(isOpen);
        }}
      >
        <DialogContent className="sm:max-w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editData ? "Edit Draft Closure Request" : "Site Closure Form"}
            </DialogTitle>
            <DialogDescription>
              {editData
                ? "Edit your draft closure request details."
                : "Fill in the details for site closure."}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleFormValidationSubmit}
            className="space-y-4"
            noValidate
          >
            {/* Site Selection Dropdown for TP and SuperAdmin Users */}
            {(isTPUser || isSuperAdmin) && (
              <div className="space-y-2">
                <Label htmlFor="siteSelection">
                  Select Site <span className="text-red-500">*</span>
                </Label>
                <SelectOne
                  options={isTPUser ? tpSites : allSites}
                  value={formState.selectedSiteId}
                  onChange={(value) =>
                    setField("selectedSiteId", value as string)
                  }
                  placeholder="Select a site"
                  disabled={
                    (isTPUser ? isLoadingSites : isLoadingAllSites) ||
                    isSubmitting
                  }
                  className={
                    validationErrors.selectedSiteId ? "border-red-500" : ""
                  }
                />
                {validationErrors.selectedSiteId && (
                  <p className="text-sm text-red-500">
                    {validationErrors.selectedSiteId}
                  </p>
                )}
              </div>
            )}

            {/* Site Code - only show for users who are not TP or SuperAdmin */}
            {!(isTPUser || isSuperAdmin) && (
              <div className="space-y-2">
                <Label htmlFor="siteId">Site Code</Label>
                <Input id="siteId" value={siteCode} readOnly />
              </div>
            )}

            {/* Date Range Fields */}
            <div className="flex space-x-4">
              <div className="w-1/2 space-y-2">
                <Label htmlFor="startDate">
                  Start Date <span className="text-red-500">*</span>
                  {!isSuperAdmin && (
                    <span className="text-gray-500 text-xs ml-2">
                      (Max 1 week in advance)
                    </span>
                  )}
                </Label>
                <DateInput
                  id="startDate"
                  value={formState.close_start}
                  onChange={(e) =>
                    handleDateChange("close_start", e.target.value)
                  }
                  min={today}
                  max={
                    isSuperAdmin
                      ? formState.close_end || undefined
                      : maxStartDate
                  }
                  className={
                    validationErrors.close_start ? "border-red-500" : ""
                  }
                />
                {validationErrors.close_start && (
                  <p className="text-sm text-red-500">
                    {validationErrors.close_start}
                  </p>
                )}
              </div>
              <div className="w-1/2 space-y-2">
                <Label htmlFor="endDate">
                  End Date <span className="text-red-500">*</span>
                </Label>
                <DateInput
                  id="endDate"
                  value={formState.close_end}
                  onChange={(e) =>
                    handleDateChange("close_end", e.target.value)
                  }
                  min={formState.close_start || today}
                  max={undefined}
                  className={validationErrors.close_end ? "border-red-500" : ""}
                />
                {validationErrors.close_end && (
                  <p className="text-sm text-red-500">
                    {validationErrors.close_end}
                  </p>
                )}
              </div>
            </div>

            {/* Session Selection */}
            {isDateRangeValid && (
              <div className="space-y-2">
                <Label htmlFor="session">
                  Session <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  value={formState.session}
                  onValueChange={(value) => setField("session", value)}
                  className="flex flex-wrap gap-6"
                >
                  {closureSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center space-x-2"
                    >
                      <RadioGroupItem
                        value={String(session.id)}
                        id={`session-${session.id}`}
                      />
                      <Label
                        htmlFor={`session-${session.id}`}
                        className="cursor-pointer"
                      >
                        {session.eng}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                {validationErrors.session && (
                  <p className="text-sm text-red-500">
                    {validationErrors.session}
                  </p>
                )}
              </div>
            )}

            {/* Time Selection Fields */}
            {showTimeInputs && (
              <div className="flex space-x-4">
                <div className="w-1/2 space-y-2">
                  <Label htmlFor="startTime">
                    Start Time <span className="text-red-500">*</span>
                    <span className="text-gray-500">(24hrs-format)</span>
                    {timeRange?.isFixed && (
                      <span className="text-blue-500 ml-2">(Fixed)</span>
                    )}
                  </Label>
                  <div
                    className={
                      timeRange?.isFixed ? "opacity-70 pointer-events-none" : ""
                    }
                  >
                    <TimeInput
                      id="startTime"
                      value={formState.start_time}
                      onChange={(val) => setField("start_time", val)}
                      min={timeRange?.min}
                      max={formState.end_time || timeRange?.max}
                      disallowSameAsValue={formState.end_time}
                      className={
                        validationErrors.start_time ? "border-red-500" : ""
                      }
                    />
                  </div>
                  {validationErrors.start_time && (
                    <p className="text-sm text-red-500">
                      {validationErrors.start_time}
                    </p>
                  )}
                </div>
                <div className="w-1/2 space-y-2">
                  <Label htmlFor="endTime">
                    End Time <span className="text-red-500">*</span>
                    <span className="text-gray-500">(24hrs-format)</span>
                    {timeRange?.isFixed && (
                      <span className="text-blue-500 ml-2">(Fixed)</span>
                    )}
                  </Label>
                  <div
                    className={
                      timeRange?.isFixed ? "opacity-70 pointer-events-none" : ""
                    }
                  >
                    <TimeInput
                      id="endTime"
                      value={formState.end_time}
                      onChange={(val) => setField("end_time", val)}
                      min={formState.start_time || timeRange?.min}
                      max={timeRange?.max}
                      disallowSameAsValue={formState.start_time}
                      className={
                        validationErrors.end_time ? "border-red-500" : ""
                      }
                    />
                  </div>
                  {validationErrors.end_time && (
                    <p className="text-sm text-red-500">
                      {validationErrors.end_time}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Category Selection - replaced with SelectOne */}
            <div className="space-y-2">
              <Label htmlFor="category">
                Closure Category <span className="text-red-500">*</span>
              </Label>
              <SelectOne
                options={filteredCategories.map((category) => ({
                  id: String(category.id),
                  label: category.eng,
                }))}
                value={formState.category_id}
                onChange={(value) => setField("category_id", value as string)}
                placeholder="Select a category"
                disabled={isLoadingCategories}
                className={validationErrors.category_id ? "border-red-500" : ""}
              />
              {validationErrors.category_id && (
                <p className="text-sm text-red-500">
                  {validationErrors.category_id}
                </p>
              )}
            </div>

            {/* Subcategory Selection (conditional) - replaced with SelectOne */}
            {showSubcategory && (
              <div className="space-y-2">
                <Label htmlFor="subCategory">
                  Closure Sub-Category <span className="text-red-500">*</span>
                </Label>
                <SelectOne
                  options={closureSubCategories.map((subCategory) => ({
                    id: String(subCategory.id),
                    label: subCategory.eng,
                  }))}
                  value={formState.subcategory_id}
                  onChange={(value) =>
                    setField("subcategory_id", value as string)
                  }
                  placeholder="Select a sub-category"
                  disabled={isLoadingSubCategories}
                  className={
                    validationErrors.subcategory_id ? "border-red-500" : ""
                  }
                />
                {validationErrors.subcategory_id && (
                  <p className="text-sm text-red-500">
                    {validationErrors.subcategory_id}
                  </p>
                )}
              </div>
            )}

            {/* Affected Areas - keeping SelectMany since this needs multiple selection */}
            <div className="space-y-2">
              <Label htmlFor="affectArea">
                Closure Affect Area <span className="text-red-500">*</span>
              </Label>
              <SelectMany
                options={closureAffectAreas.map((area) => ({
                  id: String(area.id),
                  label: area.eng,
                }))}
                value={formState.affectArea}
                onChange={(value) => setField("affectArea", value)}
                placeholder="Select affected areas"
                disabled={isLoadingAffectAreas}
                className={validationErrors.affectArea ? "border-red-500" : ""}
              />
              {validationErrors.affectArea && (
                <p className="text-sm text-red-500">
                  {validationErrors.affectArea}
                </p>
              )}
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">
                Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                value={formState.remark}
                onChange={(e) => setField("remark", e.target.value)}
                className={validationErrors.remark ? "border-red-500" : ""}
              />
              {validationErrors.remark && (
                <p className="text-sm text-red-500">
                  {validationErrors.remark}
                </p>
              )}
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="attachment">
                Attachment <span className="text-red-500">*</span>
              </Label>
              <FileUpload
                ref={fileUploadRef}
                maxFiles={6}
                acceptedFileTypes=".pdf,.jpg,.jpeg,.png"
                maxSizeInMB={2}
                buttonText="Choose File"
                onFilesSelected={handleAttachmentsChange}
                multiple={true}
                existingFiles={formattedExistingFiles}
                onExistingFilesChange={(files) =>
                  handleExistingAttachmentsChange(files, SUPABASE_URL)
                }
                className={validationErrors.attachment ? "border-red-500" : ""}
              />
              {validationErrors.attachment && (
                <p className="text-sm text-red-500">
                  {validationErrors.attachment}
                </p>
              )}
            </div>

            {/* Form Buttons */}
            <DialogFooter className="flex justify-between sm:justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isSubmitting}
              >
                Clear form
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleSubmitAsDraft}
                // disabled={isSubmitting || ((isTPUser || isSuperAdmin) && !formState.selectedSiteId)}
                disabled={isSubmitting}
              >
                {isSubmitting && activeSubmission === "draft"
                  ? editData?.id
                    ? "Updating..."
                    : "Saving..."
                  : editData?.id
                  ? "Update Draft"
                  : "Save as Draft"}
              </Button>
              <Button
                type="submit"
                // disabled={isSubmitting || ((isTPUser || isSuperAdmin) && !formState.selectedSiteId)}
                disabled={isSubmitting}
              >
                {isSubmitting && activeSubmission === "submit"
                  ? "Submitting..."
                  : "Submit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title="Confirm Submission"
        description={
          <div className="space-y-2">
            <p>Are you sure you want to submit this site closure request?</p>
            <p>Once submitted, you cannot edit the request.</p>
            <p className="text-sm text-muted-foreground">
              Tip: You can save as draft first if you're not ready to submit.
            </p>
          </div>
        }
        cancelText="Cancel"
        confirmText="Yes, Submit"
        onConfirm={processSubmit}
        onCancel={() => setShowConfirmDialog(false)}
      />
    </>
  );
};

export default SiteClosureForm;
