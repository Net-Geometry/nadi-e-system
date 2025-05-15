import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type Mukim = {
  id: number;
  name: string;
  district_id?: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
};

export function useMukim() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["mukims"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nd_mukims")
        .select("*")
        .order("id");

      if (error) throw error;
      return data as Mukim[];
    },
    meta: {
      onError: (err: Error) => {
        console.error("Error fetching mukims:", err);
        toast({
          title: "Error",
          description: "Failed to load mukims",
          variant: "destructive",
        });
      },
    },
  });

  const addMutation = useMutation({
    mutationFn: async (mukim: Partial<Mukim>) => {
      const { error } = await supabase.from("nd_mukims").insert([mukim]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mukims"] });
    },
    onError: (err) => {
      console.error("Error adding mukim:", err);
      toast({
        title: "Error",
        description: "Failed to add mukim",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; [key: string]: any }) => {
      const { error } = await supabase
        .from("nd_mukims")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mukims"] });
    },
    onError: (err) => {
      console.error("Error updating mukim:", err);
      toast({
        title: "Error",
        description: "Failed to update mukim",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("nd_mukims").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mukims"] });
    },
    onError: (err) => {
      console.error("Error deleting mukim:", err);
      toast({
        title: "Error",
        description: "Failed to delete mukim",
        variant: "destructive",
      });
    },
  });

  const addMukim = async (mukim: Partial<Mukim>) => {
    return addMutation.mutateAsync(mukim);
  };

  const updateMukim = async (id: number, data: Partial<Mukim>) => {
    return updateMutation.mutateAsync({ id, ...data });
  };

  const deleteMukim = async (id: number) => {
    return deleteMutation.mutateAsync(id);
  };

  return {
    mukims: data || [],
    isLoading,
    error,
    addMukim,
    updateMukim,
    deleteMukim,
  };
}
