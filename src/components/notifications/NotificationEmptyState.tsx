
import React from "react";
import { Bell } from "lucide-react";

interface NotificationEmptyStateProps {
  filter: "all" | "unread" | "read";
}

export const NotificationEmptyState = ({ filter }: NotificationEmptyStateProps) => {
  return (
    <div className="flex h-[200px] items-center justify-center">
      <div className="flex flex-col items-center space-y-2 text-sm text-muted-foreground">
        <Bell className="h-8 w-8 mb-2" />
        <span>No notifications found</span>
        <span className="text-xs text-center max-w-xs">
          {filter !== "all" 
            ? `Try changing your filter from "${filter}" to "all"` 
            : "You'll see notifications here when there are updates"}
        </span>
      </div>
    </div>
  );
};
