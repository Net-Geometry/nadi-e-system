import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useMaintenanceType = () => {
  const [maintenanceTypes, setMaintenanceTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMaintenanceTypes();
  }, []);

  const fetchMaintenanceTypes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("nd_type_maintainance")
        .select("*")
        .order("name");

      if (error) throw error;
      setMaintenanceTypes(data || []);
    } catch (error: any) {
      console.error("Error fetching maintenance types:", error.message);
      toast({
        title: "Error",
        description: "Failed to fetch maintenance types",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addMaintenanceType = async (data: any) => {
    try {
      const { error } = await supabase
        .from("nd_type_maintainance")
        .insert(data);
      if (error) throw error;
      await fetchMaintenanceTypes();
    } catch (error: any) {
      console.error("Error adding maintenance type:", error.message);
      toast({
        title: "Error",
        description: "Failed to add maintenance type",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateMaintenanceType = async (id: number, data: any) => {
    try {
      const { error } = await supabase
        .from("nd_type_maintainance")
        .update(data)
        .eq("id", id);
      if (error) throw error;
      await fetchMaintenanceTypes();
    } catch (error: any) {
      console.error("Error updating maintenance type:", error.message);
      toast({
        title: "Error",
        description: "Failed to update maintenance type",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteMaintenanceType = async (id: number) => {
    try {
      const { error } = await supabase
        .from("nd_type_maintainance")
        .delete()
        .eq("id", id);
      if (error) throw error;
      await fetchMaintenanceTypes();
    } catch (error: any) {
      console.error("Error deleting maintenance type:", error.message);
      toast({
        title: "Error",
        description: "Failed to delete maintenance type",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    maintenanceTypes,
    isLoading,
    addMaintenanceType,
    updateMaintenanceType,
    deleteMaintenanceType,
  };
};
