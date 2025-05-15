import {
  fetchSiteBySiteId,
  fetchSites,
} from "@/components/site/hook/site-utils";
import { supabase } from "@/integrations/supabase/client";
import { AssetType } from "@/types/asset";
import { Inventory } from "@/types/inventory";
import { Site } from "@/types/site";

export const inventoryClient = {
  fetchInventories: async (
    organizationId: string | null,
    siteId: string | null
  ): Promise<Inventory[]> => {
    const allSites = await fetchSites(organizationId);

    let query = supabase
      .from("nd_inventory")
      .select(
        `*,
        nd_inventory_type ( id, name ),
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
      console.error("Error fetching inventories:", error);
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
          type: item.nd_inventory_type,
          brand: item.nd_brand,
          site: profile ? { ...profile } : null,
        };
      })
    );
    return filteredData;
  },
  fetchInventoryById: async (id: string): Promise<Inventory> => {
    const { data, error } = await supabase
      .from("nd_inventory")
      .select(
        `*,
        nd_inventory_type ( id, name ),
        site:nd_site (
          id,
          standard_code
        )`
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching inventory:", error);
      throw error;
    }
    return {
      ...data,
      type: data.nd_inventory_type,
      site: data.site,
    };
  },

  fetchInventoryTypes: async (): Promise<AssetType[]> => {
    const { data, error } = await supabase
      .from("nd_inventory_type")
      .select("*");

    if (error) {
      console.error("Error fetching inventory types:", error);
      throw error;
    }
    return data as AssetType[];
  },
};
