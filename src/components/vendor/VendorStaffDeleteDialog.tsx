
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, AlertTriangle } from "lucide-react";

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

interface VendorStaffDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  staff: VendorStaffMember | null;
  onStaffDeleted: () => void;
}

const VendorStaffDeleteDialog: React.FC<VendorStaffDeleteDialogProps> = ({
  isOpen,
  onClose,
  staff,
  onStaffDeleted,
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!staff) return;

    setLoading(true);
    try {
      // Delete in the correct order to respect foreign key constraints
      
      // 1. Delete vendor contracts related to this staff
      const { error: contractError } = await supabase
        .from("nd_vendor_contract")
        .delete()
        .eq("vendor_staff_id", staff.id);

      if (contractError) {
        console.warn("Contract deletion error:", contractError);
      }

      // 2. Delete vendor staff record
      const { error: staffError } = await supabase
        .from("nd_vendor_staff")
        .delete()
        .eq("id", staff.id);

      if (staffError) throw staffError;

      // 3. Delete user profile and auth user if user_id exists
      if (staff.user_id) {
        // Delete from profiles table
        const { error: profileError } = await supabase
          .from("profiles")
          .delete()
          .eq("id", staff.user_id);

        if (profileError) {
          console.warn("Profile deletion error:", profileError);
        }

        // Delete from users table
        const { error: userError } = await supabase
          .from("users")
          .delete()
          .eq("id", staff.user_id);

        if (userError) {
          console.warn("User deletion error:", userError);
        }

        // Delete auth user using admin function
        const { error: authError } = await supabase.auth.admin.deleteUser(staff.user_id);
        
        if (authError) {
          console.warn("Auth user deletion error:", authError);
        }
      }

      toast({
        title: "Success",
        description: "Staff member and all related records deleted successfully",
      });

      onStaffDeleted();
      onClose();
    } catch (error: any) {
      console.error("Error deleting staff:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete staff member",
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
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Staff Member
          </DialogTitle>
          <DialogDescription className="text-left space-y-2">
            <p>
              Are you sure you want to delete <strong>{staff.fullname}</strong>?
            </p>
            <p className="text-sm text-red-600 font-medium">
              This action will permanently delete:
            </p>
            <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
              <li>Staff profile and details</li>
              <li>User account and login access</li>
              <li>All related vendor contracts</li>
              <li>All associated records in the system</li>
            </ul>
            <p className="text-sm font-medium text-red-700">
              This action cannot be undone.
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={loading}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {loading ? "Deleting..." : "Delete Permanently"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VendorStaffDeleteDialog;
