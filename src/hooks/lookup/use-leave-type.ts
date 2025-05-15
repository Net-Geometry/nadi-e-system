import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type LeaveType = {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
};

export function useLeaveType() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["leave-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nd_leave_type")
        .select("*")
        .order("id");

      if (error) throw error;
      return data as LeaveType[];
    },
    meta: {
      onError: (err: Error) => {
        console.error("Error fetching leave types:", err);
        toast({
          title: "Error",
          description: "Failed to load leave types",
          variant: "destructive",
        });
      },
    },
  });

  const addMutation = useMutation({
    mutationFn: async (leaveType: Partial<LeaveType>) => {
      const { error } = await supabase
        .from("nd_leave_type")
        .insert([leaveType]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-types"] });
    },
    onError: (err) => {
      console.error("Error adding leave type:", err);
      toast({
        title: "Error",
        description: "Failed to add leave type",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; [key: string]: any }) => {
      const { error } = await supabase
        .from("nd_leave_type")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-types"] });
    },
    onError: (err) => {
      console.error("Error updating leave type:", err);
      toast({
        title: "Error",
        description: "Failed to update leave type",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("nd_leave_type")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-types"] });
    },
    onError: (err) => {
      console.error("Error deleting leave type:", err);
      toast({
        title: "Error",
        description: "Failed to delete leave type",
        variant: "destructive",
      });
    },
  });

  const addLeaveType = async (leaveType: Partial<LeaveType>) => {
    return addMutation.mutateAsync(leaveType);
  };

  const updateLeaveType = async (id: number, data: Partial<LeaveType>) => {
    return updateMutation.mutateAsync({ id, ...data });
  };

  const deleteLeaveType = async (id: number) => {
    return deleteMutation.mutateAsync(id);
  };

  return {
    leaveTypes: data || [],
    isLoading,
    error,
    addLeaveType,
    updateLeaveType,
    deleteLeaveType,
  };
}
