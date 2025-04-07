
import React from "react";
import { Bell } from "lucide-react";

export const NotificationLoading = () => {
  return (
    <div className="flex h-[200px] items-center justify-center">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Bell className="h-4 w-4 animate-pulse" />
        <span>Loading notifications...</span>
      </div>
    </div>
  );
};
