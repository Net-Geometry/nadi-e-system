import { useQuery } from "@tanstack/react-query";
import { UserType } from "@/types/auth";

// This returns all possible user types from the UserType union type
export const useUserTypes = () => {
  // For a static list, we can hardcode the values
  // In a real app, you might fetch these from the server
  const userTypes: UserType[] = [
    "member",
    "vendor",
    "tp_management",
    "sso",
    "dusp_admin",
    "super_admin",
    "tp_pic",
    "tp_hr",
    "tp_finance",
    "tp_admin",
    "tp_operation",
    "tp_site",
    "mcmc_admin",
    "mcmc_operation",
    "mcmc_management",
    "sso_admin",
    "sso_pillar",
    "sso_management",
    "sso_operation",
    "dusp_management",
    "dusp_operation",
    "staff_assistant_manager",
    "staff_manager",
    "vendor_admin",
    "vendor_staff",
  ];

  return {
    userTypes,
    isLoading: false,
    error: null,
  };
};
