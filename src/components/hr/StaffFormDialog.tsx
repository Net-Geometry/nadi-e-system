import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { createStaffMember } from "@/lib/staff";
import { useAuth } from "@/hooks/useAuth";
import { useUserAccess } from "@/hooks/use-user-access";
import { useUserMetadata } from "@/hooks/use-user-metadata";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const staffFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email({ message: "Please enter a valid email address" }),
  userType: z.string().min(2, "User type is required"),
  employDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Please enter a valid date",
  }),
  status: z.enum(["Active", "On Leave", "Inactive"]),
  siteLocation: z.string().min(2, "Site location is required"),
  phone_number: z
    .string()
    .regex(/^(\+?6?01)[0-9]{8,9}$/, {
      message:
        "Please enter a valid Malaysian phone number (e.g., +60123456789 or 01123456789)",
    })
    .optional()
    .or(z.literal("")),
  mobile_no_2: z.string().optional().or(z.literal("")),
  telephone_no: z.string().optional().or(z.literal("")),
  telephone_no_2: z.string().optional().or(z.literal("")),
  gender_id: z.string().min(1, "Gender is required"),
  ic_number: z.string().regex(/^\d{6}-\d{2}-\d{4}$/, {
    message: "Please enter a valid IC number in the format xxxxxx-xx-xxxx",
  }),
  personal_email: z
    .string()
    .email({ message: "Please enter a valid personal email" })
    .optional()
    .or(z.literal("")),
  dob: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Please enter a valid date",
  }),
  place_of_birth: z.string().optional().or(z.literal("")),
  marital_status: z.string().min(1, "Marital status is required"),
  height: z.string().optional().or(z.literal("")),
  weight: z.string().optional().or(z.literal("")),
  race_id: z.string().min(1, "Race is required"),
  religion_id: z.string().min(1, "Religion is required"),
  nationality_id: z.string().min(1, "Nationality is required"),
  // Permanent address
  permanent_address1: z.string().optional().or(z.literal("")),
  permanent_address2: z.string().optional().or(z.literal("")),
  permanent_postcode: z.string().optional().or(z.literal("")),
  permanent_city: z.string().optional().or(z.literal("")),
  permanent_state: z.string().optional().or(z.literal("")),
  // Correspondence address
  same_as_permanent: z.boolean().default(false),
  correspondence_address1: z.string().optional().or(z.literal("")),
  correspondence_address2: z.string().optional().or(z.literal("")),
  correspondence_postcode: z.string().optional().or(z.literal("")),
  correspondence_city: z.string().optional().or(z.literal("")),
  correspondence_state: z.string().optional().or(z.literal("")),
  // Work info
  website: z.string().optional().or(z.literal("")),
  income_tax_no: z.string().optional().or(z.literal("")),
  epf_no: z.string().optional().or(z.literal("")),
  socso_no: z.string().optional().or(z.literal("")),
  bank_name: z.string().optional().or(z.literal("")),
  bank_account_no: z.string().optional().or(z.literal("")),
  qualification: z.string().optional().or(z.literal("")),
  join_date: z.string().optional().or(z.literal("")),
});

type StaffFormValues = z.infer<typeof staffFormSchema>;

interface StaffFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  organizationName: string;
  onStaffAdded: (staff: any) => void;
  siteLocations?: string[];
}

