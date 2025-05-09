import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface MaintenanceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: {
    id: string;
    name: string;
  } | null;
}

export const MaintenanceFormDialog = ({
  open,
  onOpenChange,
  asset,
}: MaintenanceFormDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!asset) return;

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    const maintenanceRecord = {
      asset_id: asset.id,
      maintenance_date: formData.get("maintenanceDate"),
      description: formData.get("description"),
      cost: formData.get("cost"),
      performed_by: formData.get("performedBy"),
      next_maintenance_date: formData.get("nextMaintenanceDate"),
    };

    try {
      // Insert maintenance record
      const { error: maintenanceError } = await supabase
        .from("maintenance_records")
        .insert([maintenanceRecord]);

      if (maintenanceError) throw maintenanceError;

      // Update asset status and next maintenance date
      const { error: assetError } = await supabase
        .from("assets")
        .update({
          status: "active",
          last_maintenance_date: maintenanceRecord.maintenance_date,
          next_maintenance_date: maintenanceRecord.next_maintenance_date,
        })
        .eq("id", asset.id);

      if (assetError) throw assetError;

      toast({
        title: "Maintenance recorded",
        description: "The maintenance record has been saved successfully.",
      });

      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["asset-stats"] });
      onOpenChange(false);
    } catch (error) {
      console.error("Error recording maintenance:", error);
      toast({
        title: "Error",
        description: "Failed to record maintenance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Maintenance - {asset.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="maintenanceDate">Maintenance Date</Label>
            <Input
              id="maintenanceDate"
              name="maintenanceDate"
              type="date"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost">Cost ($)</Label>
            <Input
              id="cost"
              name="cost"
              type="number"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="performedBy">Performed By</Label>
            <Input id="performedBy" name="performedBy" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nextMaintenanceDate">Next Maintenance Date</Label>
            <Input
              id="nextMaintenanceDate"
              name="nextMaintenanceDate"
              type="date"
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Record"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
