import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { updatePayment } from "./hooks/update-payment"; // Import the updatePayment hook
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DuspUpdatePaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  claim: any;
}

const DuspUpdatePaymentDialog: React.FC<DuspUpdatePaymentDialogProps> = ({ isOpen, onClose, claim }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [datePaid, setDatePaid] = useState("");
  const [remark, setRemark] = useState("");

  const handleSubmit = async () => {
    try {
      await updatePayment({
        claim_id: claim.id,
        claim_status: 4, // Set claim_status to 4
        payment_status: true,
        date_paid: datePaid,
        remark: remark,
      });
      toast({ title: "Success", description: "Payment updated successfully." });

      // Invalidate the query to refresh the ClaimList
      queryClient.invalidateQueries({ queryKey: ["claimStats"] });
      queryClient.invalidateQueries({ queryKey: ["fetchClaimDUSP"] });
      queryClient.invalidateQueries({ queryKey: ["fetchClaimById", claim.id] });

      onClose();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update payment.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Payment</DialogTitle>
          <DialogDescription className="text-muted-foreground mb-4">
            Enter date and remark
            </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center">Date Paid</Label>
            <Input
              type="date"
              className="w-full border rounded-md p-2"
              value={datePaid}
              onChange={(e) => setDatePaid(e.target.value)}
            />
          </div>

          <textarea
            className="w-full border rounded-md p-2"
            placeholder="Enter your remark..."
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DuspUpdatePaymentDialog;