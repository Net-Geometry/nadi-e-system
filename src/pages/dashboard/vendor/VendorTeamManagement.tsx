
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/dashboard/PageHeader";
import { PageContainer } from "@/components/ui/dashboard/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, Eye, Edit, MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import TeamFormDialog from "@/components/vendor/TeamFormDialog";
import TeamViewDialog from "@/components/vendor/TeamViewDialog";
import VendorStaffCard from "@/components/vendor/VendorStaffCard";

interface Team {
  id: number;
  name: string;
  registration_number: string;
  status: 'on_duty' | 'out_for_duty';
  staff_count: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

const VendorTeamManagement = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [vendorProfile, setVendorProfile] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchVendorProfile();
  }, []);

  useEffect(() => {
    if (vendorProfile) {
      fetchTeams();
    }
  }, [vendorProfile]);

  const fetchVendorProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: vendorStaff, error: staffError } = await supabase
        .from("nd_vendor_staff")
        .select("registration_number")
        .eq("user_id", user.id)
        .single();

      if (staffError) throw staffError;

      const { data: vendor, error: vendorError } = await supabase
        .from("nd_vendor_profile")
        .select("*")
        .eq("id", vendorStaff.registration_number)
        .single();

      if (vendorError) throw vendorError;
      setVendorProfile(vendor);
    } catch (error) {
      console.error("Error fetching vendor profile:", error);
    }
  };

  const fetchTeams = async () => {
    if (!vendorProfile) return;

    try {
      const { data: teamsData, error } = await supabase
        .from("nd_vendor_team")
        .select("*")
        .eq("registration_number", vendorProfile.registration_number);

      if (error) throw error;

      // Get staff count for each team
      const teamsWithStaffCount = await Promise.all(
        (teamsData || []).map(async (team) => {
          const { data: staffTeams } = await supabase
            .from("nd_vendor_staff_team")
            .select("id")
            .eq("vendor_team_id", team.id);

          return {
            ...team,
            staff_count: staffTeams?.length || 0,
            status: 'on_duty' as const // Default status
          };
        })
      );

      setTeams(teamsWithStaffCount);
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast({
        title: "Error",
        description: "Failed to fetch teams",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = () => {
    setSelectedTeam(null);
    setEditMode(false);
    setFormDialogOpen(true);
  };

  const handleEditTeam = (team: Team) => {
    setSelectedTeam(team);
    setEditMode(true);
    setFormDialogOpen(true);
  };

  const handleViewTeam = (team: Team) => {
    setSelectedTeam(team);
    setViewDialogOpen(true);
  };

  const filteredTeams = teams.filter((team) =>
    team.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <PageContainer>
        <div className="flex justify-between items-center mb-6">
          <PageHeader
            title="Team Management"
            description={`Manage teams for ${vendorProfile?.business_name || 'your company'}`}
          />
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/vendor/admin/staff/new">
                <Plus className="mr-2 h-4 w-4" />
                Register Staff
              </Link>
            </Button>
            <Button onClick={handleCreateTeam}>
              <Plus className="mr-2 h-4 w-4" />
              Create Team
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Team Management Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 mb-6">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search teams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team Name</TableHead>
                    <TableHead>Staff Count</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Loading teams...
                      </TableCell>
                    </TableRow>
                  ) : filteredTeams.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No teams found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTeams.map((team) => (
                      <TableRow key={team.id}>
                        <TableCell className="font-medium">
                          {team.name}
                        </TableCell>
                        <TableCell>{team.staff_count}</TableCell>
                        <TableCell>
                          <Badge variant={team.status === 'on_duty' ? 'default' : 'secondary'}>
                            {team.status === 'on_duty' ? 'On Duty' : 'Out For Duty'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(team.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewTeam(team)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditTeam(team)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Team
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Staff Members Card */}
          {vendorProfile && <VendorStaffCard vendorProfile={vendorProfile} />}
        </div>

        {/* Team Form Dialog */}
        <TeamFormDialog
          isOpen={formDialogOpen}
          onClose={() => setFormDialogOpen(false)}
          team={selectedTeam}
          editMode={editMode}
          vendorProfile={vendorProfile}
          onTeamSaved={fetchTeams}
        />

        {/* Team View Dialog */}
        <TeamViewDialog
          isOpen={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          team={selectedTeam}
          vendorProfile={vendorProfile}
        />
      </PageContainer>
    </div>
  );
};

export default VendorTeamManagement;
