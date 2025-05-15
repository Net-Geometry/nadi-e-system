import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface UserGroup {
  id: string;
  group_name: string;
  description?: string;
}

export function useUserGroups() {
  return useQuery({
    queryKey: ["user-groups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nd_user_group")
        .select("id, group_name, description")
        .or(
          "group_name.ilike.%mcmc%,group_name.ilike.%tp%,group_name.ilike.%dusp%,group_name.ilike.%sso%,group_name.ilike.%vendor%"
        )
        .order("group_name", { ascending: true });

      if (error) throw error;
      return data as UserGroup[];
    },
  });
}

export function getGroupById(
  groups: UserGroup[],
  id?: string
): UserGroup | undefined {
  if (!id) return undefined;
  return groups.find((group) => group.id.toString() === id);
}

export function isMcmcGroup(group?: UserGroup): boolean {
  return !!group && group.group_name.toLowerCase().includes("mcmc");
}

export function isTpGroup(group?: UserGroup): boolean {
  return (
    !!group &&
    (group.group_name.toLowerCase().includes("tp") ||
      group.group_name.toLowerCase().includes("tech partner"))
  );
}

export function isDuspGroup(group?: UserGroup): boolean {
  return !!group && group.group_name.toLowerCase().includes("dusp");
}

export function isSsoGroup(group?: UserGroup): boolean {
  return !!group && group.group_name.toLowerCase().includes("sso");
}

export function isVendorGroup(group?: UserGroup): boolean {
  return !!group && group.group_name.toLowerCase().includes("vendor");
}
