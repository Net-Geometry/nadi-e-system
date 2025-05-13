import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type ClosureSubcategory = {
  id: number;
  eng: string;
  bm: string;
  category_id?: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
};

export function useClosureSubcategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["closure-subcategories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nd_closure_subcategories")
        .select("*")
        .order("id");

      if (error) throw error;
      return data as ClosureSubcategory[];
    },
    meta: {
      onError: (err: Error) => {
        console.error("Error fetching closure subcategories:", err);
        toast({
          title: "Error",
          description: "Failed to load closure subcategories",
          variant: "destructive",
        });
      },
    },
  });

  const addMutation = useMutation({
    mutationFn: async (subcategory: Partial<ClosureSubcategory>) => {
      const { error } = await supabase
        .from("nd_closure_subcategories")
        .insert([subcategory]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["closure-subcategories"] });
    },
    onError: (err) => {
      console.error("Error adding closure subcategory:", err);
      toast({
        title: "Error",
        description: "Failed to add closure subcategory",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; [key: string]: any }) => {
      const { error } = await supabase
        .from("nd_closure_subcategories")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["closure-subcategories"] });
    },
    onError: (err) => {
      console.error("Error updating closure subcategory:", err);
      toast({
        title: "Error",
        description: "Failed to update closure subcategory",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("nd_closure_subcategories")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["closure-subcategories"] });
    },
    onError: (err) => {
      console.error("Error deleting closure subcategory:", err);
      toast({
        title: "Error",
        description: "Failed to delete closure subcategory",
        variant: "destructive",
      });
    },
  });

  const addClosureSubcategory = async (
    subcategory: Partial<ClosureSubcategory>
  ) => {
    return addMutation.mutateAsync(subcategory);
  };

  const updateClosureSubcategory = async (
    id: number,
    data: Partial<ClosureSubcategory>
  ) => {
    return updateMutation.mutateAsync({ id, ...data });
  };

  const deleteClosureSubcategory = async (id: number) => {
    return deleteMutation.mutateAsync(id);
  };

  return {
    closureSubcategories: data || [],
    isLoading,
    error,
    addClosureSubcategory,
    updateClosureSubcategory,
    deleteClosureSubcategory,
  };
}
