
import { Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const SettingsToggle = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-gray-700 hover:bg-gray-100">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Theme</h4>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                Light
              </Button>
              <Button variant="outline" size="sm">
                Dark
              </Button>
              <Button variant="outline" size="sm">
                System
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-medium">
              Notification Preferences
            </h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="form-checkbox" />
                <span className="text-sm">Email notifications</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="form-checkbox" />
                <span className="text-sm">Push notifications</span>
              </label>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
