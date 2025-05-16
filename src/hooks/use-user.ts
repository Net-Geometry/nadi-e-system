import { supabase } from "@/integrations/supabase/client";

export const useUserId = () => {
  const fetchUserByName = async (name: string) => {
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

export const useUserName = () => {
  const fetchUserById = async (id: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", id)
      .maybeSingle()

    if (error) throw error;

    return data;
  }

  return { fetchUserById}
}
