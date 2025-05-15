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

interface UserTechPartnerFieldProps {
  form: UseFormReturn<UserFormData>;
  isLoading: boolean;
}

export function UserTechPartnerField({
  form,
  isLoading,
}: UserTechPartnerFieldProps) {
  const { data: techPartners, isLoading: isLoadingPartners } = useQuery({
    queryKey: ["tech-partners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nd_tech_partner")
        .select("id, name")
        .order("name", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  return (
    <FormField
      control={form.control}
      name="tech_partner_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Technology Partner</FormLabel>
          {isLoadingPartners ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select
              disabled={isLoading}
              onValueChange={field.onChange}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a tech partner" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {techPartners?.map((partner) => (
                  <SelectItem key={partner.id} value={partner.id.toString()}>
                    {partner.name}
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
