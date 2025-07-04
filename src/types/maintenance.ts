import { Asset } from "@/types/asset";
import { Vendor } from "./vendor";

export interface MaintenanceRequest {
  id?: number;
  no_docket?: string;
  description: string;
  asset_id: number;
  asset?: Asset;
  type_id?: number;
  type?: TypeMaintenance;
  docket_type?: "cm" | "pm";
  sla_id?: number;
  sla?: SLACategories;
  status: MaintenanceStatus;
  requester_by: string;
  attachment?: string;
  space_id: number;
  updates?: MaintenanceUpdate[];
  maintenance_date?: string;
  priority_type_id?: number;
  logs?: MaintenanceLogs[];
  vendor_id?: number;
  vendor?: Vendor;
  frequency?: MaintenanceFrequency;
  remarks?: string;
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

export interface MaintenanceLogs {
  description: string;
  status: MaintenanceStatus;
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

export enum ClaimMaintenanceReportStatus {
  New = "new",
  InProgress = "in_progress",
  Closed = "closed",
}

export const getClaimMaintenanceReportStatus = (
  status: MaintenanceStatus
): ClaimMaintenanceReportStatus => {
  switch (status) {
    case MaintenanceStatus.Submitted:
    case MaintenanceStatus.Issued:
      return ClaimMaintenanceReportStatus.New;
    case MaintenanceStatus.Completed:
      return ClaimMaintenanceReportStatus.Closed;
    default:
      return ClaimMaintenanceReportStatus.InProgress;
  }
};

export const humanizeClaimMaintenanceReportStatus = (status: string) => {
  switch (status) {
    case "new":
      return "New";
    case "in_progress":
      return "In Progress";
    case "closed":
      return "Closed";
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

export enum MaintenanceFrequency {
  Weekly = "weekly",
  Monthly = "monthly",
  Yearly = "yearly",
}

export const humanizeMaintenanceFrequency = (frequency: string) => {
  switch (frequency) {
    case "weekly":
      return "Weekly";
    case "monthly":
      return "Monthly";
    case "yearly":
      return "Yearly";
    default:
      return "Unknown frequency";
  }
};

export const calculateNewDateByFrequency = (
  date: string,
  frequency
): string => {
  const newDate = new Date(date);

  switch (frequency) {
    case "weekly":
      newDate.setDate(newDate.getDate() + 7);
      break;
    case "monthly":
      newDate.setMonth(newDate.getMonth() + 1);
      break;
    case "yearly":
      newDate.setFullYear(newDate.getFullYear() + 1);
      break;
  }
  return newDate.toISOString().split("T")[0];
};
