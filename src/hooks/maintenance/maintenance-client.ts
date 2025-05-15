import { fetchSiteBySiteId } from "@/components/site/hook/site-utils";
import { supabase } from "@/lib/supabase";
import {
  MaintenanceRequest,
  MaintenanceStatus,
  SLACategories,
  TypeMaintenance,
} from "@/types/maintenance";

export const maintenanceClient = {
  fetchMaintenanceRequests: async (
    type?: string,
    statuses?: MaintenanceStatus[]
  ): Promise<MaintenanceRequest[]> => {
    let query = supabase
      .from("nd_maintenance_request")
      .select(
        `*,
      nd_type_maintenance ( id, name ),
      sla:nd_sla_categories ( id, name, min_day, max_day ),
      asset:nd_asset (
        id,
        name,
        site_id
      )`
      )
      .order("updated_at", { ascending: false });

    if (type) {
      const prefix =
        type.toLowerCase() === "cm"
          ? "1%"
          : type.toLowerCase() === "pm"
          ? "2%"
          : null;
      if (prefix) {
        query = query.like("no_docket", prefix);
      }
    }

    if (statuses && statuses.length > 0) {
      query = query.in("status", statuses);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching maintenance requests:", error);
      throw error;
    }
    const filteredData = await Promise.all(
      data.map(async (item) => {
        if (type === "cm") {
          const profile = await fetchSiteBySiteId(item.asset.site_id);
          item.asset.site = profile;
          return {
            ...item,
            type: item.nd_type_maintenance,
            sla: item.sla,
            asset: item.asset,
          };
        } else {
          return {
            ...item,
            type: item.nd_type_maintenance,
          };
        }
      })
    );

    return filteredData;
  },
  fetchMaintenanceRequestById: async (
    id: string
  ): Promise<MaintenanceRequest> => {
    const { data, error } = await supabase
      .from("nd_maintenance_request")
      .select(
        `*,
        nd_type_maintenance ( id, name ),
        sla:nd_sla_categories ( id, name ),
        asset:nd_asset (
          id,
          name,
          site_id
        )`
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching maintenance request:", error);
      throw error;
    }

    const profile = await fetchSiteBySiteId(data.asset.site_id);
    data.asset.site = profile;
    return {
      ...data,
      type: data.nd_type_maintenance,
      sla: data.sla,
      asset: data.asset,
    };
  },
  fetchMaintenanceTypes: async (): Promise<TypeMaintenance[]> => {
    const { data, error } = await supabase
      .from("nd_type_maintenance")
      .select("*");

    if (error) {
      console.error("Error fetching maintenance types:", error);
      throw error;
    }
    return data as TypeMaintenance[];
  },
  fetchSLACategories: async (): Promise<SLACategories[]> => {
    const { data, error } = await supabase
      .from("nd_sla_categories")
      .select("*");

    if (error) {
      console.error("Error fetching SLA categories:", error);
      throw error;
    }
    return data as SLACategories[];
  },
};
