import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/dashboard/PageHeader";
import { PageContainer } from "@/components/ui/dashboard/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface VendorFormData {
  business_name: string;
  registration_number: string;
  business_type: string;
  phone_number: string;
  service_detail: string;
  bank_account_number: string;
  // Address fields
  address1: string;
  address2?: string;
  city: string;
  postcode: string;
  state_id: number;
  district_id: number;
}

const VendorRegistration = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<VendorFormData>({
    defaultValues: {
      business_name: "",
      registration_number: "",
      business_type: "",
      phone_number: "",
      service_detail: "",
      bank_account_number: "",
      address1: "",
      address2: "",
      city: "",
      postcode: "",
      state_id: 0,
      district_id: 0,
    },
  });

  const onSubmit = async (data: VendorFormData) => {
    setLoading(true);
    try {
      console.log("Submitting vendor registration:", data);

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // First, get the next available ID for the vendor profile
      const { data: maxIdResult, error: maxIdError } = await supabase
        .from("nd_vendor_profile")
        .select("id")
        .order("id", { ascending: false })
        .limit(1);

      if (maxIdError) {
        console.error("Error getting max ID:", maxIdError);
        throw new Error(`Failed to get next ID: ${maxIdError.message}`);
      }

      const nextId =
        maxIdResult && maxIdResult.length > 0 ? maxIdResult[0].id + 1 : 1;

      // Prepare vendor profile data with explicit ID
      const vendorProfileData = {
        id: nextId,
        business_name: data.business_name,
        registration_number: data.registration_number,
        business_type: data.business_type,
        phone_number: data.phone_number,
        service_detail: data.service_detail,
        bank_account_number: data.bank_account_number || null, // Keep as string
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log("Inserting vendor profile:", vendorProfileData);

      // Insert vendor profile with explicit ID
      const { data: vendorProfile, error: profileError } = await supabase
        .from("nd_vendor_profile")
        .insert(vendorProfileData)
        .select("*")
        .single();

      if (profileError) {
        console.error("Vendor profile error:", profileError);
        throw new Error(
          `Failed to create vendor profile: ${profileError.message}`
        );
      }

      console.log("Vendor profile created:", vendorProfile);

      // Insert vendor address with proper types
      const addressData = {
        registration_number: data.registration_number,
        address1: data.address1,
        address2: data.address2 || null,
        city: data.city,
        postcode: data.postcode,
        state_id: data.state_id || null,
        district_id: data.district_id || null,
        is_active: true,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log("Inserting vendor address:", addressData);

      const { error: addressError } = await supabase
        .from("nd_vendor_address")
        .insert(addressData);

      if (addressError) {
        console.error("Vendor address error:", addressError);
        throw new Error(
          `Failed to create vendor address: ${addressError.message}`
        );
      }

      toast({
        title: "Success",
        description: "Vendor company registered successfully",
      });

      navigate("/vendor/companies");
    } catch (error: any) {
      console.error("Error registering vendor:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to register vendor company",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageContainer>
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link to="/vendor/companies">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Companies
            </Link>
          </Button>
        </div>

        <PageHeader
          title="Register Vendor Company"
          description="Register a new vendor company in the system"
        />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">
            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="business_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter business name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="registration_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration Number *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter registration number"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="business_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Type *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., Technology Services"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter phone number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="service_detail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Details</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Describe the services provided by this vendor"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bank_account_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Account Number</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter bank account number"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle>Address Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="address1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 1 *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 2</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter additional address details"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter city" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="postcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postcode *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter postcode" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State *</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">Johor</SelectItem>
                            <SelectItem value="2">Kedah</SelectItem>
                            <SelectItem value="3">Kelantan</SelectItem>
                            <SelectItem value="4">Melaka</SelectItem>
                            <SelectItem value="5">Negeri Sembilan</SelectItem>
                            <SelectItem value="6">Pahang</SelectItem>
                            <SelectItem value="7">Perak</SelectItem>
                            <SelectItem value="8">Perlis</SelectItem>
                            <SelectItem value="9">Pulau Pinang</SelectItem>
                            <SelectItem value="10">Sabah</SelectItem>
                            <SelectItem value="11">Sarawak</SelectItem>
                            <SelectItem value="12">Selangor</SelectItem>
                            <SelectItem value="13">Terengganu</SelectItem>
                            <SelectItem value="14">Kuala Lumpur</SelectItem>
                            <SelectItem value="15">Labuan</SelectItem>
                            <SelectItem value="16">Putrajaya</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" asChild>
                <Link to="/vendor/companies">Cancel</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Registering..." : "Register Company"}
              </Button>
            </div>
          </form>
        </Form>
      </PageContainer>
    </div>
  );
};

export default VendorRegistration;
