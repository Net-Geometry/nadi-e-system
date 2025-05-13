import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Notification } from "@/types/auth";

interface UseNotificationsOptions {
  filter?: "all" | "unread" | "read";
  typeFilter?: string;
}

export const useNotifications = ({
  filter = "all",
  typeFilter = "all",
}: UseNotificationsOptions = {}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch notifications
  const {
    data: notifications,
    error,
    isLoading: fetchLoading,
  } = useQuery({
    queryKey: ["notifications", filter, typeFilter],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (!userId) return [];

      let query = supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId);

      // Apply filters
      if (filter === "unread") {
        query = query.eq("read", false);
      } else if (filter === "read") {
        query = query.eq("read", true);
      }

      // Apply type filter
      if (typeFilter !== "all") {
        query = query.eq("type", typeFilter);
      }

      // Order by created_at desc
      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching notifications:", error);
        throw new Error(error.message);
      }

      return data as Notification[];
    },
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mark a notification as read
  const handleMarkAsRead = async (id: string) => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id);

      if (error) throw error;

      // Invalidate the notifications query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["notifications"] });

      toast({
        description: "Notification marked as read",
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast({
        variant: "destructive",
        description: "Failed to mark notification as read",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      setIsLoading(true);

      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (!userId) return;

      let query = supabase.from("notifications").update({ read: true });

      // Apply filters for the right subset of notifications
      query = query.eq("user_id", userId);

      if (filter === "unread") {
        query = query.eq("read", false);
      }

      if (typeFilter !== "all") {
        query = query.eq("type", typeFilter);
      }

      const { error } = await query;

      if (error) throw error;

      // Invalidate the notifications query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["notifications"] });

      toast({
        description: "All notifications marked as read",
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast({
        variant: "destructive",
        description: "Failed to mark all notifications as read",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Send a test email notification
  const sendTestEmailNotification = async (
    email: string,
    subject: string,
    message: string
  ) => {
    try {
      setIsLoading(true);

      const { error } = await supabase.functions.invoke("send-test-email", {
        body: {
          email,
          subject,
          message,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Test email notification sent",
      });

      return true;
    } catch (error) {
      console.error("Error sending test email:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send test email notification",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Send a test push notification
  const sendTestPushNotification = async (
    userId: string,
    title: string,
    body: string
  ) => {
    try {
      setIsLoading(true);

      const { error } = await supabase.functions.invoke("send-test-push", {
        body: {
          userId,
          title,
          body,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Test push notification sent",
      });

      return true;
    } catch (error) {
      console.error("Error sending test push:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send test push notification",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    notifications,
    isLoading: isLoading || fetchLoading,
    error,
    handleMarkAsRead,
    handleMarkAllAsRead,
    sendTestEmailNotification,
    sendTestPushNotification,
  };
};
