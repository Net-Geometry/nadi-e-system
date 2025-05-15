import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/auth";

export const useUserId = () => {
  const fetchUserByName = async (name: string): Promise<Profile> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("full_name", name)
      .maybeSingle()

    if (error) throw error;

    return data;
  };

  return { fetchUserByName };
};
