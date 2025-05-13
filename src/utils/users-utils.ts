import { Profile } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";

export const fetchUsers = async (
  searchQuery: string,
  userTypeFilter: string
) => {
  let query = supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (searchQuery) {
    query = query.or(
      `full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`
    );
  }

  if (userTypeFilter && userTypeFilter !== "all") {
    query = query.eq("user_type", userTypeFilter);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Profile[];
};

export const deleteUsers = async (userIds: string[]) => {
  const { error } = await supabase.from("profiles").delete().in("id", userIds);

  if (error) throw error;
};

export const exportUsersToCSV = (users: Profile[]) => {
  const csvContent =
    "data:text/csv;charset=utf-8," +
    "Full Name,Email,User Type,Created At\n" +
    users
      .map((user) =>
        [
          user.full_name,
          user.email,
          user.user_type,
          new Date(user.created_at).toLocaleDateString(),
        ].join(",")
      )
      .join("\n");

  return encodeURI(csvContent);
};
