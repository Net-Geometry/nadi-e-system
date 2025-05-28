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
import { Loader2, XCircle } from "lucide-react";

interface RejectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionRemark: string;
  setActionRemark: (remark: string) => void;
  isProcessingAction: boolean;
  handleReject: () => void;
  setSelectedForAction: (id: number | null) => void;
}

const RejectionDialog: React.FC<RejectionDialogProps> = ({
  open,
  onOpenChange,
  actionRemark,
  setActionRemark,
  isProcessingAction,
  handleReject,
  setSelectedForAction,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Closure Request</DialogTitle>
          <DialogDescription>
            Please provide a reason for the rejection.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="rejection-remark">
              Rejection Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="rejection-remark"
              placeholder="Enter your rejection reason here..."
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
            onClick={handleReject}
            disabled={isProcessingAction || !actionRemark.trim()}
            variant="destructive"
          >
            {isProcessingAction ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RejectionDialog;
