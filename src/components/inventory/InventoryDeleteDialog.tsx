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
import { InventoryFormDialogProps } from "./InventoryFormDialog";

export const InventoryDeleteDialog = ({
  open,
  onOpenChange,
  inventory,
}: InventoryFormDialogProps) => {
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const handleDialogClose = () => {
    onOpenChange(false);
    setDeleteConfirmation("");
  };

  const confirmDelete = async () => {
    if (deleteConfirmation !== "DELETE") return;
    if (!inventory) return;
    try {
      const { error } = await supabase
        .from("nd_inventory")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", inventory.id);
      if (error) throw error;

      toast({
        title: "Inventory deleted",
        description: `The inventory has been successfully deleted.`,
      });
    } catch (error) {
      console.error("Failed to delete inventory:", error);
      toast({
        title: "Error",
        description: "Failed to delete the inventory. Please try again.",
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
          <DialogTitle>Confirm Deletion [{inventory?.name}]</DialogTitle>
        </DialogHeader>
        <div>
          Are you sure you want to delete this inventory? Type "DELETE" to
          confirm.
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
