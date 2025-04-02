import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Asset } from "@/types/asset";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "../ui/button";
interface AssetDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset | null;
}

export const AssetDetailsDialog = ({
  open,
  onOpenChange,
  asset,
}: AssetDetailsDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!asset) return null;

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

  const requestDate = asset.created_at ? asset.created_at.split("T")[0] : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[60vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Asset Details</DialogTitle>
        </DialogHeader>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 space-y-4">
            <div className="flex flex-col gap-2">
              <span className="font-semibold">Item Name</span>
              <span>{asset.name}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold">Quantity</span>
              <span>{asset.qty_unit}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold">Request Date</span>
              <span>{requestDate}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold">Requested By</span>
              {/* TODO: Created By */}
              <span>{asset.created_by}</span>
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <div className="flex flex-col gap-2">
              <span className="font-semibold">Type</span>
              <span>{asset.type.name}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold">Nadi Center</span>
              <span>{asset.location_id}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold">Status</span>
              {/* TODO: Status */}
              <span>{asset.is_active ? "Final" : "Draft"}</span>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          {asset.is_active && (
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
          {!asset.is_active && (
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
