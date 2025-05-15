import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  Building,
  Calendar,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const StaffDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaffData = async () => {
      // If we already have the data from navigation state, use it
      if (location.state?.staffData) {
        setStaff(location.state.staffData);
        setLoading(false);
        return;
      }

      // Otherwise, fetch the data
      try {
        // Try to fetch from nd_staff_profile first
        let { data: staffData, error: staffError } = await supabase
          .from("nd_staff_profile")
          .select(
            `
            *,
            nd_staff_job:job_id(*),
            nd_staff_address:id(address1, address2, postcode, city, state_id)
          `
          )
          .eq("id", id)
          .maybeSingle();

        // If not found in staff profile, try tech partner profile
        if (!staffData && !staffError) {
          const { data: techPartnerData, error: techPartnerError } =
            await supabase
              .from("nd_tech_partner_profile")
              .select("*, tech_partner_id(name)")
              .eq("id", id)
              .maybeSingle();

          if (techPartnerError) throw techPartnerError;

          staffData = techPartnerData;
        } else if (staffError) {
          throw staffError;
        }

        if (staffData) {
          setStaff(staffData);
        } else {
          toast({
            title: "Staff Not Found",
            description: "Unable to find the requested staff member.",
            variant: "destructive",
          });
          navigate("/dashboard/hr/employees");
        }
      } catch (error) {
        console.error("Error fetching staff data:", error);
        toast({
          title: "Error",
          description: "Failed to load staff details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, [id, location.state, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";

    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
          <h1 className="text-2xl font-bold">
            {staff?.fullname || "Staff Details"}
          </h1>
          <Badge
            className={`ml-4 ${
              staff?.is_active
                ? "bg-green-100 text-green-800 border-green-200"
                : "bg-red-100 text-red-800 border-red-200"
            }`}
          >
            {staff?.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>

        <Tabs defaultValue="personal">
          <TabsList className="mb-4">
            <TabsTrigger value="personal">Personal Information</TabsTrigger>
            <TabsTrigger value="work">Work Information</TabsTrigger>
            <TabsTrigger value="contact">Contact Details</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Basic details about the staff member
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Full Name
                      </p>
                      <p className="flex items-center mt-1">
                        <User className="h-4 w-4 mr-2 text-gray-400" />{" "}
                        {staff?.fullname || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        IC Number
                      </p>
                      <p className="mt-1">{staff?.ic_no || "N/A"}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Date of Birth
                      </p>
                      <p className="flex items-center mt-1">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {staff?.dob ? formatDate(staff.dob) : "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Gender
                      </p>
                      <p className="mt-1">
                        {staff?.gender_id === 1
                          ? "Male"
                          : staff?.gender_id === 2
                          ? "Female"
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Religion
                      </p>
                      <p className="mt-1">{staff?.religion_id || "N/A"}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Nationality
                      </p>
                      <p className="mt-1">{staff?.nationality_id || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="work">
            <Card>
              <CardHeader>
                <CardTitle>Work Information</CardTitle>
                <CardDescription>
                  Employment details and position
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Position
                      </p>
                      <p className="flex items-center mt-1">
                        <Building className="h-4 w-4 mr-2 text-gray-400" />
                        {staff?.position_id || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Organization
                      </p>
                      <p className="mt-1">
                        {staff?.tech_partner_id?.name ||
                          staff?.nd_staff_job?.site_id ||
                          "N/A"}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Join Date
                      </p>
                      <p className="flex items-center mt-1">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {staff?.join_date ? formatDate(staff.join_date) : "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Status
                      </p>
                      <Badge
                        variant="outline"
                        className={
                          staff?.is_active
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }
                      >
                        {staff?.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Details</CardTitle>
                <CardDescription>
                  Contact information and address
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Work Email
                      </p>
                      <p className="flex items-center mt-1">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {staff?.work_email || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Personal Email
                      </p>
                      <p className="flex items-center mt-1">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {staff?.personal_email || "N/A"}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Mobile Number
                      </p>
                      <p className="flex items-center mt-1">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        {staff?.mobile_no || "N/A"}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">
                      Address
                    </p>
                    <p className="flex items-start mt-1">
                      <MapPin className="h-4 w-4 mr-2 mt-1 text-gray-400" />
                      <span>
                        {staff?.nd_staff_address?.address1 ? (
                          <>
                            {staff.nd_staff_address.address1}
                            {staff.nd_staff_address.address2 && (
                              <>, {staff.nd_staff_address.address2}</>
                            )}
                            {staff.nd_staff_address.city && (
                              <>, {staff.nd_staff_address.city}</>
                            )}
                            {staff.nd_staff_address.postcode && (
                              <>, {staff.nd_staff_address.postcode}</>
                            )}
                          </>
                        ) : (
                          "No address information available"
                        )}
                      </span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default StaffDetail;
