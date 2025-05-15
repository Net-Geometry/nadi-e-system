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
  updates?: MaintenanceUpdate[];
  maintenance_date?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface MaintenanceUpdate {
  description: string;
  attachment?: string;
  created_at?: string;
  created_by?: string;
}

export enum MaintenanceDocketType {
  Corrective = "Corrective Maintenance (CM)",
  Preventive = "Preventive Maintenance (PM)",
}

export enum MaintenanceStatus {
  Submitted = "submitted",
  Approved = "approved",
  Issued = "issued",
  InProgress = "in_progress",
  Completed = "completed",
  Incompleted = "incompleted",
  Rejected = "rejected",
  Deffered = "deffered",
}

export const humanizeMaintenanceStatus = (status: string) => {
  switch (status) {
    case "submitted":
      return "Submitted";
    case "approved":
      return "Approved";
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
    case "deffered":
      return "Defferred";
    default:
      return "Unknown status";
  }
};

export const getMaintenanceStatus = (status: string): MaintenanceStatus => {
  switch (status) {
    case "submitted":
      return MaintenanceStatus.Submitted;
    case "approved":
      return MaintenanceStatus.Approved;
    case "issued":
      return MaintenanceStatus.Issued;
    case "in_progress":
      return MaintenanceStatus.InProgress;
    case "completed":
      return MaintenanceStatus.Completed;
    case "incompleted":
      return MaintenanceStatus.Incompleted;
    case "rejected":
      return MaintenanceStatus.Rejected;
    case "deffered":
      return MaintenanceStatus.Deffered;
    default:
      return null;
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

export const getSLACategoryColor = (category: string): string => {
  switch (category) {
    case "Critical":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    case "High":
      return "bg-orange-100 text-orange-800 hover:bg-orange-200";
    case "Moderate":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case "Low":
      return "bg-green-100 text-green-800 hover:bg-green-200";
  }
};
