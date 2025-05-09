import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

// Interface for staff members data
interface StaffMember {
  id: string;
  name: string;
  email: string;
  userType: string;
  employDate: string;
  status: string;
  phone_number: string;
  ic_number: string;
  role: string;
  dusp?: string;
  tp?: string;
}

interface OrganizationInfo {
  organization_id: string | null;
  organization_name: string | null;
}

export const useStaffData = (user: any, organizationInfo: OrganizationInfo) => {
  const { toast } = useToast();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusOptions, setStatusOptions] = useState<string[]>([
    "Active",
    "On Leave",
    "Inactive",
  ]);

  useEffect(() => {
    const fetchStaffData = async () => {
      if (!user || !organizationInfo.organization_id) {
        setIsLoading(false);
        return;
      }

      try {
        if (!organizationInfo.organization_id) return;

        setIsLoading(true);

        // Fetch users with user_group=3 (TP users) under the same organization_id
        const { data: staffProfiles, error: staffProfilesError } =
          await supabase
            .from("profiles")
            .select(
              "id, full_name, email, phone_number, ic_number, user_type, created_at, user_group"
            )
            .eq("user_group", 3)
            .neq("id", user?.id); // Exclude current user

        if (staffProfilesError) throw staffProfilesError;

        // Get the user IDs from all staff profiles
        const userIds = staffProfiles?.map((profile) => profile.id) || [];

        if (userIds.length === 0) {
          setStaffList([]);
          setIsLoading(false);
          return;
        }

        // For TP staff (user_group=3), check organization_users table
        const { data: orgUsers, error: orgUsersError } = await supabase
          .from("organization_users")
          .select("user_id, role, organization_id")
          .eq("organization_id", organizationInfo.organization_id)
          .in("user_id", userIds);

        if (orgUsersError) throw orgUsersError;

        // Get organization details for DUSP and TP info
        const { data: organizations, error: orgsError } = await supabase
          .from("organizations")
          .select("id, name, type, parent_id");

        if (orgsError) throw orgsError;

        // Get all tech partner profiles for additional data
        const { data: techPartnerProfiles, error: tpProfilesError } =
          await supabase
            .from("nd_tech_partner_profile")
            .select("user_id, tech_partner_id")
            .in("user_id", userIds);

        if (tpProfilesError) throw tpProfilesError;

        // Get tech partner names
        const { data: techPartners, error: tpError } = await supabase
          .from("nd_tech_partner")
          .select("id, name");

        if (tpError) throw tpError;

        // For TP staff, get the ones directly associated with the organization
        const orgUserIds = orgUsers?.map((ou) => ou.user_id) || [];
        const filteredTPStaff =
          staffProfiles?.filter((profile) => orgUserIds.includes(profile.id)) ||
          [];

        // Map the data to our staffList format
        const formattedStaff = filteredTPStaff.map((profile) => {
          const orgUser = orgUsers?.find((ou) => ou.user_id === profile.id);
          const techPartnerProfile = techPartnerProfiles?.find(
            (tp) => tp.user_id === profile.id
          );

          // Find the organization
          const organization = organizations?.find(
            (org) => org.id === organizationInfo.organization_id
          );

          // Find tech partner details
          const techPartner = techPartnerProfile
            ? techPartners?.find(
                (tp) => tp.id === techPartnerProfile.tech_partner_id
              )
            : null;

          // Find DUSP (parent organization)
          const dusp =
            organization?.type === "tp" && organization.parent_id
              ? organizations?.find((org) => org.id === organization.parent_id)
                  ?.name
              : null;

          return {
            id: profile.id,
            name: profile.full_name || "Unknown",
            email: profile.email || "",
            userType: profile.user_type || "Unknown",
            employDate: profile.created_at,
            status: "Active", // Default status
            phone_number: profile.phone_number || "",
            ic_number: profile.ic_number || "",
            role: orgUser?.role || "Member",
            dusp: dusp || organizationInfo.organization_name || "",
            tp: techPartner?.name || organization?.name || "",
          };
        });

        setStaffList(formattedStaff);

        // Extract status options
        const statuses = [
          ...new Set(formattedStaff.map((staff) => staff.status)),
        ];
        setStatusOptions(statuses);
      } catch (error) {
        console.error("Error fetching staff data:", error);
        toast({
          title: "Error",
          description: "Failed to load staff data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaffData();
  }, [organizationInfo.organization_id, toast, user?.id]);

  // Add method to update staff list
  const addStaffMember = (newStaff: any) => {
    // Create a staff member object in the expected format
    const staffMember: StaffMember = {
      id: newStaff.id,
      name: newStaff.name || newStaff.fullname,
      email: newStaff.work_email || newStaff.email,
      userType: newStaff.userType,
      employDate: newStaff.join_date || new Date().toISOString().split("T")[0],
      status: newStaff.is_active ? "Active" : "Inactive",
      phone_number: newStaff.mobile_no || newStaff.phone_number,
      ic_number: newStaff.ic_no || newStaff.ic_number,
      role: newStaff.role || "Member",
      dusp: newStaff.dusp || organizationInfo.organization_name || "",
      tp: newStaff.tp || "",
    };

    setStaffList((prevStaff) => [staffMember, ...prevStaff]);
  };

  const updateStaffMember = (updatedStaff: StaffMember) => {
    setStaffList((prevList) =>
      prevList.map((staff) =>
        staff.id === updatedStaff.id ? updatedStaff : staff
      )
    );
  };

  const removeStaffMember = (staffId: string) => {
    setStaffList((prevList) =>
      prevList.filter((staff) => staff.id !== staffId)
    );
  };

  return {
    staffList,
    isLoading,
    statusOptions,
    addStaffMember,
    updateStaffMember,
    removeStaffMember,
  };
};
