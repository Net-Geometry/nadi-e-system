import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type Ethnic = {
  id: number;
  eng: string;
  bm: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
};

export function useEthnics() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["ethnics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nd_ethnics")
        .select("*")
        .order("id");

      if (error) throw error;
      return data as Ethnic[];
    },
    meta: {
      onError: (err: Error) => {
        console.error("Error fetching ethnics:", err);
        toast({
          title: "Error",
          description: "Failed to load ethnics",
          variant: "destructive",
        });
      },
    },
  });

  const addMutation = useMutation({
    mutationFn: async (ethnic: Partial<Ethnic>) => {
      const { error } = await supabase.from("nd_ethnics").insert([ethnic]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ethnics"] });
    },
    onError: (err) => {
      console.error("Error adding ethnic:", err);
      toast({
        title: "Error",
        description: "Failed to add ethnic",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; [key: string]: any }) => {
      const { error } = await supabase
        .from("nd_ethnics")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ethnics"] });
    },
    onError: (err) => {
      console.error("Error updating ethnic:", err);
      toast({
        title: "Error",
        description: "Failed to update ethnic",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("nd_ethnics").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ethnics"] });
    },
    onError: (err) => {
      console.error("Error deleting ethnic:", err);
      toast({
        title: "Error",
        description: "Failed to delete ethnic",
        variant: "destructive",
      });
    },
  });

  const addEthnic = async (ethnic: Partial<Ethnic>) => {
    return addMutation.mutateAsync(ethnic);
  };

  const updateEthnic = async (id: number, data: Partial<Ethnic>) => {
    return updateMutation.mutateAsync({ id, ...data });
  };

  const deleteEthnic = async (id: number) => {
    return deleteMutation.mutateAsync(id);
  };

  return {
    ethnics: data || [],
    isLoading,
    error,
    addEthnic,
    updateEthnic,
    deleteEthnic,
  };
}
