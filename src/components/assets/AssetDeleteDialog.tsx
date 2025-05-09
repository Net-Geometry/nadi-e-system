import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { AssetFormDialogProps } from "./AssetFormDialog";

export const AssetDeleteDialog = ({
  open,
  onOpenChange,
  asset,
}: AssetFormDialogProps) => {
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const handleDialogClose = () => {
    onOpenChange(false);
    setDeleteConfirmation("");
  };

  const confirmDelete = async () => {
    if (deleteConfirmation !== "DELETE") return;
    if (!asset) return;
    try {
      const { error } = await supabase
        .from("nd_asset")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", asset.id);
      if (error) throw error;

      toast({
        title: "Asset deleted",
        description: `The asset has been successfully deleted.`,
      });
    } catch (error) {
      console.error("Failed to delete asset:", error);
      toast({
        title: "Error",
        description: "Failed to delete the asset. Please try again.",
        variant: "destructive",
      });
    } finally {
      onOpenChange(false);
      setDeleteConfirmation("");
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion [{asset?.name}]</DialogTitle>
        </DialogHeader>
        <div>
          Are you sure you want to delete this asset? Type "DELETE" to confirm.
        </div>
        <input
          type="text"
          value={deleteConfirmation}
          onChange={(e) => setDeleteConfirmation(e.target.value)}
          className="mt-2 p-2 border rounded"
          placeholder="DELETE"
        />
        <DialogFooter>
          <Button variant="outline" onClick={handleDialogClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={confirmDelete}
            disabled={deleteConfirmation !== "DELETE"}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
