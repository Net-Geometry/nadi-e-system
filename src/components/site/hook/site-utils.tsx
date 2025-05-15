import { supabase } from "@/integrations/supabase/client";
import { Organization } from "@/types/organization";

import {
  Bandwidth,
  BuildingLevel,
  BuildingType,
  CategoryArea,
  District,
  Dun,
  Mukim,
  Parliament,
  Phase,
  Region,
  Site,
  SiteStatus,
  Socioeconomic,
  Space,
  State,
  Technology,
  Zone,
} from "@/types/site";

export const fetchSites = async (
  organizationId: string | null,
  isTPUser: boolean = false,
  isDUSPUser: boolean = false,
  isMCMCUser: boolean = false
): Promise<Site[]> => {
  try {
    let query = supabase
      .from("nd_site_profile")
      .select(
        `
        *,
        nd_site_status:nd_site_status(eng),
        nd_site:nd_site(id,standard_code,refid_tp,refid_mcmc),
        nd_site_socioeconomic:nd_site_socioeconomic(nd_socioeconomics:nd_socioeconomics(id,eng)),
        nd_site_space:nd_site_space(nd_space:nd_space(id,eng)),
        nd_phases:nd_phases(name),
        nd_region:nd_region(eng),
        nd_site_address:nd_site_address(address1, address2, postcode, city, district_id, state_id),
        nd_parliament:nd_parliaments(id),
        nd_dun:nd_duns(id),
        nd_mukim:nd_mukims(id),
        dusp_tp:organizations!dusp_tp_id(id, name, parent:parent_id(id,name))
      `
      )
      .order("created_at", { ascending: false });

    if (organizationId) {
      if (isTPUser) {
        // Directly filter by TP organization ID
        query = query.eq("dusp_tp_id", organizationId);
      } else if (isDUSPUser) {
        // Fetch all TP organizations under the given DUSP organization
        const { data: childOrganizations, error: childError } = await supabase
          .from("organizations")
          .select("id")
          .eq("parent_id", organizationId);

        if (childError) throw childError;

        const childOrganizationIds = childOrganizations.map((org) => org.id);

        query = query.in("dusp_tp_id", [
          organizationId,
          ...childOrganizationIds,
        ]);
      } else {
        query = query.eq("dusp_tp_id", organizationId);
      }
    }
    // MCMC users don't have an organization filter - they can see all sites

    const { data, error } = await query;
    if (error) throw error;

    return data.map((site) => ({
      ...site,
      operate_date: site.operate_date ? site.operate_date.split("T")[0] : null,
      dusp_tp_id_display: site.dusp_tp?.parent?.name
        ? `${site.dusp_tp.name} (${site.dusp_tp.parent.name})`
        : site.dusp_tp?.name || "N/A", // Ensure dusp_tp_id_display is always set
    })) as Site[];
  } catch (error) {
    console.error("Error fetching site profile:", error);
    throw error;
  }
};

export const fetchSiteBySiteId = async (
  siteId: string
): Promise<Site | null> => {
  if (!siteId || String(siteId).trim() === "" || siteId === "null") {
    return null;
  }
  try {
    const { data: site } = await supabase
      .from("nd_site")
      .select("site_profile_id")
      .eq("id", siteId)
      .single();

    if (!site) {
      return null;
    }
    const siteProfileId = site.site_profile_id;

    const { data, error } = await supabase
      .from("nd_site_profile")
      .select(
        `
        *,
        nd_site_status:nd_site_status(eng),
        nd_site:nd_site(id,standard_code,refid_tp,refid_mcmc),
        nd_site_socioeconomic:nd_site_socioeconomic(nd_socioeconomics:nd_socioeconomics(id,eng)),
        nd_site_space:nd_site_space(nd_space:nd_space(id,eng)),
        nd_phases:nd_phases(name),
        nd_region:nd_region(eng),
        nd_site_address:nd_site_address(address1, address2, postcode, city, district_id, state_id),
        nd_parliament:nd_parliaments(id),
        nd_dun:nd_duns(id),
        nd_mukim:nd_mukims(id),
        dusp_tp:organizations!dusp_tp_id(id, name, parent:parent_id(id,name))
      `
      )
      .eq("id", siteProfileId)
      .single();

    if (error) throw error;
    return data as Site | null;
  } catch (error) {
    console.error("Error fetching site profile by site ID:", error);
    throw error;
  }
};
export const fetchSiteBySiteProfileId = async (
  siteProfileId: string
): Promise<Site | null> => {
  if (
    !siteProfileId ||
    String(siteProfileId).trim() === "" ||
    siteProfileId === "null"
  ) {
    return null;
  }
  try {
    const { data, error } = await supabase
      .from("nd_site_profile")
      .select(
        `
        *,
        nd_site_status:nd_site_status(eng),
        nd_site:nd_site(id,standard_code,refid_tp,refid_mcmc),
        nd_site_socioeconomic:nd_site_socioeconomic(nd_socioeconomics:nd_socioeconomics(id,eng)),
        nd_site_space:nd_site_space(nd_space:nd_space(id,eng)),
        nd_phases:nd_phases(name),
        nd_region:nd_region(eng),
        nd_site_address:nd_site_address(address1, address2, postcode, city, district_id, state_id),
        nd_parliament:nd_parliaments(id),
        nd_dun:nd_duns(id),
        nd_mukim:nd_mukims(id),
        dusp_tp:organizations!dusp_tp_id(id, name, parent:parent_id(id,name))
      `
      )
      .eq("id", siteProfileId)
      .single();

    if (error) throw error;
    return data as Site | null;
  } catch (error) {
    console.error("Error fetching site profile by site profile ID:", error);
    throw error;
  }
};

