import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ClosureAffectArea,
  ClosureCategory,
  ClosureSession,
  ClosureSubCategory,
  SiteListClosureRequest,
} from "../types/site-closure";

export const fetchlListClosureData = async (
  organizationId: string | null = null,
  isDUSPUser: boolean = false,
  siteId: string | null = null,
  isMCMCUser: boolean = false // Add parameter for MCMC users
): Promise<SiteListClosureRequest[]> => {
  // First, we need to handle site profiles filtering based on organization
  let siteProfileIds: string[] = [];

  // If we have an organization filter and it's not an MCMC user, we need to fetch the relevant site profiles
  // MCMC users don't need organization filtering - they can see all sites
  if (organizationId && !isMCMCUser) {
    let siteProfileQuery = supabase.from("nd_site_profile").select("id");

    if (isDUSPUser) {
      // For DUSP users, fetch all TP organizations under the DUSP
      const { data: childOrganizations, error: childError } = await supabase
        .from("organizations")
        .select("id")
        .eq("parent_id", organizationId);

      if (childError) throw childError;

      // Get all child organization IDs
      const childOrganizationIds = childOrganizations.map((org) => org.id);

      if (childOrganizationIds.length > 0) {
        // Filter site profiles where organization ID is in the child organizations
        siteProfileQuery = siteProfileQuery.in(
          "dusp_tp_id",
          childOrganizationIds
        );
      }
    } else {
      // For TP users, filter site profiles directly by their organization ID
      siteProfileQuery = siteProfileQuery.eq("dusp_tp_id", organizationId);
    }

    // Execute the site profile query
    const { data: siteProfiles, error: siteProfilesError } =
      await siteProfileQuery;

    if (siteProfilesError) throw siteProfilesError;

    // Extract the site profile IDs
    siteProfileIds = siteProfiles.map((profile) => profile.id);
  }

  // Now build the main query for closures
  let query = supabase
    .from("nd_site_closure")
    .select(
      `
      id,
      site_id,
      nd_closure_categories:nd_closure_categories(
          id,
          bm,
          eng
      ),
      nd_closure_subcategories:nd_closure_subcategories(
          bm,
          eng
      ),
      close_start,
      close_end,
      duration,
      nd_closure_status:nd_closure_status(
          id,
          name
      ),
      nd_site_profile:nd_site_profile(
          id,
          sitename,
          nd_site:nd_site(standard_code),
          region_id:nd_region(id, eng),
          state_id:nd_state(id, name),
          organizations:organizations(
              id,
              name,
              type,
              parent_id(id, name)
          )
      ),
      requester_id,
      request_datetime,
      created_by
    `
    )
    .order("created_at", { ascending: false });

  // Filter by site ID if provided (highest priority)
  if (siteId) {
    query = query.eq("site_id", siteId);
  }
  // Apply the site profile filter if we have organization filtering and it's not an MCMC user
  else if (organizationId && siteProfileIds.length > 0 && !isMCMCUser) {
    query = query.in("site_id", siteProfileIds);
  }

  const { data: closureData, error } = await query;

  if (error) throw error;

  // Get all unique creator IDs to fetch their profile information
  const creatorIds = Array.from(
    new Set(
      closureData
        .filter((item) => item.created_by)
        .map((item) => item.created_by)
    )
  );

  // Fetch profile information for creators if there are any creator IDs
  let creatorProfiles: Record<string, any> = {};
  if (creatorIds.length > 0) {
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, user_type")
      .in("id", creatorIds);

    if (profilesError) {
      console.error("Error fetching creator profiles:", profilesError);
    } else if (profilesData) {
      // Create a mapping from creator ID to profile data
      creatorProfiles = profilesData.reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, any>);
    }
  }

  // Combine closure data with creator profile information
  const enhancedData = closureData.map((item) => ({
    ...item,
    profiles: item.created_by ? creatorProfiles[item.created_by] || null : null,
  }));

  return enhancedData as unknown as SiteListClosureRequest[];
};

export const fetchClosureCategories = async (): Promise<ClosureCategory[]> => {
  const { data, error } = await supabase
    .from("nd_closure_categories")
    .select("id,bm,eng");
  if (error) throw error;
  return data || [];
};

export const fetchClosureSubCategories = async (): Promise<
  ClosureSubCategory[]
> => {
  const { data, error } = await supabase
    .from("nd_closure_subcategories")
    .select(`id, bm, eng, nd_closure_categories(id)`);
  if (error) throw error;
  return data || [];
};

export const fetchClosureAffectAreas = async (): Promise<
  ClosureAffectArea[]
> => {
  const { data, error } = await supabase
    .from("nd_closure_affect_areas")
    .select("id, bm, eng");
  if (error) throw error;
  return data || [];
};

export const fetchClosureSession = async (): Promise<ClosureSession[]> => {
  const { data, error } = await supabase
    .from("nd_closure_session")
    .select("id, bm, eng");
  if (error) throw error;
  return data || [];
};

export const fetchClosureDetail = async (
  closureId: number | string
): Promise<any> => {
  // First, fetch the closure data
  const { data: closureData, error } = await supabase
    .from("nd_site_closure")
    .select(
      `
      id,
      remark,
      nd_closure_categories:nd_closure_categories(
          id,
          bm,
          eng
      ),
      nd_closure_subcategories:nd_closure_subcategories(
          id,
          bm,
          eng
      ),
      close_start,
      close_end,
      start_time,
      end_time,
      session,
      nd_closure_session:nd_closure_session(
          id,
          bm,
          eng
      ),
      duration,
      nd_closure_status:nd_closure_status(
          id,
          name
      ),
      nd_site_profile:nd_site_profile(
          id,
          sitename,
          nd_site:nd_site(standard_code),
          organizations:organizations(
              id,
              name,
              type,
              parent_id(id, name)
          )
      ),
      requester_id,
      request_datetime,
      nd_site_closure_affect_area:nd_site_closure_affect_area(
          id,
          site_affect_area,
          nd_closure_affect_areas:nd_closure_affect_areas(
              id,
              bm,
              eng
          )
      ),
      nd_site_closure_attachment:nd_site_closure_attachment(
          id,
          file_path
      )
    `
    )
    .eq("id", closureId)
    .single();

  if (error) throw error;

  // If we have a requester_id, fetch the requestor profile information
  if (closureData && closureData.requester_id) {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, email, user_type")
      .eq("id", closureData.requester_id)
      .single();

    if (profileError) {
      console.error("Error fetching requestor profile:", profileError);
    } else {
      // Add the profile data to the closure data
      closureData.profiles = profileData;
    }
  }

  return closureData;
};
