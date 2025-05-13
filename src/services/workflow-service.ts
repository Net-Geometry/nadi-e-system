import { supabase } from "@/integrations/supabase/client";
import {
  ApprovalAction,
  WorkOrderData,
  WorkOrderStatus,
  WorkflowDefinition,
} from "@/types/workflow";

// Predefined workflow definitions
const workOrderApprovalFlow: WorkflowDefinition = {
  id: "work-order-approval",
  type: "work_order",
  name: "Work Order Approval Flow",
  description: "Approval process for work orders completion",
  initialStep: "completion-approval",
  isActive: true, // Added the required isActive property
  moduleId: "work-orders", // Added optional moduleId property
  steps: [
    {
      id: "completion-approval",
      name: "Work Order Completion Approval",
      description: "TP/Staff approves the completion of the work order",
      approverRoles: ["tp", "staff"],
      nextStepOnApprove: null,
      nextStepOnReject: "rejection-reason-approval",
      statusOnApprove: "complete",
      statusOnReject: "incomplete",
      requireReason: true,
    },
    {
      id: "rejection-reason-approval",
      name: "Work Order Rejection Reason Approval",
      description: "TP/Staff approves the reason for work order incompletion",
      approverRoles: ["tp", "staff"],
      nextStepOnApprove: null,
      nextStepOnReject: null,
      statusOnApprove: "in_progress",
      statusOnReject: "cancelled",
      requireReason: true,
    },
  ],
};

const trainingReportApprovalFlow: WorkflowDefinition = {
  id: "training-report-approval",
  type: "training_report",
  name: "Staff Training Report Approval",
  description: "Approval process for staff training reports",
  initialStep: "tp-approval",
  isActive: true, // Added the required isActive property
  moduleId: "training", // Added optional moduleId property
  steps: [
    {
      id: "tp-approval",
      name: "Technology Partner Approval",
      description: "Technology Partner approves the staff training report",
      approverRoles: ["tp"],
      nextStepOnApprove: null,
      nextStepOnReject: null,
      statusOnApprove: "complete",
      statusOnReject: "rejected",
      requireReason: true,
    },
  ],
};

const centerManagementApprovalFlow: WorkflowDefinition = {
  id: "center-management-approval",
  type: "center_management",
  name: "Center Management Approval",
  description: "Approval process for center relocation or temporary closure",
  initialStep: "admin-review",
  isActive: true, // Added the required isActive property
  moduleId: "center-management", // Added optional moduleId property
  steps: [
    {
      id: "admin-review",
      name: "Administrative Review",
      description: "Review of the center management request by administrators",
      approverRoles: ["admin", "manager"],
      nextStepOnApprove: null,
      nextStepOnReject: null,
      statusOnApprove: "approved",
      statusOnReject: "rejected",
      requireReason: true,
    },
  ],
};

// Map of workflow definitions by ID
const workflowDefinitions: Record<string, WorkflowDefinition> = {
  "work-order-approval": workOrderApprovalFlow,
  "training-report-approval": trainingReportApprovalFlow,
  "center-management-approval": centerManagementApprovalFlow,
};

