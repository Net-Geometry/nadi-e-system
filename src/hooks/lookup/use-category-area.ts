import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type CategoryArea = {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
};

export function useCategoryArea() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["category-area"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nd_category_area")
        .select("*")
        .order("id");

      if (error) throw error;
      return data as CategoryArea[];
    },
    meta: {
      onError: (err: Error) => {
        console.error("Error fetching category areas:", err);
        toast({
          title: "Error",
          description: "Failed to load category areas",
          variant: "destructive",
        });
      },
    },
  });

  const addMutation = useMutation({
    mutationFn: async (area: Partial<CategoryArea>) => {
      const { error } = await supabase.from("nd_category_area").insert([area]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category-area"] });
    },
    onError: (err) => {
      console.error("Error adding category area:", err);
      toast({
        title: "Error",
        description: "Failed to add category area",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; [key: string]: any }) => {
      const { error } = await supabase
        .from("nd_category_area")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category-area"] });
    },
    onError: (err) => {
      console.error("Error updating category area:", err);
      toast({
        title: "Error",
        description: "Failed to update category area",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("nd_category_area")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category-area"] });
    },
    onError: (err) => {
      console.error("Error deleting category area:", err);
      toast({
        title: "Error",
        description: "Failed to delete category area",
        variant: "destructive",
      });
    },
  });

  const addCategoryArea = async (area: Partial<CategoryArea>) => {
    return addMutation.mutateAsync(area);
  };

  const updateCategoryArea = async (
    id: number,
    data: Partial<CategoryArea>
  ) => {
    return updateMutation.mutateAsync({ id, ...data });
  };

  const deleteCategoryArea = async (id: number) => {
    return deleteMutation.mutateAsync(id);
  };

  return {
    categoryAreas: data || [],
    isLoading,
    error,
    addCategoryArea,
    updateCategoryArea,
    deleteCategoryArea,
  };
}
