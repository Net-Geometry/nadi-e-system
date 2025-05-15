import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type MaritalStatus = {
  id: number;
  eng: string;
  bm: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
};

export function useMaritalStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["marital-status"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nd_marital_status")
        .select("*")
        .order("id");

      if (error) throw error;
      return data as MaritalStatus[];
    },
    meta: {
      onError: (err: Error) => {
        console.error("Error fetching marital status:", err);
        toast({
          title: "Error",
          description: "Failed to load marital status",
          variant: "destructive",
        });
      },
    },
  });

  const addMutation = useMutation({
    mutationFn: async (maritalStatus: Partial<MaritalStatus>) => {
      const { error } = await supabase
        .from("nd_marital_status")
        .insert([maritalStatus]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marital-status"] });
    },
    onError: (err) => {
      console.error("Error adding marital status:", err);
      toast({
        title: "Error",
        description: "Failed to add marital status",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; [key: string]: any }) => {
      const { error } = await supabase
        .from("nd_marital_status")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marital-status"] });
    },
    onError: (err) => {
      console.error("Error updating marital status:", err);
      toast({
        title: "Error",
        description: "Failed to update marital status",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("nd_marital_status")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marital-status"] });
    },
    onError: (err) => {
      console.error("Error deleting marital status:", err);
      toast({
        title: "Error",
        description: "Failed to delete marital status",
        variant: "destructive",
      });
    },
  });

  const addMaritalStatus = async (maritalStatus: Partial<MaritalStatus>) => {
    return addMutation.mutateAsync(maritalStatus);
  };

  const updateMaritalStatus = async (
    id: number,
    data: Partial<MaritalStatus>
  ) => {
    return updateMutation.mutateAsync({ id, ...data });
  };

  const deleteMaritalStatus = async (id: number) => {
    return deleteMutation.mutateAsync(id);
  };

  return {
    maritalStatuses: data || [],
    isLoading,
    error,
    addMaritalStatus,
    updateMaritalStatus,
    deleteMaritalStatus,
  };
}
