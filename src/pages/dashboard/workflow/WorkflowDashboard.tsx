import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { WorkflowConfigList } from "@/components/workflow/WorkflowConfigList";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { WorkflowConfig } from "@/types/workflow";

const WorkflowDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [configurations, setConfigurations] = useState<WorkflowConfig[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch workflow configurations
  const fetchConfigurations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("workflow_configurations")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) {
        throw error;
      }

      // Map database fields (snake_case) to our model fields (camelCase)
      const mappedConfigurations: WorkflowConfig[] = data.map(
        (config: any) => ({
          id: config.id,
          title: config.title,
          description: config.description || "",
          moduleId: config.module_id || "",
          moduleName: config.module_name || "",
          isActive: config.is_active || false,
          createdAt: config.created_at || new Date().toISOString(),
          updatedAt: config.updated_at || new Date().toISOString(),
          startStepId: config.start_step_id || "",
          steps: [],
          slaHours: config.sla_hours || 48,
        })
      );

      setConfigurations(mappedConfigurations);
    } catch (error) {
      console.error("Error fetching configurations:", error);
      toast({
        title: "Error",
        description: "Failed to load workflow configurations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchConfigurations();
  }, []);

  const handleCreateConfig = () => {
    navigate("/workflow/configuration/new");
  };

  const handleDeleteConfig = async (id: string) => {
    try {
      const { error } = await supabase
        .from("workflow_configurations")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      // Remove from local state
      setConfigurations((prevConfigs) =>
        prevConfigs.filter((config) => config.id !== id)
      );

      toast({
        title: "Configuration Deleted",
        description: "The workflow configuration has been deleted",
      });
    } catch (error) {
      console.error("Error deleting configuration:", error);
      toast({
        title: "Error",
        description: "Failed to delete workflow configuration",
        variant: "destructive",
      });
    }
  };

  const handleEditConfig = (id: string) => {
    navigate(`/workflow/configuration/${id}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Workflow Configurations</h1>
          <Button onClick={handleCreateConfig}>
            <Plus className="mr-2 h-4 w-4" />
            New Configuration
          </Button>
        </div>

        <WorkflowConfigList
          configurations={configurations}
          isLoading={isLoading}
          onEdit={handleEditConfig}
          onDelete={handleDeleteConfig}
          onRefresh={fetchConfigurations}
        />
      </div>
    </DashboardLayout>
  );
};

export default WorkflowDashboard;
