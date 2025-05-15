import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useInsertSiteClosureData, useUpdateSiteClosureData } from './submit-siteclosure-data';

type FormData = {
  remark: string;
  close_start: string;
  close_end: string;
  start_time: string;
  end_time: string;
  category_id: string;
  subcategory_id: string;
  affectArea: string[];
  session: string;
  status: string;
  selectedSiteId?: string; // Add selectedSiteId to form data
};

type ValidationErrors = {
  close_start?: string;
  close_end?: string;
  session?: string;
  start_time?: string;
  end_time?: string;
  category_id?: string;
  subcategory_id?: string;
  remark?: string;
  affectArea?: string;
  selectedSiteId?: string; // Add validation error for site selection
  attachment?: string; // Add validation error for attachment
};

type SubmissionType = "draft" | "submit" | null;

// Add this interface to define the validation context
interface ValidationContext {
  showSubcategory?: boolean;
  isDateRangeValid?: boolean;
  showTimeInputs?: boolean;
}

export const useSiteClosureForm = (
  siteId: string,
  siteCode: string,
  editData: any,
  isSuperAdmin: boolean,
  onSuccess?: () => void,
  onOpenChange?: (open: boolean) => void
) => {
  const { toast } = useToast();
  const { insertSiteClosureData, loading: isInserting } = useInsertSiteClosureData();
  const { updateSiteClosureData, loading: isUpdating } = useUpdateSiteClosureData();
  
  // Combined loading state
  const isSubmitting = isInserting || isUpdating;
    // Form state
  const [formState, setFormState] = useState<FormData>({
    remark: "",
    close_start: "",
    close_end: "",
    start_time: "",
    end_time: "",
    category_id: "",
    subcategory_id: "",
    affectArea: [],
    session: "",
    status: "2", // Default status is 2 for submit
    selectedSiteId: siteId || undefined, // Initialize selectedSiteId with siteId for Staff/Site users
  });
  
  // Validation errors
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  
  // File handling state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<string[]>([]);
  const [originalAttachments, setOriginalAttachments] = useState<string[]>([]);
  const [wasFormCleared, setWasFormCleared] = useState(false);
  
  // Submission state
  const [activeSubmission, setActiveSubmission] = useState<SubmissionType>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Initialize or reset form based on whether we're editing
  useEffect(() => {
    console.log("Setting form state based on editData:", editData ? "editing" : "new form");
    
    // Reset all state first to avoid any lingering values
    setSelectedFiles([]);
    setWasFormCleared(false);
    setValidationErrors({});
    
    if (editData) {
      // Populate form for editing
      setFormState({
        remark: editData.remark || "",
        close_start: editData.close_start || "",
        close_end: editData.close_end || "",
        start_time: editData.start_time || "",
        end_time: editData.end_time || "",
        category_id: editData.category_id || "",
        subcategory_id: editData.subcategory_id || "",
        affectArea: editData.affectArea || [],
        session: editData.session || "",
        status: "1", // Keep as draft
        selectedSiteId: editData.selectedSiteId || undefined, // Populate selectedSiteId
      });
      
      // Set attachment states
      if (editData.existingAttachments && Array.isArray(editData.existingAttachments)) {
        console.log("Setting existing attachments:", editData.existingAttachments.length);
        setExistingAttachments([...editData.existingAttachments]);
        setOriginalAttachments([...editData.existingAttachments]);
      } else {
        console.log("No existing attachments found in edit data");
        setExistingAttachments([]);
        setOriginalAttachments([]);
      }    } else {
      // Initialize empty form for new request
      console.log("Initializing empty form for new request");
      setFormState({
        remark: "",
        close_start: "",
        close_end: "",
        start_time: "",
        end_time: "",
        category_id: "",
        subcategory_id: "",
        affectArea: [],
        session: "",
        status: "2", // Default status is 2 for submit
        selectedSiteId: siteId || undefined, // Initialize selectedSiteId with siteId for Staff/Site users
      });
      
      // Clear attachment states
      setExistingAttachments([]);
      setOriginalAttachments([]);
    }
  }, [editData]);

  const setField = useCallback((field: string, value: any) => {
    setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    setFormState(prevState => ({ ...prevState, [field]: value }));
  }, []);
  
  const isDateWithinAllowedRange = useCallback((dateString: string) => {
    if (!dateString || isSuperAdmin) return true;
    
    const selectedDate = new Date(dateString);
    selectedDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const oneWeekFromToday = new Date();
    oneWeekFromToday.setDate(today.getDate() + 6); // 6 days ahead for a total of 7 days including today
    oneWeekFromToday.setHours(23, 59, 59, 999); // End of the 7th day
    
    // Make sure the selected date is NOT after the 1-week limit
    return selectedDate <= oneWeekFromToday;
  }, [isSuperAdmin]);

  const handleDateChange = useCallback((field: string, value: string) => {
    if (field === "close_start" && value === "" && formState.close_end) {
      setFormState(prev => ({
        ...prev,
        close_start: "",
        close_end: "",
      }));
    } else {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
      setFormState(prevState => ({ ...prevState, [field]: value }));
      
      if (field === "close_start" && !isDateWithinAllowedRange(value)) {
        setValidationErrors(prev => ({
          ...prev,
          close_start: "Closure date cannot be more than 1 week in advance"
        }));
      }
    }
  }, [formState.close_end, isDateWithinAllowedRange]);

  const validateForm = useCallback((context: ValidationContext = {}) => {
    const errors: ValidationErrors = {};
    
    console.log("Validating form state:", formState);
    // Basic validations that always apply
    if (!formState.close_start) {
      errors.close_start = "Start date is required";
    } else if (!isSuperAdmin && !isDateWithinAllowedRange(formState.close_start)) {
      errors.close_start = "Start date cannot be more than 1 week in advance";
    }
    
    console.log("Validating close_end:", formState.close_end);
    if (!formState.close_end) {
      errors.close_end = "End date is required";
    }
    
    console.log("Validating close_start:", formState.close_start);
    // Check if date range is valid before validating session
    // Use the provided context or determine it here
    const isDateRangeValid = context.isDateRangeValid !== undefined 
      ? context.isDateRangeValid 
      : formState.close_start && formState.close_end && 
        new Date(formState.close_start) <= new Date(formState.close_end);
    
    if (isDateRangeValid && !formState.session) {
      errors.session = "Session is required";
    }
    
    console.log("Validating session:", formState.session);
    // Use the provided context for time inputs or determine it here
    const showTimeInputs = context.showTimeInputs !== undefined
      ? context.showTimeInputs
      : formState.session && !["1", "4"].includes(formState.session);
    
      console.log("Show time inputs:", showTimeInputs);
    // Only validate time fields if time inputs should be shown
    if (showTimeInputs) {
      if (!formState.start_time) {
        errors.start_time = "Start time is required";
      }
      
      if (!formState.end_time) {
        errors.end_time = "End time is required";
      }
    }
    
    console.log("Validating category_id:", formState.category_id);
    // Category is always required
    if (!formState.category_id) {
      errors.category_id = "Category is required";
    }
    
    // Only validate subcategory if it's needed based on selected category
    const needsSubcategory = context.showSubcategory !== undefined
      ? context.showSubcategory
      : formState.category_id === "6"; // Default logic if context not provided
      
    console.log("Needs subcategory:", needsSubcategory);
    if (needsSubcategory && !formState.subcategory_id) {
      errors.subcategory_id = "Sub-category is required";
    }
    
    console.log("Validating remark:", formState.remark);
    // Always required fields
    if (!formState.remark) {
      errors.remark = "Reason is required";
    }
    
    console.log("Validating affected areas:", formState.affectArea);
    if (!formState.affectArea.length) {
      errors.affectArea = "At least one affected area must be selected";
    }
    
    console.log("Validating selectedSiteId:", formState.selectedSiteId);
    // Check for site selection
    if (!formState.selectedSiteId) {
      errors.selectedSiteId = "Site selection is required";
    }
    
    console.log("Validating attachments:", selectedFiles.length, existingAttachments.length);
    // Check if attachments are provided - make attachment required
    if (selectedFiles.length === 0 && existingAttachments.length === 0) {
      errors.attachment = "At least one attachment is required";
    }
    
    setValidationErrors(errors);
    
    return Object.keys(errors).length === 0;
  }, [formState, isSuperAdmin, isDateWithinAllowedRange, selectedFiles, existingAttachments]);
  const resetForm = useCallback(() => {
    setFormState({
      remark: "",
      close_start: "",
      close_end: "",
      start_time: "",
      end_time: "",
      category_id: "",
      subcategory_id: "",
      affectArea: [],
      session: "",
      status: "2",
      selectedSiteId: siteId || undefined, // Retain siteId for Staff/Site users
    });
    setValidationErrors({});
    setSelectedFiles([]);
    
    // Track if we're clearing an edit form with existing attachments
    if (editData?.id && existingAttachments.length > 0) {
      setWasFormCleared(true);
    }
    
    setExistingAttachments([]);
  }, [editData?.id, existingAttachments.length, siteId]);
  const cleanupFormState = useCallback(() => {
    console.log("Cleaning up form state after successful submission");
    setFormState({
      remark: "",
      close_start: "",
      close_end: "",
      start_time: "",
      end_time: "",
      category_id: "",
      subcategory_id: "",
      affectArea: [],
      session: "",
      status: "2", // Reset to default status
      selectedSiteId: siteId || undefined, // Retain siteId for Staff/Site users
    });
    setValidationErrors({});
    setSelectedFiles([]);
    setExistingAttachments([]);
    setOriginalAttachments([]);
    setWasFormCleared(false);
    setActiveSubmission(null);
    setShowConfirmDialog(false);
  }, [siteId]);

  const handleSubmitAsDraft = useCallback(async () => {
    setActiveSubmission("draft");
    setFormState(prev => ({ ...prev, status: "1" }));
    
    // Use the selectedSiteId from formState if available (for TP/SuperAdmin users)
    const effectiveSiteId = formState.selectedSiteId || siteId;
    
    const formData = { 
      site_id: effectiveSiteId, 
      ...formState, 
      status: "1",
      ...(editData?.id ? { 
        id: editData.id,
        existingAttachments: existingAttachments,
        originalAttachments: originalAttachments,
        wasFormCleared: wasFormCleared
      } : {})
    };
    
    try {
      const operation = editData?.id 
        ? updateSiteClosureData(formData, selectedFiles, siteCode)
        : insertSiteClosureData(formData, selectedFiles, siteCode);
      
      const result = await operation;
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Site closure saved as draft successfully."
        });
        cleanupFormState(); // Add this line to reset form state
        if (onSuccess) onSuccess();
        if (onOpenChange) onOpenChange(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      toast({
        title: "Error",
        description: "An error occurred while saving the draft.",
        variant: "destructive",
      });
    } finally {
      setActiveSubmission(null);
    }
  }, [
    siteId, formState, editData?.id, existingAttachments, originalAttachments,
    wasFormCleared, selectedFiles, siteCode, updateSiteClosureData,
    insertSiteClosureData, toast, onSuccess, onOpenChange, cleanupFormState // Add cleanupFormState to dependency array
  ]);

  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setShowConfirmDialog(true);
  }, [validateForm, toast]);

  const processSubmit = useCallback(async () => {
    setActiveSubmission("submit");
    setFormState(prev => ({ ...prev, status: "2" }));

    try {
      let result;
      
      // Use the selectedSiteId from formState if available (for TP/SuperAdmin users)
      const effectiveSiteId = formState.selectedSiteId || siteId;
      
      if (editData?.id) {
        const closureData = { 
          site_id: effectiveSiteId, 
          ...formState, 
          status: "2", 
          id: editData.id,
          existingAttachments: existingAttachments,
          originalAttachments: originalAttachments,
          wasFormCleared: wasFormCleared
        };
        result = await updateSiteClosureData(closureData, selectedFiles, siteCode);
      } else {
        const closureData = { site_id: effectiveSiteId, ...formState, status: "2" };
        result = await insertSiteClosureData(closureData, selectedFiles, siteCode);
      }

      if (result.success) {
        toast({
          title: "Success",
          description: "Site closure submitted successfully.",
        });
        cleanupFormState(); // Add this line to reset form state
        if (onSuccess) onSuccess();
        if (onOpenChange) onOpenChange(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error submitting site closure:", error);
      toast({
        title: "Error",
        description: "An error occurred while submitting the site closure.",
        variant: "destructive",
      });
    } finally {
      setActiveSubmission(null);
    }
  }, [
    siteId, formState, editData?.id, existingAttachments, originalAttachments, 
    wasFormCleared, selectedFiles, siteCode, updateSiteClosureData, 
    insertSiteClosureData, toast, onSuccess, onOpenChange, cleanupFormState // Add cleanupFormState to dependency array
  ]);

  const handleAttachmentsChange = useCallback((files: File[]) => {
    setSelectedFiles(files);
  }, []);

  const handleExistingAttachmentsChange = useCallback((updatedAttachments: Array<{url: string, name: string}>, supabaseUrl: string) => {
    const updatedPaths = updatedAttachments.map(file => 
      file.url.startsWith(supabaseUrl) ? file.url.substring(supabaseUrl.length) : file.url
    );
    setExistingAttachments(updatedPaths);
  }, []);

  const resetCleanupFlags = useCallback(() => {
    setWasFormCleared(false);
  }, []);
  const cleanupState = useCallback(() => {
    console.log("Cleaning up form state completely");
    setFormState({
      remark: "",
      close_start: "",
      close_end: "",
      start_time: "",
      end_time: "",
      category_id: "",
      subcategory_id: "",
      affectArea: [],
      session: "",
      status: "2",
      selectedSiteId: siteId || undefined, // Retain siteId for Staff/Site users
    });
    setValidationErrors({});
    setSelectedFiles([]);
    setExistingAttachments([]);
    setOriginalAttachments([]);
    setWasFormCleared(false);
    setActiveSubmission(null);
    setShowConfirmDialog(false);
  }, [siteId]);

  return {
    formState,
    setFormState,
    setField,
    validationErrors,
    isSubmitting,
    activeSubmission,
    selectedFiles,
    existingAttachments,
    wasFormCleared,
    showConfirmDialog,
    handleDateChange,
    validateForm,
    resetForm,
    handleSubmitAsDraft,
    handleFormSubmit,
    processSubmit,
    handleAttachmentsChange,
    handleExistingAttachmentsChange,
    resetCleanupFlags,
    setShowConfirmDialog,
    cleanupState,
    cleanupFormState, // Expose this function
  };
};
