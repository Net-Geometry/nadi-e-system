import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Role {
  id: string;
  name: string;
  description: string;
  created_at: string;
  users_count: number;
}

export const useRoles = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: roles,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      console.log("Fetching roles data...");

      try {
        const { data: rolesData, error: rolesError } = await supabase
          .from("roles")
          .select("id, name, description, created_at");

        if (rolesError) {
          console.error("Error fetching roles:", rolesError);
          throw rolesError;
        }

        if (!rolesData) {
          throw new Error("No roles data returned");
        }

        console.log("Roles data fetched:", rolesData);

        // Get counts directly from profiles table based on user_type
        const rolesWithCounts = await Promise.all(
          rolesData.map(async (role) => {
            let count = 0;

            // Map role names to corresponding user_types in profiles
            if (role.name === "super_admin") {
              // For super_admin role, count profiles with user_type 'super_admin'
              const { count: adminCount, error: adminError } = await supabase
                .from("profiles")
                .select("*", { count: "exact", head: true })
                .eq("user_type", "super_admin");

              if (adminError) {
                console.error("Error counting super_admin users:", adminError);
              } else {
                count = adminCount || 0;
              }
            } else if (role.name === "admin") {
              // For admin role, count profiles with admin-like user_types
              const adminTypes = [
                "sso",
                "dusp",
                "tp",
                "staff_internal",
                "staff_external",
                "medical_office",
              ];

              const { count: adminCount, error: adminError } = await supabase
                .from("profiles")
                .select("*", { count: "exact", head: true })
                .in("user_type", adminTypes);

              if (adminError) {
                console.error("Error counting admin users:", adminError);
              } else {
                count = adminCount || 0;
              }
            } else if (role.name === "user") {
              // For user role, count profiles with user_type 'member'
              const { count: userCount, error: userError } = await supabase
                .from("profiles")
                .select("*", { count: "exact", head: true })
                .eq("user_type", "member");

              if (userError) {
                console.error("Error counting member users:", userError);
              } else {
                count = userCount || 0;
              }
            } else {
              // For other roles, use the role name directly as the user_type
              const { count: otherCount, error: otherError } = await supabase
                .from("profiles")
                .select("*", { count: "exact", head: true })
                .eq("user_type", role.name.toLowerCase());

              if (otherError) {
                console.error(`Error counting ${role.name} users:`, otherError);
              } else {
                count = otherCount || 0;
              }
            }

            return {
              ...role,
              users_count: count,
            };
          })
        );

        console.log("Roles with counts:", rolesWithCounts);
        return rolesWithCounts;
      } catch (error) {
        console.error("Error in queryFn:", error);
        throw error;
      }
    },
    meta: {
      onError: (error: Error) => {
        console.error("Query error:", error);
        toast({
          title: "Error",
          description: "Failed to fetch roles data. Please try again.",
          variant: "destructive",
        });
      },
    },
  });

  const createRole = async (values: { name: string; description: string }) => {
    try {
      const { error } = await supabase.from("roles").insert([values]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Role created successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["roles"] });
    } catch (error) {
      console.error("Error creating role:", error);
      toast({
        title: "Error",
        description: "Failed to create role. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateRole = async (
    roleId: string,
    values: { description: string }
  ) => {
    try {
      const { error } = await supabase
        .from("roles")
        .update({ description: values.description })
        .eq("id", roleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Role updated successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["roles"] });
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "Failed to update role. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    roles,
    isLoading,
    error,
    createRole,
    updateRole,
  };
};
