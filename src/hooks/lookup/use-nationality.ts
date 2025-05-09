import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type Nationality = {
  id: number;
  eng: string;
  bm: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
};

export function useNationality() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["nationalities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nd_nationalities")
        .select("*")
        .order("id");

      if (error) throw error;
      return data as Nationality[];
    },
    meta: {
      onError: (err: Error) => {
        console.error("Error fetching nationalities:", err);
        toast({
          title: "Error",
          description: "Failed to load nationalities",
          variant: "destructive",
        });
      },
    },
  });

  const addMutation = useMutation({
    mutationFn: async (nationality: Partial<Nationality>) => {
      const { error } = await supabase
        .from("nd_nationalities")
        .insert([nationality]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nationalities"] });
    },
    onError: (err) => {
      console.error("Error adding nationality:", err);
      toast({
        title: "Error",
        description: "Failed to add nationality",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; [key: string]: any }) => {
      const { error } = await supabase
        .from("nd_nationalities")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nationalities"] });
    },
    onError: (err) => {
      console.error("Error updating nationality:", err);
      toast({
        title: "Error",
        description: "Failed to update nationality",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("nd_nationalities")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nationalities"] });
    },
    onError: (err) => {
      console.error("Error deleting nationality:", err);
      toast({
        title: "Error",
        description: "Failed to delete nationality",
        variant: "destructive",
      });
    },
  });

  const addNationality = async (nationality: Partial<Nationality>) => {
    return addMutation.mutateAsync(nationality);
  };

  const updateNationality = async (id: number, data: Partial<Nationality>) => {
    return updateMutation.mutateAsync({ id, ...data });
  };

  const deleteNationality = async (id: number) => {
    return deleteMutation.mutateAsync(id);
  };

  return {
    nationalities: data || [],
    isLoading,
    error,
    addNationality,
    updateNationality,
    deleteNationality,
  };
}
