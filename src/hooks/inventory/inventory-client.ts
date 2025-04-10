import { fetchSites } from "@/components/site/component/site-utils";
import { supabase } from "@/lib/supabase";
import { AssetType } from "@/types/asset";
import { Inventory } from "@/types/inventory";

export const inventoryClient = {
  fetchInventories: async (
    organizationId: string | null
  ): Promise<Inventory[]> => {
    const allSites = await fetchSites(organizationId);

    const { data, error } = await supabase
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
      .order("id");

    if (error) {
      console.error("Error fetching inventories:", error);
      throw error;
    }
    return data.map((item) => {
      const profile = allSites.find((s) => s.id === item.site?.site_profile_id);

      return {
        ...item,
        type: item.nd_inventory_type,
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
