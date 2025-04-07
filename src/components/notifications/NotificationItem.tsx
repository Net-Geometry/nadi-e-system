
import React from "react";
import { Notification } from "@/types/auth";
import { Check, Clock, CheckCircle, Info, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NotificationItemProps {
  notification: Notification;
  index: number;
  totalCount: number;
  onMarkAsRead: (id: string) => void;
}

export const NotificationItem = ({ 
  notification, 
  index, 
  totalCount, 
  onMarkAsRead 
}: NotificationItemProps) => {
  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };
  
  const getTypeBadge = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Success</Badge>;
      case "warning":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Warning</Badge>;
      case "error":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Error</Badge>;
      default:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Info</Badge>;
    }
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "MMM d, yyyy 'at' h:mm a");
  };

  return (
    <div key={notification.id}>
      <div
        className={cn(
          "group flex items-start gap-4 rounded-lg p-4 transition-colors hover:bg-muted/50",
          notification.read ? "opacity-60 bg-muted/20" : "",
          "animate-fade-in"
        )}
      >
        <div className="flex-shrink-0 mt-1 transition-transform group-hover:scale-110">
          {getIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium leading-none">
              {notification.title}
            </p>
            {getTypeBadge(notification.type)}
          </div>
          <p className="text-sm text-muted-foreground">
            {notification.message}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatDate(notification.created_at)}
            </div>
            
            {!notification.read && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-xs" 
                onClick={() => onMarkAsRead(notification.id)}
              >
                <Check className="h-3 w-3 mr-1" />
                Mark as read
              </Button>
            )}
          </div>
        </div>
      </div>
      {index < totalCount - 1 && (
        <Separator className="my-1" />
      )}
    </div>
  );
};
