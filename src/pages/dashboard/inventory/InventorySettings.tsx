import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const InventorySettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    enableDepreciation: true,
    maintenanceReminders: true,
    defaultDepreciationRate: "10",
    maintenanceInterval: "30",
  });

  const handleSave = () => {
    console.log("Saving asset settings:", settings);
    toast({
      title: "Settings Saved",
      description:
        "Inventory management settings have been updated successfully.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Inventory Management Settings</h1>
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="enableDepreciation">
                Enable Depreciation Calculation
              </Label>
              <Switch
                id="enableDepreciation"
                checked={settings.enableDepreciation}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enableDepreciation: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="maintenanceReminders">
                Maintenance Reminders
              </Label>
              <Switch
                id="maintenanceReminders"
                checked={settings.maintenanceReminders}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, maintenanceReminders: checked })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultDepreciationRate">
                Default Depreciation Rate (%)
              </Label>
              <Input
                id="defaultDepreciationRate"
                type="number"
                value={settings.defaultDepreciationRate}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    defaultDepreciationRate: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maintenanceInterval">
                Default Maintenance Interval (days)
              </Label>
              <Input
                id="maintenanceInterval"
                type="number"
                value={settings.maintenanceInterval}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maintenanceInterval: e.target.value,
                  })
                }
              />
            </div>
            <Button onClick={handleSave}>Save Settings</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default InventorySettings;
