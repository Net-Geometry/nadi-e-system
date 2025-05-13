import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/auth";

export const useUsers = () => {
  const fetchUsers = async (): Promise<Profile[]> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Profile[];
  };

  const useUsersQuery = () =>
    useQuery({
      queryKey: ["users"],
      queryFn: fetchUsers,
    });

  return { useUsersQuery };
};
