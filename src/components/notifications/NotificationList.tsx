
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationItem } from "./NotificationItem";
import { NotificationEmptyState } from "./NotificationEmptyState";
import { NotificationLoading } from "./NotificationLoading";
import { NotificationError } from "./NotificationError";
import { useNotifications } from "./hooks/useNotifications";

interface NotificationListProps {
  filter?: "all" | "unread" | "read";
  typeFilter?: string;
}

export const NotificationList = ({ 
  filter = "all", 
  typeFilter = "all" 
}: NotificationListProps) => {
  const { notifications, isLoading, error, handleMarkAsRead } = useNotifications({ 
    filter, 
    typeFilter 
  });

  if (isLoading) {
    return <NotificationLoading />;
  }

  if (error) {
    console.error("Notification list error:", error);
    return <NotificationError />;
  }

  if (!notifications?.length) {
    return <NotificationEmptyState filter={filter} />;
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-1 p-1">
        {notifications.map((notification, index) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            index={index}
            totalCount={notifications.length}
            onMarkAsRead={handleMarkAsRead}
          />
        ))}
      </div>
    </ScrollArea>
  );
};
