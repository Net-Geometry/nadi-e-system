import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useRelationship = () => {
  const [relationships, setRelationships] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRelationships();
  }, []);

  const fetchRelationships = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("nd_type_relationship")
        .select("*")
        .order("name");

      if (error) throw error;
      setRelationships(data || []);
    } catch (error: any) {
      console.error("Error fetching relationships:", error.message);
      toast({
        title: "Error",
        description: "Failed to fetch relationships",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addRelationship = async (data: any) => {
    try {
      const { error } = await supabase
        .from("nd_type_relationship")
        .insert(data);
      if (error) throw error;
      await fetchRelationships();
    } catch (error: any) {
      console.error("Error adding relationship:", error.message);
      toast({
        title: "Error",
        description: "Failed to add relationship",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateRelationship = async (id: number, data: any) => {
    try {
      const { error } = await supabase
        .from("nd_type_relationship")
        .update(data)
        .eq("id", id);
      if (error) throw error;
      await fetchRelationships();
    } catch (error: any) {
      console.error("Error updating relationship:", error.message);
      toast({
        title: "Error",
        description: "Failed to update relationship",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteRelationship = async (id: number) => {
    try {
      const { error } = await supabase
        .from("nd_type_relationship")
        .delete()
        .eq("id", id);
      if (error) throw error;
      await fetchRelationships();
    } catch (error: any) {
      console.error("Error deleting relationship:", error.message);
      toast({
        title: "Error",
        description: "Failed to delete relationship",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    relationships,
    isLoading,
    addRelationship,
    updateRelationship,
    deleteRelationship,
  };
};
