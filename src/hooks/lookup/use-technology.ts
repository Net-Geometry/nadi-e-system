import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useTechnology = () => {
  const [technologies, setTechnologies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTechnologies();
  }, []);

  const fetchTechnologies = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("nd_technology")
        .select("*")
        .order("name");

      if (error) throw error;
      setTechnologies(data || []);
    } catch (error: any) {
      console.error("Error fetching technologies:", error.message);
      toast({
        title: "Error",
        description: "Failed to fetch technologies",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addTechnology = async (data: any) => {
    try {
      const { error } = await supabase.from("nd_technology").insert(data);
      if (error) throw error;
      await fetchTechnologies();
    } catch (error: any) {
      console.error("Error adding technology:", error.message);
      toast({
        title: "Error",
        description: "Failed to add technology",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateTechnology = async (id: number, data: any) => {
    try {
      const { error } = await supabase
        .from("nd_technology")
        .update(data)
        .eq("id", id);
      if (error) throw error;
      await fetchTechnologies();
    } catch (error: any) {
      console.error("Error updating technology:", error.message);
      toast({
        title: "Error",
        description: "Failed to update technology",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteTechnology = async (id: number) => {
    try {
      const { error } = await supabase
        .from("nd_technology")
        .delete()
        .eq("id", id);
      if (error) throw error;
      await fetchTechnologies();
    } catch (error: any) {
      console.error("Error deleting technology:", error.message);
      toast({
        title: "Error",
        description: "Failed to delete technology",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    technologies,
    isLoading,
    addTechnology,
    updateTechnology,
    deleteTechnology,
  };
};
