import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type BuildingLevel = {
  id: number;
  eng: string;
  bm: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
};

export function useBuildingLevel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["building-level"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nd_building_level")
        .select("*")
        .order("id");

      if (error) throw error;
      return data as BuildingLevel[];
    },
    meta: {
      onError: (err: Error) => {
        console.error("Error fetching building levels:", err);
        toast({
          title: "Error",
          description: "Failed to load building levels",
          variant: "destructive",
        });
      },
    },
  });

  const addMutation = useMutation({
    mutationFn: async (level: Partial<BuildingLevel>) => {
      const { error } = await supabase
        .from("nd_building_level")
        .insert([level]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["building-level"] });
    },
    onError: (err) => {
      console.error("Error adding building level:", err);
      toast({
        title: "Error",
        description: "Failed to add building level",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; [key: string]: any }) => {
      const { error } = await supabase
        .from("nd_building_level")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["building-level"] });
    },
    onError: (err) => {
      console.error("Error updating building level:", err);
      toast({
        title: "Error",
        description: "Failed to update building level",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("nd_building_level")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["building-level"] });
    },
    onError: (err) => {
      console.error("Error deleting building level:", err);
      toast({
        title: "Error",
        description: "Failed to delete building level",
        variant: "destructive",
      });
    },
  });

  const addBuildingLevel = async (level: Partial<BuildingLevel>) => {
    return addMutation.mutateAsync(level);
  };

  const updateBuildingLevel = async (
    id: number,
    data: Partial<BuildingLevel>
  ) => {
    return updateMutation.mutateAsync({ id, ...data });
  };

  const deleteBuildingLevel = async (id: number) => {
    return deleteMutation.mutateAsync(id);
  };

  return {
    buildingLevels: data || [],
    isLoading,
    error,
    addBuildingLevel,
    updateBuildingLevel,
    deleteBuildingLevel,
  };
}
