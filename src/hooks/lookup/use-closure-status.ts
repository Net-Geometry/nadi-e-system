import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type ClosureStatus = {
  id: number;
  name: string;
  remark?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
};

export function useClosureStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["closure-status"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nd_closure_status")
        .select("*")
        .order("id");

      if (error) throw error;
      return data as ClosureStatus[];
    },
    meta: {
      onError: (err: Error) => {
        console.error("Error fetching closure status:", err);
        toast({
          title: "Error",
          description: "Failed to load closure status",
          variant: "destructive",
        });
      },
    },
  });

  const addMutation = useMutation({
    mutationFn: async (status: Partial<ClosureStatus>) => {
      const { error } = await supabase
        .from("nd_closure_status")
        .insert([status]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["closure-status"] });
    },
    onError: (err) => {
      console.error("Error adding closure status:", err);
      toast({
        title: "Error",
        description: "Failed to add closure status",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; [key: string]: any }) => {
      const { error } = await supabase
        .from("nd_closure_status")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["closure-status"] });
    },
    onError: (err) => {
      console.error("Error updating closure status:", err);
      toast({
        title: "Error",
        description: "Failed to update closure status",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("nd_closure_status")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["closure-status"] });
    },
    onError: (err) => {
      console.error("Error deleting closure status:", err);
      toast({
        title: "Error",
        description: "Failed to delete closure status",
        variant: "destructive",
      });
    },
  });

  const addClosureStatus = async (status: Partial<ClosureStatus>) => {
    return addMutation.mutateAsync(status);
  };

  const updateClosureStatus = async (
    id: number,
    data: Partial<ClosureStatus>
  ) => {
    return updateMutation.mutateAsync({ id, ...data });
  };

  const deleteClosureStatus = async (id: number) => {
    return deleteMutation.mutateAsync(id);
  };

  return {
    closureStatus: data || [],
    isLoading,
    error,
    addClosureStatus,
    updateClosureStatus,
    deleteClosureStatus,
  };
}
