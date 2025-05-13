import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash, Edit, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Template {
  id: string;
  name: string;
  title_template: string;
  message_template: string;
  type: "info" | "warning" | "success" | "error";
  channels: string[];
}

export const NotificationTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    title_template: "",
    message_template: "",
    type: "info",
  });

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("notification_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Error loading notification templates:", error);
      toast({
        title: "Error",
        description: "Failed to load notification templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, type: value }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      title_template: "",
      message_template: "",
      type: "info",
    });
    setEditingTemplate(null);
  };

  const handleEditClick = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      title_template: template.title_template,
      message_template: template.message_template,
      type: template.type,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingTemplate) {
        // Update existing template
        const { error } = await supabase
          .from("notification_templates")
          .update({
            name: formData.name,
            title_template: formData.title_template,
            message_template: formData.message_template,
            type: formData.type,
          })
          .eq("id", editingTemplate.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Template updated successfully",
        });
      } else {
        // Create new template
        const { error } = await supabase.from("notification_templates").insert({
          name: formData.name,
          title_template: formData.title_template,
          message_template: formData.message_template,
          type: formData.type,
          channels: ["in_app"],
        });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Template created successfully",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadTemplates();
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const { error } = await supabase
        .from("notification_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template deleted successfully",
      });

      loadTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Notification Templates</CardTitle>
          <CardDescription>
            Create and manage notification templates
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadTemplates}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Template
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? "Edit Template" : "Create Template"}
                </DialogTitle>
                <DialogDescription>
                  {editingTemplate
                    ? "Update the notification template details"
                    : "Add a new notification template"}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Welcome Email"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="type">Notification Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={handleTypeChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="title_template">Title Template</Label>
                  <Input
                    id="title_template"
                    name="title_template"
                    placeholder="Welcome to {service_name}"
                    value={formData.title_template}
                    onChange={handleInputChange}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Use {"{variable}"} syntax for dynamic content
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="message_template">Message Template</Label>
                  <Textarea
                    id="message_template"
                    name="message_template"
                    placeholder="Hello {name}, welcome to our service!"
                    value={formData.message_template}
                    onChange={handleInputChange}
                    rows={4}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Use {"{variable}"} syntax for dynamic content
                  </p>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setIsDialogOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingTemplate ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : templates.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Title Template</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>{template.title_template}</TableCell>
                  <TableCell>
                    <span
                      className={`capitalize px-2 py-1 rounded-full text-xs bg-${
                        template.type === "info"
                          ? "blue"
                          : template.type === "success"
                          ? "green"
                          : template.type === "warning"
                          ? "yellow"
                          : "red"
                      }-100 text-${
                        template.type === "info"
                          ? "blue"
                          : template.type === "success"
                          ? "green"
                          : template.type === "warning"
                          ? "yellow"
                          : "red"
                      }-700`}
                    >
                      {template.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No templates found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create your first template
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
