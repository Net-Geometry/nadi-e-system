import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { useState, FormEvent, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useMultistepFormClaim } from "../hook/useMultipleFormClaim";
import { ClaimDateForm } from "../form/ClaimDateForm";
import { ClaimApplicationForm } from "../form/ClaimApplicationForm";
import { insertClaimData } from "./hooks/insert-claim";
import { useNavigate } from "react-router-dom";
import { useDuspTpData } from "../hook/use-claim-data";
import { ClaimAttachmentForm } from "../form/ClaimAttachmentForm";


type CategoryData = {
  id: number;
  name: string;
  item_ids: {
    id: number;
    name: string;
    need_support_doc: boolean;
    need_summary_report: boolean;
    summary_report_file: File | null; // New state for the support document
    suppport_doc_file: File[] | null; // New state for the summary report
    status_item: boolean;
    remark: string;
    site_ids: number[];
  }[];
}

type FormData = {
  claim_type: string;
  year: number;
  quarter: number;
  month: number;
  ref_no: string;
  tp_dusp_id: string;
  tp_name: string;
  dusp_name: string;

  phase_id: number;
  category_ids: CategoryData[];
  is_finished_generate: boolean;


};

const INITIAL_DATA: FormData = {
  claim_type: "",
  year: new Date().getFullYear(),
  quarter: null,
  month: null,
  ref_no: "",
  tp_dusp_id: null,
  tp_name: "",
  dusp_name: "",

  phase_id: null,
  category_ids: [], // Initialize as empty array
  is_finished_generate: false,
};

const ClaimFormPage = () => {

  const { duspTpData, isLoading, error } = useDuspTpData();
  const [data, setData] = useState({
    ...INITIAL_DATA,
    tp_name: "", // Initialize as empty
    dusp_name: "", // Initialize as empty
    tp_dusp_id: "", // Initialize as null
  });

  const [loading, setLoading] = useState(false); // Add loading state
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (duspTpData) {
      setData((prev) => ({
        ...prev,
        tp_name: duspTpData.name,
        dusp_name: duspTpData.parent_id?.name,
        tp_dusp_id: duspTpData.id,
      }));
    }
  }, [duspTpData]);

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
    <ClaimDateForm {...data} updateFields={updateFields} />,
    <ClaimApplicationForm {...data} updateFields={updateFields} />,
    <ClaimAttachmentForm {...data} updateFields={updateFields} />,
  ]);

  const steps = [
    { label: "Initialization", validate: () => data.claim_type && data.ref_no },
    { label: "Claim Application", validate: () => data.phase_id },
    { label: "Reports and Attachments", validate: () => data.category_ids.length > 0 && data.is_finished_generate },
  ];

  function isStepComplete(index: number) {
    return steps[index].validate();
  }

  const handleNext = async () => {
    if (currentStepIndex === 0) {
      if (!data.claim_type) {
        showValidationError("Claim type is required");
        return;
      }
      if (!data.year) {
        showValidationError("Year is required");
        return;
      }
      if (!data.year) {
        showValidationError("Year is required");
        return;
      }
      if (data.claim_type === "QUARTERLY") {
        if (!data.quarter) {
          showValidationError("Quarter is required for quarterly claims");
          return;
        }
      }
      if (data.claim_type === "MONTHLY") {
        if (!data.month) {
          showValidationError("Month is required for monthly claims");
          return;
        }
      }
      if (!data.tp_dusp_id) {
        showValidationError("TP DUSP ID is required");
        return;
      }
    }

    if (currentStepIndex === 1) {
      if (!data.phase_id) {
        showValidationError("Phase is required");
        return;
      }
    }

    if (currentStepIndex === 2) {
      if (!data.is_finished_generate) {
        showValidationError("You must finish generating all reports before proceeding.");
        return;
      }
    }


    if (!isLastStep) {
      next();
    } else {
      try {
        setLoading(true); // Start loading
        // console.log("Data to be saved:", data);
        await insertClaimData(data); // Call the insertClaimData function
        toast({
          title: "Success",
          description: "The new claim has been drafted.",
          variant: "default",
        });
        setData(INITIAL_DATA);
        reset();
        if (duspTpData) {
          setData((prev) => ({
            ...prev,
            tp_name: duspTpData.name,
            dusp_name: duspTpData.parent_id?.name,
            tp_dusp_id: duspTpData.id,
          }));
        }
        navigate("/claim/register");
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
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Claim Registration</h1>
      <Card>
        {loading && (
          <div className="absolute inset-0 bg-white/70 z-50 flex items-center justify-center">
            <Loader2 className="animate-spin w-10 h-10 text-primary" />
            <span className="ml-3 text-lg font-semibold">Registering...</span>
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Add New Claim</CardTitle>
          <p className="text-muted-foreground">Fill in the details for the new claim</p>
        </CardHeader>
        <CardContent>
          <div className="flex bg-muted rounded-lg overflow-hidden mt-4">
            {steps.map((step, index) => {
              const isActive = currentStepIndex === index;
              const isCompleted = isStepComplete(index);

              return (
                <div
                  key={index}
                  className={`flex-1 px-4 py-2 flex items-center justify-center space-x-2 text-sm transition-all border rounded-md
              ${isActive ? "bg-white font-semibold text-foreground shadow-sm dark:text-black" : "text-muted-foreground hover:bg-muted/50"}`}
                >
                  {isCompleted && <CheckCircle className="text-green-500" size={16} />}
                  <span>{step.label}</span>
                </div>
              );
            })}
          </div>
          <form onSubmit={(e: FormEvent) => e.preventDefault()} className="mt-4">
            <div>{step}</div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between w-full mt-4">
          {!isFirstStep ? (
            <Button type="button" onClick={back} variant="outline" disabled={loading}>
              Back
            </Button>
          ) : (
            <div /> // Placeholder to maintain spacing
          )}

          <Button type="button" onClick={handleNext}>
            {isLastStep ? "Create Draft Claim" : "Next"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ClaimFormPage;