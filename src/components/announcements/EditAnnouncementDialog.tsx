import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SelectMany } from "@/components/ui/SelectMany";
import { useUserTypes } from "@/components/user-groups/hooks/useUserTypes";
import { DateInput } from "@/components/ui/date-input";
import { Pencil } from "lucide-react";
import { formatDate } from "@/utils/date-utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

interface EditAnnouncementDialogProps {
  announcement: {
    id: string;
    title: string;
    message: string;
    user_types: string[];
    start_date: string;
    end_date: string;
    status: "active" | "inactive";
  };
  onUpdate: () => void;
}

export function EditAnnouncementDialog({
  announcement,
  onUpdate,
}: EditAnnouncementDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { userTypes } = useUserTypes();
  const form = useForm({
    defaultValues: {
      title: announcement.title,
      message: announcement.message,
      user_types: announcement.user_types || [],
      start_date: formatDate(new Date(announcement.start_date)),
      end_date: formatDate(new Date(announcement.end_date)),
    },
  });

  useEffect(() => {
    if (open) {
      // Reset form with announcement data when dialog opens
      form.reset({
        title: announcement.title,
        message: announcement.message,
        user_types: announcement.user_types || [],
        start_date: formatDate(new Date(announcement.start_date)),
        end_date: formatDate(new Date(announcement.end_date)),
      });
    }
  }, [open, announcement, form]);

  const userTypeOptions = userTypes.map((type) => ({
    id: type,
    label: type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
  }));

  const onSubmit = async (data: any) => {
    try {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);

      // Validate dates
      if (endDate <= startDate) {
        toast({
          title: "Invalid Dates",
          description: "End date must be after start date",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("announcements")
        .update({
          title: data.title,
          message: data.message,
          user_types: data.user_types,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        })
        .eq("id", announcement.id);

      if (error) {
        console.error("Error updating announcement:", error);
        toast({
          title: "Error",
          description: "Failed to update announcement",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Announcement updated successfully",
      });

      setOpen(false);
      onUpdate();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Edit announcement">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Announcement</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Announcement title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your announcement message"
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <DateInput {...field} />
                    </FormControl>
                    <FormDescription>
                      When the announcement becomes active
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <DateInput {...field} />
                    </FormControl>
                    <FormDescription>
                      When the announcement expires
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="user_types"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target User Types</FormLabel>
                  <FormControl>
                    <SelectMany
                      options={userTypeOptions}
                      value={field.value || []}
                      onChange={field.onChange}
                      placeholder="Select user types that can view this announcement"
                    />
                  </FormControl>
                  <FormDescription>
                    Leave empty to show to all users
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
