import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SelectMany } from "@/components/ui/SelectMany";
import { useUserTypes } from "@/components/user-groups/hooks/useUserTypes";
import { DateInput } from "@/components/ui/date-input";
import { useEffect, useState } from "react";
import { formatDate } from "@/utils/date-utils";
import { useAppSettings } from "@/hooks/use-app-settings";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

interface AnnouncementFormData {
  title: string;
  message: string;
  user_types: string[];
  start_date: string;
  end_date: string;
}

export default function CreateAnnouncement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const form = useForm<AnnouncementFormData>();
  const { userTypes } = useUserTypes();
  const { getSetting } = useAppSettings();
  const [defaultDuration, setDefaultDuration] = useState(7);

  // Get default duration from app settings
  useEffect(() => {
    const durationDays = parseInt(
      getSetting("default_announcement_duration", "7")
    );
    setDefaultDuration(durationDays);

    // Set default end date based on current date + default duration
    const today = new Date();
    const startDateStr = formatDate(today);

    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + durationDays);
    const endDateStr = formatDate(endDate);

    form.setValue("start_date", startDateStr);
    form.setValue("end_date", endDateStr);
  }, [getSetting]);

  const userTypeOptions = userTypes.map((type) => ({
    id: type,
    label: type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
  }));

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startDate = new Date(e.target.value);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + defaultDuration);
    form.setValue("end_date", formatDate(endDate));
  };

  const onSubmit = async (data: AnnouncementFormData) => {
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

      const { error } = await supabase.from("announcements").insert({
        title: data.title,
        message: data.message,
        user_types: data.user_types,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: "active",
      });

      if (error) {
        console.error("Error creating announcement:", error);
        if (error.message.includes("maximum number of active announcements")) {
          toast({
            title: "Error",
            description: "Maximum number of active announcements reached",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to create announcement",
            variant: "destructive",
          });
        }
        return;
      }

      toast({
        title: "Success",
        description: "Announcement created successfully",
      });

      navigate("/announcements");
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
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Create New Announcement</h1>
        </div>

        <div className="max-w-2xl">
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
                        <DateInput
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleStartDateChange(e);
                          }}
                        />
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
                        When the announcement expires (defaults to{" "}
                        {defaultDuration} days after start)
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="submit">Create Announcement</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/announcements")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </DashboardLayout>
  );
}
