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

interface UserPositionFieldProps {
  form: UseFormReturn<UserFormData>;
  isLoading: boolean;
}

export function UserPositionField({ form, isLoading }: UserPositionFieldProps) {
  const { data: positions, isLoading: isLoadingPositions } = useQuery({
    queryKey: ["positions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nd_position")
        .select("id, name")
        .order("name", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  return (
    <FormField
      control={form.control}
      name="position_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Position</FormLabel>
          {isLoadingPositions ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select
              disabled={isLoading}
              onValueChange={field.onChange}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a position" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {positions?.map((position) => (
                  <SelectItem key={position.id} value={position.id.toString()}>
                    {position.name}
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
