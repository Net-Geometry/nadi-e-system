
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface TeamViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  team: any | null;
  vendorProfile: any;
}

const TeamViewDialog: React.FC<TeamViewDialogProps> = ({
  isOpen,
  onClose,
  team,
  vendorProfile,
}) => {
  const [teamStaff, setTeamStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && team) {
      fetchTeamStaff();
    }
  }, [isOpen, team]);

  const fetchTeamStaff = async () => {
    if (!team) return;

    setLoading(true);
    try {
      // Get staff team assignments
      const { data: staffTeamData, error: teamError } = await supabase
        .from("nd_vendor_staff_team")
        .select("*")
        .eq("vendor_team_id", team.id);

      if (teamError) throw teamError;

      // For now, we'll use the team name from the assignments
      // In a proper implementation, you'd join with the staff table
      setTeamStaff(staffTeamData || []);
    } catch (error) {
      console.error("Error fetching team staff:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!team) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Team Details - {team.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Team Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Team Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Team Name</label>
                  <p className="text-sm text-gray-900">{team.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Current Status</label>
                  <div>
                    <Badge variant={team.status === 'on_duty' ? 'default' : 'secondary'}>
                      {team.status === 'on_duty' ? 'On Duty' : 'Out For Duty'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Company</label>
                  <p className="text-sm text-gray-900">{vendorProfile?.business_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Staff Count</label>
                  <p className="text-sm text-gray-900">{team.staff_count || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Created Date</label>
                  <p className="text-sm text-gray-900">
                    {new Date(team.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Last Updated</label>
                  <p className="text-sm text-gray-900">
                    {new Date(team.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading team members...</div>
              ) : teamStaff.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No staff members assigned to this team
                </div>
              ) : (
                <div className="space-y-2">
                  {teamStaff.map((member, index) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Team Member {index + 1}</p>
                        <p className="text-sm text-gray-500">
                          Added: {new Date(member.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamViewDialog;
