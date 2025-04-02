import { supabase } from "@/lib/supabase";
import { AssetType } from "@/types/asset";
import { Inventory } from "@/types/inventory";

export const inventoryClient = {
  fetchInventories: async (): Promise<Inventory[]> => {
    const { data, error } = await supabase
      .from("nd_inventory")
      .select(
        `*,
          nd_inventory_type ( id, name )`
      )
      .order("id");

    if (error) {
      console.error("Error fetching inventories:", error);
      throw error;
    }
    return data.map((item) => ({
      ...item,
      type: item.nd_inventory_type,
    }));
  },
  fetchInventoryById: async (id: string): Promise<Inventory> => {
    const { data, error } = await supabase
      .from("nd_inventory")
      .select(
        `*,
          nd_inventory_type ( id, name )`
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
