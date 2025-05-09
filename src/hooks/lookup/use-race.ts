import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useRace = () => {
  const [races, setRaces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRaces();
  }, []);

  const fetchRaces = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("nd_races")
        .select("*")
        .order("eng");

      if (error) throw error;
      setRaces(data || []);
    } catch (error: any) {
      console.error("Error fetching races:", error.message);
      toast({
        title: "Error",
        description: "Failed to fetch races",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addRace = async (data: any) => {
    try {
      const { error } = await supabase.from("nd_races").insert(data);
      if (error) throw error;
      await fetchRaces();
    } catch (error: any) {
      console.error("Error adding race:", error.message);
      toast({
        title: "Error",
        description: "Failed to add race",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateRace = async (id: number, data: any) => {
    try {
      const { error } = await supabase
        .from("nd_races")
        .update(data)
        .eq("id", id);
      if (error) throw error;
      await fetchRaces();
    } catch (error: any) {
      console.error("Error updating race:", error.message);
      toast({
        title: "Error",
        description: "Failed to update race",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteRace = async (id: number) => {
    try {
      const { error } = await supabase.from("nd_races").delete().eq("id", id);
      if (error) throw error;
      await fetchRaces();
    } catch (error: any) {
      console.error("Error deleting race:", error.message);
      toast({
        title: "Error",
        description: "Failed to delete race",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    races,
    isLoading,
    addRace,
    updateRace,
    deleteRace,
  };
};
