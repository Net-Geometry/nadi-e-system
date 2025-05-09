import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useOccupation = () => {
  const [occupations, setOccupations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOccupations();
  }, []);

  const fetchOccupations = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("nd_occupation")
        .select("*")
        .order("name");

      if (error) throw error;
      setOccupations(data || []);
    } catch (error: any) {
      console.error("Error fetching occupations:", error.message);
      toast({
        title: "Error",
        description: "Failed to fetch occupations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addOccupation = async (data: any) => {
    try {
      const { error } = await supabase.from("nd_occupation").insert(data);
      if (error) throw error;
      await fetchOccupations();
    } catch (error: any) {
      console.error("Error adding occupation:", error.message);
      toast({
        title: "Error",
        description: "Failed to add occupation",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateOccupation = async (id: number, data: any) => {
    try {
      const { error } = await supabase
        .from("nd_occupation")
        .update(data)
        .eq("id", id);
      if (error) throw error;
      await fetchOccupations();
    } catch (error: any) {
      console.error("Error updating occupation:", error.message);
      toast({
        title: "Error",
        description: "Failed to update occupation",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteOccupation = async (id: number) => {
    try {
      const { error } = await supabase
        .from("nd_occupation")
        .delete()
        .eq("id", id);
      if (error) throw error;
      await fetchOccupations();
    } catch (error: any) {
      console.error("Error deleting occupation:", error.message);
      toast({
        title: "Error",
        description: "Failed to delete occupation",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    occupations,
    isLoading,
    addOccupation,
    updateOccupation,
    deleteOccupation,
  };
};
