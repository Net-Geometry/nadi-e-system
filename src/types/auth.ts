export type UserType =
  | "member"
  | "vendor"
  | "tp_management"
  | "sso"
  | "dusp_admin"
  | "super_admin"
  | "tp_pic"
  | "tp_hr"
  | "tp_finance"
  | "tp_admin"
  | "tp_operation"
  | "mcmc_admin"
  | "mcmc_operation"
  | "mcmc_management"
  | "sso_admin"
  | "sso_pillar"
  | "sso_management"
  | "sso_operation"
  | "dusp_management"
  | "dusp_operation"
  | "staff_assistant_manager"
  | "staff_manager"
  | "vendor_admin"
  | "vendor_staff"
  | string; // Allow any string to support dynamic roles

export type NotificationType = "info" | "warning" | "success" | "error";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  ic_number: string;
  phone_number: string;
  avatar_url?: string;
  user_type: UserType;
  user_group?: string; // Added user_group property
  gender?: string; // Added gender property
  work_email?: string; // Added work_email property
  nd_user_group?: {
    group_name: string;
    id: string;
  }; // Added nd_user_group property for the join
  theme_preference: "light" | "dark";
  notification_preferences: {
    email: boolean;
    push: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  created_at: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string | null;
  module: string;
  action: string;
  created_at?: string;
}

export interface RolePermission {
  role_id: string;
  permission_id: string;
  created_at: string;
}

export interface UserRole {
  user_id: string;
  role_id: string;
  created_at: string;
}
