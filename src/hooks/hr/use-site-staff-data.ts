import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

// Interface for staff members data
interface SiteStaffMember {
  id: string;
  name: string;
  email: string;
  userType: string;
  employDate: string;
  status: string;
  phone_number: string;
  ic_number: string;
  siteLocation: string;
}

// Hook to fetch and manage site staff data
export const useSiteStaffData = (user: any, organizationInfo: any) => {
  const [staffList, setStaffList] = useState<SiteStaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const [statusOptions, setStatusOptions] = useState<string[]>([
    "Active",
    "On Leave",
    "Inactive",
  ]);

  useEffect(() => {
    const fetchSiteStaffData = async () => {
      if (!user || !organizationInfo.organization_id) {
        setIsLoading(false);
        return;
      }

      try {
        if (!organizationInfo.organization_id) return;

        setIsLoading(true);

        // Fetch profiles with user_group = 6 (center staff)
        const { data: centerStaffProfiles, error: centerStaffError } =
          await supabase
            .from("profiles")
            .select(
              "id, full_name, email, phone_number, ic_number, user_type, created_at, user_group"
            )
            .eq("user_group", 6)
            .neq("id", user?.id); // Exclude current user

        if (centerStaffError) throw centerStaffError;

        if (!centerStaffProfiles || centerStaffProfiles.length === 0) {
          setStaffList([]);
          setIsLoading(false);
          return;
        }

        console.log("Found center staff profiles:", centerStaffProfiles.length);

        // Get the user IDs from staff profiles
        const userIds = centerStaffProfiles.map((profile) => profile.id);

        // Get sites associated with organization
        const { data: sites, error: sitesError } = await supabase
          .from("nd_site_profile")
          .select("id, sitename")
          .eq("dusp_tp_id", organizationInfo.organization_id);

        if (sitesError) throw sitesError;

        if (!sites || sites.length === 0) {
          console.log("No sites found for organization");
          setStaffList([]);
          setIsLoading(false);
          return;
        }

        const siteIds = sites.map((site) => site.id);

        // Get staff contracts to link staff to sites
        const { data: staffContracts, error: contractsError } = await supabase
          .from("nd_staff_contract")
          .select("user_id, site_id, contract_start, is_active")
          .in("user_id", userIds)
          .in("site_id", siteIds);

        if (contractsError) throw contractsError;

        // Map the data to our staffList format
        const formattedStaff = centerStaffProfiles
          .filter((profile) => {
            // Only include profiles that have contracts with sites in this organization
            const hasContract = staffContracts?.some(
              (contract) =>
                contract.user_id === profile.id &&
                siteIds.includes(contract.site_id)
            );
            return hasContract;
          })
          .map((profile) => {
            const contract = staffContracts?.find(
              (c) => c.user_id === profile.id
            );
            const site = sites?.find((s) => s.id === contract?.site_id);

            return {
              id: profile.id,
              name: profile.full_name || "Unknown",
              email: profile.email || "",
              userType: profile.user_type || "Unknown",
              employDate: contract?.contract_start || null,
              status: contract?.is_active ? "Active" : "Inactive",
              siteLocation: site?.sitename || "Unassigned",
              phone_number: profile.phone_number || "",
              ic_number: profile.ic_number || "",
            };
          });

        setStaffList(formattedStaff);

        // Extract location and status options
        const locations = [
          ...new Set(
            formattedStaff.map((staff) => staff.siteLocation).filter(Boolean)
          ),
        ];
        const statuses = [
          ...new Set(
            formattedStaff.map((staff) => staff.status).filter(Boolean)
          ),
        ];

        setLocationOptions(locations);
        setStatusOptions(statuses);
      } catch (error: any) {
        console.error("Error fetching site staff data:", error);
        toast({
          title: "Error",
          description: "Failed to load site staff data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSiteStaffData();
  }, [organizationInfo.organization_id, user?.id]);

  // Add method to update staff list
  const addStaffMember = (newStaff: any) => {
    // Create a staff member object in the expected format
    const staffMember: SiteStaffMember = {
      id: newStaff.id,
      name: newStaff.name || newStaff.fullname,
      email: newStaff.work_email || newStaff.email,
      userType: newStaff.userType,
      employDate:
        newStaff.join_date ||
        newStaff.contract_start ||
        new Date().toISOString().split("T")[0],
      status: newStaff.is_active ? "Active" : "Inactive",
      phone_number: newStaff.mobile_no || newStaff.phone_number,
      ic_number: newStaff.ic_no || newStaff.ic_number,
      siteLocation: newStaff.siteLocationName || "Unknown site",
    };

    setStaffList((prevStaff) => [staffMember, ...prevStaff]);
  };

  const updateStaffMember = (updatedStaff: SiteStaffMember) => {
    setStaffList((prevList) =>
      prevList.map((staff) =>
        staff.id === updatedStaff.id ? updatedStaff : staff
      )
    );

    // If this staff has a new location, add it to the options
    if (
      updatedStaff.siteLocation &&
      !locationOptions.includes(updatedStaff.siteLocation)
    ) {
      setLocationOptions((prev) => [...prev, updatedStaff.siteLocation]);
    }
  };

  const removeStaffMember = (staffId: string) => {
    setStaffList((prevList) =>
      prevList.filter((staff) => staff.id !== staffId)
    );
  };

  return {
    staffList,
    isLoading,
    locationOptions,
    statusOptions,
    addStaffMember,
    updateStaffMember,
    removeStaffMember,
  };
};
