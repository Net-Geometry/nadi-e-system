import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { UserFormData } from "../types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  UserGroup,
  getGroupById,
  isMcmcGroup,
  isTpGroup,
  isDuspGroup,
  isSsoGroup,
  isVendorGroup,
  isStaffGroup,
} from "../hooks/use-user-groups";

interface UserTypeFieldProps {
  form: UseFormReturn<UserFormData>;
  isLoading: boolean;
  required?: boolean;
  userGroups?: UserGroup[];
}

export function UserTypeField({
  form,
  isLoading,
  required = true,
  userGroups = [],
}: UserTypeFieldProps) {
  const selectedUserGroup = form.watch("user_group");

  // Define user types mapping based on user groups
  const getUserTypesForGroup = (userGroupId: string) => {
    const group = getGroupById(userGroups, userGroupId);

    if (!group) return [];

    if (isMcmcGroup(group)) {
      return [
        { name: "mcmc_admin", description: "MCMC Administrator" },
        { name: "mcmc_management", description: "MCMC Management" },
        { name: "mcmc_operation", description: "MCMC Operation" },
      ];
    }

    if (isTpGroup(group)) {
      return [
        { name: "tp_admin", description: "Tech Partner Administrator" },
        { name: "tp_management", description: "Tech Partner Management" },
        { name: "tp_hr", description: "Tech Partner HR" },
        { name: "tp_finance", description: "Tech Partner Finance" },
        { name: "tp_operation", description: "Tech Partner Operation" },
        { name: "tp_pic", description: "Tech Partner PIC" },
      ];
    }

    if (isDuspGroup(group)) {
      return [
        { name: "dusp_admin", description: "DUSP Administrator" },
        { name: "dusp_management", description: "DUSP Management" },
        { name: "dusp_operation", description: "DUSP Operation" },
      ];
    }

    if (isSsoGroup(group)) {
      return [
        { name: "sso_admin", description: "SSO Administrator" },
        { name: "sso_management", description: "SSO Management" },
        { name: "sso_operation", description: "SSO Operation" },
        { name: "sso_pillar", description: "SSO Pillar" },
      ];
    }

    if (isVendorGroup(group)) {
      return [
        { name: "vendor_admin", description: "Vendor Administrator" },
        { name: "vendor_staff", description: "Vendor Staff" },
      ];
    }

    if (isStaffGroup(group)) {
      return [
        { name: "staff_manager", description: "Staff Manager" },
        {
          name: "staff_assistant_manager",
          description: "Staff Assistant Manager",
        },
      ];
    }

    // Default fallback for other groups
    return [{ name: "member", description: "Member" }];
  };

  const { data: userTypes, isLoading: isLoadingTypes } = useQuery({
    queryKey: ["user-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roles")
        .select("name, description")
        .order("name", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Get filtered user types based on selected user group
  const filteredUserTypes = selectedUserGroup
    ? getUserTypesForGroup(selectedUserGroup)
    : userTypes || [];

  return (
    <FormField
      control={form.control}
      name="user_type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{required ? "User Type *" : "User Type"}</FormLabel>
          {isLoadingTypes ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select
              disabled={isLoading || !selectedUserGroup}
              onValueChange={field.onChange}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !selectedUserGroup
                        ? "Select a user group first"
                        : "Select a user type"
                    }
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {filteredUserTypes?.map((type) => (
                  <SelectItem key={type.name} value={type.name}>
                    {type.name
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}{" "}
                    {type.description ? `- ${type.description}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
