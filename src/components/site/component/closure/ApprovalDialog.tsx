import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../ui/dialog";
import { Button } from "../../../ui/button";
import { Textarea } from "../../../ui/textarea";
import { Label } from "../../../ui/label";
import { Loader2, CheckCircle } from "lucide-react";

interface ApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionRemark: string;
  setActionRemark: (remark: string) => void;
  isProcessingAction: boolean;
  handleApprove: () => void;
  setSelectedForAction: (id: number | null) => void;
}

const ApprovalDialog: React.FC<ApprovalDialogProps> = ({
  open,
  onOpenChange,
  actionRemark,
  setActionRemark,
  isProcessingAction,
  handleApprove,
  setSelectedForAction,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Closure Request</DialogTitle>
          <DialogDescription>
            Please provide a remark for the approval.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="approval-remark">Approval Remark</Label>
            <Textarea
              id="approval-remark"
              placeholder="Enter your approval remarks here..."
              value={actionRemark}
              onChange={(e) => setActionRemark(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setSelectedForAction(null);
              setActionRemark("");
            }}
            disabled={isProcessingAction}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            disabled={isProcessingAction}
            className="bg-green-600 hover:bg-green-700"
          >
            {isProcessingAction ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApprovalDialog;
