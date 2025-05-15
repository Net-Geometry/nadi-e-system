import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { useState, FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { ClaimApplicationForm } from "./form/ClaimApplicationForm";
import { useMultistepFormClaim } from "./hook/useMultipleFormClaim";
import useGeoData from "@/hooks/use-geo-data";
import { ClaimRequestForm } from "./form/ClaimRequestForm";
import useClaimCategorySimple from "./hook/use-claim-categoy-simple";
import { insertClaimData } from "./hook/insert-claim";

type FileData = {
  name: string; // File name
  url: string;  // File URL or path
};

type FormData = {
  tp_dusp_id: string;
  dusp_name: string;
  tp_name: string;
  phase_id: string;
  refid_mcmc: string;
  claim_status: boolean | string | null;
  year: string;
  quarter: string;
  month: string;
  ref_no: string;
  payment_status: boolean;

  category_id: string;
  item_id: string;
  status_item: boolean | string | null;
  request_remark: string;
  need_support_doc: boolean | string | null;
  need_summary_report: boolean | string | null;
  claim_type_id_support: string;
  file_path_support: FileData[]; // Changed to an array of objects
  claim_type_id_summary: string;
  file_path_summary: FileData[]; // Changed to an array of objects
};


const INITIAL_DATA: FormData = {
  tp_dusp_id: null,
  dusp_name: null,
  tp_name: null,
  phase_id: null,
  refid_mcmc: null,
  claim_status: "1",
  year: new Date().getFullYear().toString(), // Set the current year as the default value
  quarter: null,
  month: null,
  ref_no: null,
  payment_status: false,

  category_id: null,
  item_id: null,
  status_item: false,
  request_remark: null,
  need_support_doc: false,
  need_summary_report: false,
  claim_type_id_support: "1",
  file_path_support: [], // Empty array of objects
  claim_type_id_summary: "2",
  file_path_summary: [], // Empty array of objects
};

const ClaimFormDialog = ({
  isOpen,
  onClose,
  organizationId,
  tpName,
  duspName,
}: {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string | null;
  tpName: string | null;
  duspName: string | null;
}) => {
  const [data, setData] = useState({
    ...INITIAL_DATA,
    tp_dusp_id: organizationId || "", // Set organizationId as the default value for tp_dusp_id
    tp_name: tpName || "", // Set tpName as the default value for tp_name
    dusp_name: duspName || "", // Set duspName as the default value for dusp_name
  });

  const { categories, items, fetchItemsByCategory, error } = useClaimCategorySimple(); // Use the hook
  const { phases } = useGeoData();

  const [loading, setLoading] = useState(false); // Add loading state
  const { toast } = useToast();

  function updateFields(fields: Partial<FormData>) {
    setData((prev) => ({ ...prev, ...fields }));
  }

  const showValidationError = (description: string) => {
    toast({
      title: "Validation Error",
      description,
      variant: "destructive",
    });
  };

  const { currentStepIndex, step, isFirstStep, isLastStep, back, next, reset } = useMultistepFormClaim([
    <ClaimApplicationForm  {...data} updateFields={updateFields} phases={phases} />,
    <ClaimRequestForm
      {...data}
      updateFields={updateFields}
      categories={categories} // Pass categories
      items={items} // Pass items
      fetchItemsByCategory={fetchItemsByCategory} // Pass fetch function
    />,
  ]);

  const steps = [
    { label: "Claim Application", validate: () => data.tp_dusp_id && data.refid_mcmc },
    { label: "Attachment", validate: () => data.tp_dusp_id && data.refid_mcmc },
  ];

  function isStepComplete(index: number) {
    return steps[index].validate();
  }

  const handleNext = async () => {
    if (currentStepIndex === 0) {
      if (!data.tp_dusp_id) return showValidationError("Organization is required.");
      if (!data.phase_id) return showValidationError("Phases is required.");
      if (!data.year) return showValidationError("Year is required.");
      if (!data.month) return showValidationError("Month is required.");
    }

    if (currentStepIndex === 1) {
      if (!data.category_id) return showValidationError("Category is required.");
      if (!data.item_id) return showValidationError("Item is required.");
      if (data.need_summary_report) {
        if (!data.file_path_summary || data.file_path_summary.length === 0) {
          return showValidationError("Summary Report is required.");
        }
      }
      if (data.need_support_doc) {
        if (!data.file_path_support || data.file_path_support.length === 0) {
          return showValidationError("Support Document is required.");
        }
      }
    }

    if (!isLastStep) {
      next();
    } else {
      try {
        setLoading(true); // Start loading
        await insertClaimData(data); // Call the insertClaimData function
        toast({
          title: "Success",
          description: "The new member has been successfully registered.",
          variant: "default",
        });
        setData(INITIAL_DATA);
        reset();
        onClose();
      } catch (error: any) {
        console.error("Error saving data:", error);
        toast({
          title: "Error",
          description: "Failed to save data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false); // Stop loading
      }
    }
  };


  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        setData(INITIAL_DATA); // Reset the form data
        reset(); // Reset the multistep form (if applicable)
        onClose(); // Call the original onClose function
      }}
    >
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        {loading && (
          <div className="absolute inset-0 bg-white/70 z-50 flex items-center justify-center">
            <Loader2 className="animate-spin w-10 h-10 text-primary" />
            <span className="ml-3 text-lg font-semibold">Registering...</span>
          </div>
        )}
        <DialogHeader>
          <DialogTitle className="text-2xl mb-2">Add New Member</DialogTitle>
          <div className="flex bg-muted rounded-lg overflow-hidden">
            {steps.map((step, index) => {
              const isActive = currentStepIndex === index;
              const isCompleted = isStepComplete(index);

              return (
                <div
                  key={index}
                  className={`flex-1 px-4 py-2 flex items-center justify-center space-x-2 text-sm transition-all 
                  ${isActive ? "bg-white font-semibold text-foreground shadow-sm dark:text-black" : "text-muted-foreground hover:bg-muted/50"}`}
                >
                  {isCompleted && <CheckCircle className="text-green-500" size={16} />}
                  <span>{step.label}</span>
                </div>
              );
            })}
          </div>
        </DialogHeader>
        <form onSubmit={(e: FormEvent) => e.preventDefault()}>
          <div >{step}</div>
          <DialogFooter className="flex justify-between w-full mt-4">
            {!isFirstStep ? (
              <Button type="button" onClick={back} variant="outline" disabled={loading}>
                Back
              </Button>
            ) : (
              <div /> // Placeholder to maintain spacing
            )}

            <Button
              type="button"
              onClick={handleNext}
            >
              {isLastStep ? "Create Draft Claim" : "Next"}
            </Button>
          </DialogFooter>

        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClaimFormDialog;