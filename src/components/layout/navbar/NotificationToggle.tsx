import { Bell, CheckCircle, Mail, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Notification } from "@/types/auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export const NotificationToggle = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (!userId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error fetching notifications:", error);
        setLoading(false);
        return;
      }

      setNotifications(data || []);

      // Count unread notifications
      const unreadNotifications = data?.filter((n) => !n.read) || [];
      setUnreadCount(unreadNotifications.length);
      setLoading(false);
    } catch (err) {
      console.error("Unexpected error fetching notifications:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Subscribe to real-time notifications
    const setupRealtimeSubscription = async () => {
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;

      if (!userId) return;

      const channel = supabase
        .channel("notification_changes")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          () => {
            fetchNotifications();
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          () => {
            fetchNotifications();
          }
        )
        .subscribe();

      return channel;
    };

    const channel = setupRealtimeSubscription();

    // Cleanup subscription on unmount
    return () => {
      channel.then((channel) => {
        if (channel) supabase.removeChannel(channel);
      });
    };
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (!userId) return;

      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId)
        .eq("read", false);

      if (error) throw error;

      // Refresh notifications
      fetchNotifications();

      // Invalidate notifications query in react-query
      queryClient.invalidateQueries({ queryKey: ["notifications"] });

      toast({
        description: "All notifications marked as read",
      });
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast({
        variant: "destructive",
        description: "Failed to mark all as read",
      });
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) throw error;

      // Refresh notifications
      fetchNotifications();

      // Invalidate notifications query in react-query
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast({
        variant: "destructive",
        description: "Failed to mark notification as read",
      });
    }
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case "warning":
        return <Server className="h-6 w-6 text-yellow-500" />;
      case "error":
        return <Server className="h-6 w-6 text-red-500" />;
      default:
        return <Mail className="h-6 w-6 text-blue-500" />;
    }
  };

  // Calculate time ago
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds} seconds ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;

    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} days ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months} months ago`;

    return `${Math.floor(months / 12)} years ago`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-700 hover:bg-gray-100 relative dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications ({unreadCount} unread)</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[380px] p-0 rounded-md overflow-hidden"
        sideOffset={20}
      >
        <div className="bg-white dark:bg-gray-900 shadow-lg">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-sm font-medium text-primary"
              >
                Mark all as read
              </Button>
            )}
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center p-6">
              <div className="animate-pulse flex space-x-2 items-center">
                <div className="h-4 w-4 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center p-6 text-muted-foreground">
              <Bell className="h-12 w-12 mb-2 opacity-30" />
              <p>No notifications yet</p>
              <p className="text-xs mt-1">New notifications will appear here</p>
            </div>
          )}

          {/* Notifications list */}
          {!loading && notifications.length > 0 && (
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex items-start p-4 border-b hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer",
                    notification.read ? "opacity-70" : ""
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-full mr-3",
                      "bg-purple-100 dark:bg-purple-900/20"
                    )}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm",
                        !notification.read && "font-medium"
                      )}
                    >
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {timeAgo(notification.created_at)}
                      </span>

                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="p-4 text-center border-t">
            <Button
              variant="ghost"
              className="w-full text-primary"
              onClick={() => setOpen(false)}
              asChild
            >
              <a href="/dashboard/notifications">View all notifications</a>
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
