import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Asset } from "@/types/asset";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
interface MaintenanceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset | null;
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
      <DialogContent className="w-full">
        <DialogHeader>
          <DialogTitle>Create New Maintenance Request</DialogTitle>
          <DialogDescription>
            Fill in the details for the new maintenance request
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-4">
            <Label className="font-bold text-right w-32" htmlFor="asset">
              Asset
            </Label>
            <Input
              id="asset"
              name="asset"
              value={asset.name}
              readOnly
              className="w-72 cursor-not-allowed"
            />
          </div>

          <div className="flex items-center space-x-4">
            <Label className="font-bold text-right w-32" htmlFor="type">
              Type
            </Label>
            <Select name="type" required>
              <SelectTrigger className="w-72">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key={0} value="1">
                  Preventive
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-4">
            <Label className="font-bold text-right w-32" htmlFor="description">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              required
              className="w-72"
            />
          </div>

          <div className="flex items-center space-x-4">
            <Label className="font-bold text-right w-32" htmlFor="priority">
              Priority
            </Label>
            <Select name="priority" required>
              <SelectTrigger className="w-72">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key={0} value="1">
                  High
                </SelectItem>
                <SelectItem key={1} value="2">
                  Medium
                </SelectItem>
                <SelectItem key={2} value="3">
                  Low
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-4">
            <Label className="font-bold text-right w-32" htmlFor="location">
              Location
            </Label>
            <Input id="location" name="location" required className="w-72" />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
