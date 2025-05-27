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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  MoreHorizontal,
  ToggleLeft,
  ToggleRight,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import VendorContractDialog from "@/components/vendor/VendorContractDialog";

interface VendorCompany {
  id: number;
  business_name: string;
  registration_number: string;
  business_type: string;
  phone_number: string;
  service_detail: string;
  bank_account_number: string;
  staff_count: number;
  contract_status: string;
  is_active?: boolean;
}

const VendorCompanies = () => {
  const [companies, setCompanies] = useState<VendorCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<VendorCompany | null>(
    null
  );
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isContractDialogOpen, setIsContractDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data: vendorData, error } = await supabase.from(
        "nd_vendor_profile"
      ).select(`
          id,
          business_name,
          registration_number,
          business_type,
          phone_number,
          service_detail,
          bank_account_number
        `);

      if (error) throw error;

      // Get staff count for each vendor
      const companiesWithStats = await Promise.all(
        (vendorData || []).map(async (vendor) => {
          const { count: staffCount } = await supabase
            .from("nd_vendor_staff")
            .select("id", { count: "exact" })
            .eq("registration_number", vendor.registration_number);

          const { data: contractData } = await supabase
            .from("nd_vendor_contract")
            .select("is_active")
            .eq("registration_number", vendor.registration_number)
            .single();

          return {
            ...vendor,
            staff_count: staffCount || 0,
            contract_status: contractData?.is_active ? "Active" : "Inactive",
            is_active: contractData?.is_active || false,
          };
        })
      );

      setCompanies(companiesWithStats);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (company: VendorCompany) => {
    setSelectedCompany(company);
    setIsViewDialogOpen(true);
  };

  const handleContractManagement = (company: VendorCompany) => {
    setSelectedCompany(company);
    setIsContractDialogOpen(true);
  };

  const handleToggleActive = async (company: VendorCompany) => {
    try {
      const newStatus = !company.is_active;

      // Update the contract status
      const { error } = await supabase
        .from("nd_vendor_contract")
        .update({ is_active: newStatus })
        .eq("registration_number", company.registration_number);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Vendor company ${
          newStatus ? "activated" : "deactivated"
        } successfully`,
      });

      // Refresh the companies list
      fetchCompanies();
    } catch (error: any) {
      console.error("Error toggling company status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update company status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (company: VendorCompany) => {
    setSelectedCompany(company);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmation !== "DELETE" || !selectedCompany) return;

    try {
      // Delete vendor address first (due to foreign key)
      await supabase
        .from("nd_vendor_address")
        .delete()
        .eq("registration_number", selectedCompany.registration_number);

      // Delete vendor staff
      await supabase
        .from("nd_vendor_staff")
        .delete()
        .eq("registration_number", selectedCompany.registration_number);

      // Delete vendor contract
      await supabase
        .from("nd_vendor_contract")
        .delete()
        .eq("registration_number", selectedCompany.registration_number);

      // Finally delete the vendor profile
      const { error } = await supabase
        .from("nd_vendor_profile")
        .delete()
        .eq("id", selectedCompany.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vendor company deleted successfully",
      });

      // Refresh the companies list
      fetchCompanies();
      setIsDeleteDialogOpen(false);
      setSelectedCompany(null);
      setDeleteConfirmation("");
    } catch (error: any) {
      console.error("Error deleting company:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete company",
        variant: "destructive",
      });
    }
  };

  const filteredCompanies = companies.filter(
    (company) =>
      company.business_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      company.registration_number
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <PageContainer>
        <div className="flex justify-between items-center mb-6">
          <PageHeader
            title="Vendor Companies"
            description="Manage all vendor companies and their details"
          />
          <Button asChild>
            <Link to="/vendor/companies/new">
              <Plus className="mr-2 h-4 w-4" />
              Register New Company
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-6">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Registration Number</TableHead>
                  <TableHead>Business Type</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Staff Count</TableHead>
                  <TableHead>Contract Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading companies...
                    </TableCell>
                  </TableRow>
                ) : filteredCompanies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No companies found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">
                        {company.business_name}
                      </TableCell>
                      <TableCell>{company.registration_number}</TableCell>
                      <TableCell>{company.business_type}</TableCell>
                      <TableCell>{company.phone_number}</TableCell>
                      <TableCell>{company.staff_count}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            company.contract_status === "Active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {company.contract_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(company)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleContractManagement(company)}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Manage Contract
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleActive(company)}
                            >
                              {company.is_active ? (
                                <ToggleLeft className="mr-2 h-4 w-4" />
                              ) : (
                                <ToggleRight className="mr-2 h-4 w-4" />
                              )}
                              {company.is_active ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(company)}
                              className="text-destructive"
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

        {/* View Details Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Vendor Company Details</DialogTitle>
            </DialogHeader>
            {selectedCompany && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Business Name
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedCompany.business_name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Registration Number
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedCompany.registration_number}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Business Type
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedCompany.business_type}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedCompany.phone_number}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Bank Account Number
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedCompany.bank_account_number || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Staff Count
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedCompany.staff_count}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Service Details
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedCompany.service_detail || "No details provided"}
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>
                Are you sure you want to delete "
                {selectedCompany?.business_name}"?
              </p>
              <p className="text-sm text-gray-600">
                This will also delete all associated staff, contracts, and
                address records. This action cannot be undone.
              </p>
              <p className="text-sm font-medium">Type "DELETE" to confirm:</p>
              <Input
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setDeleteConfirmation("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleteConfirmation !== "DELETE"}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Contract Management Dialog */}
        <VendorContractDialog
          isOpen={isContractDialogOpen}
          onClose={() => setIsContractDialogOpen(false)}
          vendorCompany={selectedCompany}
          onContractUpdated={fetchCompanies}
        />
      </PageContainer>
    </div>
  );
};

export default VendorCompanies;
