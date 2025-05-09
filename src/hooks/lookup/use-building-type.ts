import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type BuildingType = {
  id: number;
  eng: string;
  bm: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
};

export function useBuildingType() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["building-type"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nd_building_type")
        .select("*")
        .order("id");

      if (error) throw error;
      return data as BuildingType[];
    },
    meta: {
      onError: (err: Error) => {
        console.error("Error fetching building types:", err);
        toast({
          title: "Error",
          description: "Failed to load building types",
          variant: "destructive",
        });
      },
    },
  });

  const addMutation = useMutation({
    mutationFn: async (type: Partial<BuildingType>) => {
      const { error } = await supabase.from("nd_building_type").insert([type]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["building-type"] });
    },
    onError: (err) => {
      console.error("Error adding building type:", err);
      toast({
        title: "Error",
        description: "Failed to add building type",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; [key: string]: any }) => {
      const { error } = await supabase
        .from("nd_building_type")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["building-type"] });
    },
    onError: (err) => {
      console.error("Error updating building type:", err);
      toast({
        title: "Error",
        description: "Failed to update building type",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("nd_building_type")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["building-type"] });
    },
    onError: (err) => {
      console.error("Error deleting building type:", err);
      toast({
        title: "Error",
        description: "Failed to delete building type",
        variant: "destructive",
      });
    },
  });

  const addBuildingType = async (type: Partial<BuildingType>) => {
    return addMutation.mutateAsync(type);
  };

  const updateBuildingType = async (
    id: number,
    data: Partial<BuildingType>
  ) => {
    return updateMutation.mutateAsync({ id, ...data });
  };

  const deleteBuildingType = async (id: number) => {
    return deleteMutation.mutateAsync(id);
  };

  return {
    buildingTypes: data || [],
    isLoading,
    error,
    addBuildingType,
    updateBuildingType,
    deleteBuildingType,
  };
}
