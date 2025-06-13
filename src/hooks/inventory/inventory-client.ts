import { supabase } from "@/integrations/supabase/client";
import { AssetType } from "@/types/asset";
import { Inventory } from "@/types/inventory";

export const inventoryClient = {
  fetchInventories: async (
    organizationId: string | null,
    siteId: string | null
  ): Promise<Inventory[]> => {
    let query = supabase
      .from("nd_inventory")
      .select(
        `*,
        nd_inventory_attachment(
          file_path,
          created_at
        ),
        nd_inventory_type ( id, name ),
        site:nd_site_profile (
          *
        )`
      )
      .is("deleted_at", null);

    if (siteId) {
      query = query.eq("site_id", Number(siteId));
    }

    query = query.order("id");

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching inventories:", error);
      throw error;
    }

    const formatProfile = (profile) => ({
      ...profile,
      dusp_tp_id_display: profile?.dusp_tp?.parent
        ? `${profile.dusp_tp.name} (${profile.dusp_tp.parent.name})`
        : profile?.dusp_tp?.name ?? "N/A",
    });

    const filteredData = await Promise.all(
      data.map(async (item) => {
        const profile = formatProfile(item.site);

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
        nd_inventory_attachment(
          file_path,
          created_at
        ),
        nd_inventory_type ( id, name ),
        site:nd_site_profile (
          *
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
