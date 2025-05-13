import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useUserMetadata } from "@/hooks/use-user-metadata";
import { StaffFormDialog } from "@/components/hr/StaffFormDialog";
import { useAuth } from "@/hooks/useAuth";
import { useUserAccess } from "@/hooks/use-user-access";
import { createStaffMember, deleteStaffMember } from "@/lib/staff";
import { useSiteStaffData } from "@/hooks/hr/use-site-staff-data";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { SiteStaffTable } from "@/components/hr/SiteStaffTable";
import { StaffToolbar } from "@/components/hr/StaffToolbar";
import { SiteStaffFilters } from "@/components/hr/SiteStaffFilters";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

const statusColors = {
  Active: "bg-green-100 text-green-800",
  "On Leave": "bg-yellow-100 text-yellow-800",
  Inactive: "bg-red-100 text-red-800",
};

const SiteStaff = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isEditStaffOpen, setIsEditStaffOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const userMetadataString = useUserMetadata();
  const { user } = useAuth();
  const { userType } = useUserAccess();

  const [organizationInfo, setOrganizationInfo] = useState<{
    organization_id: string | null;
    organization_name: string | null;
  }>({
    organization_id: null,
    organization_name: null,
  });

  useEffect(() => {
    if (userMetadataString) {
      try {
        const metadata = JSON.parse(userMetadataString);
        setOrganizationInfo({
          organization_id: metadata.organization_id || null,
          organization_name: metadata.organization_name || null,
        });
      } catch (error) {
        console.error("Error parsing user metadata:", error);
      }
    }
  }, [userMetadataString]);

  const {
    staffList,
    isLoading,
    locationOptions,
    statusOptions,
    addStaffMember,
    updateStaffMember,
    removeStaffMember,
  } = useSiteStaffData(user, organizationInfo);

  // Extract unique user types from staff list
  const userTypeOptions = useMemo(() => {
    if (!staffList?.length) return [];
    const uniqueTypes = [
      ...new Set(staffList.map((staff) => staff.userType).filter(Boolean)),
    ];
    return uniqueTypes.sort();
  }, [staffList]);

  const filteredStaff = useMemo(() => {
    return staffList.filter((staff) => {
      const matchesSearch =
        staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (staff.userType &&
          staff.userType.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (staff.siteLocation &&
          staff.siteLocation
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (staff.email &&
          staff.email.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesLocation =
        locationFilter === "all" || staff.siteLocation === locationFilter;

      const matchesStatus =
        statusFilter === "all" || staff.status === statusFilter;

      const matchesUserType =
        userTypeFilter === "all" || staff.userType === userTypeFilter;

      return (
        matchesSearch && matchesLocation && matchesStatus && matchesUserType
      );
    });
  }, [staffList, searchQuery, locationFilter, statusFilter, userTypeFilter]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setLocationFilter("all");
    setStatusFilter("all");
    setUserTypeFilter("all");
  };

  const handleEditStaff = (staffId) => {
    const staff = staffList.find((s) => s.id === staffId);
    if (staff) {
      setSelectedStaff(staff);
      navigate(`/dashboard/hr/staff/edit/${staffId}`);
    }
  };

  const handleViewStaff = async (staffId) => {
    try {
      // Convert staffId to string if it's not already, to avoid type mismatches
      const idToUse = String(staffId);

      // Fetch complete staff profile data from nd_staff_profile
      const { data, error } = await supabase
        .from("nd_staff_profile")
        .select(
          `
          *,
          nd_staff_job:job_id(site_id, position_id, join_date),
          nd_staff_address:id(address1, address2, postcode, city, state_id)
        `
        )
        .eq("id", idToUse)
        .maybeSingle();

      if (error) {
        console.error("Error fetching staff details:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load staff details.",
        });
        return;
      }

      if (data) {
        // Navigate to staff details page with data
        navigate(`/dashboard/hr/staff/${staffId}`, {
          state: { staffData: data },
        });
      } else {
        toast({
          title: "Staff Not Found",
          description: "Unable to find staff details.",
        });
      }
    } catch (error) {
      console.error("Error fetching staff details:", error);
      toast({
        title: "Error",
        description: "Failed to load staff details. Please try again.",
      });
    }
  };

  const handleDeleteStaff = (staffId) => {
    const staff = staffList.find((s) => s.id === staffId);
    if (staff) {
      setStaffToDelete(staff);
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDeleteStaff = async () => {
    if (!staffToDelete) return;

    try {
      // Convert staffId to string if it's not already
      const idToUse = String(staffToDelete.id);
      // Delete staff profile from nd_staff_profile
      const { error } = await supabase
        .from("nd_staff_profile")
        .delete()
        .eq("id", idToUse);

      if (error) throw error;

      // Update UI after successful deletion
      removeStaffMember(staffToDelete.id);

      toast({
        title: "Staff Deleted",
        description: `${staffToDelete.name} has been removed successfully.`,
      });
    } catch (error) {
      console.error("Error deleting staff:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to delete staff member. Please try again.",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setStaffToDelete(null);
    }
  };

  const handleToggleStatus = async (staffId, currentStatus) => {
    const staff = staffList.find((s) => s.id === staffId);
    if (!staff) return;

    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";

    try {
      // Convert staffId to string if it's not already
      const idToUse = String(staffId);
      // Update staff status in the database
      const { error } = await supabase
        .from("nd_staff_profile")
        .update({ is_active: newStatus === "Active" })
        .eq("id", idToUse);

      if (error) throw error;

      // Update UI
      updateStaffMember({
        ...staff,
        status: newStatus,
      });

      toast({
        title: "Status Updated",
        description: `${staff.name}'s status has been changed to ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error updating staff status:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to update staff status. Please try again.",
      });
    }
  };

  const handleAddStaff = () => {
    if (!organizationInfo.organization_id) {
      toast({
        title: "Organization Not Found",
        description:
          "You need to be associated with an organization to add staff.",
        variant: "destructive",
      });
      return;
    }

    const allowedUserTypes = ["tp_admin", "tp_hr", "super_admin"];
    if (!userType || !allowedUserTypes.includes(userType)) {
      toast({
        title: "Permission Denied",
        description:
          "Only TP Admin, HR, and Super Admin users can add staff members.",
        variant: "destructive",
      });
      return;
    }

    setIsAddStaffOpen(true);
  };

  const handleStaffAdded = async (newStaff) => {
    try {
      console.log("Adding new site staff member with data:", newStaff);

      if (newStaff.id) {
        // If the staff already has an ID, it was created on the server
        addStaffMember(newStaff);

        toast({
          title: "Staff Added",
          description: `${
            newStaff.name || newStaff.fullname
          } has been added successfully as ${(newStaff.userType || "").replace(
            /_/g,
            " "
          )} at ${newStaff.siteLocationName || "Unknown site"}.`,
        });
      } else {
        // Create staff member on the server
        const result = await createStaffMember(newStaff);

        addStaffMember({
          ...newStaff,
          id: result.data.id,
        });

        toast({
          title: "Staff Added",
          description: `${
            newStaff.name
          } has been added successfully as ${newStaff.userType.replace(
            /_/g,
            " "
          )} at ${newStaff.siteLocationName || "Unknown site"}.`,
        });
      }
    } catch (error: any) {
      console.error("Error adding staff:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to add staff member. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStaffEdited = async (updatedStaff) => {
    try {
      // Update staff on the server would go here
      updateStaffMember(updatedStaff);
      toast({
        title: "Staff Updated",
        description: `${updatedStaff.name}'s information has been updated successfully.`,
      });
    } catch (error) {
      console.error("Error updating staff:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to update staff member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEditStaffOpen(false);
      setSelectedStaff(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-MY", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle select all staff
  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      const allIds = filteredStaff.map((staff) => staff.id);
      setSelectedStaffIds(allIds);
    } else {
      setSelectedStaffIds([]);
    }
  };

  // Handle select individual staff
  const handleSelectStaff = (staffId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedStaffIds((prev) => [...prev, staffId]);
    } else {
      setSelectedStaffIds((prev) => prev.filter((id) => id !== staffId));
    }
  };

  // Get the selected staff objects for export
  const getSelectedStaffObjects = () => {
    return staffList.filter((staff) => selectedStaffIds.includes(staff.id));
  };

  return (
    <DashboardLayout>
      <div>
        <StaffToolbar
          selectedStaff={getSelectedStaffObjects()}
          allStaff={staffList}
          onAddStaff={handleAddStaff}
          organizationName={organizationInfo.organization_name}
          staffType="site"
        />

        <SiteStaffFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          statusOptions={statusOptions}
          userTypeFilter={userTypeFilter}
          setUserTypeFilter={setUserTypeFilter}
          userTypeOptions={userTypeOptions}
          locationFilter={locationFilter}
          setLocationFilter={setLocationFilter}
          locationOptions={locationOptions}
          onResetFilters={handleResetFilters}
        />

        <SiteStaffTable
          isLoading={isLoading}
          filteredStaff={filteredStaff}
          formatDate={formatDate}
          statusColors={statusColors}
          onEdit={handleEditStaff}
          onDelete={handleDeleteStaff}
          onView={handleViewStaff}
          onToggleStatus={handleToggleStatus}
          selectedStaff={selectedStaffIds}
          onSelectStaff={handleSelectStaff}
          onSelectAll={handleSelectAll}
        />
      </div>

      {organizationInfo.organization_id && (
        <StaffFormDialog
          open={isAddStaffOpen}
          onOpenChange={setIsAddStaffOpen}
          organizationId={organizationInfo.organization_id}
          organizationName={
            organizationInfo.organization_name || "Your Organization"
          }
          onStaffAdded={handleStaffAdded}
          siteLocations={locationOptions}
        />
      )}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {staffToDelete?.name}'s record from
              the system. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteStaff}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default SiteStaff;
