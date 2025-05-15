import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type District = {
  id: number;
  name: string;
  state_id?: number;
  code?: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
};

export function useDistrict() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["districts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nd_district")
        .select("*")
        .order("id");

      if (error) throw error;
      return data as District[];
    },
    meta: {
      onError: (err: Error) => {
        console.error("Error fetching districts:", err);
        toast({
          title: "Error",
          description: "Failed to load districts",
          variant: "destructive",
        });
      },
    },
  });

  const addMutation = useMutation({
    mutationFn: async (district: Partial<District>) => {
      const { error } = await supabase.from("nd_district").insert([district]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["districts"] });
    },
    onError: (err) => {
      console.error("Error adding district:", err);
      toast({
        title: "Error",
        description: "Failed to add district",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; [key: string]: any }) => {
      const { error } = await supabase
        .from("nd_district")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["districts"] });
    },
    onError: (err) => {
      console.error("Error updating district:", err);
      toast({
        title: "Error",
        description: "Failed to update district",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("nd_district")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["districts"] });
    },
    onError: (err) => {
      console.error("Error deleting district:", err);
      toast({
        title: "Error",
        description: "Failed to delete district",
        variant: "destructive",
      });
    },
  });

  const addDistrict = async (district: Partial<District>) => {
    return addMutation.mutateAsync(district);
  };

  const updateDistrict = async (id: number, data: Partial<District>) => {
    return updateMutation.mutateAsync({ id, ...data });
  };

  const deleteDistrict = async (id: number) => {
    return deleteMutation.mutateAsync(id);
  };

  return {
    districts: data || [],
    isLoading,
    error,
    addDistrict,
    updateDistrict,
    deleteDistrict,
  };
}
