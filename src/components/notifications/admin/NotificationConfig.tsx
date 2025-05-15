import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Mail, MessageSquare } from "lucide-react";

interface ConfigSettings {
  emailEnabled: boolean;
  inAppEnabled: boolean;
  pushEnabled: boolean;
  emailFromAddress: string;
  emailFromName: string;
  emailSubjectPrefix: string;
  maxNotificationAge: number;
}

export const NotificationConfig = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<ConfigSettings>({
    emailEnabled: false,
    inAppEnabled: true,
    pushEnabled: false,
    emailFromAddress: "",
    emailFromName: "",
    emailSubjectPrefix: "[NADI] ",
    maxNotificationAge: 30,
  });

  // Load settings from app_settings table
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("app_settings")
          .select("*")
          .in("key", [
            "notification_email_enabled",
            "notification_in_app_enabled",
            "notification_push_enabled",
            "notification_email_from",
            "notification_email_name",
            "notification_email_subject_prefix",
            "notification_max_age_days",
          ]);

        if (error) throw error;

        if (data && data.length > 0) {
          const configMap: Record<string, string> = {};
          data.forEach((item) => {
            configMap[item.key] = item.value;
          });

          setSettings({
            emailEnabled: configMap["notification_email_enabled"] === "true",
            inAppEnabled: configMap["notification_in_app_enabled"] === "true",
            pushEnabled: configMap["notification_push_enabled"] === "true",
            emailFromAddress: configMap["notification_email_from"] || "",
            emailFromName: configMap["notification_email_name"] || "",
            emailSubjectPrefix:
              configMap["notification_email_subject_prefix"] || "[NADI] ",
            maxNotificationAge: parseInt(
              configMap["notification_max_age_days"] || "30",
              10
            ),
          });
        }
      } catch (error) {
        console.error("Error loading notification settings:", error);
        toast({
          title: "Error",
          description: "Failed to load notification settings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [toast]);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Convert settings to array of objects for upsert
      const settingsArray = [
        {
          key: "notification_email_enabled",
          value: String(settings.emailEnabled),
        },
        {
          key: "notification_in_app_enabled",
          value: String(settings.inAppEnabled),
        },
        {
          key: "notification_push_enabled",
          value: String(settings.pushEnabled),
        },
        {
          key: "notification_email_from",
          value: settings.emailFromAddress,
        },
        {
          key: "notification_email_name",
          value: settings.emailFromName,
        },
        {
          key: "notification_email_subject_prefix",
          value: settings.emailSubjectPrefix,
        },
        {
          key: "notification_max_age_days",
          value: String(settings.maxNotificationAge),
        },
      ];

      // Upsert settings
      for (const setting of settingsArray) {
        const { error } = await supabase
          .from("app_settings")
          .upsert(
            { key: setting.key, value: setting.value },
            { onConflict: "key" }
          );

        if (error) throw error;
      }

      toast({
        title: "Settings saved",
        description: "Notification settings have been updated successfully",
      });
    } catch (error) {
      console.error("Error saving notification settings:", error);
      toast({
        title: "Error",
        description: "Failed to save notification settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleChange = (key: keyof ConfigSettings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: keyof ConfigSettings
  ) => {
    const value =
      e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Configuration</CardTitle>
        <CardDescription>
          Configure how notifications are delivered and managed
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="channels" className="space-y-6">
          <TabsList>
            <TabsTrigger value="channels">Notification Channels</TabsTrigger>
            <TabsTrigger value="email">Email Settings</TabsTrigger>
            <TabsTrigger value="retention">Retention & Cleanup</TabsTrigger>
          </TabsList>

          <TabsContent value="channels" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between border p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">In-app Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Show notifications inside the application
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.inAppEnabled}
                  onCheckedChange={() => handleToggleChange("inAppEnabled")}
                  disabled={loading}
                />
              </div>

              <div className="flex items-center justify-between border p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Send notifications via email
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.emailEnabled}
                  onCheckedChange={() => handleToggleChange("emailEnabled")}
                  disabled={loading}
                />
              </div>

              <div className="flex items-center justify-between border p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">Push Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Send notifications to mobile devices
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.pushEnabled}
                  onCheckedChange={() => handleToggleChange("pushEnabled")}
                  disabled={loading}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="emailFromAddress">From Email Address</Label>
                <Input
                  id="emailFromAddress"
                  placeholder="notifications@example.com"
                  value={settings.emailFromAddress}
                  onChange={(e) => handleInputChange(e, "emailFromAddress")}
                  disabled={loading || !settings.emailEnabled}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="emailFromName">From Name</Label>
                <Input
                  id="emailFromName"
                  placeholder="NADI Notifications"
                  value={settings.emailFromName}
                  onChange={(e) => handleInputChange(e, "emailFromName")}
                  disabled={loading || !settings.emailEnabled}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="emailSubjectPrefix">Email Subject Prefix</Label>
                <Input
                  id="emailSubjectPrefix"
                  placeholder="[NADI] "
                  value={settings.emailSubjectPrefix}
                  onChange={(e) => handleInputChange(e, "emailSubjectPrefix")}
                  disabled={loading || !settings.emailEnabled}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="retention" className="space-y-4">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="maxNotificationAge">
                  Notification Retention Period (days)
                </Label>
                <Input
                  id="maxNotificationAge"
                  type="number"
                  min="1"
                  max="365"
                  value={settings.maxNotificationAge}
                  onChange={(e) => handleInputChange(e, "maxNotificationAge")}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Notifications older than this will be automatically deleted
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end border-t pt-6">
        <Button onClick={handleSaveSettings} disabled={loading || saving}>
          {saving ? "Saving..." : "Save Configuration"}
        </Button>
      </CardFooter>
    </Card>
  );
};
