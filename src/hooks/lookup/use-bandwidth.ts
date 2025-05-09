import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type Bandwidth = {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
};

export function useBandwidth() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["bandwidth"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nd_bandwidth")
        .select("*")
        .order("id");

      if (error) throw error;
      return data as Bandwidth[];
    },
    meta: {
      onError: (err: Error) => {
        console.error("Error fetching bandwidth:", err);
        toast({
          title: "Error",
          description: "Failed to load bandwidth data",
          variant: "destructive",
        });
      },
    },
  });

  const addMutation = useMutation({
    mutationFn: async (bandwidth: Partial<Bandwidth>) => {
      const { error } = await supabase.from("nd_bandwidth").insert([bandwidth]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bandwidth"] });
    },
    onError: (err) => {
      console.error("Error adding bandwidth:", err);
      toast({
        title: "Error",
        description: "Failed to add bandwidth",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; [key: string]: any }) => {
      const { error } = await supabase
        .from("nd_bandwidth")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bandwidth"] });
    },
    onError: (err) => {
      console.error("Error updating bandwidth:", err);
      toast({
        title: "Error",
        description: "Failed to update bandwidth",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("nd_bandwidth")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bandwidth"] });
    },
    onError: (err) => {
      console.error("Error deleting bandwidth:", err);
      toast({
        title: "Error",
        description: "Failed to delete bandwidth",
        variant: "destructive",
      });
    },
  });

  const addBandwidth = async (bandwidth: Partial<Bandwidth>) => {
    return addMutation.mutateAsync(bandwidth);
  };

  const updateBandwidth = async (id: number, data: Partial<Bandwidth>) => {
    return updateMutation.mutateAsync({ id, ...data });
  };

  const deleteBandwidth = async (id: number) => {
    return deleteMutation.mutateAsync(id);
  };

  return {
    bandwidth: data || [],
    isLoading,
    error,
    addBandwidth,
    updateBandwidth,
    deleteBandwidth,
  };
}