export const fetchSiteStatus = async (): Promise<SiteStatus[]> => {
  try {
    const { data, error } = await supabase.from("nd_site_status").select("*");

    if (error) throw error;
    return data as SiteStatus[];
  } catch (error) {
    console.error("Error fetching status:", error);
    throw error;
  }
};

export const fetchPhase = async (): Promise<Phase[]> => {
  try {
    const { data, error } = await supabase.from("nd_phases").select("*");

    if (error) throw error;
    return data as Phase[];
  } catch (error) {
    console.error("Error fetching phase:", error);
    throw error;
  }
};

export const fetchRegion = async (): Promise<Region[]> => {
  try {
    const { data, error } = await supabase.from("nd_region").select("*");

    if (error) throw error;
    return data as Region[];
  } catch (error) {
    console.error("Error fetching region:", error);
    throw error;
  }
};

export const fetchDistrict = async (stateId: string): Promise<District[]> => {
  try {
    const { data, error } = await supabase
      .from("nd_district")
      .select("*")
      .eq("state_id", stateId);

    if (error) throw error;
    return data as District[];
  } catch (error) {
    console.error("Error fetching district:", error);
    throw error;
  }
};

export const fetchParliament = async (
  stateId: string
): Promise<Parliament[]> => {
  try {
    const { data, error } = await supabase
      .from("nd_parliaments")
      .select("*")
      .eq("state_id", stateId);

    if (error) throw error;
    return data as Parliament[];
  } catch (error) {
    console.error("Error fetching parliament:", error);
    throw error;
  }
};

export const fetchDun = async (parliamentid: string): Promise<Dun[]> => {
  let refid: string | null = null;
  try {
    const { data, error } = await supabase
      .from("nd_parliaments")
      .select("refid")
      .eq("id", parliamentid)
      .single();

    if (error) throw error;
    refid = data?.refid || null;
  } catch (error) {
    console.error("Error fetching refid from parliament:", error);
    throw error;
  }
  try {
    const { data, error } = await supabase
      .from("nd_duns")
      .select("*")
      .eq("rfid_parliament", refid);

    if (error) throw error;
    return data as Dun[];
  } catch (error) {
    console.error("Error fetching dun:", error);
    throw error;
  }
};

export const fetchMukim = async (districtId: string): Promise<Mukim[]> => {
  try {
    const { data, error } = await supabase
      .from("nd_mukims")
      .select("*")
      .eq("district_id", districtId);
    if (error) throw error;
    return data as Mukim[];
  } catch (error) {
    console.error("Error fetching mukim:", error);
    throw error;
  }
};

export const fetchState = async (regionId: string): Promise<State[]> => {
  try {
    const { data, error } = await supabase
      .from("nd_state")
      .select("*")
      .eq("region_id", regionId);

    if (error) throw error;
    return data as State[];
  } catch (error) {
    console.error("Error fetching state:", error);
    throw error;
  }
};

export const fetchTechnology = async (): Promise<Technology[]> => {
  try {
    const { data, error } = await supabase
      .from("nd_technology")
      .select("id,name");

    if (error) throw error;
    return data as Technology[];
  } catch (error) {
    console.error("Error fetching technology:", error);
    throw error;
  }
};

export const fetchBandwidth = async (): Promise<Bandwidth[]> => {
  try {
    const { data, error } = await supabase
      .from("nd_bandwidth")
      .select("id,name");

    if (error) throw error;
    return data as Bandwidth[];
  } catch (error) {
    console.error("Error fetching bandwidth:", error);
    throw error;
  }
};

