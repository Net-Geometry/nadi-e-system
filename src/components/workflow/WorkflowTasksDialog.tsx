import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertTriangle } from "lucide-react";
import { TaskFormDialog } from "./TaskFormDialog";

interface WorkflowTasksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflow: any;
}

export const WorkflowTasksDialog = ({
  open,
  onOpenChange,
  workflow,
}: WorkflowTasksDialogProps) => {
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["workflow-tasks", workflow?.id],
    queryFn: async () => {
      if (!workflow?.id) return [];

      console.log("Fetching tasks for workflow:", workflow.id);
      const { data, error } = await supabase
        .from("workflow_tasks")
        .select("*")
        .eq("workflow_id", workflow.id)
        .order("order_index", { ascending: true });

      if (error) {
        console.error("Error fetching tasks:", error);
        throw error;
      }

      console.log("Tasks fetched:", data);
      return data;
    },
    enabled: !!workflow?.id,
  });

  const handleEscalate = async (taskId: string) => {
    try {
      const { error } = await supabase.from("workflow_escalations").insert([
        {
          task_id: taskId,
          escalated_by: (await supabase.auth.getUser()).data.user?.id,
          reason: "Task requires attention",
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task escalated successfully",
      });
    } catch (error) {
      console.error("Error escalating task:", error);
      toast({
        title: "Error",
        description: "Failed to escalate task",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "in_progress":
        return "bg-blue-500";
      case "completed":
        return "bg-green-500";
      case "blocked":
        return "bg-red-500";
      case "cancelled":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "high":
        return "bg-orange-500";
      case "urgent":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Tasks - {workflow?.name}</DialogTitle>
        </DialogHeader>

        <div className="flex justify-end mb-4">
          <Button onClick={() => setIsCreateTaskDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Loading tasks...
                  </TableCell>
                </TableRow>
              ) : tasks?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No tasks found
                  </TableCell>
                </TableRow>
              ) : (
                tasks?.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {task.due_date
                        ? new Date(task.due_date).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedTask(task);
                            setIsCreateTaskDialogOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEscalate(task.id)}
                        >
                          <AlertTriangle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <TaskFormDialog
          open={isCreateTaskDialogOpen}
          onOpenChange={setIsCreateTaskDialogOpen}
          workflowId={workflow?.id}
          task={selectedTask}
          onSuccess={() => {
            queryClient.invalidateQueries({
              queryKey: ["workflow-tasks", workflow?.id],
            });
            setSelectedTask(null);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
