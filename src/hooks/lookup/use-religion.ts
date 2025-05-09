import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useReligion = () => {
  const [religions, setReligions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReligions();
  }, []);

  const fetchReligions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("nd_religion")
        .select("*")
        .order("eng");

      if (error) throw error;
      setReligions(data || []);
    } catch (error: any) {
      console.error("Error fetching religions:", error.message);
      toast({
        title: "Error",
        description: "Failed to fetch religions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addReligion = async (data: any) => {
    try {
      const { error } = await supabase.from("nd_religion").insert(data);
      if (error) throw error;
      await fetchReligions();
    } catch (error: any) {
      console.error("Error adding religion:", error.message);
      toast({
        title: "Error",
        description: "Failed to add religion",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateReligion = async (id: number, data: any) => {
    try {
      const { error } = await supabase
        .from("nd_religion")
        .update(data)
        .eq("id", id);
      if (error) throw error;
      await fetchReligions();
    } catch (error: any) {
      console.error("Error updating religion:", error.message);
      toast({
        title: "Error",
        description: "Failed to update religion",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteReligion = async (id: number) => {
    try {
      const { error } = await supabase
        .from("nd_religion")
        .delete()
        .eq("id", id);
      if (error) throw error;
      await fetchReligions();
    } catch (error: any) {
      console.error("Error deleting religion:", error.message);
      toast({
        title: "Error",
        description: "Failed to delete religion",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    religions,
    isLoading,
    addReligion,
    updateReligion,
    deleteReligion,
  };
};
