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
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import VendorStaffViewDialog from "@/components/vendor/VendorStaffViewDialog";
import VendorStaffEditDialog from "@/components/vendor/VendorStaffEditDialog";
import VendorStaffDeleteDialog from "@/components/vendor/VendorStaffDeleteDialog";

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

const VendorStaff = () => {
  const [staff, setStaff] = useState<VendorStaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<VendorStaffMember | null>(
    null
  );
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const { data: staffData, error } = await supabase.from("nd_vendor_staff")
        .select(`
          id,
          fullname,
          ic_no,
          mobile_no,
          work_email,
          position_id,
          is_active,
          registration_number,
          user_id
        `);

      if (error) throw error;

      // Get vendor company details and contract status for each staff member
      const staffWithDetails = await Promise.all(
        (staffData || []).map(async (member) => {
          // Get vendor company details
          const { data: companyData } = await supabase
            .from("nd_vendor_profile")
            .select("business_name, registration_number, business_type")
            .eq("id", member.registration_number)
            .single();

          // Get contract status for the vendor company
          const { data: contractData } = await supabase
            .from("nd_vendor_contract")
            .select("is_active, contract_start, contract_end")
            .eq("registration_number", member.registration_number)
            .maybeSingle();

          return {
            ...member,
            vendor_company: companyData || {
              business_name: "Unknown",
              registration_number: "",
              business_type: "",
            },
            contract_status: contractData || { is_active: false },
          };
        })
      );

      setStaff(staffWithDetails);
    } catch (error) {
      console.error("Error fetching staff:", error);
      toast({
        title: "Error",
        description: "Failed to fetch vendor staff",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (member: VendorStaffMember) => {
    try {
      // Check if contract is active before allowing activation
      if (!member.is_active && !member.contract_status?.is_active) {
        toast({
          title: "Cannot Activate",
          description:
            "Cannot activate staff member when vendor contract is inactive",
          variant: "destructive",
        });
        return;
      }

      const newStatus = !member.is_active;

      const { error } = await supabase
        .from("nd_vendor_staff")
        .update({ is_active: newStatus })
        .eq("id", member.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Staff member ${
          newStatus ? "activated" : "deactivated"
        } successfully`,
      });

      fetchStaff(); // Refresh the list
    } catch (error) {
      console.error("Error toggling staff status:", error);
      toast({
        title: "Error",
        description: "Failed to update staff status",
        variant: "destructive",
      });
    }
  };

  const handleView = (member: VendorStaffMember) => {
    setSelectedStaff(member);
    setViewDialogOpen(true);
  };

  const handleEdit = (member: VendorStaffMember) => {
    setSelectedStaff(member);
    setEditDialogOpen(true);
  };

  const handleDelete = (member: VendorStaffMember) => {
    setSelectedStaff(member);
    setDeleteDialogOpen(true);
  };

  const getStatusBadge = (member: VendorStaffMember) => {
    const contractActive = member.contract_status?.is_active;
    const userActive = member.is_active;

    if (!contractActive) {
      return <Badge variant="destructive">Contract Inactive</Badge>;
    }

    if (contractActive && userActive) {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          Active
        </Badge>
      );
    }

    if (contractActive && !userActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }

    return <Badge variant="secondary">Inactive</Badge>;
  };

  const canToggleUserStatus = (member: VendorStaffMember) => {
    // Can only toggle user status if contract is active
    return member.contract_status?.is_active === true;
  };

  const filteredStaff = staff.filter(
    (member) =>
      member.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.work_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.vendor_company?.business_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <PageContainer>
        <div className="flex justify-between items-center mb-6">
          <PageHeader
            title="Vendor Staff"
            description="Manage all vendor staff members"
          />
          <Button asChild>
            <Link to="/vendor/staff/new">
              <Plus className="mr-2 h-4 w-4" />
              Register New Staff
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-6">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>IC Number</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Business Type</TableHead>
                  <TableHead>Contract Status</TableHead>
                  <TableHead>User Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading staff...
                    </TableCell>
                  </TableRow>
                ) : filteredStaff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No staff found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStaff.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.fullname}
                      </TableCell>
                      <TableCell>{member.ic_no}</TableCell>
                      <TableCell>{member.work_email}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {member.vendor_company?.business_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ({member.vendor_company?.registration_number})
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {member.vendor_company?.business_type}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            member.contract_status?.is_active
                              ? "default"
                              : "destructive"
                          }
                        >
                          {member.contract_status?.is_active
                            ? "Active"
                            : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={member.is_active ? "default" : "secondary"}
                        >
                          {member.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleView(member)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEdit(member)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleActive(member)}
                              disabled={!canToggleUserStatus(member)}
                            >
                              {member.is_active ? (
                                <>
                                  <ToggleLeft className="mr-2 h-4 w-4" />
                                  Deactivate User
                                </>
                              ) : (
                                <>
                                  <ToggleRight className="mr-2 h-4 w-4" />
                                  Activate User
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(member)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
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

        {/* View Dialog */}
        <VendorStaffViewDialog
          isOpen={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          staff={selectedStaff}
        />

        {/* Edit Dialog */}
        <VendorStaffEditDialog
          isOpen={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          staff={selectedStaff}
          onStaffUpdated={fetchStaff}
        />

        {/* Delete Dialog */}
        <VendorStaffDeleteDialog
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          staff={selectedStaff}
          onStaffDeleted={fetchStaff}
        />
      </PageContainer>
    </div>
  );
};

export default VendorStaff;
