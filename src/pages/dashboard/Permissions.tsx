import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PermissionGroup } from "@/components/permissions/PermissionGroup";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Permission, groupPermissionsByModule } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

const Permissions = () => {
  const navigate = useNavigate();
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

  const handleBackToRoles = () => {
    navigate("/admin/roles");
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div>Loading permissions...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-6xl space-y-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToRoles}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Roles
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold">Permissions Management</h1>
          <p className="text-muted-foreground mt-2">
            Configure access control and permission settings
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

export default Permissions;
