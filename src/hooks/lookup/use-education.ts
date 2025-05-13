import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type Education = {
  id: number;
  eng: string;
  bm: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
};

export function useEducation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["education"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nd_education")
        .select("*")
        .order("id");

      if (error) throw error;
      return data as Education[];
    },
    meta: {
      onError: (err: Error) => {
        console.error("Error fetching education levels:", err);
        toast({
          title: "Error",
          description: "Failed to load education levels",
          variant: "destructive",
        });
      },
    },
  });

  const addMutation = useMutation({
    mutationFn: async (education: Partial<Education>) => {
      const { error } = await supabase.from("nd_education").insert([education]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["education"] });
    },
    onError: (err) => {
      console.error("Error adding education level:", err);
      toast({
        title: "Error",
        description: "Failed to add education level",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; [key: string]: any }) => {
      const { error } = await supabase
        .from("nd_education")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["education"] });
    },
    onError: (err) => {
      console.error("Error updating education level:", err);
      toast({
        title: "Error",
        description: "Failed to update education level",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("nd_education")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["education"] });
    },
    onError: (err) => {
      console.error("Error deleting education level:", err);
      toast({
        title: "Error",
        description: "Failed to delete education level",
        variant: "destructive",
      });
    },
  });

  const addEducation = async (education: Partial<Education>) => {
    return addMutation.mutateAsync(education);
  };

  const updateEducation = async (id: number, data: Partial<Education>) => {
    return updateMutation.mutateAsync({ id, ...data });
  };

  const deleteEducation = async (id: number) => {
    return deleteMutation.mutateAsync(id);
  };

  return {
    educationLevels: data || [],
    isLoading,
    error,
    addEducation,
    updateEducation,
    deleteEducation,
  };
}
