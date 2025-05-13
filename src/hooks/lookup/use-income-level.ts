import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type IncomeLevel = {
  id: number;
  eng: string;
  bm: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
};

export function useIncomeLevel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["income-levels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nd_income_levels")
        .select("*")
        .order("id");

      if (error) throw error;
      return data as IncomeLevel[];
    },
    meta: {
      onError: (err: Error) => {
        console.error("Error fetching income levels:", err);
        toast({
          title: "Error",
          description: "Failed to load income levels",
          variant: "destructive",
        });
      },
    },
  });

  const addMutation = useMutation({
    mutationFn: async (incomeLevel: Partial<IncomeLevel>) => {
      const { error } = await supabase
        .from("nd_income_levels")
        .insert([incomeLevel]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income-levels"] });
    },
    onError: (err) => {
      console.error("Error adding income level:", err);
      toast({
        title: "Error",
        description: "Failed to add income level",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; [key: string]: any }) => {
      const { error } = await supabase
        .from("nd_income_levels")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income-levels"] });
    },
    onError: (err) => {
      console.error("Error updating income level:", err);
      toast({
        title: "Error",
        description: "Failed to update income level",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("nd_income_levels")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income-levels"] });
    },
    onError: (err) => {
      console.error("Error deleting income level:", err);
      toast({
        title: "Error",
        description: "Failed to delete income level",
        variant: "destructive",
      });
    },
  });

  const addIncomeLevel = async (incomeLevel: Partial<IncomeLevel>) => {
    return addMutation.mutateAsync(incomeLevel);
  };

  const updateIncomeLevel = async (id: number, data: Partial<IncomeLevel>) => {
    return updateMutation.mutateAsync({ id, ...data });
  };

  const deleteIncomeLevel = async (id: number) => {
    return deleteMutation.mutateAsync(id);
  };

  return {
    incomeLevels: data || [],
    isLoading,
    error,
    addIncomeLevel,
    updateIncomeLevel,
    deleteIncomeLevel,
  };
}
