import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Info } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { UserType } from "@/types/auth";

interface Announcement {
  id: string;
  title: string;
  message: string;
  status: "active" | "inactive";
  user_types: UserType[];
  created_at: string;
  start_date: string;
  end_date: string;
}

export function AnnouncementSimpleView() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Get the user's profile to determine user type
        const { data: profileData } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", user.id)
          .single();

        const userType = profileData?.user_type;

        // Fetch active announcements that are valid for current date
        const { data, error } = await supabase
          .from("announcements")
          .select(
            "id, title, message, status, user_types, created_at, start_date, end_date"
          )
          .eq("status", "active")
          .lte("start_date", new Date().toISOString())
          .or(`end_date.gt.${new Date().toISOString()},end_date.is.null`)
          .order("created_at", { ascending: false })
          .limit(3);

        if (error) {
          console.error("Error fetching announcements:", error);
          return;
        }

        // Filter announcements based on user type
        const filteredAnnouncements =
          data?.filter((announcement) => {
            // If user_types array is empty, show to all users
            if (
              !announcement.user_types ||
              announcement.user_types.length === 0
            ) {
              return true;
            }
            // Otherwise, check if user's type is in the announcement's user_types
            return announcement.user_types.includes(userType);
          }) || [];

        setAnnouncements(filteredAnnouncements);
      } catch (error) {
        console.error("Error in announcements fetch:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (announcements.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 animate-fade-in">
      {announcements.map((announcement) => (
        <Alert
          key={announcement.id}
          className="bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors"
        >
          <div className="flex items-start">
            <Info className="h-5 w-5 text-primary mr-2 mt-0.5" />
            <div className="flex-1">
              <AlertTitle className="text-lg font-semibold">
                {announcement.title}
              </AlertTitle>
              <AlertDescription className="mt-1 text-gray-700 dark:text-gray-300">
                {announcement.message}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      ))}
    </div>
  );
}
