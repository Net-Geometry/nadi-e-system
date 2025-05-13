import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TargetType = "user" | "user_group" | "user_type" | "organization";

interface SendNotificationFormProps {
  onSuccess?: () => void;
}

export function SendNotificationForm({ onSuccess }: SendNotificationFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"info" | "success" | "warning" | "error">(
    "info"
  );
  const [targetType, setTargetType] = useState<TargetType>("user");
  const [userId, setUserId] = useState("");
  const [userGroupId, setUserGroupId] = useState("");
  const [userType, setUserType] = useState("");
  const [organizationId, setOrganizationId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !message) {
      toast({
        title: "Error",
        description: "Please fill out all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Different handling based on target type
      switch (targetType) {
        case "user":
          if (!userId) {
            throw new Error("User ID is required");
          }

          const { error: userError } = await supabase.rpc(
            "create_notification",
            {
              p_user_id: userId,
              p_title: title,
              p_message: message,
              p_type: type,
            }
          );

          if (userError) throw userError;
          break;

        case "user_group":
          if (!userGroupId) {
            throw new Error("User Group ID is required");
          }

          // Fetch users in the group
          const { data: groupUsers, error: groupError } = await supabase
            .from("profiles")
            .select("id")
            .eq("user_group", userGroupId);

          if (groupError) throw groupError;

          // Send notification to each user in the group
          for (const user of groupUsers) {
            await supabase.rpc("create_notification", {
              p_user_id: user.id,
              p_title: title,
              p_message: message,
              p_type: type,
            });
          }
          break;

        case "user_type":
          if (!userType) {
            throw new Error("User Type is required");
          }

          // Fetch users of the specified type
          const { data: typeUsers, error: typeError } = await supabase
            .from("profiles")
            .select("id")
            .eq("user_type", userType);

          if (typeError) throw typeError;

          // Send notification to each user of the type
          for (const user of typeUsers) {
            await supabase.rpc("create_notification", {
              p_user_id: user.id,
              p_title: title,
              p_message: message,
              p_type: type,
            });
          }
          break;

        case "organization":
          if (!organizationId) {
            throw new Error("Organization ID is required");
          }

          // Fetch users in the organization
          const { data: orgUsers, error: orgError } = await supabase
            .from("organization_users")
            .select("user_id")
            .eq("organization_id", organizationId);

          if (orgError) throw orgError;

          // Send notification to each user in the organization
          for (const user of orgUsers) {
            await supabase.rpc("create_notification", {
              p_user_id: user.user_id,
              p_title: title,
              p_message: message,
              p_type: type,
            });
          }
          break;
      }

      toast({
        title: "Success",
        description: "Notification sent successfully",
      });

      // Reset form
      setTitle("");
      setMessage("");
      setType("info");

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error sending notification:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send notification",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Notification</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Notification Type</Label>
            <Select value={type} onValueChange={(value: any) => setType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Information</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Target</Label>
            <Tabs
              defaultValue="user"
              value={targetType}
              onValueChange={(value) => setTargetType(value as TargetType)}
              className="w-full"
            >
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="user">User</TabsTrigger>
                <TabsTrigger value="user_group">User Group</TabsTrigger>
                <TabsTrigger value="user_type">User Type</TabsTrigger>
                <TabsTrigger value="organization">Organization</TabsTrigger>
              </TabsList>

              <TabsContent value="user" className="pt-4">
                <div className="space-y-2">
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="user_group" className="pt-4">
                <div className="space-y-2">
                  <Label htmlFor="userGroupId">User Group ID</Label>
                  <Input
                    id="userGroupId"
                    value={userGroupId}
                    onChange={(e) => setUserGroupId(e.target.value)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="user_type" className="pt-4">
                <div className="space-y-2">
                  <Label htmlFor="userType">User Type</Label>
                  <Select value={userType} onValueChange={setUserType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="vendor">Vendor</SelectItem>
                      <SelectItem value="tp">TP</SelectItem>
                      <SelectItem value="sso">SSO</SelectItem>
                      <SelectItem value="dusp">DUSP</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="staff_internal">
                        Staff Internal
                      </SelectItem>
                      <SelectItem value="staff_external">
                        Staff External
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="organization" className="pt-4">
                <div className="space-y-2">
                  <Label htmlFor="organizationId">Organization ID</Label>
                  <Input
                    id="organizationId"
                    value={organizationId}
                    onChange={(e) => setOrganizationId(e.target.value)}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Sending..." : "Send Notification"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
