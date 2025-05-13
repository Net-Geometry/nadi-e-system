import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useOrganizations } from "@/hooks/use-organizations";
import { UserType } from "@/types/auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Define an extended interface for the user profile that includes user_group_name
interface ExtendedUserProfile {
  id: string;
  full_name?: string;
  email?: string;
  user_type: string;
  user_group?: number;
  user_group_name?: string;
  organization_id?: string;
  organization_name?: string;
}

export const useOrganizationUserManagement = () => {
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("member");
  const [filterUserType, setFilterUserType] = useState<string>("all");
  const [userGroupIds, setUserGroupIds] = useState<number[]>([]);

  const {
    useOrganizationQuery,
    useOrganizationUsersQuery,
    useAddUserToOrganizationMutation,
    useRemoveUserFromOrganizationMutation,
  } = useOrganizations();

  // Fetch organization to determine eligible user types
  const { data: organization } = useOrganizationQuery(id!);

  // Get eligible user types based on organization type
  const eligibleUserTypes: UserType[] =
    organization?.type === "dusp"
      ? ["dusp_admin", "dusp_management", "dusp_operation"]
      : [
          "tp_admin",
          "tp_management",
          "tp_pic",
          "tp_hr",
          "tp_finance",
          "tp_operation",
          "tp_site",
        ];

  // Get user groups based on organization type
  const { data: userGroups = [], isLoading: loadingUserGroups } = useQuery({
    queryKey: ["user-groups", organization?.type],
    queryFn: async () => {
      if (!organization?.type) return [];

      console.log(
        "Fetching user groups for organization type:",
        organization.type
      );

      // Get appropriate user group for the organization type - using ILIKE for case-insensitive matching
      const { data, error } = await supabase
        .from("nd_user_group")
        .select("id, group_name, user_types")
        .ilike("group_name", organization?.type === "dusp" ? "%DUSP%" : "%TP%");

      if (error) {
        console.error("Error fetching user groups:", error);
        throw error;
      }

      console.log("Found user groups:", data);

      // Extract the ids of relevant user groups
      const groupIds = data.map((group) => group.id);
      setUserGroupIds(groupIds);
      return data;
    },
    enabled: !!organization?.type,
  });

  // Fetch users already in the organization
  const {
    data: orgUsers = [],
    isLoading: loadingOrgUsers,
    error: orgUsersError,
  } = useOrganizationUsersQuery(id!);

  // Fetch users filtered by the appropriate user groups and user types
  const { data: eligibleUsers = [], isLoading: loadingEligibleUsers } =
    useQuery({
      queryKey: [
        "eligible-users-by-group-type",
        userGroupIds,
        eligibleUserTypes,
      ],
      queryFn: async () => {
        if (!userGroupIds.length) return [];

        console.log(
          "Fetching eligible users with user_group and user_type details"
        );

        // Get users from profiles table filtered by user_group and user_type
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, email, user_type, user_group")
          .in("user_group", userGroupIds)
          .in("user_type", eligibleUserTypes);

        if (error) {
          console.error("Error fetching eligible users:", error);
          throw error;
        }

        console.log("Found eligible users:", data.length);

        // Fetch user group details for each user and cast to ExtendedUserProfile
        const extendedUsers: ExtendedUserProfile[] = [...data];

        for (const user of extendedUsers) {
          // Fetch user group name
          if (user.user_group) {
            const { data: groupData, error: groupError } = await supabase
              .from("nd_user_group")
              .select("group_name")
              .eq("id", user.user_group)
              .single();

            if (!groupError && groupData) {
              user.user_group_name = groupData.group_name;
            }
          }

          // Fetch organization name if the user has an organization_id
          if (user.organization_id) {
            const { data: orgData, error: orgError } = await supabase
              .from("organizations")
              .select("name")
              .eq("id", user.organization_id)
              .maybeSingle();

            if (!orgError && orgData) {
              user.organization_name = orgData.name;
            }
          }
        }

        return extendedUsers;
      },
      enabled: userGroupIds.length > 0 && eligibleUserTypes.length > 0,
    });

  // Filter users not already in the organization
  const availableUsers = eligibleUsers.filter(
    (user) => !orgUsers.some((orgUser) => orgUser.user_id === user.id)
  );

  // Filter available users by search term and selected user type
  const filteredAvailableUsers = availableUsers.filter((user) => {
    const matchesSearch =
      (user.full_name?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) || (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchesType =
      filterUserType === "all" || user.user_type === filterUserType;

    return matchesSearch && matchesType;
  });

  // Mutations
  const addUserMutation = useAddUserToOrganizationMutation();
  const removeUserMutation = useRemoveUserFromOrganizationMutation();

  // Add user to organization
  const handleAddUser = (userId: string) => {
    if (!id) return;

    console.log(
      "Adding user:",
      userId,
      "to org:",
      id,
      "with role:",
      selectedRole
    );

    addUserMutation.mutate({
      organization_id: id,
      user_id: userId,
      role: selectedRole,
    });
  };

  // Remove user from organization
  const handleRemoveUser = (userId: string) => {
    if (!id) return;

    console.log("Removing user:", userId, "from org:", id);

    removeUserMutation.mutate({
      organizationId: id,
      userId,
    });
  };

  return {
    id,
    searchTerm,
    setSearchTerm,
    selectedRole,
    setSelectedRole,
    filterUserType,
    setFilterUserType,
    eligibleUserTypes,
    orgUsers,
    loadingOrgUsers,
    orgUsersError,
    filteredAvailableUsers,
    loadingEligibleUsers: loadingEligibleUsers || loadingUserGroups,
    handleAddUser,
    handleRemoveUser,
    organizationType: organization?.type,
    userGroups,
  };
};
