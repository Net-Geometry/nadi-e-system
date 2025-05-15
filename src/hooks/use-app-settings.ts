import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AppSetting {
  id: string;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export const useAppSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: settings = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["app-settings"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("app_settings").select("*");

        if (error) {
          console.error("Error fetching settings:", error);
          throw new Error(`Failed to fetch app settings: ${error.message}`);
        }

        return data as AppSetting[];
      } catch (err) {
        console.error("Error in settings query:", err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { data, error } = await supabase
        .from("app_settings")
        .update({ value })
        .eq("key", key)
        .select();

      if (error) {
        console.error("Error updating setting:", error);
        toast({
          title: "Failed to update setting",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["app-settings"] });
      toast({
        title: "Setting updated",
        description: `Successfully updated ${variables.key}`,
      });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      // Toast is already handled in mutationFn
    },
  });

  const getSetting = (key: string, defaultValue: string = ""): string => {
    if (isLoading || isError) return defaultValue;
    const setting = settings.find((s) => s.key === key);
    return setting?.value ?? defaultValue;
  };

  return {
    settings,
    isLoading,
    isFetching,
    isError,
    error,
    updateSetting,
    getSetting,
    refetch,
  };
};
