import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type BankList = {
  id: number;
  bank_name: string;
  bank_code?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
};

export function useBankList() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["bank-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nd_bank_list")
        .select("*")
        .order("id");

      if (error) throw error;
      return data as BankList[];
    },
    meta: {
      onError: (err: Error) => {
        console.error("Error fetching bank list:", err);
        toast({
          title: "Error",
          description: "Failed to load bank list",
          variant: "destructive",
        });
      },
    },
  });

  const addMutation = useMutation({
    mutationFn: async (bank: Partial<BankList>) => {
      const { error } = await supabase.from("nd_bank_list").insert([bank]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-list"] });
    },
    onError: (err) => {
      console.error("Error adding bank:", err);
      toast({
        title: "Error",
        description: "Failed to add bank",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; [key: string]: any }) => {
      const { error } = await supabase
        .from("nd_bank_list")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-list"] });
    },
    onError: (err) => {
      console.error("Error updating bank:", err);
      toast({
        title: "Error",
        description: "Failed to update bank",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("nd_bank_list")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-list"] });
    },
    onError: (err) => {
      console.error("Error deleting bank:", err);
      toast({
        title: "Error",
        description: "Failed to delete bank",
        variant: "destructive",
      });
    },
  });

  const addBank = async (bank: Partial<BankList>) => {
    return addMutation.mutateAsync(bank);
  };

  const updateBank = async (id: number, data: Partial<BankList>) => {
    return updateMutation.mutateAsync({ id, ...data });
  };

  const deleteBank = async (id: number) => {
    return deleteMutation.mutateAsync(id);
  };

  return {
    banks: data || [],
    isLoading,
    error,
    addBank,
    updateBank,
    deleteBank,
  };
}
