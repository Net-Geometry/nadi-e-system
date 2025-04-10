import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInventories } from "@/hooks/use-inventories";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface InventoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InventoryFormDialog = ({
  open,
  onOpenChange,
}: InventoryFormDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { useInventoryTypesQuery } = useInventories();

  const {
    data: inventoryTypes = [],
    isLoading: isLoadingAssetType,
    error,
  } = useInventoryTypesQuery();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    const inventory = {
      name: formData.get("name"),
      type_id: formData.get("type"),
    };

    try {
      console.log("Creating new inventory:", inventory);
      const { error } = await supabase.from("nd_inventory").insert([inventory]);

      if (error) throw error;

      toast({
        title: "Inventory added successfully",
        description: "The new inventory has been added to the system.",
      });

      queryClient.invalidateQueries({ queryKey: ["inventories"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-stats"] });
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding inventory:", error);
      toast({
        title: "Error",
        description: "Failed to add the inventory. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingAssetType) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        Loading...
      </Dialog>
    );
  }

  if (error) {
    console.error("Error fetching inventory types:", error);
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        Failed to load inventory types
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2/3">
        <DialogHeader>
          <DialogTitle>Add New Inventory</DialogTitle>
          <DialogDescription>
            Fill in the details below to register a new inventory
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Inventory Name</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="Enter inventory name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Inventory Type</Label>
            <Select name="type" required>
              <SelectTrigger>
                <SelectValue placeholder="Select inventory type" />
              </SelectTrigger>
              <SelectContent>
                {inventoryTypes.map((type, index) => (
                  <SelectItem key={index} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Adding..." : "Add Inventory"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
