import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useRegion = () => {
  const [regions, setRegions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("nd_region")
        .select("*")
        .order("name");

      if (error) throw error;
      setRegions(data || []);
    } catch (error: any) {
      console.error("Error fetching regions:", error.message);
      toast({
        title: "Error",
        description: "Failed to fetch regions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addRegion = async (data: any) => {
    try {
      const { error } = await supabase.from("nd_region").insert(data);
      if (error) throw error;
      await fetchRegions();
    } catch (error: any) {
      console.error("Error adding region:", error.message);
      toast({
        title: "Error",
        description: "Failed to add region",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateRegion = async (id: number, data: any) => {
    try {
      const { error } = await supabase
        .from("nd_region")
        .update(data)
        .eq("id", id);
      if (error) throw error;
      await fetchRegions();
    } catch (error: any) {
      console.error("Error updating region:", error.message);
      toast({
        title: "Error",
        description: "Failed to update region",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteRegion = async (id: number) => {
    try {
      const { error } = await supabase.from("nd_region").delete().eq("id", id);
      if (error) throw error;
      await fetchRegions();
    } catch (error: any) {
      console.error("Error deleting region:", error.message);
      toast({
        title: "Error",
        description: "Failed to delete region",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    regions,
    isLoading,
    addRegion,
    updateRegion,
    deleteRegion,
  };
};
