
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Notification } from "@/types/auth";
import { Bell, CheckCircle, Info, AlertTriangle, XCircle, Clock, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface NotificationListProps {
  filter?: "all" | "unread" | "read";
  typeFilter?: string;
}

export const NotificationList = ({ 
  filter = "all", 
  typeFilter = "all" 
}: NotificationListProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading, error } = useQuery({
    queryKey: ["notifications", filter, typeFilter],
    queryFn: async () => {
      console.log("Fetching notifications with filters:", { filter, typeFilter });
      
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      
      if (!userId) {
        return [];
      }
      
      let query = supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      
      if (filter === "unread") {
        query = query.eq("read", false);
      } else if (filter === "read") {
        query = query.eq("read", true);
      }
      
      if (typeFilter !== "all") {
        query = query.eq("type", typeFilter);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching notifications:", error);
        throw error;
      }
      
      console.log("Notifications fetched:", data);
      return data as Notification[];
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);
        
      if (error) throw error;
      return notificationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast({
        description: "Notification marked as read",
      });
    },
    onError: (error) => {
      console.error("Error marking notification as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    },
  });

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

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Bell className="h-4 w-4 animate-pulse" />
          <span>Loading notifications...</span>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Notification list error:", error);
    return (
      <div className="flex h-[200px] items-center justify-center">
        <div className="flex items-center space-x-2 text-sm text-destructive">
          <XCircle className="h-4 w-4" />
          <span>Error loading notifications</span>
        </div>
      </div>
    );
  }

  if (!notifications?.length) {
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
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-1 p-1">
        {notifications.map((notification, index) => (
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
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Mark as read
                    </Button>
                  )}
                </div>
              </div>
            </div>
            {index < notifications.length - 1 && (
              <Separator className="my-1" />
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
