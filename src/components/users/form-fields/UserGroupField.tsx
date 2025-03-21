
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
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

interface UserGroupFieldProps {
  form: UseFormReturn<UserFormData>;
  isLoading: boolean;
}

export function UserGroupField({ form, isLoading }: UserGroupFieldProps) {
  const { data: userGroups, isLoading: isLoadingGroups } = useQuery({
    queryKey: ["user-groups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nd_user_group")
        .select("id, group_name, description")
        .order("group_name", { ascending: true });
        
      if (error) throw error;
      return data;
    },
  });

  return (
    <FormField
      control={form.control}
      name="user_group"
      render={({ field }) => (
        <FormItem>
          <FormLabel>User Group</FormLabel>
          {isLoadingGroups ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select
              disabled={isLoading}
              onValueChange={field.onChange}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user group" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {userGroups?.map((group) => (
                  <SelectItem key={group.id} value={group.id.toString()}>
                    {group.group_name}
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
