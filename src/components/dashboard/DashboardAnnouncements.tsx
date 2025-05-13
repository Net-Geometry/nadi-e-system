import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { UserTypeChips } from "@/components/user-groups/UserTypeChips";
import { formatDate } from "@/utils/date-utils";
import { Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Announcement {
  id: string;
  title: string;
  message: string;
  status: "active" | "inactive";
  user_types: string[];
  created_at: string;
  start_date: string;
  end_date: string;
}

export function DashboardAnnouncements() {
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

        // Fetch active announcements that are valid for current date and user type
        const { data, error } = await supabase
          .from("announcements")
          .select("*")
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
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle>Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-4 text-center text-muted-foreground">
            Loading announcements...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (announcements.length === 0) {
    return null; // Don't show the card if there are no announcements
  }

  const isAnnouncementExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          Announcements
        </CardTitle>
        <CardDescription>Important updates and notices</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {announcements.map((announcement) => (
          <Alert
            key={announcement.id}
            className="bg-primary/5 border-primary/20"
          >
            <div className="flex justify-between items-start">
              <AlertTitle className="text-lg font-semibold">
                {announcement.title}
              </AlertTitle>
              <div className="flex gap-2">
                <UserTypeChips userTypes={announcement.user_types} />
                {announcement.end_date &&
                  isAnnouncementExpired(announcement.end_date) && (
                    <Badge
                      variant="outline"
                      className="bg-amber-100 text-amber-800 border-amber-200"
                    >
                      Expired
                    </Badge>
                  )}
              </div>
            </div>
            <AlertDescription className="mt-2">
              <div className="text-gray-700 dark:text-gray-300">
                {announcement.message}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Valid: {formatDate(announcement.start_date)} -{" "}
                {announcement.end_date
                  ? formatDate(announcement.end_date)
                  : "Indefinitely"}
              </div>
            </AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}
