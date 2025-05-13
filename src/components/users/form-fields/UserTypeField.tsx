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

interface UserTypeFieldProps {
  form: UseFormReturn<UserFormData>;
  isLoading: boolean;
  required?: boolean;
}

export function UserTypeField({
  form,
  isLoading,
  required = true,
}: UserTypeFieldProps) {
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
              disabled={isLoading}
              onValueChange={field.onChange}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {userTypes?.map((type) => (
                  <SelectItem key={type.name} value={type.name}>
                    {type.name}{" "}
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
