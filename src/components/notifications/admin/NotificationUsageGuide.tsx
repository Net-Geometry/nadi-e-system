import { useState } from "react";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useUsers } from "@/hooks/use-users";
import {
  sendNotificationToUsers,
  sendTemplateNotificationToUsers,
  sendTestEmailWithTemplate,
  sendTestPushWithTemplate,
} from "@/utils/notification-utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export function NotificationUsageGuide() {
  const { toast } = useToast();
  const { useUsersQuery } = useUsers();
  const { data: users = [] } = useUsersQuery();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function handleTestSendToMultipleUsers() {
    if (selectedUsers.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one user",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Send a direct notification to multiple users
      const result = await sendNotificationToUsers(
        selectedUsers,
        "Multi-User Test Notification",
        "This is a test notification sent to multiple users at once."
      );

      toast({
        title: result.success ? "Success" : "Partial Success",
        description: `Sent ${result.totalSent} notifications. Failed: ${result.totalFailed}`,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      console.error("Error sending multi-user notification:", error);
      toast({
        title: "Error",
        description: "Failed to send notifications to multiple users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleTestTemplateToMultipleUsers() {
    if (selectedUsers.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one user",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get a template to use
      const { data: templates } = await supabase
        .from("notification_templates")
        .select("*")
        .limit(1);

      if (!templates || templates.length === 0) {
        toast({
          title: "Error",
          description: "No notification templates found",
          variant: "destructive",
        });
        return;
      }

      // Use the first template found
      const template = templates[0];

      // Send a template notification to multiple users
      const result = await sendTemplateNotificationToUsers(
        selectedUsers,
        template.id,
        {
          user_name: "Multiple Users",
          action: "Test",
          date: new Date().toLocaleDateString(),
        }
      );

      // Handle the response safely - check for properties before accessing them
      const sentCount = "totalSent" in result ? result.totalSent : 0;
      const failedCount = "totalFailed" in result ? result.totalFailed : 0;

      toast({
        title: result.success ? "Success" : "Partial Success",
        description: `Sent ${sentCount} template notifications. Failed: ${failedCount}`,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      console.error(
        "Error sending template notifications to multiple users:",
        error
      );
      toast({
        title: "Error",
        description: "Failed to send template notifications to multiple users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleUserSelect = (userId: string, checked: boolean) => {
    setSelectedUsers((prev) =>
      checked ? [...prev, userId] : prev.filter((id) => id !== userId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedUsers(checked ? users.map((user) => user.id) : []);
  };

  return (
    <div className="space-y-8">
      <Tabs defaultValue="code-examples">
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="code-examples">Code Examples</TabsTrigger>
          <TabsTrigger value="demo">Live Demo</TabsTrigger>
        </TabsList>

        <TabsContent value="code-examples" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sending to Multiple Users</CardTitle>
              <CardDescription>
                How to send notifications to multiple users at once
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-secondary p-4 rounded-md overflow-x-auto">
                <code className="text-sm language-typescript">{`
// Using direct notification to multiple users
import { sendNotificationToUsers } from "@/utils/notification-utils";

const userIds = ["user-id-1", "user-id-2", "user-id-3"];
const result = await sendNotificationToUsers(
  userIds,
  "Important Announcement",
  "This message will be sent to multiple users.",
  "info" // or "success", "warning", "error"
);

console.log(\`Successfully sent: \${result.totalSent}\`);
console.log(\`Failed to send: \${result.totalFailed}\`);

// Using templates for multiple users
import { sendTemplateNotificationToUsers } from "@/utils/notification-utils";

const userIds = ["user-id-1", "user-id-2", "user-id-3"];
const templateId = "your-template-id";
const params = {
  user_name: "Team Member",
  action: "Required",
  date: new Date().toLocaleDateString()
};

const result = await sendTemplateNotificationToUsers(
  userIds,
  templateId,
  params
);
                `}</code>
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sending In-App Notifications</CardTitle>
              <CardDescription>
                How to send in-app notifications to users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-secondary p-4 rounded-md overflow-x-auto">
                <code className="text-sm language-typescript">{`
// Using utility functions
import { sendNotificationToUser } from "@/utils/notification-utils";

// Send to a single user
const result = await sendNotificationToUser(
  "user-id",
  "Notification Title", 
  "This is the notification message", 
  "info" // or "success", "warning", "error"
);

// Using template for a single user
import { sendTemplateNotificationToUser } from "@/utils/notification-utils";

const result = await sendTemplateNotificationToUser(
  "user-id",
  "template-id",
  { 
    user_name: "John Doe",
    action: "Completed",
    date: new Date().toLocaleDateString()
  }
);
                `}</code>
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sending Email Notifications</CardTitle>
              <CardDescription>
                How to send email notifications using templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-secondary p-4 rounded-md overflow-x-auto">
                <code className="text-sm language-typescript">{`
// Using Edge Functions directly
const { error } = await supabase.functions.invoke("send-test-email", {
  body: {
    email: "user@example.com",
    subject: "Manual Subject",
    message: "Manual message content"
  }
});

// Using templates
import { sendTestEmailWithTemplate } from "@/utils/notification-utils";

const result = await sendTestEmailWithTemplate(
  "user@example.com",
  "template-id",
  { 
    user_name: "John Doe",
    action: "Completed",
    date: new Date().toLocaleDateString()
  }
);
                `}</code>
              </pre>
              <Alert className="mt-4 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                <AlertDescription>
                  Note: In a production environment, you should implement proper
                  email sending functionality with services like SendGrid,
                  Resend, or Amazon SES.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sending Push Notifications</CardTitle>
              <CardDescription>
                How to send push notifications using templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-secondary p-4 rounded-md overflow-x-auto">
                <code className="text-sm language-typescript">{`
// Using Edge Functions directly
const { error } = await supabase.functions.invoke("send-test-push", {
  body: {
    userId: "user-id",
    title: "Manual Title",
    body: "Manual notification body"
  }
});

// Using templates
import { sendTestPushWithTemplate } from "@/utils/notification-utils";

const result = await sendTestPushWithTemplate(
  "user-id",
  "template-id",
  { 
    user_name: "John Doe",
    action: "Completed",
    date: new Date().toLocaleDateString()
  }
);
                `}</code>
              </pre>
              <Alert className="mt-4 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                <AlertDescription>
                  Note: In a production environment, you should implement proper
                  push notification functionality with services like Firebase
                  Cloud Messaging (FCM) or OneSignal.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Multi-User Notification Demo</CardTitle>
              <CardDescription>
                Select users and send test notifications to them
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={
                      selectedUsers.length > 0 &&
                      selectedUsers.length === users.length
                    }
                    onCheckedChange={handleSelectAll}
                  />
                  <Label htmlFor="select-all">Select All Users</Label>
                </div>

                <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                  {users.length === 0 ? (
                    <div className="text-center py-4">No users available</div>
                  ) : (
                    <div className="space-y-2">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`user-${user.id}`}
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={(checked) =>
                              handleUserSelect(user.id, !!checked)
                            }
                          />
                          <Label
                            htmlFor={`user-${user.id}`}
                            className="flex items-center space-x-2"
                          >
                            <User size={16} className="text-muted-foreground" />
                            <span>
                              {user.full_name ||
                                user.email ||
                                `User ${user.id.substring(0, 8)}`}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                onClick={handleTestSendToMultipleUsers}
                disabled={isLoading || selectedUsers.length === 0}
              >
                {isLoading ? "Sending..." : "Send Direct Notification"}
              </Button>
              <Button
                onClick={handleTestTemplateToMultipleUsers}
                disabled={isLoading || selectedUsers.length === 0}
                variant="outline"
              >
                {isLoading ? "Sending..." : "Send Template Notification"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
