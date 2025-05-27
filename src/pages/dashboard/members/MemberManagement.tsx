import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PaginationComponent } from "@/components/ui/PaginationComponent";
import {
  Users,
  UserPlus,
  Activity,
  UserCheck,
  Search,
  Edit,
  Eye,
  Download,
  House,
  Grid2X2Icon,
  Calendar,
  RotateCcw,
  Filter,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/auth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { TableRowNumber } from "@/components/ui/TableRowNumber";
import Registration from "./Registration";
import { useUserMetadata } from "@/hooks/use-user-metadata";

const MemberManagement = () => {
  const userMetadata = useUserMetadata();
  const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;
  const userGroup = parsedMetadata?.user_group;

  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
    null
  );
  const pageSize = 20;
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State to manage dialog visibility

  // Fetch members data
  const { data: membersData, isLoading } = useQuery({
    queryKey: ["members", searchTerm, sortField, sortDirection, currentPage],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("*", { count: "exact" })
        .eq("user_type", "member");

      if (searchTerm) {
        query = query.or(
          `full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
        );
      }

      if (sortField && sortDirection) {
        query = query.order(sortField, { ascending: sortDirection === "asc" });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      query = query.range(
        (currentPage - 1) * pageSize,
        currentPage * pageSize - 1
      );

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching members:", error);
        throw error;
      }

      return { data: data as Profile[], count: count || 0 };
    },
  });

  // Mock data for statistics
  const stats = {
    totalMembers: membersData?.count || 0,
    premiumMembers: 0,
    activeMembers: membersData?.data?.length || 0,
    lastRegistration:
      membersData && membersData.data.length > 0
        ? new Date(membersData.data[0].created_at).toLocaleString()
        : "N/A",
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil((membersData?.count || 0) / pageSize);
  const paginatedMembers = membersData?.data || [];

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };


  const handleAddNewMember = () => {
    setIsDialogOpen(true); // Open the dialog
  };


  const handleViewDetailsClick = (userId: string) => {
    navigate(`/member-management/profile?id=${userId}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold">Member Management</h1>
          <p className="text-gray-500 mt-1">
            View and manage all members in the system
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 flex items-start justify-between">
            <div>
              <h3 className="text-l text-gray-600">Total Members</h3>
              <p className="text-3xl font-bold">{stats.totalMembers}</p>
              <p className="text-sm text-green-500">↑ 8% vs last month</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6 flex items-start justify-between">
            <div>
              <h3 className="text-l text-gray-600">MADANI Community</h3>
              <p className="text-3xl font-bold">{stats.premiumMembers}</p>
              {/* <p className="text-sm text-green-500">↑ 12% vs last month</p> */}
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </Card>

          <Card className="p-6 flex items-start justify-between">
            <div>
              <h3 className="text-l text-gray-600">Active Members</h3>
              <p className="text-3xl font-bold">{stats.activeMembers}</p>
              {/* <p className="text-sm text-green-500">↑ 5% vs last month</p> */}
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
          </Card>

          <Card className="p-6 flex items-start justify-between">
            <div>
              <h3 className="text-l text-gray-600">Entrepreneur Members</h3>
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-gray-500">
                Last registration: 15 minutes ago
              </p>
            </div>
            <div className="bg-amber-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-amber-600" />
            </div>
          </Card>
        </div>

        {/* Search and Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-1/2">
            <Input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <Search className="h-4 w-4" />

            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            {userGroup === 9 && (
              <Button
                className="flex items-center gap-2"
                onClick={handleAddNewMember}
              >
                <UserPlus className="h-4 w-4" />
                Add New Member
              </Button>
            )}

          </div>
        </div>

        {/* Registration Dialog */}
        <Registration
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)} // Close the dialog
        />

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <House className="h-4 w-4" />
              Site
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Grid2X2Icon className="h-4 w-4" />
              Phase
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Grid2X2Icon className="h-4 w-4" />
              State
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />

              Date Registered
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
          <Button variant="default" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Apply Filters
          </Button>
        </div>

        {/* Members Table */}
        <div className="rounded-md shadow overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox />
                  </TableHead>
                  <TableHead className="w-[60px]">ID</TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("full_name")}
                  >
                    Name
                    {sortField === "full_name" && (
                      <span className="ml-2">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("email")}
                  >
                    Email
                    {sortField === "email" && (
                      <span className="ml-2">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Reg. Date</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-10">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      </div>
                      <p className="mt-2 text-gray-500">Loading members...</p>
                    </TableCell>
                  </TableRow>
                ) : paginatedMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-10">
                      <p className="text-gray-500">
                        No members found matching your criteria
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedMembers.map((member, index) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell className="font-medium">
                        {`M${String(
                          (currentPage - 1) * pageSize + index + 1
                        ).padStart(3, "0")}`}
                      </TableCell>
                      <TableCell>{member.full_name || "N/A"}</TableCell>
                      <TableCell>{member.email || "N/A"}</TableCell>
                      <TableCell>{member.phone_number || "N/A"}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(member.created_at)}</TableCell>
                      <TableCell>{formatDate(member.created_at)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleViewDetailsClick(member.id)} // Add view details button
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        {membersData?.data?.length > 0 && (
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={membersData?.count || 0}
            pageSize={pageSize}
            startItem={(currentPage - 1) * pageSize + 1}
            endItem={Math.min(currentPage * pageSize, membersData?.count || 0)}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default MemberManagement;
