import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useStaffSites } from "@/hooks/use-staff-sites";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Edit2, Plus, Trash2 } from "lucide-react";

interface WorkHourConfig {
  id: string;
  site_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

interface Site {
  id: string;
  sitename: string;
}

const weekDays = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

const workHourSchema = z.object({
  siteId: z.coerce.number({
    required_error: "Site is required",
  }),
  dayOfWeek: z.string({
    required_error: "Day of week is required",
  }),
  startTime: z.string({
    required_error: "Start time is required",
  }),
  endTime: z.string({
    required_error: "End time is required",
  }),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof workHourSchema>;

export const WorkHourManager = () => {
  const [open, setOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<WorkHourConfig | null>(
    null
  );
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { staffSites, isLoading: loadingSites } = useStaffSites();

  const form = useForm<FormValues>({
    resolver: zodResolver(workHourSchema),
    defaultValues: {
      dayOfWeek: "monday",
      startTime: "09:00",
      endTime: "17:00",
      isActive: true,
    },
  });

  // Get work hour configurations
  const { data: workHours, isLoading: loadingWorkHours } = useQuery({
    queryKey: ["workHours", selectedSite],
    queryFn: async () => {
      if (!selectedSite) return [];

      const { data, error } = await supabase
        .from("nd_work_hour_config")
        .select("*")
        .eq("site_id", selectedSite)
        .order("day_of_week", { ascending: true });

      if (error) throw error;
      return data as WorkHourConfig[];
    },
    enabled: !!selectedSite,
  });

  // Create new work hour config
  const createWorkHour = useMutation({
    mutationFn: async (values: FormValues) => {
      const { data, error } = await supabase
        .from("nd_work_hour_config")
        .insert([
          {
            site_id: values.siteId,
            day_of_week: values.dayOfWeek,
            start_time: values.startTime,
            end_time: values.endTime,
            is_active: values.isActive,
          },
        ]);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workHours", selectedSite] });
      toast({
        title: "Success",
        description: "Work hour configuration has been added successfully",
      });
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add work hour configuration: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Update existing work hour config
  const updateWorkHour = useMutation({
    mutationFn: async (values: FormValues & { id: string }) => {
      const { data, error } = await supabase
        .from("nd_work_hour_config")
        .update({
          site_id: values.siteId,
          day_of_week: values.dayOfWeek,
          start_time: values.startTime,
          end_time: values.endTime,
          is_active: values.isActive,
        })
        .eq("id", values.id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workHours", selectedSite] });
      toast({
        title: "Success",
        description: "Work hour configuration has been updated successfully",
      });
      setOpen(false);
      form.reset();
      setSelectedConfig(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          "Failed to update work hour configuration: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Delete work hour config
  const deleteWorkHour = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("nd_work_hour_config")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workHours", selectedSite] });
      toast({
        title: "Success",
        description: "Work hour configuration has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          "Failed to delete work hour configuration: " + error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (staffSites && staffSites.length > 0 && !selectedSite) {
      setSelectedSite(staffSites[0].id);
    }
  }, [staffSites, selectedSite]);

  useEffect(() => {
    if (selectedConfig) {
      form.reset({
        siteId: parseInt(selectedConfig.site_id.toString()),
        dayOfWeek: selectedConfig.day_of_week,
        startTime: selectedConfig.start_time,
        endTime: selectedConfig.end_time,
        isActive: selectedConfig.is_active,
      });
    }
  }, [selectedConfig, form]);

  const handleAddNew = () => {
    setSelectedConfig(null);
    form.reset({
      siteId: selectedSite
        ? parseInt(selectedSite)
        : staffSites && staffSites.length > 0
        ? parseInt(staffSites[0].id)
        : 0,
      dayOfWeek: "monday",
      startTime: "09:00",
      endTime: "17:00",
      isActive: true,
    });
    setOpen(true);
  };

  const handleEdit = (config: WorkHourConfig) => {
    setSelectedConfig(config);
    setOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    if (selectedConfig) {
      updateWorkHour.mutate({ ...values, id: selectedConfig.id });
    } else {
      createWorkHour.mutate(values);
    }
  };

  const formatTime = (timeString: string) => {
    // Handle time format (e.g., convert "09:00:00" to "09:00 AM")
    try {
      const [hours, minutes] = timeString.split(":");
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (err) {
      return timeString;
    }
  };

  // Get day name from value
  const getDayName = (dayValue: string) => {
    const day = weekDays.find((d) => d.value === dayValue);
    return day ? day.label : dayValue;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-medium">Work Hours Configuration</h3>
          {!loadingSites && staffSites && staffSites.length > 0 && (
            <Select value={selectedSite || ""} onValueChange={setSelectedSite}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select site" />
              </SelectTrigger>
              <SelectContent>
                {staffSites.map((site) => (
                  <SelectItem key={site.id} value={site.id}>
                    {site.sitename}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <Button
          onClick={handleAddNew}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Work Hours</span>
        </Button>
      </div>

      {loadingSites || (loadingWorkHours && selectedSite) ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : !selectedSite ? (
        <div className="text-center p-12 border rounded-md">
          <p className="text-muted-foreground">Please select a site</p>
        </div>
      ) : workHours && workHours.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="px-4 py-2 text-left">Day</th>
                <th className="px-4 py-2 text-left">Start Time</th>
                <th className="px-4 py-2 text-left">End Time</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {workHours.map((config) => (
                <tr key={config.id} className="border-b">
                  <td className="px-4 py-3 capitalize">
                    {getDayName(config.day_of_week)}
                  </td>
                  <td className="px-4 py-3">{formatTime(config.start_time)}</td>
                  <td className="px-4 py-3">{formatTime(config.end_time)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                        config.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {config.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(config)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteWorkHour.mutate(config.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center p-12 border rounded-md">
          <p className="text-muted-foreground">
            No work hour configurations found
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Click "Add Work Hours" to create a new configuration
          </p>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedConfig ? "Edit Work Hours" : "Add Work Hours"}
            </DialogTitle>
            <DialogDescription>
              Configure work hours for a specific day.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="siteId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select site" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {staffSites &&
                          staffSites.map((site) => (
                            <SelectItem key={site.id} value={site.id}>
                              {site.sitename}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dayOfWeek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day of Week</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {weekDays.map((day) => (
                          <SelectItem key={day.value} value={day.value}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <FormDescription>
                        Set whether this work hour configuration is active
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={
                    createWorkHour.isPending || updateWorkHour.isPending
                  }
                >
                  {createWorkHour.isPending || updateWorkHour.isPending ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </span>
                  ) : (
                    <span>Save</span>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
