import { supabase } from "@/integrations/supabase/client";
import {
  OrganizationUser,
  OrganizationUserFormData,
} from "@/types/organization";
import { UserType } from "@/types/auth";

/**
 * Organization users-related Supabase client functions
 */
export const organizationUsersClient = {
  /**
   * Fetch users for a specific organization
   */
  fetchOrganizationUsers: async (
    organizationId: string
  ): Promise<OrganizationUser[]> => {
    const { data, error } = await supabase
      .from("organization_users")
      .select(
        `
        *,
        profiles:user_id (
          id, 
          full_name, 
          email, 
          user_type
        )
      `
      )
      .eq("organization_id", organizationId);

    if (error) throw error;
    return data as unknown as OrganizationUser[];
  },

  /**
   * Add a user to an organization
   */
  addUserToOrganization: async (
    formData: OrganizationUserFormData
  ): Promise<OrganizationUser> => {
    console.log("Adding user to organization:", formData);

    // First, check if the relationship already exists
    const { data: existingData } = await supabase
      .from("organization_users")
      .select("id")
      .eq("organization_id", formData.organization_id)
      .eq("user_id", formData.user_id)
      .single();

    if (existingData) {
      console.log("User already exists in organization, updating role instead");
      // If exists, update the role
      const { data, error } = await supabase
        .from("organization_users")
        .update({ role: formData.role })
        .eq("id", existingData.id)
        .select()
        .single();

      if (error) throw error;
      return data as OrganizationUser;
    }

    // Otherwise, create a new relationship
    const { data, error } = await supabase
      .from("organization_users")
      .insert([formData])
      .select()
      .single();

    if (error) {
      console.error("Error adding user to organization:", error);
      throw error;
    }

    return data as OrganizationUser;
  },

  /**
   * Remove a user from an organization
   */
  removeUserFromOrganization: async (
    organizationId: string,
    userId: string
  ): Promise<void> => {
    console.log("Removing user from organization:", { organizationId, userId });

    const { error } = await supabase
      .from("organization_users")
      .delete()
      .eq("organization_id", organizationId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error removing user:", error);
      throw error;
    }
  },

  /**
   * Check if user has specific role in organization
   */
  checkUserHasRoleInOrganization: async (
    userId: string,
    organizationId: string,
    roles: string[]
  ): Promise<boolean> => {
    const { data, error } = await supabase
      .from("organization_users")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", userId);

    if (error) throw error;

    if (!data || data.length === 0) return false;
    return roles.includes(data[0].role);
  },

  /**
   * Get eligible users by user type for adding to organization
   */
  fetchEligibleUsersByType: async (userTypes: UserType[]): Promise<any[]> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .in("user_type", userTypes);

    if (error) throw error;
    return data;
  },
};
