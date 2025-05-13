import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PermissionGroup } from "@/components/permissions/PermissionGroup";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Permission, groupPermissionsByModule } from "@/lib/permissions";

const fetchPermissions = async () => {
  console.log("Fetching permissions...");
  const { data, error } = await supabase
    .from("permissions")
    .select("*")
    .order("module", { ascending: true });

  if (error) {
    console.error("Error fetching permissions:", error);
    throw error;
  }

  console.log("Permissions fetched:", data);
  return data as Permission[];
};

const AccessControl = () => {
  const { data: permissions, isLoading } = useQuery({
    queryKey: ["permissions"],
    queryFn: fetchPermissions,
    meta: {
      onError: (error: Error) => {
        console.error("Query error:", error);
      },
    },
  });

  const permissionGroups = permissions
    ? groupPermissionsByModule(permissions)
    : [];
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const handleTogglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  if (isLoading) {
    return <div>Loading permissions...</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Access Control</h1>
          <p className="text-muted-foreground mt-2">
            Manage permissions and access levels
          </p>
        </div>

        <div className="grid gap-6">
          {permissionGroups.map((group) => (
            <PermissionGroup
              key={group.module}
              group={group}
              selectedPermissions={selectedPermissions}
              onTogglePermission={handleTogglePermission}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AccessControl;
