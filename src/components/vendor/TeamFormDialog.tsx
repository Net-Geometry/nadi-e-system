
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface TeamFormData {
  name: string;
  status: 'on_duty' | 'out_for_duty';
  selectedStaff: number[];
}

interface TeamFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  team: any | null;
  editMode: boolean;
  vendorProfile: any;
  onTeamSaved: () => void;
}

const TeamFormDialog: React.FC<TeamFormDialogProps> = ({
  isOpen,
  onClose,
  team,
  editMode,
  vendorProfile,
  onTeamSaved,
}) => {
  const [loading, setLoading] = useState(false);
  const [availableStaff, setAvailableStaff] = useState<any[]>([]);
  const [currentTeamStaff, setCurrentTeamStaff] = useState<number[]>([]);
  const { toast } = useToast();

  const form = useForm<TeamFormData>({
    defaultValues: {
      name: "",
      status: "on_duty",
      selectedStaff: [],
    },
  });

  useEffect(() => {
    if (isOpen && vendorProfile) {
      fetchAvailableStaff();
      if (editMode && team) {
        form.reset({
          name: team.name,
          status: team.status || 'on_duty',
          selectedStaff: [],
        });
        fetchCurrentTeamStaff();
      } else {
        form.reset({
          name: "",
          status: "on_duty",
          selectedStaff: [],
        });
      }
    }
  }, [isOpen, team, editMode, vendorProfile, form]);

  const fetchAvailableStaff = async () => {
    try {
      const { data: staff, error } = await supabase
        .from("nd_vendor_staff")
        .select("id, fullname, work_email, position_id")
        .eq("registration_number", vendorProfile.id)
        .eq("position_id", 2) // Only fetch staff with position_id = 2
        .eq("is_active", true);

      if (error) throw error;
      setAvailableStaff(staff || []);
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };

  const fetchCurrentTeamStaff = async () => {
    if (!team) return;

    try {
      const { data: teamStaff, error } = await supabase
        .from("nd_vendor_staff_team")
        .select("id")
        .eq("vendor_team_id", team.id);

      if (error) throw error;
      
      const staffIds = teamStaff?.map(ts => ts.id) || [];
      setCurrentTeamStaff(staffIds);
      form.setValue("selectedStaff", staffIds);
    } catch (error) {
      console.error("Error fetching current team staff:", error);
    }
  };

  const onSubmit = async (data: TeamFormData) => {
    if (!vendorProfile) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      if (editMode && team) {
        // Update existing team
        const { error: teamError } = await supabase
          .from("nd_vendor_team")
          .update({
            name: data.name,
            updated_by: user.id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", team.id);

        if (teamError) throw teamError;

        // Update team staff assignments
        // First, remove all current assignments
        await supabase
          .from("nd_vendor_staff_team")
          .delete()
          .eq("vendor_team_id", team.id);

        // Then add new assignments
        if (data.selectedStaff.length > 0) {
          const teamStaffData = data.selectedStaff.map(staffId => ({
            vendor_team_id: team.id,
            team_name: data.name,
            created_by: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }));

          const { error: staffError } = await supabase
            .from("nd_vendor_staff_team")
            .insert(teamStaffData);

          if (staffError) throw staffError;
        }
      } else {
        // Create new team - let the database generate the ID automatically
        const teamData = {
          name: data.name,
          registration_number: vendorProfile.registration_number,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data: newTeam, error: teamError } = await supabase
          .from("nd_vendor_team")
          .insert(teamData)
          .select("*")
          .single();

        if (teamError) throw teamError;

        // Add staff to team
        if (data.selectedStaff.length > 0) {
          const teamStaffData = data.selectedStaff.map(staffId => ({
            vendor_team_id: newTeam.id,
            team_name: data.name,
            created_by: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }));

          const { error: staffError } = await supabase
            .from("nd_vendor_staff_team")
            .insert(teamStaffData);

          if (staffError) throw staffError;
        }
      }

      toast({
        title: "Success",
        description: editMode ? "Team updated successfully" : "Team created successfully",
      });

      onTeamSaved();
      onClose();
    } catch (error: any) {
      console.error("Error saving team:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save team",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStaffSelection = (staffId: number, checked: boolean) => {
    const currentSelection = form.getValues("selectedStaff");
    let newSelection;

    if (checked) {
      newSelection = [...currentSelection, staffId];
    } else {
      newSelection = currentSelection.filter(id => id !== staffId);
    }

    form.setValue("selectedStaff", newSelection);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editMode ? "Edit Team" : "Create New Team"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter team name" required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="on_duty">On Duty</SelectItem>
                      <SelectItem value="out_for_duty">Out For Duty</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>Select Staff Members (Position: Staff)</FormLabel>
              <div className="max-h-60 overflow-y-auto border rounded-md p-4 space-y-2">
                {availableStaff.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No staff members available (position: Staff)
                  </div>
                ) : (
                  availableStaff.map((staff) => (
                    <div key={staff.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`staff-${staff.id}`}
                        checked={form.watch("selectedStaff").includes(staff.id)}
                        onCheckedChange={(checked) => 
                          handleStaffSelection(staff.id, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={`staff-${staff.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {staff.fullname} ({staff.work_email}) - Staff
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Saving..." : editMode ? "Update Team" : "Create Team"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TeamFormDialog;
