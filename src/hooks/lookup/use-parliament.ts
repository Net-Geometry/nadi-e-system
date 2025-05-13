import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useParliament = () => {
  const [parliaments, setParliaments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchParliaments();
  }, []);

  const fetchParliaments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("nd_parliaments")
        .select("*")
        .order("name");

      if (error) throw error;
      setParliaments(data || []);
    } catch (error: any) {
      console.error("Error fetching parliaments:", error.message);
      toast({
        title: "Error",
        description: "Failed to fetch parliaments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addParliament = async (data: any) => {
    try {
      const { error } = await supabase.from("nd_parliaments").insert(data);
      if (error) throw error;
      await fetchParliaments();
    } catch (error: any) {
      console.error("Error adding parliament:", error.message);
      toast({
        title: "Error",
        description: "Failed to add parliament",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateParliament = async (id: number, data: any) => {
    try {
      const { error } = await supabase
        .from("nd_parliaments")
        .update(data)
        .eq("id", id);
      if (error) throw error;
      await fetchParliaments();
    } catch (error: any) {
      console.error("Error updating parliament:", error.message);
      toast({
        title: "Error",
        description: "Failed to update parliament",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteParliament = async (id: number) => {
    try {
      const { error } = await supabase
        .from("nd_parliaments")
        .delete()
        .eq("id", id);
      if (error) throw error;
      await fetchParliaments();
    } catch (error: any) {
      console.error("Error deleting parliament:", error.message);
      toast({
        title: "Error",
        description: "Failed to delete parliament",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    parliaments,
    isLoading,
    addParliament,
    updateParliament,
    deleteParliament,
  };
};
