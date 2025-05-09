import { useState as useReactState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useStateData = () => {
  const [states, setStates] = useReactState<any[]>([]);
  const [isLoading, setIsLoading] = useReactState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("nd_state")
        .select("*")
        .order("name");

      if (error) throw error;
      setStates(data || []);
    } catch (error: any) {
      console.error("Error fetching states:", error.message);
      toast({
        title: "Error",
        description: "Failed to fetch states",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addState = async (data: any) => {
    try {
      const { error } = await supabase.from("nd_state").insert(data);
      if (error) throw error;
      await fetchStates();
    } catch (error: any) {
      console.error("Error adding state:", error.message);
      toast({
        title: "Error",
        description: "Failed to add state",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateState = async (id: number, data: any) => {
    try {
      const { error } = await supabase
        .from("nd_state")
        .update(data)
        .eq("id", id);
      if (error) throw error;
      await fetchStates();
    } catch (error: any) {
      console.error("Error updating state:", error.message);
      toast({
        title: "Error",
        description: "Failed to update state",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteState = async (id: number) => {
    try {
      const { error } = await supabase.from("nd_state").delete().eq("id", id);
      if (error) throw error;
      await fetchStates();
    } catch (error: any) {
      console.error("Error deleting state:", error.message);
      toast({
        title: "Error",
        description: "Failed to delete state",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    states,
    isLoading,
    addState,
    updateState,
    deleteState,
  };
};
