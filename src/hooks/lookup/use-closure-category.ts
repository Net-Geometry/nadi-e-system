import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type ClosureCategory = {
  id: number;
  eng: string;
  bm: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
};

export function useClosureCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["closure-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nd_closure_categories")
        .select("*")
        .order("id");

      if (error) throw error;
      return data as ClosureCategory[];
    },
    meta: {
      onError: (err: Error) => {
        console.error("Error fetching closure categories:", err);
        toast({
          title: "Error",
          description: "Failed to load closure categories",
          variant: "destructive",
        });
      },
    },
  });

  const addMutation = useMutation({
    mutationFn: async (category: Partial<ClosureCategory>) => {
      const { error } = await supabase
        .from("nd_closure_categories")
        .insert([category]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["closure-categories"] });
    },
    onError: (err) => {
      console.error("Error adding closure category:", err);
      toast({
        title: "Error",
        description: "Failed to add closure category",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; [key: string]: any }) => {
      const { error } = await supabase
        .from("nd_closure_categories")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["closure-categories"] });
    },
    onError: (err) => {
      console.error("Error updating closure category:", err);
      toast({
        title: "Error",
        description: "Failed to update closure category",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("nd_closure_categories")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["closure-categories"] });
    },
    onError: (err) => {
      console.error("Error deleting closure category:", err);
      toast({
        title: "Error",
        description: "Failed to delete closure category",
        variant: "destructive",
      });
    },
  });

  const addClosureCategory = async (category: Partial<ClosureCategory>) => {
    return addMutation.mutateAsync(category);
  };

  const updateClosureCategory = async (
    id: number,
    data: Partial<ClosureCategory>
  ) => {
    return updateMutation.mutateAsync({ id, ...data });
  };

  const deleteClosureCategory = async (id: number) => {
    return deleteMutation.mutateAsync(id);
  };

  return {
    closureCategories: data || [],
    isLoading,
    error,
    addClosureCategory,
    updateClosureCategory,
    deleteClosureCategory,
  };
}
