import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { updateClaim } from "../hook/update-claim"; // Import the update function
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface TpSubmitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  claim: any;
}

const TpSubmitDialog: React.FC<TpSubmitDialogProps> = ({ isOpen, onClose, claim }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [remark, setRemark] = useState("");

  const handleSubmit = async () => {
    try {
      await updateClaim({
        claim_id: claim.id,
        claim_status: 2,
        request_remark: remark,
      });
      toast({ title: "Success", description: "Claim submitted successfully." });

      // Invalidate the query to refresh the ClaimList
      queryClient.invalidateQueries({ queryKey: ["claimStats"] });
      queryClient.invalidateQueries({ queryKey: ["fetchClaimTP"] });
      queryClient.invalidateQueries({ queryKey: ["fetchClaimById", claim.id] });

      onClose();
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit claim.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Claim</DialogTitle>
          <DialogDescription className="text-muted-foreground mb-4">
            Provide a remark for your submission.
          </DialogDescription>
        </DialogHeader>
        <textarea
          className="w-full border rounded-md p-2"
          placeholder="Enter your remark..."
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
        />
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

export default TpSubmitDialog;