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
import { useAssets } from "@/hooks/use-assets";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface AssetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AssetFormDialog = ({
  open,
  onOpenChange,
}: AssetFormDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { useAssetTypesQuery } = useAssets();

  const {
    data: assetTypes = [],
    isLoading: isLoadingAssetType,
    error,
  } = useAssetTypesQuery();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    const asset = {
      name: formData.get("name"),
      type_id: formData.get("type"),
    };

    try {
      console.log("Creating new asset:", asset);
      const { error } = await supabase.from("nd_asset").insert([asset]);

      if (error) throw error;

      toast({
        title: "Asset added successfully",
        description: "The new asset has been added to the system.",
      });

      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["asset-stats"] });
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding asset:", error);
      toast({
        title: "Error",
        description: "Failed to add the asset. Please try again.",
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
    console.error("Error fetching asset types:", error);
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        Failed to load asset types
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2/3">
        <DialogHeader>
          <DialogTitle>Add New Asset</DialogTitle>
          <DialogDescription>
            Fill in the details below to register a new asset
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Asset Name</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="Enter asset name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Asset Type</Label>
            <Select name="type" required>
              <SelectTrigger>
                <SelectValue placeholder="Select asset type" />
              </SelectTrigger>
              <SelectContent>
                {assetTypes.map((type, index) => (
                  <SelectItem key={index} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Adding..." : "Add Asset"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
