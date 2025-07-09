import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { updateClaim } from "../hook/update-claim";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { generateReportByItemId } from "../hook/getGenerateReport";
import { submitClaimSummaryReports } from "./hooks/submit-claim";

interface TpSubmitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // Add success callback
  claim: any;
}

const TpSubmitDialog: React.FC<TpSubmitDialogProps> = ({ isOpen, onClose, onSuccess, claim }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [remark, setRemark] = useState("");
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // STEP 1: Generate reports for all items that need summary reports
      for (const request of claim.requests) {
        // Find the first item in this request that needs a summary report for header logic
        const firstTrueItem = request.items.find((item: any) => item.item.need_summary_report);
        const firstTrueItemId = firstTrueItem?.item.id;

        for (const requestItem of request.items) {
          const item = requestItem.item;

          // Only generate report if item needs summary report
          if (item.need_summary_report) {
            const itemId = item.id;

            const reportData = {
              claimType: claim.claim_type,
              quater: String(claim.quarter),
              startDate: claim.start_date,
              endDate: claim.end_date,
              tpFilter: claim.tp_dusp_id.id,
              phaseFilter: claim.phase_id.id,
              duspFilter: claim.tp_dusp_id.parent_id.id,
              dusplogo: claim.tp_dusp_id.parent_id.logo_url,
              nadiFilter: item.site_ids,
              header: itemId === firstTrueItemId,
            };

            try {
              const generatedFile = await generateReportByItemId(itemId, reportData);

              if (generatedFile) {
                // STEP 2: Insert attachment for the generated report
                const formData = {
                  request_id: requestItem.id,
                  claim_type: claim.claim_type,
                  year: claim.year,
                  ref_no: claim.ref_no,
                  tp_name: claim.tp_dusp_id.name,
                  dusp_name: claim.tp_dusp_id.parent_id.name,
                  summary_report_file: generatedFile,
                };

                await submitClaimSummaryReports(formData);
              }
            } catch (error) {
              console.error(`Error generating or uploading report for item ${itemId}:`, error);
              throw new Error(`Failed to generate report for item ${item.name}`);
            }
          }
        }
      }

      // STEP 3: Update claim status (original functionality)
      await updateClaim({
        claim_id: claim.id,
        claim_status: 2,
        request_remark: remark,
      });

      toast({ title: "Success", description: "Claim submitted successfully with generated reports." });

      // Invalidate the query to refresh the ClaimList
      queryClient.invalidateQueries({ queryKey: ["claimStats"] });
      queryClient.invalidateQueries({ queryKey: ["fetchClaimTP"] });
      queryClient.invalidateQueries({ queryKey: ["fetchClaimById"] });

      // Reset states and close dialog
      setRemark("");
      setIsCheckboxChecked(false);

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (error) {
      console.error("Error submitting claim:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit claim.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Don't close if loading
    if (loading) return;

    setRemark("");
    setIsCheckboxChecked(false);
    onClose();
  };

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (loading) return; // prevent closing
        if (!open) handleClose();
      }}
    >      <AlertDialogContent className="sm:max-w-[40vw] max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Submit Claim</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Provide a remark for your submission. Reports will be generated and uploaded automatically.
              </p>

              <textarea
                className="w-full border rounded-md p-2"
                placeholder="Enter your remark..."
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                rows={4}
                disabled={loading} // Disable during loading
              />

              <p className="text-sm text-gray-700 italic">
                Once submitted, the claim <span className="text-red-600">cannot</span> be edited.
              </p>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="confirm-checkbox"
                  className="mr-2"
                  checked={isCheckboxChecked}
                  onChange={(e) => setIsCheckboxChecked(e.target.checked)}
                  disabled={loading} // Disable during loading
                />
                <label htmlFor="confirm-checkbox" className="text-sm text-gray-600">
                  I understand and confirm this action
                </label>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose} disabled={loading}>
            Cancel
          </AlertDialogCancel>

          <Button
            onClick={handleSubmit}
            disabled={loading || !isCheckboxChecked || !remark.trim()}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating & Submitting...
              </div>
            ) : (
              "Submit"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default TpSubmitDialog;