import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useSectorType = () => {
  const [sectorTypes, setSectorTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSectorTypes();
  }, []);

  const fetchSectorTypes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("nd_type_sector")
        .select("*")
        .order("name");

      if (error) throw error;
      setSectorTypes(data || []);
    } catch (error: any) {
      console.error("Error fetching sector types:", error.message);
      toast({
        title: "Error",
        description: "Failed to fetch sector types",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addSectorType = async (data: any) => {
    try {
      const { error } = await supabase.from("nd_type_sector").insert(data);
      if (error) throw error;
      await fetchSectorTypes();
    } catch (error: any) {
      console.error("Error adding sector type:", error.message);
      toast({
        title: "Error",
        description: "Failed to add sector type",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateSectorType = async (id: number, data: any) => {
    try {
      const { error } = await supabase
        .from("nd_type_sector")
        .update(data)
        .eq("id", id);
      if (error) throw error;
      await fetchSectorTypes();
    } catch (error: any) {
      console.error("Error updating sector type:", error.message);
      toast({
        title: "Error",
        description: "Failed to update sector type",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteSectorType = async (id: number) => {
    try {
      const { error } = await supabase
        .from("nd_type_sector")
        .delete()
        .eq("id", id);
      if (error) throw error;
      await fetchSectorTypes();
    } catch (error: any) {
      console.error("Error deleting sector type:", error.message);
      toast({
        title: "Error",
        description: "Failed to delete sector type",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    sectorTypes,
    isLoading,
    addSectorType,
    updateSectorType,
    deleteSectorType,
  };
};
