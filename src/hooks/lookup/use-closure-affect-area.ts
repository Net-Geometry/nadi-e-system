import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type ClosureAffectArea = {
  id: number;
  eng: string;
  bm: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
};

export function useClosureAffectArea() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["closure-affect-areas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nd_closure_affect_areas")
        .select("*")
        .order("id");

      if (error) throw error;
      return data as ClosureAffectArea[];
    },
    meta: {
      onError: (err: Error) => {
        console.error("Error fetching closure affect areas:", err);
        toast({
          title: "Error",
          description: "Failed to load closure affect areas",
          variant: "destructive",
        });
      },
    },
  });

  const addMutation = useMutation({
    mutationFn: async (area: Partial<ClosureAffectArea>) => {
      const { error } = await supabase
        .from("nd_closure_affect_areas")
        .insert([area]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["closure-affect-areas"] });
    },
    onError: (err) => {
      console.error("Error adding closure affect area:", err);
      toast({
        title: "Error",
        description: "Failed to add closure affect area",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; [key: string]: any }) => {
      const { error } = await supabase
        .from("nd_closure_affect_areas")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["closure-affect-areas"] });
    },
    onError: (err) => {
      console.error("Error updating closure affect area:", err);
      toast({
        title: "Error",
        description: "Failed to update closure affect area",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("nd_closure_affect_areas")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["closure-affect-areas"] });
    },
    onError: (err) => {
      console.error("Error deleting closure affect area:", err);
      toast({
        title: "Error",
        description: "Failed to delete closure affect area",
        variant: "destructive",
      });
    },
  });

  const addClosureAffectArea = async (area: Partial<ClosureAffectArea>) => {
    return addMutation.mutateAsync(area);
  };

  const updateClosureAffectArea = async (
    id: number,
    data: Partial<ClosureAffectArea>
  ) => {
    return updateMutation.mutateAsync({ id, ...data });
  };

  const deleteClosureAffectArea = async (id: number) => {
    return deleteMutation.mutateAsync(id);
  };

  return {
    closureAffectAreas: data || [],
    isLoading,
    error,
    addClosureAffectArea,
    updateClosureAffectArea,
    deleteClosureAffectArea,
  };
}
