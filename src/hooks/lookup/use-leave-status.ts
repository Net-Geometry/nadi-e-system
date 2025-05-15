import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type LeaveStatus = {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
};

export function useLeaveStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["leave-status"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nd_leave_status")
        .select("*")
        .order("id");

      if (error) throw error;
      return data as LeaveStatus[];
    },
    meta: {
      onError: (err: Error) => {
        console.error("Error fetching leave status:", err);
        toast({
          title: "Error",
          description: "Failed to load leave status",
          variant: "destructive",
        });
      },
    },
  });

  const addMutation = useMutation({
    mutationFn: async (leaveStatus: Partial<LeaveStatus>) => {
      const { error } = await supabase
        .from("nd_leave_status")
        .insert([leaveStatus]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-status"] });
    },
    onError: (err) => {
      console.error("Error adding leave status:", err);
      toast({
        title: "Error",
        description: "Failed to add leave status",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; [key: string]: any }) => {
      const { error } = await supabase
        .from("nd_leave_status")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-status"] });
    },
    onError: (err) => {
      console.error("Error updating leave status:", err);
      toast({
        title: "Error",
        description: "Failed to update leave status",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("nd_leave_status")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-status"] });
    },
    onError: (err) => {
      console.error("Error deleting leave status:", err);
      toast({
        title: "Error",
        description: "Failed to delete leave status",
        variant: "destructive",
      });
    },
  });

  const addLeaveStatus = async (leaveStatus: Partial<LeaveStatus>) => {
    return addMutation.mutateAsync(leaveStatus);
  };

  const updateLeaveStatus = async (id: number, data: Partial<LeaveStatus>) => {
    return updateMutation.mutateAsync({ id, ...data });
  };

  const deleteLeaveStatus = async (id: number) => {
    return deleteMutation.mutateAsync(id);
  };

  return {
    leaveStatuses: data || [],
    isLoading,
    error,
    addLeaveStatus,
    updateLeaveStatus,
    deleteLeaveStatus,
  };
}
