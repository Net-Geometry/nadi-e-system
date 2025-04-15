
import { supabase } from "@/lib/supabase";
import { Organization, OrganizationFormData, OrganizationUser, OrganizationUserFormData } from "@/types/organization";

/**
 * Organization-related Supabase client functions
 */
export const organizationClient = {
  /**
   * Fetch all organizations
   */
  fetchOrganizations: async (): Promise<Organization[]> => {
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .order("name");

    if (error) throw error;
    return data as Organization[];
  },

  /**
   * Fetch a single organization by ID
   */
  fetchOrganizationById: async (id: string): Promise<Organization> => {
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data as Organization;
  },

  /**
   * Fetch child organizations by parent ID
   */
  fetchChildOrganizations: async (parentId: string): Promise<Organization[]> => {
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("parent_id", parentId)
      .order("name");

    if (error) throw error;
    return data as Organization[];
  },
  
  /**
   * Create a new organization
   */
  createOrganization: async (formData: OrganizationFormData): Promise<Organization> => {
    // Clean up the data to ensure parent_id is properly handled
    const cleanData = { ...formData };
    
    // Ensure parent_id is either a valid UUID or null, not an empty string
    if (cleanData.parent_id === "") {
      cleanData.parent_id = null;
    }

    const { data, error } = await supabase
      .from("organizations")
      .insert([cleanData])
      .select()
      .single();

    if (error) throw error;
    return data as Organization;
  },

  /**
   * Update an existing organization
   */
  updateOrganization: async ({ id, ...formData }: Organization): Promise<Organization> => {
    // Clean up the data to ensure parent_id is properly handled
    const cleanData = { ...formData };
    
    // Ensure parent_id is either a valid UUID or null, not an empty string
    if (cleanData.parent_id === "") {
      cleanData.parent_id = null;
    }

    const { data, error } = await supabase
      .from("organizations")
      .update(cleanData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Organization;
  },

  /**
   * Delete an organization
   */
  deleteOrganization: async (id: string): Promise<void> => {
    // First check if organization has children
    const { data: children } = await supabase
      .from("organizations")
      .select("id")
      .eq("parent_id", id);
    
    if (children && children.length > 0) {
      throw new Error("Cannot delete organization with sub-organizations. Please delete or reassign sub-organizations first.");
    }

    const { error } = await supabase
      .from("organizations")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
};
