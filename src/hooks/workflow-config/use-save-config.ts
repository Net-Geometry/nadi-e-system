import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WorkflowConfig, WorkflowConfigStep } from "@/types/workflow";
import { useNavigate } from "react-router-dom";

export function useSaveConfig(isNew: boolean) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const saveWorkflowConfig = async (
    updatedConfig: WorkflowConfig,
    updatedSteps: WorkflowConfigStep[]
  ) => {
    setIsSaving(true);

    try {
      let configId = updatedConfig.id;

      // If it's a new config, create it first
      if (isNew) {
        const newConfig = {
          title: updatedConfig.title,
          description: updatedConfig.description,
          module_id: updatedConfig.moduleId,
          module_name: updatedConfig.moduleName,
          is_active: updatedConfig.isActive,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          start_step_id: updatedConfig.startStepId,
          sla_hours: updatedConfig.slaHours,
        };

        const { data: insertedConfig, error: configError } = await supabase
          .from("workflow_configurations")
          .insert(newConfig)
          .select()
          .single();

        if (configError) {
          throw configError;
        }

        configId = insertedConfig.id;
      } else {
        // Update existing config
        const { error: configError } = await supabase
          .from("workflow_configurations")
          .update({
            title: updatedConfig.title,
            description: updatedConfig.description,
            module_id: updatedConfig.moduleId,
            module_name: updatedConfig.moduleName,
            is_active: updatedConfig.isActive,
            updated_at: new Date().toISOString(),
            start_step_id: updatedConfig.startStepId,
            sla_hours: updatedConfig.slaHours,
          })
          .eq("id", configId);

        if (configError) {
          throw configError;
        }

        // Delete existing steps to replace with new ones
        const { error: deleteError } = await supabase
          .from("workflow_config_steps")
          .delete()
          .eq("workflow_config_id", configId);

        if (deleteError) {
          throw deleteError;
        }
      }

      // Insert updated steps
      if (updatedSteps.length > 0) {
        const stepsToInsert = updatedSteps.map((step, index) => ({
          name: step.name,
          description: step.description,
          workflow_config_id: configId,
          order_index: index,
          approver_user_types: step.approverUserTypes,
          conditions: step.conditions,
          next_step_id: step.nextStepId,
          is_start_step: step.isStartStep,
          is_end_step: step.isEndStep,
          sla_hours: step.slaHours,
        }));

        const { error: stepsError } = await supabase
          .from("workflow_config_steps")
          .insert(stepsToInsert);

        if (stepsError) {
          throw stepsError;
        }
      }

      toast({
        title: "Success",
        description: "Workflow configuration saved successfully",
      });

      // Redirect back to the list view
      navigate("/workflow");
    } catch (error) {
      console.error("Error saving workflow configuration:", error);
      toast({
        title: "Error",
        description: "Failed to save workflow configuration",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    saveWorkflowConfig,
  };
}
