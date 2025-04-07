
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Notification } from "@/types/auth";
import { useToast } from "@/hooks/use-toast";

interface UseNotificationsProps {
  filter?: "all" | "unread" | "read";
  typeFilter?: string;
}

export const useNotifications = ({ filter = "all", typeFilter = "all" }: UseNotificationsProps) => {
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

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  return {
    notifications,
    isLoading,
    error,
    handleMarkAsRead
  };
};
