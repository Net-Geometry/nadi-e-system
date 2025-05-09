import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Loader2 } from "lucide-react";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const staffFormSchema = z.object({
  fullname: z.string().min(1, "Full name is required"),
  position_id: z.string().optional(),
  mobile_no: z.string().optional(),
  work_email: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  personal_email: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  is_active: z.boolean().default(true),
});

type StaffFormValues = z.infer<typeof staffFormSchema>;

const StaffEdit = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [positions, setPositions] = useState([]);
  const [profileType, setProfileType] = useState<
    "tech_partner" | "staff" | null
  >(null);

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      fullname: "",
      position_id: "",
      mobile_no: "",
      work_email: "",
      personal_email: "",
      is_active: true,
    },
  });

  useEffect(() => {
    // Fetch positions for dropdown
    const fetchPositions = async () => {
      try {
        const { data, error } = await supabase
          .from("nd_position")
          .select("id, name");

        if (error) throw error;

        setPositions(data || []);
      } catch (error) {
        console.error("Error fetching positions:", error);
        toast.error({
          title: "Error",
          description: "Failed to load position data.",
        });
      }
    };

    fetchPositions();
  }, [toast]);

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        // Try to fetch from nd_staff_profile first
        // Convert id to string to avoid type mismatches
        const idToUse = typeof id === "string" ? id : String(id);

        let { data: staffData, error: staffError } = await supabase
          .from("nd_staff_profile")
          .select("*")
          .eq("id", idToUse)
          .maybeSingle();

        // If found in staff profile
        if (staffData) {
          console.log("Found staff profile:", staffData);
          setStaff(staffData);
          setProfileType("staff");

          // Set form values
          form.reset({
            fullname: staffData.fullname || "",
            position_id: staffData.position_id
              ? String(staffData.position_id)
              : "",
            mobile_no: staffData.mobile_no || "",
            work_email: staffData.work_email || "",
            personal_email: staffData.personal_email || "",
            is_active: staffData.is_active || false,
          });
          return;
        }

        // If not found in staff profile, try tech partner profile
        const { data: techPartnerData, error: techPartnerError } =
          await supabase
            .from("nd_tech_partner_profile")
            .select("*")
            .eq("id", idToUse)
            .maybeSingle();

        if (techPartnerError) throw techPartnerError;

        if (techPartnerData) {
          console.log("Found tech partner profile:", techPartnerData);
          setStaff(techPartnerData);
          setProfileType("tech_partner");

          // Set form values
          form.reset({
            fullname: techPartnerData.fullname || "",
            position_id: techPartnerData.position_id
              ? String(techPartnerData.position_id)
              : "",
            mobile_no: techPartnerData.mobile_no || "",
            work_email: techPartnerData.work_email || "",
            personal_email: techPartnerData.personal_email || "",
            is_active: techPartnerData.is_active || false,
          });
        } else {
          toast.error({
            title: "Staff Not Found",
            description: "Unable to find the requested staff member.",
          });
          navigate("/dashboard/hr/employees");
        }
      } catch (error) {
        console.error("Error fetching staff data:", error);
        toast.error({
          title: "Error",
          description: "Failed to load staff details. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, [id, navigate, form, toast]);

  const onSubmit = async (values: StaffFormValues) => {
    if (!profileType) {
      toast.error({
        title: "Error",
        description: "Unable to determine staff profile type.",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Determine which table to update based on profile type
      const tableName =
        profileType === "tech_partner"
          ? "nd_tech_partner_profile"
          : "nd_staff_profile";

      // Convert id to string to avoid type mismatches
      const idToUse = typeof id === "string" ? id : String(id);

      // Update the staff record
      const { error } = await supabase
        .from(tableName)
        .update({
          fullname: values.fullname,
          position_id: values.position_id ? parseInt(values.position_id) : null,
          mobile_no: values.mobile_no,
          work_email: values.work_email,
          personal_email: values.personal_email,
          is_active: values.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", idToUse);

      if (error) throw error;

      toast.success({
        title: "Success",
        description: "Staff information has been updated successfully.",
      });

      navigate(-1);
    } catch (error) {
      console.error("Error updating staff:", error);
      toast.error({
        title: "Error",
        description: "Failed to update staff information. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto max-w-4xl py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
          <p className="text-center mt-4 text-gray-500">
            Loading staff details...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-4xl py-6">
        <div className="mb-6 flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold">Edit Staff</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Staff Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="fullname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="position_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select position" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {positions.map((position) => (
                              <SelectItem
                                key={position.id}
                                value={position.id.toString()}
                              >
                                {position.name}
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
                    name="mobile_no"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter mobile number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="work_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Work email address"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="personal_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Personal Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Personal email address"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active Status</FormLabel>
                        <FormDescription>
                          Is this staff member currently active?
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {submitting ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StaffEdit;
