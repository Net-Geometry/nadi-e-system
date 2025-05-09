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
        nd_brand ( id, name ),
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

  fetchAssetById: async (id: string): Promise<Asset> => {
    const { data, error } = await supabase
      .from("nd_asset")
      .select(
        `*,
        nd_asset_type ( id, name ),
        brand:nd_brand ( id, name ),
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
    return {
      ...data,
      type: data.nd_asset_type,
      brand: data.brand,
      site: data.site,
    };
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
};