export const WorkflowService = {
  // Get a workflow definition by ID
  getWorkflowDefinition(workflowId: string): WorkflowDefinition | undefined {
    return workflowDefinitions[workflowId];
  },

  // Get all workflow definitions
  getAllWorkflowDefinitions(): WorkflowDefinition[] {
    return Object.values(workflowDefinitions);
  },

  // Start a new workflow process for a work order
  async startWorkOrderWorkflow(
    workOrderId: string,
    createdBy: string
  ): Promise<WorkOrderData | null> {
    const workflow = workflowDefinitions["work-order-approval"];
    const initialStep = workflow.steps.find(
      (step) => step.id === workflow.initialStep
    );

    if (!initialStep) {
      console.error("Initial step not found in workflow definition");
      return null;
    }

    // Create a work order record with workflow data
    const workOrderData: Partial<WorkOrderData> = {
      id: workOrderId,
      status: "pending_approval",
      createdBy,
      createdAt: new Date().toISOString(),
      currentStepId: initialStep.id,
      requiredApprovals: initialStep.approverRoles,
      approvals: [],
    };

    try {
      // Update the work order in the database with workflow data
      const { data, error } = await supabase.from("workflows").insert({
        entity_id: workOrderId,
        entity_type: "work_order",
        workflow_id: workflow.id,
        current_step: initialStep.id,
        status: "pending_approval",
        data: workOrderData,
      });

      if (error) {
        console.error("Error starting workflow:", error);
        return null;
      }

      return workOrderData as WorkOrderData;
    } catch (error) {
      console.error("Error in startWorkOrderWorkflow:", error);
      return null;
    }
  },

  // Process an approval action
  async processApproval(
    workOrderId: string,
    stepId: string,
    approverId: string,
    action: ApprovalAction,
    reason?: string
  ): Promise<{
    success: boolean;
    newStatus?: WorkOrderStatus;
    nextStep?: string;
  }> {
    try {
      // Get the current workflow data
      const { data: workflowData, error: fetchError } = await supabase
        .from("workflows")
        .select("*")
        .eq("entity_id", workOrderId)
        .eq("entity_type", "work_order")
        .single();

      if (fetchError || !workflowData) {
        console.error("Error fetching workflow:", fetchError);
        return { success: false };
      }

      // Get the workflow definition
      const workflowDef = workflowDefinitions[workflowData.workflow_id];
      if (!workflowDef) {
        console.error(
          "Workflow definition not found",
          workflowData.workflow_id
        );
        return { success: false };
      }

      // Get the current step
      const currentStep = workflowDef.steps.find((step) => step.id === stepId);
      if (!currentStep) {
        console.error("Current step not found in workflow definition");
        return { success: false };
      }

      // Determine the next step and status based on the action
      const isApproved = action === "approve";
      const nextStepId = isApproved
        ? currentStep.nextStepOnApprove
        : currentStep.nextStepOnReject;
      const newStatus = isApproved
        ? currentStep.statusOnApprove
        : currentStep.statusOnReject;

      // Add the approval to the work order data
      const workOrderData = workflowData.data as WorkOrderData;
      const updatedApprovals = [
        ...workOrderData.approvals,
        {
          stepId,
          approverId,
          approved: isApproved,
          reason,
          timestamp: new Date().toISOString(),
        },
      ];

      // Update the work order data with the new approval
      const updatedData: Partial<WorkOrderData> = {
        ...workOrderData,
        approvals: updatedApprovals,
        status: newStatus,
        currentStepId: nextStepId || null,
      };

      if (!isApproved && reason) {
        updatedData.rejectionReason = reason;
      }

      // Update the workflow in the database
      const { error: updateError } = await supabase
        .from("workflows")
        .update({
          current_step: nextStepId,
          status: newStatus,
          data: updatedData,
        })
        .eq("entity_id", workOrderId)
        .eq("entity_type", "work_order");

      if (updateError) {
        console.error("Error updating workflow:", updateError);
        return { success: false };
      }

      // Also update the actual work order status
      const { error: workOrderUpdateError } = await supabase
        .from("work_orders")
        .update({
          status: newStatus,
        })
        .eq("id", workOrderId);

      if (workOrderUpdateError) {
        console.error(
          "Error updating work order status:",
          workOrderUpdateError
        );
      }

      return {
        success: true,
        newStatus,
        nextStep: nextStepId || undefined,
      };
    } catch (error) {
      console.error("Error in processApproval:", error);
      return { success: false };
    }
  },

  // Get active workflows for a user based on their roles
  async getActiveWorkflowsForUser(
    userId: string,
    userRoles: string[]
  ): Promise<any[]> {
    try {
      // Get workflows that require approval from any of the user's roles
      const { data: workflows, error } = await supabase
        .from("workflows")
        .select("*")
        .eq("status", "pending_approval");

      if (error) {
        console.error("Error fetching workflows:", error);
        return [];
      }

      // Filter workflows where the current step requires approval from the user's roles
      return workflows.filter((workflow) => {
        const workflowDef = workflowDefinitions[workflow.workflow_id];
        if (!workflowDef) return false;

        const currentStep = workflowDef.steps.find(
          (step) => step.id === workflow.current_step
        );
        if (!currentStep) return false;

        // Check if any of the user's roles are in the required approver roles
        return currentStep.approverRoles.some((role) =>
          userRoles.includes(role)
        );
      });
    } catch (error) {
      console.error("Error in getActiveWorkflowsForUser:", error);
      return [];
    }
  },
};
