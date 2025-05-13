import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type City = {
  id: number;
  name: string;
  state_id?: number;
  state?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
};

export function useCity() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["cities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nd_city")
        .select("*")
        .order("id");

      if (error) throw error;
      return data as City[];
    },
    meta: {
      onError: (err: Error) => {
        console.error("Error fetching cities:", err);
        toast({
          title: "Error",
          description: "Failed to load cities",
          variant: "destructive",
        });
      },
    },
  });

  const addMutation = useMutation({
    mutationFn: async (city: Partial<City>) => {
      const { error } = await supabase.from("nd_city").insert([city]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cities"] });
    },
    onError: (err) => {
      console.error("Error adding city:", err);
      toast({
        title: "Error",
        description: "Failed to add city",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; [key: string]: any }) => {
      const { error } = await supabase
        .from("nd_city")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cities"] });
    },
    onError: (err) => {
      console.error("Error updating city:", err);
      toast({
        title: "Error",
        description: "Failed to update city",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("nd_city").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cities"] });
    },
    onError: (err) => {
      console.error("Error deleting city:", err);
      toast({
        title: "Error",
        description: "Failed to delete city",
        variant: "destructive",
      });
    },
  });

  const addCity = async (city: Partial<City>) => {
    return addMutation.mutateAsync(city);
  };

  const updateCity = async (id: number, data: Partial<City>) => {
    return updateMutation.mutateAsync({ id, ...data });
  };

  const deleteCity = async (id: number) => {
    return deleteMutation.mutateAsync(id);
  };

  return {
    cities: data || [],
    isLoading,
    error,
    addCity,
    updateCity,
    deleteCity,
  };
}