export const fetchBuildingType = async (): Promise<BuildingType[]> => {
  try {
    const { data, error } = await supabase
      .from("nd_building_type")
      .select("id,eng");

    if (error) throw error;
    return data as BuildingType[];
  } catch (error) {
    console.error("Error fetching building type:", error);
    throw error;
  }
};

export const fetchZone = async (): Promise<Zone[]> => {
  try {
    const { data, error } = await supabase
      .from("nd_zone")
      .select("id,area,zone");

    if (error) throw error;
    return data as Zone[];
  } catch (error) {
    console.error("Error fetching zone:", error);
    throw error;
  }
};

export const fetchCategoryArea = async (): Promise<CategoryArea[]> => {
  try {
    const { data, error } = await supabase
      .from("nd_category_area")
      .select("id,name");

    if (error) throw error;
    return data as CategoryArea[];
  } catch (error) {
    console.error("Error fetching category zone:", error);
    throw error;
  }
};

export const fetchBuildingLevel = async (): Promise<BuildingLevel[]> => {
  try {
    const { data, error } = await supabase
      .from("nd_building_level")
      .select("id,eng");

    if (error) throw error;
    return data as BuildingLevel[];
  } catch (error) {
    console.error("Error fetching building level:", error);
    throw error;
  }
};

export const toggleSiteActiveStatus = async (
  siteId: string,
  currentStatus: boolean
): Promise<void> => {
  try {
    const newStatus = currentStatus ? 0 : 1;
    const { error } = await supabase
      .from("nd_site_profile")
      .update({ is_active: newStatus })
      .eq("id", siteId);

    if (error) throw error;
  } catch (error) {
    console.error("Error toggling site active status:", error);
    throw error;
  }
};

export const fetchSocioecomic = async (): Promise<Socioeconomic[]> => {
  try {
    const { data, error } = await supabase
      .from("nd_socioeconomics")
      .select("id,eng");

    if (error) throw error;
    return data as Socioeconomic[];
  } catch (error) {
    console.error("Error fetching socioecomic:", error);
    throw error;
  }
};

export const fetchSiteSpace = async (): Promise<Space[]> => {
  try {
    const { data, error } = await supabase.from("nd_space").select("id,eng");

    if (error) throw error;
    return data as Space[];
  } catch (error) {
    console.error("Error fetching space:", error);
    throw error;
  }
};

export const deleteSite = async (siteId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("nd_site_profile")
      .delete()
      .eq("id", siteId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting site:", error);
    throw error;
  }
};

export const fetchOrganization = async (): Promise<Organization[]> => {
  try {
    const { data: parent, error: parentErr } = await supabase
      .from("organizations")
      .select("id,name,type")
      .neq("type", "tp");

    if (parentErr) throw parentErr;

    const { data: child, error: childErr } = await supabase
      .from("organizations")
      .select("id,name,type,parent_id")
      .eq("type", "tp");

    if (childErr) throw childErr;

    const datacombine = child.map((child) => {
      const parentData = parent.find((parent) => parent.id === child.parent_id);
      return {
        ...child,
        displayName: parentData
          ? `${child.name} (${parentData.name})`
          : child.name,
      };
    });

    return datacombine as Organization[];
  } catch (error) {
    console.error("Error fetching organization:", error);
    throw error;
  }
};

export const fetchAllStates = async (): Promise<State[]> => {
  try {
    const { data, error } = await supabase.from("nd_state").select("*");

    if (error) throw error;
    return data as State[];
  } catch (error) {
    console.error("Error fetching all states:", error);
    throw error;
  }
};

export const fetchAllDistricts = async (): Promise<District[]> => {
  try {
    const { data, error } = await supabase.from("nd_district").select("*");

    if (error) throw error;
    return data as District[];
  } catch (error) {
    console.error("Error fetching all districts:", error);
    throw error;
  }
};

export const fetchAllMukims = async (): Promise<Mukim[]> => {
  try {
    const { data, error } = await supabase.from("nd_mukims").select("*");
    if (error) throw error;
    return data as Mukim[];
  } catch (error) {
    console.error("Error fetching all mukims:", error);
    throw error;
  }
};

export const fetchAllParliaments = async (): Promise<Parliament[]> => {
  try {
    const { data, error } = await supabase.from("nd_parliaments").select("*");

    if (error) throw error;
    return data as Parliament[];
  } catch (error) {
    console.error("Error fetching all parliaments:", error);
    throw error;
  }
};

export const fetchAllDuns = async (): Promise<Dun[]> => {
  try {
    const { data, error } = await supabase.from("nd_duns").select("*");

    if (error) throw error;
    return data as Dun[];
  } catch (error) {
    console.error("Error fetching all duns:", error);
    throw error;
  }
};
