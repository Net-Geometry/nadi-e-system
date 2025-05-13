import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type ICTKnowledge = {
  id: number;
  eng: string;
  bm: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
};

export function useICTKnowledge() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["ict-knowledge"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nd_ict_knowledge")
        .select("*")
        .order("id");

      if (error) throw error;
      return data as ICTKnowledge[];
    },
    meta: {
      onError: (err: Error) => {
        console.error("Error fetching ICT knowledge:", err);
        toast({
          title: "Error",
          description: "Failed to load ICT knowledge",
          variant: "destructive",
        });
      },
    },
  });

  const addMutation = useMutation({
    mutationFn: async (knowledge: Partial<ICTKnowledge>) => {
      const { error } = await supabase
        .from("nd_ict_knowledge")
        .insert([knowledge]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ict-knowledge"] });
    },
    onError: (err) => {
      console.error("Error adding ICT knowledge:", err);
      toast({
        title: "Error",
        description: "Failed to add ICT knowledge",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; [key: string]: any }) => {
      const { error } = await supabase
        .from("nd_ict_knowledge")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ict-knowledge"] });
    },
    onError: (err) => {
      console.error("Error updating ICT knowledge:", err);
      toast({
        title: "Error",
        description: "Failed to update ICT knowledge",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("nd_ict_knowledge")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ict-knowledge"] });
    },
    onError: (err) => {
      console.error("Error deleting ICT knowledge:", err);
      toast({
        title: "Error",
        description: "Failed to delete ICT knowledge",
        variant: "destructive",
      });
    },
  });

  const addICTKnowledge = async (knowledge: Partial<ICTKnowledge>) => {
    return addMutation.mutateAsync(knowledge);
  };

  const updateICTKnowledge = async (
    id: number,
    data: Partial<ICTKnowledge>
  ) => {
    return updateMutation.mutateAsync({ id, ...data });
  };

  const deleteICTKnowledge = async (id: number) => {
    return deleteMutation.mutateAsync(id);
  };

  return {
    ictKnowledge: data || [],
    isLoading,
    error,
    addICTKnowledge,
    updateICTKnowledge,
    deleteICTKnowledge,
  };
}
