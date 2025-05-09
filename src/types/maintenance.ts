import { Asset } from "@/types/asset";

export interface MaintenanceRequest {
  id: number;
  no_docket: string;
  description: string;
  asset_id?: number;
  asset?: Asset;
  type_id?: number;
  type?: TypeMaintenance;
  sla_id?: number;
  sla: SLACategories;
  status: string;
  requester_by: string;
  attachment?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export enum MaintenanceDocketType {
  Corrective = "Corrective Maintenance (CM)",
  Preventive = "Preventive Maintenance (PM)",
}

export enum MaintenanceStatus {
  Approved = "approved",
  Issued = "issued",
  InProgress = "in_progress",
  Completed = "completed",
  Incompleted = "incompleted",
  Rejected = "rejected",
  Defferred = "deferred",
}

export const humanizeMaintenanceStatus = (status: string) => {
  switch (status) {
    case "issued":
      return "Issued";
    case "in_progress":
      return "In Progress";
    case "completed":
      return "Completed";
    case "incompleted":
      return "Incompleted";
    case "rejected":
      return "Rejected";
    case "deferred":
      return "Deferred";
    default:
      return "Unknown status";
  }
};

export interface TypeMaintenance {
  id: number;
  name: string;
  description: string;
}

export interface SLACategories {
  id: number;
  name: string;
  min_day: number;
  max_day: number;
}
