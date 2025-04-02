import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Inventory } from "@/types/inventory";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "../ui/button";
interface InventoryDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventory: Inventory | null;
}

export const InventoryDetailsDialog = ({
  open,
  onOpenChange,
  inventory,
}: InventoryDetailsDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!inventory) return null;

  // TODO: Submit to DUSP
  const handleSubmitToDusp = async () => {
    return new Error("Function not implemented.");
  };

  const handleSubmitForApproval = async () => {
    return new Error("Function not implemented.");
  };

  const handleApprove = async () => {
    return new Error("Function not implemented.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[60vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Inventory Details</DialogTitle>
        </DialogHeader>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 space-y-4">
            <div className="flex flex-col gap-2">
              <span className="font-semibold">Item Name</span>
              <span>{inventory.name}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold">Quantity</span>
              <span>{inventory.quantity}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold">Request Date</span>
              <span>{inventory.created_at}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold">Requested By</span>
              {/* TODO: Created By */}
              <span>{inventory.created_by}</span>
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <div className="flex flex-col gap-2">
              <span className="font-semibold">Type</span>
              <span>{inventory.type.name}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold">Nadi Center</span>
              <span>{"TODO"}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold">Status</span>
              {/* TODO: Status */}
              <span>{"Draft"}</span>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="default"
            onClick={() => {
              handleSubmitToDusp();
            }}
          >
            Submit to DUSP
          </Button>
          {/* {inventory.is_active && (
            <Button
              type="button"
              variant="default"
              onClick={() => {
                handleSubmitToDusp();
              }}
            >
              Submit to DUSP
            </Button>
          )}
          {!inventory.is_active && (
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  handleSubmitForApproval();
                }}
              >
                Submit for Approval
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={() => {
                  handleApprove();
                }}
              >
                Approve
              </Button>
            </div>
          )} */}
        </div>
      </DialogContent>
    </Dialog>
  );
};
