import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WorkflowConfig, WorkflowConfigStep } from "@/types/workflow";
import { useParams } from "react-router-dom";

export function useConfigData() {
  const [config, setConfig] = useState<WorkflowConfig | null>(null);
  const [steps, setSteps] = useState<WorkflowConfigStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { id } = useParams();
  const isNew = id === "new";

  // Fetch workflow configuration and steps
  useEffect(() => {
    if (isNew) {
      // Initialize with default values for a new configuration
      setConfig({
        id: "",
        title: "",
        description: "",
        moduleId: "",
        moduleName: "",
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        startStepId: "",
        steps: [],
        slaHours: 48,
      });
      setSteps([]);
      return;
    }

    const fetchWorkflowConfig = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        // Fetch workflow configuration
        const { data: configData, error: configError } = await supabase
          .from("workflow_configurations")
          .select("*")
          .eq("id", id)
          .single();

        if (configError) {
          throw configError;
        }

        // Fetch workflow steps
        const { data: stepsData, error: stepsError } = await supabase
          .from("workflow_config_steps")
          .select("*")
          .eq("workflow_config_id", id)
          .order("order_index", { ascending: true });

        if (stepsError) {
          throw stepsError;
        }

        // Map database fields (snake_case) to our model fields (camelCase)
        const mappedConfig: WorkflowConfig = {
          id: configData.id,
          title: configData.title,
          description: configData.description || "",
          moduleId: configData.module_id || "",
          moduleName: configData.module_name || "",
          isActive: configData.is_active || false,
          createdAt: configData.created_at || new Date().toISOString(),
          updatedAt: configData.updated_at || new Date().toISOString(),
          startStepId: configData.start_step_id || "",
          steps: [],
          slaHours: configData.sla_hours || 48,
        };

        // Map database fields (snake_case) to our model fields (camelCase)
        const mappedSteps: WorkflowConfigStep[] = stepsData.map(
          (step: any) => ({
            id: step.id,
            name: step.name,
            description: step.description || "",
            order: step.order_index,
            approverUserTypes: step.approver_user_types || [],
            conditions: step.conditions || [],
            nextStepId: step.next_step_id,
            isStartStep: step.is_start_step || false,
            isEndStep: step.is_end_step || false,
            slaHours: step.sla_hours || 24,
          })
        );

        setConfig(mappedConfig);
        setSteps(mappedSteps);
      } catch (error) {
        console.error("Error fetching workflow configuration:", error);
        toast({
          title: "Error",
          description: "Failed to load workflow configuration",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflowConfig();
  }, [id, isNew, toast]);

  return {
    config,
    setConfig,
    steps,
    setSteps,
    isLoading,
    isNew,
  };
}
