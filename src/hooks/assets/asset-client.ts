import { fetchSites } from "@/components/site/component/site-utils";
import { supabase } from "@/lib/supabase";
import { Asset, AssetCategory, AssetType } from "@/types/asset";

export const assetClient = {
  fetchAssets: async (organizationId: string | null): Promise<Asset[]> => {
    const allSites = await fetchSites(organizationId);

    const { data, error } = await supabase
      .from("nd_asset")
      .select(
        `*,
        nd_asset_type ( id, name ),
        site:nd_site (
          id,
          standard_code,
          site_profile_id
        )`
      )
      .order("id");

    if (error) {
      console.error("Error fetching assets:", error);
      throw error;
    }

    return data.map((item) => {
      const profile = allSites.find((s) => s.id === item.site?.site_profile_id);

      return {
        ...item,
        type: item.nd_asset_type,
        site: profile
          ? {
              ...profile,
              dusp_tp_id_display:
                profile.dusp_tp && profile.dusp_tp.parent
                  ? `${profile.dusp_tp.name} (${profile.dusp_tp.parent.name})`
                  : profile.dusp_tp?.name ?? "N/A",
            }
          : undefined,
      };
    });
  },
  fetchAssetById: async (id: string): Promise<Asset> => {
    const { data, error } = await supabase
      .from("nd_asset")
      .select(
        `*,
        nd_asset_type ( id, name ),
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
};
