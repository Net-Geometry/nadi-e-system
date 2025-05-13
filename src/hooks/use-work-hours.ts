import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WorkHourConfig {
  id: string;
  site_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

interface CreateWorkHourInput {
  siteId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface UpdateWorkHourInput extends CreateWorkHourInput {
  id: string;
}

/**
 * Hook to manage work hours configuration for a site
 */
export const useWorkHours = (siteId: string | null) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch work hours for a specific site
  const workHoursQuery = useQuery({
    queryKey: ["workHours", siteId],
    queryFn: async () => {
      if (!siteId) return [];

      const { data, error } = await supabase
        .from("nd_work_hour_config")
        .select("*")
        .eq("site_id", siteId)
        .order("day_of_week", { ascending: true });

      if (error) throw error;
      return data as WorkHourConfig[];
    },
    enabled: !!siteId,
  });

  // Create a new work hour configuration
  const createWorkHour = useMutation({
    mutationFn: async (values: CreateWorkHourInput) => {
      const { data, error } = await supabase
        .from("nd_work_hour_config")
        .insert([
          {
            site_id: values.siteId,
            day_of_week: values.dayOfWeek,
            start_time: values.startTime,
            end_time: values.endTime,
            is_active: values.isActive,
          },
        ]);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workHours", siteId] });
      toast({
        title: "Success",
        description: "Work hour configuration has been added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add work hour configuration: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Update an existing work hour configuration
  const updateWorkHour = useMutation({
    mutationFn: async (values: UpdateWorkHourInput) => {
      const { data, error } = await supabase
        .from("nd_work_hour_config")
        .update({
          site_id: values.siteId,
          day_of_week: values.dayOfWeek,
          start_time: values.startTime,
          end_time: values.endTime,
          is_active: values.isActive,
        })
        .eq("id", values.id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workHours", siteId] });
      toast({
        title: "Success",
        description: "Work hour configuration has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          "Failed to update work hour configuration: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Delete a work hour configuration
  const deleteWorkHour = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("nd_work_hour_config")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workHours", siteId] });
      toast({
        title: "Success",
        description: "Work hour configuration has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          "Failed to delete work hour configuration: " + error.message,
        variant: "destructive",
      });
    },
  });

  return {
    workHours: workHoursQuery.data || [],
    isLoading: workHoursQuery.isLoading,
    error: workHoursQuery.error,
    createWorkHour,
    updateWorkHour,
    deleteWorkHour,
  };
};