export function StaffFormDialog({
  open,
  onOpenChange,
  organizationId,
  organizationName,
  onStaffAdded,
  siteLocations,
}: StaffFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [availableSites, setAvailableSites] = useState<
    { id: string; sitename: string }[]
  >([]);
  const [userTypes, setUserTypes] = useState<string[]>([]);
  const { user } = useAuth();
  const { userType: currentUserType } = useUserAccess();
  const userMetadataString = useUserMetadata();

  const [races, setRaces] = useState<{ id: string; eng: string }[]>([]);
  const [religions, setReligions] = useState<{ id: string; eng: string }[]>([]);
  const [nationalities, setNationalities] = useState<
    { id: string; eng: string }[]
  >([]);
  const [maritalStatuses, setMaritalStatuses] = useState<
    { id: string; eng: string }[]
  >([]);
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [genders, setGenders] = useState<{ id: string; eng: string }[]>([]);
  const [states, setStates] = useState<{ id: string; name: string }[]>([]);
  const [banks, setBanks] = useState<{ id: string; bank_name: string }[]>([]);
  const [activeTab, setActiveTab] = useState("personal-info");

  const [currentUserCredentials, setCurrentUserCredentials] = useState<{
    email?: string;
    password?: string;
  }>({});

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const { data, error } = await supabase
          .from("nd_site_profile")
          .select("id, sitename")
          .eq("dusp_tp_id", organizationId);

        if (error) throw error;
        if (data) {
          setAvailableSites(data);
        }
      } catch (err) {
        console.error("Error fetching sites:", err);
        toast({
          title: "Error",
          description: "Failed to load site locations.",
          variant: "destructive",
        });
      }
    };

    const fetchUserTypes = async () => {
      try {
        const allowedTypes = ["staff_manager", "staff_assistant_manager"];
        setUserTypes(allowedTypes);
      } catch (err) {
        console.error("Error fetching user types:", err);
      }
    };

    const fetchRaces = async () => {
      try {
        const { data, error } = await supabase
          .from("nd_races")
          .select("id, eng")
          .order("eng");

        if (error) throw error;
        if (data) setRaces(data);
      } catch (err) {
        console.error("Error fetching races:", err);
      }
    };

    const fetchReligions = async () => {
      try {
        const { data, error } = await supabase
          .from("nd_religion")
          .select("id, eng")
          .order("eng");

        if (error) throw error;
        if (data) setReligions(data);
      } catch (err) {
        console.error("Error fetching religions:", err);
      }
    };

    const fetchNationalities = async () => {
      try {
        const { data, error } = await supabase
          .from("nd_nationalities")
          .select("id, eng")
          .order("eng");

        if (error) throw error;
        if (data) setNationalities(data);
      } catch (err) {
        console.error("Error fetching nationalities:", err);
      }
    };

    const fetchMaritalStatuses = async () => {
      try {
        const { data, error } = await supabase
          .from("nd_marital_status")
          .select("id, eng")
          .order("eng");

        if (error) throw error;
        if (data) setMaritalStatuses(data);
      } catch (err) {
        console.error("Error fetching marital statuses:", err);
      }
    };

    const fetchCities = async () => {
      try {
        const { data, error } = await supabase
          .from("nd_city")
          .select("id, name")
          .order("name");

        if (error) throw error;
        if (data) setCities(data);
      } catch (err) {
        console.error("Error fetching cities:", err);
      }
    };

    const fetchGenders = async () => {
      try {
        const { data, error } = await supabase
          .from("nd_genders")
          .select("id, eng")
          .order("eng");

        if (error) throw error;
        if (data) setGenders(data);
      } catch (err) {
        console.error("Error fetching genders:", err);
      }
    };

    const fetchStates = async () => {
      try {
        const { data, error } = await supabase
          .from("nd_state")
          .select("id, name")
          .order("name");

        if (error) throw error;
        if (data) setStates(data);
      } catch (err) {
        console.error("Error fetching states:", err);
      }
    };

    const fetchBanks = async () => {
      try {
        const { data, error } = await supabase
          .from("nd_bank_list")
          .select("id, bank_name")
          .order("bank_name");

        if (error) throw error;
        if (data) setBanks(data);
      } catch (err) {
        console.error("Error fetching banks:", err);
      }
    };

    if (organizationId) {
      fetchSites();
      fetchUserTypes();
      fetchRaces();
      fetchReligions();
      fetchNationalities();
      fetchMaritalStatuses();
      fetchCities();
      fetchGenders();
      fetchStates();
      fetchBanks();
    }
  }, [organizationId, toast]);

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      name: "",
      email: "",
      userType: "",
      employDate: new Date().toISOString().split("T")[0],
      status: "Active",
      siteLocation: "",
      phone_number: "",
      mobile_no_2: "",
      telephone_no: "",
      telephone_no_2: "",
      gender_id: "",
      ic_number: "",
      personal_email: "",
      qualification: "",
      dob: "",
      place_of_birth: "",
      marital_status: "",
      height: "",
      weight: "",
      race_id: "",
      religion_id: "",
      nationality_id: "",
      permanent_address1: "",
      permanent_address2: "",
      permanent_postcode: "",
      permanent_city: "",
      permanent_state: "",
      same_as_permanent: false,
      correspondence_address1: "",
      correspondence_address2: "",
      correspondence_postcode: "",
      correspondence_city: "",
      correspondence_state: "",
      website: "",
      income_tax_no: "",
      epf_no: "",
      socso_no: "",
      bank_name: "",
      bank_account_no: "",
    },
  });

  // Calculate age from date of birth
  const calculateAge = (dob: string): string => {
    if (!dob) return "";
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  };

  // Watch for date of birth changes
  const dobValue = form.watch("dob");
  const age = calculateAge(dobValue);

  // Watch for same as permanent checkbox
  const sameAsPermanent = form.watch("same_as_permanent");

  // Update correspondence address when checkbox is checked
  useEffect(() => {
    if (sameAsPermanent) {
      const permanentAddress1 = form.getValues("permanent_address1");
      const permanentAddress2 = form.getValues("permanent_address2");
      const permanentPostcode = form.getValues("permanent_postcode");
      const permanentCity = form.getValues("permanent_city");
      const permanentState = form.getValues("permanent_state");

      form.setValue("correspondence_address1", permanentAddress1);
      form.setValue("correspondence_address2", permanentAddress2);
      form.setValue("correspondence_postcode", permanentPostcode);
      form.setValue("correspondence_city", permanentCity);
      form.setValue("correspondence_state", permanentState);
    }
  }, [sameAsPermanent, form]);

  const handleICNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9-]/g, "");

    if (value.length > 6 && value.charAt(6) !== "-") {
      value = value.slice(0, 6) + "-" + value.slice(6);
    }
    if (value.length > 9 && value.charAt(9) !== "-") {
      value = value.slice(0, 9) + "-" + value.slice(9);
    }

    if (value.length > 14) {
      value = value.slice(0, 14);
    }

    form.setValue("ic_number", value);
  };

  useEffect(() => {
    const promptForPassword = async () => {
      if (user?.email) {
        setCurrentUserCredentials({
          email: user.email,
        });
      }
    };

    if (open && user) {
      promptForPassword();
    }
  }, [open, user]);

  const onSubmit = async (data: StaffFormValues) => {
    setIsSubmitting(true);
    try {
      const allowedCreatorTypes = ["tp_admin", "tp_hr", "super_admin"];
      if (!currentUserType || !allowedCreatorTypes.includes(currentUserType)) {
        throw new Error("You do not have permission to create staff members");
      }

      if (
        !["staff_manager", "staff_assistant_manager"].includes(data.userType)
      ) {
        throw new Error(
          "Only staff_manager and staff_assistant_manager user types are allowed"
        );
      }

      console.log(
        "Submitting staff with user type:",
        data.userType,
        "and site location:",
        data.siteLocation
      );

      // Find the selected site for displaying in success message
      const selectedSite = availableSites.find(
        (site) => site.id === data.siteLocation
      );

      // Ensure site location is a number for database compatibility
      const siteLocationId = parseInt(data.siteLocation, 10);

      if (isNaN(siteLocationId)) {
        throw new Error("Invalid site location format");
      }

      // Parse organization ID from user metadata if available
      let parsedOrganizationId = organizationId;
      if (userMetadataString) {
        try {
          const metadata = JSON.parse(userMetadataString);
          if (metadata.organization_id) {
            parsedOrganizationId = metadata.organization_id;
          }
        } catch (error) {
          console.error("Error parsing user metadata:", error);
        }
      }

      const result = await createStaffMember({
        ...data,
        organizationId: parsedOrganizationId,
        siteLocation: siteLocationId, // Convert to number to match bigint in database
      });

      // If result includes user_id, add user to organization_users table
      if (result.data && result.data.user_id) {
        await supabase.from("organization_users").insert({
          user_id: result.data.user_id,
          organization_id: parsedOrganizationId,
          role: "staff",
        });
      }

      onStaffAdded({
        ...result.data,
        name: data.name,
        userType: data.userType,
        siteLocationName: selectedSite?.sitename || "Unknown site",
      });

      toast({
        title: "Success",
        description: `${
          data.name
        } has been added to ${organizationName} as ${data.userType.replace(
          /_/g,
          " "
        )} at ${selectedSite?.sitename || "Unknown site"}`,
      });
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      console.error("Error adding staff:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to add staff member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add New Site Staff Member
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="personal-info">Personal Info</TabsTrigger>
                <TabsTrigger value="permanent-address">
                  Permanent Address
                </TabsTrigger>
                <TabsTrigger value="correspondence-address">
                  Correspondence Address
                </TabsTrigger>
                <TabsTrigger value="work-info">Work Info</TabsTrigger>
              </TabsList>

              <TabsContent value="personal-info" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name*</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="John Doe" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ic_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IC Number*</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            onChange={handleICNumberChange}
                            placeholder="xxxxxx-xx-xxxx"
                            className="font-mono"
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
                        <FormLabel>Mobile No*</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="tel"
                            placeholder="+60123456789"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mobile_no_2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile No 2</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="tel"
                            placeholder="+60123456789"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="telephone_no"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telephone No*</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="tel"
                            placeholder="03-12345678"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="telephone_no_2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telephone No 2</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="tel"
                            placeholder="03-12345678"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {genders.map((gender) => (
                              <SelectItem key={gender.id} value={gender.id}>
                                {gender.eng}
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
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="work@example.com"
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
                        <FormLabel>Personal Email*</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="personal@example.com"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth*</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormLabel>Age</FormLabel>
                    <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base md:text-sm">
                      {age || "-"}
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="place_of_birth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Place of Birth</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {cities.map((city) => (
                              <SelectItem key={city.id} value={city.id}>
                                {city.name}
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
                    name="marital_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marital Status*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select marital status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {maritalStatuses.map((status) => (
                              <SelectItem key={status.id} value={status.id}>
                                {status.eng}
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
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (cm)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" placeholder="175" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" placeholder="70" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="race_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Race*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select race" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {races.map((race) => (
                              <SelectItem key={race.id} value={race.id}>
                                {race.eng}
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
                    name="religion_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Religion*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select religion" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {religions.map((religion) => (
                              <SelectItem key={religion.id} value={religion.id}>
                                {religion.eng}
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
                    name="nationality_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nationality*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select nationality" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {nationalities.map((nationality) => (
                              <SelectItem
                                key={nationality.id}
                                value={nationality.id}
                              >
                                {nationality.eng}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="permanent-address" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="permanent_address1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Permanent Address 1</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="123 Main Street" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="permanent_address2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Permanent Address 2</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Apt 4B" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="permanent_postcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Permanent Postcode</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="50000" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="permanent_city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Permanent City</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {cities.map((city) => (
                              <SelectItem key={city.id} value={city.id}>
                                {city.name}
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
                    name="permanent_state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Permanent State</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {states.map((state) => (
                              <SelectItem key={state.id} value={state.id}>
                                {state.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent
                value="correspondence-address"
                className="space-y-4 pt-4"
              >
                <div className="mb-4">
                  <FormField
                    control={form.control}
                    name="same_as_permanent"
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="same-as-permanent"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="h-5 w-5"
                        />
                        <label
                          htmlFor="same-as-permanent"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Same as permanent address
                        </label>
                      </div>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="correspondence_address1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correspondence Address 1</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="123 Main Street"
                            disabled={form.watch("same_as_permanent")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="correspondence_address2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correspondence Address 2</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Apt 4B"
                            disabled={form.watch("same_as_permanent")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="correspondence_postcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correspondence Postcode</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="50000"
                            disabled={form.watch("same_as_permanent")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="correspondence_city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correspondence City</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={form.watch("same_as_permanent")}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {cities.map((city) => (
                              <SelectItem key={city.id} value={city.id}>
                                {city.name}
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
                    name="correspondence_state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correspondence State</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={form.watch("same_as_permanent")}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {states.map((state) => (
                              <SelectItem key={state.id} value={state.id}>
                                {state.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="work-info" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="url"
                            placeholder="https://example.com"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="income_tax_no"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Income Tax No.</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="SB12345678" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="epf_no"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>EPF No.</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="12345678901" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="socso_no"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Socso No.</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="S1234567890" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bank_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select bank" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {banks.map((bank) => (
                              <SelectItem key={bank.id} value={bank.id}>
                                {bank.bank_name}
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
                    name="bank_account_no"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Account No.</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="123456789012" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="userType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select user type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {userTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type
                                  .split("_")
                                  .map(
                                    (word) =>
                                      word.charAt(0).toUpperCase() +
                                      word.slice(1)
                                  )
                                  .join(" ")}
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
                    name="employDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employment Date*</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="join_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Join Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="On Leave">On Leave</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="siteLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site Location*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select site location">
                                {field.value &&
                                  availableSites.find(
                                    (site) => site.id === field.value
                                  )?.sitename}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {availableSites.map((site) => (
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
                    name="qualification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qualification</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Bachelor's Degree, etc."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Staff"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
