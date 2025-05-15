import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type LeaveOffType = {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
};

export function useLeaveOffType() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["leave-off-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nd_leave_off_type")
        .select("*")
        .order("id");

      if (error) throw error;
      return data as LeaveOffType[];
    },
    meta: {
      onError: (err: Error) => {
        console.error("Error fetching leave off types:", err);
        toast({
          title: "Error",
          description: "Failed to load leave off types",
          variant: "destructive",
        });
      },
    },
  });

  const addMutation = useMutation({
    mutationFn: async (leaveOffType: Partial<LeaveOffType>) => {
      const { error } = await supabase
        .from("nd_leave_off_type")
        .insert([leaveOffType]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-off-types"] });
    },
    onError: (err) => {
      console.error("Error adding leave off type:", err);
      toast({
        title: "Error",
        description: "Failed to add leave off type",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; [key: string]: any }) => {
      const { error } = await supabase
        .from("nd_leave_off_type")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-off-types"] });
    },
    onError: (err) => {
      console.error("Error updating leave off type:", err);
      toast({
        title: "Error",
        description: "Failed to update leave off type",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("nd_leave_off_type")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-off-types"] });
    },
    onError: (err) => {
      console.error("Error deleting leave off type:", err);
      toast({
        title: "Error",
        description: "Failed to delete leave off type",
        variant: "destructive",
      });
    },
  });

  const addLeaveOffType = async (leaveOffType: Partial<LeaveOffType>) => {
    return addMutation.mutateAsync(leaveOffType);
  };

  const updateLeaveOffType = async (
    id: number,
    data: Partial<LeaveOffType>
  ) => {
    return updateMutation.mutateAsync({ id, ...data });
  };

  const deleteLeaveOffType = async (id: number) => {
    return deleteMutation.mutateAsync(id);
  };

  return {
    leaveOffTypes: data || [],
    isLoading,
    error,
    addLeaveOffType,
    updateLeaveOffType,
    deleteLeaveOffType,
  };
}
