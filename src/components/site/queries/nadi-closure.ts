import { supabase } from "@/integrations/supabase/client";
import {
  NADIClosure,
  NADIClosureFormData,
  NADIClosureStatus,
} from "../types/nadi-closure";

// Fetch all NADI closures with optional filtering
export const fetchNADIClosures = async (
  organizationId?: string | null,
  isTPUser: boolean = false,
  isDUSPUser: boolean = false,
  statusFilter?: number[]
): Promise<NADIClosure[]> => {
  try {
    let query = supabase
      .from("nd_nadi_closure")
      .select(
        `
        *,
        nd_site_profile!inner(
          id,
          sitename,
          organizations(id, name),
          nd_site(standard_code)
        ),
        nd_nadi_closure_status(id, name, description, color)
      `
      )
      .order("created_at", { ascending: false });

    // Apply organization filter based on user role
    if (organizationId) {
      if (isDUSPUser) {
        // For DUSP users - fetch all TP organizations under this DUSP
        const { data: childOrganizations, error: childError } = await supabase
          .from("organizations")
          .select("id")
          .eq("parent_id", organizationId);

        if (childError) {
          console.error("Error fetching child organizations:", childError);
          throw childError;
        }

        // Get all child organization IDs
        const childOrganizationIds = childOrganizations.map((org) => org.id);

        // Filter sites where organization ID is in the list of child TPs
        query = query.in(
          "nd_site_profile.organizations.id",
          childOrganizationIds
        );
      } else {
        // For TP users - filter by their organization ID directly
        query = query.eq("nd_site_profile.organizations.id", organizationId);
      }
    }

    // Apply status filter if provided
    if (statusFilter && statusFilter.length > 0) {
      query = query.in("status_id", statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data.map((item) => ({
      id: item.id,
      site_id: item.site_id,
      site_name: item.nd_site_profile?.sitename,
      site_code: item.nd_site_profile?.nd_site?.[0]?.standard_code,
      reason: item.reason,
      closure_date: item.closure_date,
      expected_recovery_date: item.expected_recovery_date,
      affected_services: item.affected_services,
      comments: item.comments,
      status_id: item.status_id,
      status_description: item.nd_nadi_closure_status?.name,
      status_color: item.nd_nadi_closure_status?.color,
      created_by: item.created_by,
      created_at: item.created_at,
      updated_by: item.updated_by,
      updated_at: item.updated_at,
      organization_id: item.nd_site_profile?.organizations?.id,
      organization_name: item.nd_site_profile?.organizations?.name,
      notification_sent: item.notification_sent,
    }));
  } catch (error) {
    console.error("Error fetching NADI closures:", error);
    return [];
  }
};

// Fetch a single NADI closure by ID
export const fetchNADIClosureById = async (
  id: number
): Promise<NADIClosure | null> => {
  try {
    const { data, error } = await supabase
      .from("nd_nadi_closure")
      .select(
        `
        *,
        nd_site_profile!inner(
          id,
          sitename,
          organizations(id, name),
          nd_site(standard_code)
        ),
        nd_nadi_closure_status(id, name, description, color),
        nd_nadi_closure_attachments(*)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      site_id: data.site_id,
      site_name: data.nd_site_profile?.sitename,
      site_code: data.nd_site_profile?.nd_site?.[0]?.standard_code,
      reason: data.reason,
      closure_date: data.closure_date,
      expected_recovery_date: data.expected_recovery_date,
      affected_services: data.affected_services,
      comments: data.comments,
      status_id: data.status_id,
      status_description: data.nd_nadi_closure_status?.name,
      created_by: data.created_by,
      created_at: data.created_at,
      updated_by: data.updated_by,
      updated_at: data.updated_at,
      organization_id: data.nd_site_profile?.organizations?.id,
      organization_name: data.nd_site_profile?.organizations?.name,
      notification_sent: data.notification_sent,
      attachments: data.nd_nadi_closure_attachments,
    };
  } catch (error) {
    console.error("Error fetching NADI closure:", error);
    return null;
  }
};

// Create a new NADI closure request
export const createNADIClosure = async (
  closureData: NADIClosureFormData,
  files?: File[]
): Promise<{ success: boolean; error?: string; data?: any }> => {
  try {
    // Insert the NADI closure record
    const { data: closureRecord, error: closureError } = await supabase
      .from("nd_nadi_closure")
      .insert({
        site_id: closureData.site_id,
        reason: closureData.reason,
        closure_date: closureData.closure_date,
        expected_recovery_date: closureData.expected_recovery_date,
        affected_services: closureData.affected_services,
        comments: closureData.comments,
        status_id: NADIClosureStatus.PENDING, // Default to pending
        created_by: closureData.created_by,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (closureError) {
      throw closureError;
    }

    // Upload attachments if provided
    if (files && files.length > 0 && closureRecord) {
      for (const file of files) {
        const fileExt = file.name.split(".").pop();
        const filePath = `nadi_closures/${closureRecord.id}/${Date.now()}-${
          file.name
        }`;

        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from("site-documents")
          .upload(filePath, file);

        if (uploadError) {
          console.error("Error uploading attachment:", uploadError);
          continue;
        }

        // Store attachment reference in database
        const { error: attachmentError } = await supabase
          .from("nd_nadi_closure_attachments")
          .insert({
            closure_id: closureRecord.id,
            file_name: file.name,
            file_path: filePath,
            file_type: file.type,
            file_size: file.size,
            uploaded_at: new Date().toISOString(),
            uploaded_by: closureData.created_by,
          });

        if (attachmentError) {
          console.error("Error saving attachment reference:", attachmentError);
        }
      }
    }

    return { success: true, data: closureRecord };
  } catch (error: any) {
    console.error("Error creating NADI closure:", error);
    return { success: false, error: error.message };
  }
};

// Update NADI closure status
export const updateNADIClosureStatus = async (
  closureId: number,
  statusId: NADIClosureStatus,
  userId: string,
  comments?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("nd_nadi_closure")
      .update({
        status_id: statusId,
        comments: comments ? comments : undefined,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", closureId);

    if (error) {
      throw error;
    }

    // Add status history record
    await supabase.from("nd_nadi_closure_history").insert({
      closure_id: closureId,
      status_id: statusId,
      changed_by: userId,
      comments,
      changed_at: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error("Error updating NADI closure status:", error);
    return false;
  }
};

// Count NADI closure requests requiring action
export const fetchActionableRequestCount = async (
  organizationId?: string | null,
  userId?: string
): Promise<number> => {
  try {
    // For administrators or DUSP users, count pending closures
    let query = supabase
      .from("nd_nadi_closure")
      .select("id", { count: "exact" })
      .eq("status_id", NADIClosureStatus.PENDING);

    if (organizationId) {
      // Join to filter by organization if needed
      query = supabase
        .from("nd_nadi_closure")
        .select("id, nd_site_profile!inner(organizations(id))", {
          count: "exact",
        })
        .eq("status_id", NADIClosureStatus.PENDING)
        .eq("nd_site_profile.organizations.id", organizationId);
    }

    const { count, error } = await query;

    if (error) {
      throw error;
    }

    return count || 0;
  } catch (error) {
    console.error("Error fetching actionable request count:", error);
    return 0;
  }
};
