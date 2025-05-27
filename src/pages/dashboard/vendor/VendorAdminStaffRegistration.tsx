
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/dashboard/PageHeader";
import { PageContainer } from "@/components/ui/dashboard/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Save } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface VendorStaffFormData {
  fullname: string;
  ic_no: string;
  mobile_no: string;
  work_email: string;
  password: string;
}

const VendorAdminStaffRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [vendorProfile, setVendorProfile] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<VendorStaffFormData>({
    defaultValues: {
      fullname: "",
      ic_no: "",
      mobile_no: "",
      work_email: "",
      password: "",
    },
  });

  useEffect(() => {
    fetchVendorProfile();
  }, []);

  const fetchVendorProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current vendor admin's profile
      const { data: vendorStaff, error: staffError } = await supabase
        .from("nd_vendor_staff")
        .select("registration_number")
        .eq("user_id", user.id)
        .single();

      if (staffError) throw staffError;

      // Get vendor company details
      const { data: vendor, error: vendorError } = await supabase
        .from("nd_vendor_profile")
        .select("*")
        .eq("id", vendorStaff.registration_number)
        .single();

      if (vendorError) throw vendorError;
      setVendorProfile(vendor);
    } catch (error) {
      console.error("Error fetching vendor profile:", error);
      toast({
        title: "Error",
        description: "Failed to load vendor profile",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: VendorStaffFormData) => {
    if (!vendorProfile) {
      toast({
        title: "Error",
        description: "Vendor profile not found",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error("You must be logged in to register staff");
      }

      // Create user account using the edge function
      const { data: authData, error: authError } = await supabase.functions.invoke("create-user", {
        body: {
          email: data.work_email,
          fullName: data.fullname,
          userType: "vendor_staff",
          userGroup: 5, // vendor group
          phoneNumber: data.mobile_no,
          icNumber: data.ic_no,
          password: data.password,
        },
      });

      if (authError) {
        console.error("Auth error:", authError);
        throw new Error(`Failed to create user account: ${authError.message}`);
      }

      if (!authData?.id) {
        throw new Error("Failed to create user account - no user ID returned");
      }

      // Insert vendor staff record
      const staffData = {
        user_id: authData.id,
        fullname: data.fullname,
        ic_no: data.ic_no,
        mobile_no: data.mobile_no,
        work_email: data.work_email,
        position_id: 2, // Staff position
        registration_number: vendorProfile.id,
        is_active: true,
        created_by: currentUser.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error: staffError } = await supabase
        .from("nd_vendor_staff")
        .insert(staffData);

      if (staffError) {
        console.error("Staff creation error:", staffError);
        throw new Error(`Failed to create staff record: ${staffError.message}`);
      }

      toast({
        title: "Success",
        description: "Vendor staff registered successfully",
      });

      navigate("/vendor/teams");
    } catch (error: any) {
      console.error("Error registering vendor staff:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to register vendor staff",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!vendorProfile) {
    return (
      <div>
        <PageContainer>
          <div className="text-center py-8">Loading vendor profile...</div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div>
      <PageContainer>
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link to="/vendor/teams">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Teams
            </Link>
          </Button>
        </div>

        <PageHeader
          title="Register Vendor Staff"
          description={`Register a new staff member for ${vendorProfile.business_name}`}
        />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Staff Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Company:</strong> {vendorProfile.business_name} ({vendorProfile.registration_number})
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter full name" required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ic_no"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IC Number *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter IC number" required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="mobile_no"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter mobile number" required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="work_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Email *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="Enter work email"
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Enter password"
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" asChild>
                <Link to="/vendor/teams">Cancel</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Registering..." : "Register Staff"}
              </Button>
            </div>
          </form>
        </Form>
      </PageContainer>
    </div>
  );
};

export default VendorAdminStaffRegistration;
