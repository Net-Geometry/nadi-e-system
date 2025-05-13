import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { usePermissions } from "@/hooks/use-permissions";
import { SettingsLoading } from "@/components/settings/SettingsLoading";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { SystemSettings } from "@/components/settings/SystemSettings";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Database, Settings as SettingsIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();
  const { data: permissions = [] } = usePermissions();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const canManageSettings = permissions.some(
    (p) => p.name === "manage_settings"
  );

  useEffect(() => {
    const checkSuperAdmin = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", user.id)
          .single();

        setIsSuperAdmin(profile?.user_type === "super_admin");
      } catch (error) {
        console.error("Error checking super admin status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSuperAdmin();
  }, []);

  const handleNavigateToLookup = () => {
    navigate("/admin/lookup-settings");
  };

  if (isLoading) {
    return <SettingsLoading />;
  }

  // Allow access if user is either super_admin or has manage_settings permission
  if (!isSuperAdmin && !canManageSettings) {
    return (
      <DashboardLayout>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">
            You don't have permission to access system settings
          </h2>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-6xl">
        <SettingsHeader />

        <div className="flex items-center justify-end mb-6 gap-4">
          <Button
            onClick={handleNavigateToLookup}
            className="flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            Manage Lookup Data
          </Button>
        </div>

        <div className="space-y-8">
          <SystemSettings />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
