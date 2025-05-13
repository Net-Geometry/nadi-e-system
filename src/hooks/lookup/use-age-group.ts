import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type AgeGroup = {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
};

export function useAgeGroup() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["age-groups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nd_age_group")
        .select("*")
        .order("id");

      if (error) throw error;
      return data as AgeGroup[];
    },
    meta: {
      onError: (err: Error) => {
        console.error("Error fetching age groups:", err);
        toast({
          title: "Error",
          description: "Failed to load age groups",
          variant: "destructive",
        });
      },
    },
  });

  const addMutation = useMutation({
    mutationFn: async (ageGroup: Partial<AgeGroup>) => {
      const { error } = await supabase.from("nd_age_group").insert([ageGroup]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["age-groups"] });
    },
    onError: (err) => {
      console.error("Error adding age group:", err);
      toast({
        title: "Error",
        description: "Failed to add age group",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; [key: string]: any }) => {
      const { error } = await supabase
        .from("nd_age_group")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["age-groups"] });
    },
    onError: (err) => {
      console.error("Error updating age group:", err);
      toast({
        title: "Error",
        description: "Failed to update age group",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("nd_age_group")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["age-groups"] });
    },
    onError: (err) => {
      console.error("Error deleting age group:", err);
      toast({
        title: "Error",
        description: "Failed to delete age group",
        variant: "destructive",
      });
    },
  });

  const addAgeGroup = async (ageGroup: Partial<AgeGroup>) => {
    return addMutation.mutateAsync(ageGroup);
  };

  const updateAgeGroup = async (id: number, data: Partial<AgeGroup>) => {
    return updateMutation.mutateAsync({ id, ...data });
  };

  const deleteAgeGroup = async (id: number) => {
    return deleteMutation.mutateAsync(id);
  };

  return {
    ageGroups: data || [],
    isLoading,
    error,
    addAgeGroup,
    updateAgeGroup,
    deleteAgeGroup,
  };
}
