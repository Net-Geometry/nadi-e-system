import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface Phase {
  id: number;
  name: string;
  contract_start: string | null;
  contract_end: string | null;
  is_active: boolean | null;
  remark: string | null;
  created_at: string | null;
  created_by: string | null;
  updated_at: string | null;
  updated_by: string | null;
}

export function usePhase(phaseId: string | number | null) {
  const { toast } = useToast();
  
  const {
    data: phase,
    isLoading,
    error
  } = useQuery({
    queryKey: ["phase", phaseId],
    queryFn: async () => {
      if (!phaseId) return null;
      
      const { data, error } = await supabase
        .from("nd_phases")
        .select("*")
        .eq("id", Number(phaseId))
        .single();
      
      if (error) {
        console.error("Error fetching phase:", error);
        toast({
          title: "Error",
          description: "Failed to load phase information",
          variant: "destructive"
        });
        throw error;
      }
      
      return data as Phase;
    },
    enabled: !!phaseId // Only run query if phaseId is provided
  });
  
  return {
    phase,
    isLoading,
    error
  };
}

export function useAllPhases() {
  const { toast } = useToast();
  
  const {
    data: phases,
    isLoading,
    error
  } = useQuery({
    queryKey: ["phases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nd_phases")
        .select("*")
        .order("id");
      
      if (error) {
        console.error("Error fetching phases:", error);
        toast({
          title: "Error",
          description: "Failed to load phases",
          variant: "destructive"
        });
        throw error;
      }
      
      return data as Phase[];
    }
  });
  
  return {
    phases,
    isLoading,
    error
  };
}

export default usePhase;
