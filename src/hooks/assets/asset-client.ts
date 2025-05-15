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
      query = query.eq("site_id", siteId);
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
      query = query.eq("site_id", siteId);
    }

    if (name) {
      query = query.textSearch("name", name);
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
        nd_brand!nd_asset_nd_brand_fk  ( id, name ),
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

  fetchAssetByName: async (assetName: string) => {
    const { data, error } = await supabase
      .from("nd_asset")
      .select("id")
      .eq("name", assetName)
      .single()

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

  fetchAssetsByType: async (typeId: number, siteId: number) => {
    if (!!siteId) {
      const { data, error } = await supabase
        .from("nd_asset")
        .select(`
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
            is_using
          )
        `)
        .eq("type_id", typeId)
        .eq("site_id", siteId);

      if (error) throw error;

      return data;
    }
    
    const { data, error } = await supabase
      .from("nd_asset")
      .select(`
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
          is_using
        )
        `)
      .eq("type_id", typeId);

    if (error) {
      console.error("Error fetching assets by type:", error);
      throw error;
    }

    return data;
  },

  fetchAssetsBySiteId: async (siteId: number, assetTypeId: number): Promise<Asset> => {
    const { data, error } = await supabase
      .from("nd_asset")
      .select(`
        *, 
        nd_site!inner (
          id
        ), 
        nd_booking (
          is_using,
          booking_start,
          booking_end
        )
      `)
      .eq("nd_site.id", siteId)
      .eq("type_id", assetTypeId)

    if (error) throw error;

    return data;
  },

  toggleAssetActiveStatus: async (
    assetId: string,
    currentStatus: boolean
  ): Promise<void> => {
    try {
      const newStatus = currentStatus ? 0 : 1;
      const { error } = await supabase
        .from("nd_asset")
        .update({ is_active: newStatus })
        .eq("id", assetId);

      if (error) throw error;
    } catch (error) {
      console.error("Error toggling site active status:", error);
      throw error;
    }
  },

  getAllPcInTpsSite: async(tps_site_ids: number[], assetType: number) => {
    try {
      const results = await Promise.all(
        tps_site_ids.map(async (id) => {
          const asset = await assetClient.fetchAssetsBySiteId(id, assetType);
          return asset;
        })
      );
  
      return results.flat();
    } catch (error) {
      console.error("Failed to fetch assets:", error);
      return [];
    }
  }
};
