import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface EmailConfig {
  provider: "smtp" | "resend" | "sendgrid";
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
  smtp_password?: string;
  from_email?: string;
  from_name?: string;
  api_key?: string;
}

export const EmailConfiguration = () => {
  const { toast } = useToast();
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    provider: "smtp",
    smtp_host: "",
    smtp_port: 587,
    smtp_user: "",
    smtp_password: "",
    from_email: "",
    from_name: "",
    api_key: "",
  });

  useEffect(() => {
    const loadEmailConfig = async () => {
      try {
        const { data: emailData } = await supabase
          .from("email_config")
          .select("*")
          .single();
        if (emailData) {
          setEmailConfig(emailData);
        }
      } catch (error) {
        console.error("Error loading email config:", error);
        toast({
          title: "Error",
          description: "Failed to load email configuration",
          variant: "destructive",
        });
      }
    };

    loadEmailConfig();
  }, [toast]);

  const handleUpdateEmailConfig = async () => {
    try {
      const { error } = await supabase.from("email_config").upsert(emailConfig);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Email configuration updated successfully",
      });
    } catch (error) {
      console.error("Error updating email config:", error);
      toast({
        title: "Error",
        description: "Failed to update email configuration",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Email Provider</Label>
          <Select
            value={emailConfig.provider}
            onValueChange={(value: "smtp" | "resend" | "sendgrid") =>
              setEmailConfig((prev) => ({ ...prev, provider: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="smtp">SMTP</SelectItem>
              <SelectItem value="resend">Resend</SelectItem>
              <SelectItem value="sendgrid">SendGrid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {emailConfig.provider === "smtp" && (
          <>
            <div className="space-y-2">
              <Label>SMTP Host</Label>
              <Input
                value={emailConfig.smtp_host || ""}
                onChange={(e) =>
                  setEmailConfig((prev) => ({
                    ...prev,
                    smtp_host: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>SMTP Port</Label>
              <Input
                type="number"
                value={emailConfig.smtp_port || ""}
                onChange={(e) =>
                  setEmailConfig((prev) => ({
                    ...prev,
                    smtp_port: parseInt(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>SMTP User</Label>
              <Input
                value={emailConfig.smtp_user || ""}
                onChange={(e) =>
                  setEmailConfig((prev) => ({
                    ...prev,
                    smtp_user: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>SMTP Password</Label>
              <Input
                type="password"
                value={emailConfig.smtp_password || ""}
                onChange={(e) =>
                  setEmailConfig((prev) => ({
                    ...prev,
                    smtp_password: e.target.value,
                  }))
                }
              />
            </div>
          </>
        )}

        {(emailConfig.provider === "resend" ||
          emailConfig.provider === "sendgrid") && (
          <div className="space-y-2">
            <Label>API Key</Label>
            <Input
              type="password"
              value={emailConfig.api_key || ""}
              onChange={(e) =>
                setEmailConfig((prev) => ({
                  ...prev,
                  api_key: e.target.value,
                }))
              }
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>From Email</Label>
          <Input
            value={emailConfig.from_email || ""}
            onChange={(e) =>
              setEmailConfig((prev) => ({
                ...prev,
                from_email: e.target.value,
              }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label>From Name</Label>
          <Input
            value={emailConfig.from_name || ""}
            onChange={(e) =>
              setEmailConfig((prev) => ({
                ...prev,
                from_name: e.target.value,
              }))
            }
          />
        </div>

        <Button onClick={handleUpdateEmailConfig}>
          Save Email Configuration
        </Button>
      </CardContent>
    </Card>
  );
};
