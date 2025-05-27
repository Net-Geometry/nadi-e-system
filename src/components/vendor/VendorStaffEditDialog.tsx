
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save } from "lucide-react";

interface VendorStaffMember {
  id: number;
  fullname: string;
  ic_no: string;
  mobile_no: string;
  work_email: string;
  position_id: number;
  is_active: boolean;
  registration_number: number;
  user_id: string;
  vendor_company?: {
    business_name: string;
    registration_number: string;
    business_type: string;
  };
  contract_status?: {
    is_active: boolean;
    contract_start?: string;
    contract_end?: string;
  };
}

interface VendorStaffEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  staff: VendorStaffMember | null;
  onStaffUpdated: () => void;
}

interface FormData {
  fullname: string;
  ic_no: string;
  mobile_no: string;
  work_email: string;
}

const VendorStaffEditDialog: React.FC<VendorStaffEditDialogProps> = ({
  isOpen,
  onClose,
  staff,
  onStaffUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    defaultValues: {
      fullname: "",
      ic_no: "",
      mobile_no: "",
      work_email: "",
    },
  });

  useEffect(() => {
    if (staff) {
      form.reset({
        fullname: staff.fullname,
        ic_no: staff.ic_no,
        mobile_no: staff.mobile_no,
        work_email: staff.work_email,
      });
    }
  }, [staff, form]);

  const onSubmit = async (data: FormData) => {
    if (!staff) return;

    setLoading(true);
    try {
      // Update vendor staff record
      const { error: staffError } = await supabase
        .from("nd_vendor_staff")
        .update({
          fullname: data.fullname,
          ic_no: data.ic_no,
          mobile_no: data.mobile_no,
          work_email: data.work_email,
          updated_at: new Date().toISOString(),
        })
        .eq("id", staff.id);

      if (staffError) throw staffError;

      // Update user profile if user_id exists
      if (staff.user_id) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            full_name: data.fullname,
            email: data.work_email,
            phone_number: data.mobile_no,
            ic_number: data.ic_no,
          })
          .eq("id", staff.user_id);

        if (profileError) {
          console.warn("Profile update error:", profileError);
        }
      }

      toast({
        title: "Success",
        description: "Staff member updated successfully",
      });

      onStaffUpdated();
      onClose();
    } catch (error: any) {
      console.error("Error updating staff:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update staff member",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!staff) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Staff Member</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter full name" required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ic_no"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IC Number *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter IC number" required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mobile_no"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter mobile number" required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="work_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Email *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="Enter work email"
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default VendorStaffEditDialog;
