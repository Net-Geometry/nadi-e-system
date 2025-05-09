import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Permission } from "@/types/auth";

interface PermissionData {
  id: string;
  name: string;
  description: string | null;
  module: string;
  action: string;
  created_at?: string;
}

interface RolePermissionResponse {
  permissions: PermissionData[];
}

export const usePermissions = () => {
  return useQuery({
    queryKey: ["user-permissions"],
    queryFn: async () => {
      console.log("Fetching user permissions...");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error fetching user:", userError);
        throw userError;
      }

      if (!user) {
        console.log("No authenticated user found");
        return [] as Permission[];
      }

      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("role_id")
        .eq("user_id", user.id);

      if (rolesError) {
        console.error("Error fetching user roles:", rolesError);
        throw rolesError;
      }

      if (!userRoles.length) {
        console.log("No roles found for user");
        return [] as Permission[];
      }

      const roleIds = userRoles.map((ur) => ur.role_id);

      const { data: permissions, error: permissionsError } = await supabase
        .from("role_permissions")
        .select(
          `
          permissions:permission_id (
            id,
            name,
            description,
            module,
            action,
            created_at
          )
        `
        )
        .in("role_id", roleIds);

      if (permissionsError) {
        console.error("Error fetching permissions:", permissionsError);
        throw permissionsError;
      }

      console.log("Fetched permissions:", permissions);

      // Remove duplicates and transform the data to match the Permission interface
      const transformedPermissions = [
        ...new Set(
          permissions.flatMap((p: RolePermissionResponse) =>
            p.permissions.map((permission) => ({
              id: permission.id,
              name: permission.name,
              description: permission.description,
              module: permission.module,
              action: permission.action,
              created_at: permission.created_at,
            }))
          )
        ),
      ];

      return transformedPermissions;
    },
    retry: 1,
    meta: {
      onError: (error: Error) => {
        console.error("Query error:", error);
      },
    },
  });
};
