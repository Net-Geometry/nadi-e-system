import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { Trash2, Plus, Calendar as CalendarIcon } from "lucide-react";

interface OffDay {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  site_id: number;
}

const offDaySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date({
    required_error: "End date is required",
  }),
  isRecurring: z.boolean().default(false),
  recurrencePattern: z.string().optional(),
  siteId: z.number().optional(),
});

type FormValues = z.infer<typeof offDaySchema>;

export const OffDaysManager = () => {
  const [open, setOpen] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedOffDay, setSelectedOffDay] = useState<OffDay | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(offDaySchema),
    defaultValues: {
      title: "",
      description: "",
      isRecurring: false,
      recurrencePattern: "",
    },
  });

  // Fetch off days
  const { data: offDays, isLoading } = useQuery({
    queryKey: ["offDays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nd_off_days")
        .select("*")
        .order("start_date", { ascending: true });

      if (error) throw error;
      return data as OffDay[];
    },
  });

  // Create new off day
  const createOffDay = useMutation({
    mutationFn: async (values: FormValues) => {
      const { data, error } = await supabase.from("nd_off_days").insert([
        {
          title: values.title,
          description: values.description,
          start_date: values.startDate.toISOString().split("T")[0],
          end_date: values.endDate.toISOString().split("T")[0],
          is_recurring: values.isRecurring,
          recurrence_pattern: values.recurrencePattern,
          site_id: values.siteId || 1, // Default site ID, adjust as needed
        },
      ]);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offDays"] });
      toast({
        title: "Success",
        description: "Off day has been added successfully",
      });
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add off day: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Update existing off day
  const updateOffDay = useMutation({
    mutationFn: async (values: FormValues & { id: string }) => {
      const { data, error } = await supabase
        .from("nd_off_days")
        .update({
          title: values.title,
          description: values.description,
          start_date: values.startDate.toISOString().split("T")[0],
          end_date: values.endDate.toISOString().split("T")[0],
          is_recurring: values.isRecurring,
          recurrence_pattern: values.recurrencePattern,
        })
        .eq("id", values.id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offDays"] });
      toast({
        title: "Success",
        description: "Off day has been updated successfully",
      });
      setOpen(false);
      form.reset();
      setSelectedOffDay(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update off day: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Delete off day
  const deleteOffDay = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("nd_off_days")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offDays"] });
      toast({
        title: "Success",
        description: "Off day has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete off day: " + error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (selectedOffDay) {
      form.reset({
        title: selectedOffDay.title,
        description: selectedOffDay.description || "",
        startDate: new Date(selectedOffDay.start_date),
        endDate: new Date(selectedOffDay.end_date),
        isRecurring: selectedOffDay.is_recurring,
        recurrencePattern: selectedOffDay.recurrence_pattern || "",
      });
    }
  }, [selectedOffDay, form]);

  // Form submit handler
  const onSubmit = (values: FormValues) => {
    if (selectedOffDay) {
      updateOffDay.mutate({ ...values, id: selectedOffDay.id });
    } else {
      createOffDay.mutate(values);
    }
  };

  // Handle calendar date selection
  useEffect(() => {
    if (offDays) {
      const dates = offDays.map((offDay) => new Date(offDay.start_date));
      setSelectedDates(dates);
    }
  }, [offDays]);

  const handleAddNew = () => {
    setSelectedOffDay(null);
    form.reset({
      title: "",
      description: "",
      startDate: new Date(),
      endDate: new Date(),
      isRecurring: false,
      recurrencePattern: "",
    });
    setOpen(true);
  };

  const handleEdit = (offDay: OffDay) => {
    setSelectedOffDay(offDay);
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Off Days</h3>
        <Button
          onClick={handleAddNew}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Off Day</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Calendar
            mode="multiple"
            selected={selectedDates}
            className="rounded-md border p-3 pointer-events-auto"
          />
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : offDays && offDays.length > 0 ? (
            offDays.map((offDay) => (
              <div
                key={offDay.id}
                className="flex items-center justify-between border rounded-md p-4"
              >
                <div>
                  <h4 className="font-medium">{offDay.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(offDay.start_date), "MMMM dd, yyyy")} -
                    {format(new Date(offDay.end_date), "MMMM dd, yyyy")}
                  </p>
                  {offDay.is_recurring && (
                    <p className="text-sm text-muted-foreground">
                      Recurring: {offDay.recurrence_pattern}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(offDay)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteOffDay.mutate(offDay.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-6 border rounded-md">
              <p className="text-muted-foreground">No off days configured</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedOffDay ? "Edit Off Day" : "Add New Off Day"}
            </DialogTitle>
            <DialogDescription>
              Configure the off day details and schedule.
            </DialogDescription>
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
                      <Input placeholder="e.g., National Holiday" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add more details about this off day"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            value={
                              field.value ? format(field.value, "PPP") : ""
                            }
                            readOnly
                            className="pl-10"
                            onChange={() => {}}
                          />
                          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            value={
                              field.value ? format(field.value, "PPP") : ""
                            }
                            readOnly
                            className="pl-10"
                            onChange={() => {}}
                          />
                          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isRecurring"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Recurring</FormLabel>
                      <FormDescription>
                        Enable if this is a recurring off day
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

              {form.watch("isRecurring") && (
                <FormField
                  control={form.control}
                  name="recurrencePattern"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recurrence Pattern</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Yearly, Every Monday"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Describe how often this off day recurs
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={createOffDay.isPending || updateOffDay.isPending}
                >
                  {createOffDay.isPending || updateOffDay.isPending ? (
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
