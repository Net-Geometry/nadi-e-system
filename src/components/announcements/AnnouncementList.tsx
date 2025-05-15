import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Eye, EyeOff, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserTypeChips } from "@/components/user-groups/UserTypeChips";
import { formatDate } from "@/utils/date-utils";
import { EditAnnouncementDialog } from "./EditAnnouncementDialog";

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

export function AnnouncementList() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch announcements",
          variant: "destructive",
        });
        return;
      }

      setAnnouncements(data || []);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    try {
      const { error } = await supabase
        .from("announcements")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update announcement status",
          variant: "destructive",
        });
        return;
      }

      fetchAnnouncements();
      toast({
        title: "Success",
        description: `Announcement ${
          newStatus === "active" ? "shown" : "hidden"
        } successfully`,
      });
    } catch (error) {
      console.error("Error toggling status:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete announcement",
          variant: "destructive",
        });
        return;
      }

      fetchAnnouncements();
      toast({
        title: "Success",
        description: "Announcement deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const isAnnouncementExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Button onClick={() => navigate("/announcements/create-announcement")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Announcement
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Target Users</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {announcements.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center h-24 text-muted-foreground"
                >
                  No announcements available
                </TableCell>
              </TableRow>
            ) : (
              announcements.map((announcement) => (
                <TableRow key={announcement.id}>
                  <TableCell className="font-medium">
                    {announcement.title}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {announcement.message}
                  </TableCell>
                  <TableCell>
                    <UserTypeChips userTypes={announcement.user_types} />
                  </TableCell>
                  <TableCell>
                    {formatDate(announcement.start_date)} -{" "}
                    {formatDate(announcement.end_date)}
                    {isAnnouncementExpired(announcement.end_date) && (
                      <Badge
                        variant="outline"
                        className="ml-2 bg-amber-100 text-amber-800 border-amber-200"
                      >
                        Expired
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        announcement.status === "active"
                          ? "success"
                          : "secondary"
                      }
                    >
                      {announcement.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          toggleStatus(announcement.id, announcement.status)
                        }
                        title={
                          announcement.status === "active"
                            ? "Hide announcement"
                            : "Show announcement"
                        }
                      >
                        {announcement.status === "active" ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <EditAnnouncementDialog
                        announcement={announcement}
                        onUpdate={fetchAnnouncements}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteAnnouncement(announcement.id)}
                        title="Delete announcement"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
