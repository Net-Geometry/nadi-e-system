import {
  fetchSiteBySiteId,
  fetchSites,
} from "@/components/site/hook/site-utils";
import { supabase } from "@/integrations/supabase/client";
import { Asset, AssetCategory, AssetType } from "@/types/asset";
import { Site } from "@/types/site";

export const assetClient = {
  fetchAssets: async (
    organizationId: string | null,
    siteId: string | null
  ): Promise<Asset[]> => {
    const allSites = await fetchSites(organizationId);

    let query = supabase
      .from("nd_asset")
      .select(
        `*,
        nd_asset_type ( id, name ),
        nd_brand!nd_asset_nd_brand_fk  ( id, name ),
        site:nd_site (
          id,
          standard_code,
          site_profile_id
        )`
      )
      .is("deleted_at", null);

    if (siteId) {
      query = query.eq("site_id", Number(siteId));
    }

    query = query.order("id");

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching assets:", error);
      throw error;
    }

    const formatProfile = (profile: Site) => ({
      ...profile,
      dusp_tp_id_display: profile?.dusp_tp?.parent
        ? `${profile.dusp_tp.name} (${profile.dusp_tp.parent.name})`
        : profile?.dusp_tp?.name ?? "N/A",
    });

    const filteredData = await Promise.all(
      data.map(async (item) => {
        let profile = null;

        if (siteId) {
          profile = await fetchSiteBySiteId(siteId);
        } else {
          profile = allSites.find((s) => s.id === item.site?.site_profile_id);
          profile = formatProfile(profile);
        }

        return {
          ...item,
          type: item.nd_asset_type,
          brand: item.nd_brand,
          site: profile ? { ...profile } : null,
        };
      })
    );

    return filteredData;
  },
  fetchAssetsByName: async (
    organizationId: string | null,
    siteId: string | null,
    name: string | null,
    isActive?: boolean | null
  ): Promise<Asset[]> => {
    if (!name) return [];

    const allSites = await fetchSites(organizationId);

    console.log(siteId);

    let query = supabase
      .from("nd_asset")
      .select(
        `*,
        nd_asset_type ( id, name ),
        nd_brand!nd_asset_nd_brand_fk  ( id, name ),
        site:nd_site (
          id,
          standard_code,
          site_profile_id
        )`
      )
      .is("deleted_at", null);

    if (siteId) {
      query = query.eq("site_id", Number(siteId));
    }

    if (name) {
      query = query.textSearch("name", name, { type: "plain" });
    }

    if (isActive) {
      query = query.eq("is_active", isActive);
    }

    query = query.limit(5).order("id");

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching assets:", error);
      throw error;
    }

    const formatProfile = (profile: Site) => ({
      ...profile,
      dusp_tp_id_display: profile?.dusp_tp?.parent
        ? `${profile.dusp_tp.name} (${profile.dusp_tp.parent.name})`
        : profile?.dusp_tp?.name ?? "N/A",
    });

    const filteredData = await Promise.all(
      data.map(async (item) => {
        let profile = null;

        if (siteId) {
          profile = await fetchSiteBySiteId(siteId);
        } else {
          profile = allSites.find((s) => s.id === item.site?.site_profile_id);
          profile = formatProfile(profile);
        }

        return {
          ...item,
          type: item.nd_asset_type,
          brand: item.nd_brand,
          site: profile ? { ...profile } : null,
        };
      })
    );

    return filteredData;
  },

  fetchAssetById: async (id: number): Promise<Asset> => {
    const { data, error } = await supabase
      .from("nd_asset")
      .select(
        `*,
        nd_asset_type ( id, name ),
        nd_brand!nd_asset_nd_brand_fk  ( id, name, brand_type ),
        site:nd_site (
          id,
          standard_code
        )`
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching asset:", error);
      throw error;
    }

    const profile = await fetchSiteBySiteId(data.site_id);

    return {
      ...data,
      type: data.nd_asset_type,
      brand: data.nd_brand,
      site: profile,
    };
  },

  fetchSuperAdminAsset: async (isSuperAdmin: boolean) => {
    if (!isSuperAdmin) {
      throw new Error(
        "Error dannied: you don't have permission to get all asset"
      );
    }

    const { data, error } = await supabase.from("nd_asset").select(`
        *,
        nd_brand (
            id,
            name,
            brand_type
          ),
        nd_booking (
            id,
            booking_start,
            booking_end,
            is_using,
            created_by
          ),
        nd_asset_type!inner (
            category_id
          )  
      `);

    if (error) throw error;

    return data;
  },

  fetchAssetByName: async (assetName: string) => {
    const { data, error } = await supabase
      .from("nd_asset")
      .select("id")
      .eq("name", assetName)
      .single();

    if (error) {
      console.error("Error fetching asset by name", error);
      throw error;
    }

    return data;
  },

  fetchAssetCategories: async (): Promise<AssetCategory[]> => {
    const { data, error } = await supabase
      .from("nd_asset_categories")
      .select("*");

    if (error) {
      console.error("Error fetching asset categories:", error);
      throw error;
    }
    return data;
  },

  fetchAssetTypes: async (): Promise<AssetType[]> => {
    const { data, error } = await supabase.from("nd_asset_type").select("*");

    if (error) {
      console.error("Error fetching asset types:", error);
      throw error;
    }
    return data;
  },

  fetchAssetTypesWithCategory: async (): Promise<AssetType[]> => {
    const { data, error } = await supabase.from("nd_asset_type").select(`
      *,
      nd_asset_categories ( id, name )
    `);

    if (error) {
      console.error("Error fetching asset types:", error);
      throw error;
    }

    return data.map((item) => ({
      ...item,
      category: item.nd_asset_categories,
    }));
  },

  fetchAssetsByType: async (siteProfileId: number) => {
    if (siteProfileId) {
      const { data: siteId, error: errorSiteId } = await supabase
        .from("nd_site")
        .select("id")
        .eq("site_profile_id", siteProfileId)
        .single();

      if (errorSiteId) {
        throw errorSiteId;
      }

      const { data, error } = await supabase
        .from("nd_asset")
        .select(
          `
          *,
          nd_brand (
            id,
            name,
            brand_type
          ),
          nd_booking (
            id,
            booking_start,
            booking_end,
            is_using,
            created_by
          )
        `)
        .eq("site_id", siteId?.id);

      if (error) throw error;

      return data;
    }
  },

  fetchAssetsBySiteId: async (siteProfileId: number | null, siteId?: number) => {
    let site_id = siteId;

    if (siteProfileId) {
      const { data: siteProfile, error: errorSiteProfile } = await supabase
        .from("nd_site")
        .select("id")
        .eq("site_profile_id", siteProfileId)
        .single()

      if (errorSiteProfile) throw errorSiteProfile;

      site_id = siteProfile?.id;
    }

    const { data, error } = await supabase
      .from("nd_asset")
      .select(
        `
        *, 
        nd_site (
          id
        ), 
        nd_brand (
          id,
          name,
          brand_type
        ),
        nd_booking (
          id,
          booking_start,
          booking_end,
          is_using,
          created_by
        )
      `)
      .eq("site_id", site_id)

    if (error) throw error;

    return data;
  },

  fetchAssetsInTpsSites: async (tpOrgId: string) => {
    // Fetch all profile eq tpOrgId and join site table, inside site join asset

    const { data, error } = await supabase
      .from("nd_site_profile")
      .select(`
          nd_site (
            nd_asset (
              *,
              nd_booking (*)
            )
          )
      `)
      .eq("dusp_tp_id", tpOrgId)

    if (error) throw error;

    const assetsOnly = data.flatMap((siteItem) => siteItem.nd_site.flatMap((site) => site.nd_asset));

    return assetsOnly;
  },

  toggleAssetActiveStatus: async (
    assetId: string,
    currentStatus: boolean
  ): Promise<void> => {
    try {
      const newStatus = currentStatus ? 0 : 1;
      const { error } = await supabase
        .from("nd_asset")
        .update({ is_active: !!newStatus })
        .eq("id", assetId);

      if (error) throw error;
    } catch (error) {
      console.error("Error toggling site active status:", error);
      throw error;
    }
  }
};
