import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type Gender = {
  id: number;
  eng: string;
  bm: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
};

export function useGenders() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["genders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nd_genders")
        .select("*")
        .order("id");

      if (error) throw error;
      return data as Gender[];
    },
    meta: {
      onError: (err: Error) => {
        console.error("Error fetching genders:", err);
        toast({
          title: "Error",
          description: "Failed to load genders",
          variant: "destructive",
        });
      },
    },
  });

  const addMutation = useMutation({
    mutationFn: async (gender: Partial<Gender>) => {
      const { error } = await supabase.from("nd_genders").insert([gender]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["genders"] });
    },
    onError: (err) => {
      console.error("Error adding gender:", err);
      toast({
        title: "Error",
        description: "Failed to add gender",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; [key: string]: any }) => {
      const { error } = await supabase
        .from("nd_genders")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["genders"] });
    },
    onError: (err) => {
      console.error("Error updating gender:", err);
      toast({
        title: "Error",
        description: "Failed to update gender",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("nd_genders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["genders"] });
    },
    onError: (err) => {
      console.error("Error deleting gender:", err);
      toast({
        title: "Error",
        description: "Failed to delete gender",
        variant: "destructive",
      });
    },
  });

  const addGender = async (gender: Partial<Gender>) => {
    return addMutation.mutateAsync(gender);
  };

  const updateGender = async (id: number, data: Partial<Gender>) => {
    return updateMutation.mutateAsync({ id, ...data });
  };

  const deleteGender = async (id: number) => {
    return deleteMutation.mutateAsync(id);
  };

  return {
    genders: data || [],
    isLoading,
    error,
    addGender,
    updateGender,
    deleteGender,
  };
}
