import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type DUN = {
  id: number;
  name: string;
  full_name?: string;
  refid?: string;
  rfid_parliament?: string;
  no_of_duns?: number;
  is_active?: boolean;
  states_id?: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
};

export function useDUN() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["duns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nd_duns")
        .select("*")
        .order("id");

      if (error) throw error;
      return data as DUN[];
    },
    meta: {
      onError: (err: Error) => {
        console.error("Error fetching DUNs:", err);
        toast({
          title: "Error",
          description: "Failed to load DUNs",
          variant: "destructive",
        });
      },
    },
  });

  const addMutation = useMutation({
    mutationFn: async (dun: Partial<DUN>) => {
      const { error } = await supabase.from("nd_duns").insert([dun]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["duns"] });
    },
    onError: (err) => {
      console.error("Error adding DUN:", err);
      toast({
        title: "Error",
        description: "Failed to add DUN",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; [key: string]: any }) => {
      const { error } = await supabase
        .from("nd_duns")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["duns"] });
    },
    onError: (err) => {
      console.error("Error updating DUN:", err);
      toast({
        title: "Error",
        description: "Failed to update DUN",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("nd_duns").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["duns"] });
    },
    onError: (err) => {
      console.error("Error deleting DUN:", err);
      toast({
        title: "Error",
        description: "Failed to delete DUN",
        variant: "destructive",
      });
    },
  });

  const addDUN = async (dun: Partial<DUN>) => {
    return addMutation.mutateAsync(dun);
  };

  const updateDUN = async (id: number, data: Partial<DUN>) => {
    return updateMutation.mutateAsync({ id, ...data });
  };

  const deleteDUN = async (id: number) => {
    return deleteMutation.mutateAsync(id);
  };

  return {
    duns: data || [],
    isLoading,
    error,
    addDUN,
    updateDUN,
    deleteDUN,
  };
}
