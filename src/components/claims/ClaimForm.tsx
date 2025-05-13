import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface ClaimFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface ClaimFormData {
  claim_type: string;
  title: string;
  description: string;
  amount: string;
}

export function ClaimForm({ onSuccess, onCancel }: ClaimFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ClaimFormData>({
    defaultValues: {
      claim_type: "",
      title: "",
      description: "",
      amount: "",
    },
  });

  const onSubmit = async (data: ClaimFormData) => {
    setIsLoading(true);
    try {
      const claimNumber = `CLM-${Date.now()}`;
      const { error } = await supabase.from("claims").insert({
        claim_number: claimNumber,
        claim_type: data.claim_type,
        title: data.title,
        description: data.description,
        amount: parseFloat(data.amount),
        status: "pending",
      });

      if (error) throw error;
      onSuccess?.();
    } catch (error) {
      console.error("Error submitting claim:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="claim_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Claim Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select claim type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="damage">Damage</SelectItem>
                    <SelectItem value="reimbursement">Reimbursement</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit Claim"}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
