
import React from "react";
import { XCircle } from "lucide-react";

export const NotificationError = () => {
  return (
    <div className="flex h-[200px] items-center justify-center">
      <div className="flex items-center space-x-2 text-sm text-destructive dark:text-red-400">
        <XCircle className="h-4 w-4" />
        <span className="dark:text-red-400">Error loading notifications</span>
      </div>
    </div>
  );
};
