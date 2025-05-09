import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AdminLeaveDetailsDialog } from "./AdminLeaveDetailsDialog";

type LeaveApplication = {
  id: string;
  staff: {
    id: string;
    name: string;
  };
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: "Pending" | "Approved" | "Rejected";
  reason: string;
  attachmentUrl?: string;
  created_at: string;
};

export function AdminLeaveApplications() {
  const [selectedLeave, setSelectedLeave] = useState<LeaveApplication | null>(
    null
  );
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: leaveApplications, isLoading } = useQuery({
    queryKey: ["admin-leave-applications"],
    queryFn: async () => {
      // In a real app, this would fetch from the database
      // For now, returning mock data
      return [
        {
          id: "1",
          staff: { id: "101", name: "John Smith" },
          type: "Annual",
          startDate: "2025-05-15",
          endDate: "2025-05-17",
          days: 3,
          status: "Pending",
          reason: "Family vacation",
          created_at: "2025-05-01T08:30:00Z",
        },
        {
          id: "2",
          staff: { id: "102", name: "Sarah Johnson" },
          type: "Medical",
          startDate: "2025-05-12",
          endDate: "2025-05-13",
          days: 2,
          status: "Approved",
          reason: "Doctor's appointment",
          attachmentUrl: "/medical-certificate.pdf",
          created_at: "2025-05-03T10:15:00Z",
        },
        {
          id: "3",
          staff: { id: "103", name: "Michael Brown" },
          type: "Emergency",
          startDate: "2025-05-10",
          endDate: "2025-05-10",
          days: 1,
          status: "Rejected",
          reason: "Family emergency",
          attachmentUrl: "/emergency-doc.pdf",
          created_at: "2025-05-02T14:45:00Z",
        },
        {
          id: "4",
          staff: { id: "104", name: "Emily Davis" },
          type: "Replacement",
          startDate: "2025-05-20",
          endDate: "2025-05-21",
          days: 2,
          status: "Pending",
          reason: "Personal matters",
          created_at: "2025-05-05T09:20:00Z",
        },
      ] as LeaveApplication[];
    },
  });

  const handleViewDetails = (leave: LeaveApplication) => {
    setSelectedLeave(leave);
    setViewDetailsOpen(true);
  };

  const filteredApplications = leaveApplications?.filter((leave) => {
    const matchesStatus =
      statusFilter === "all" || leave.status.toLowerCase() === statusFilter;
    const matchesSearch =
      leave.staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leave.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leave.reason.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const statusColors: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Approved: "bg-green-100 text-green-800 border-green-200",
    Rejected: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Input
            placeholder="Search staff or leave type"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64"
          />
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff</TableHead>
              <TableHead>Leave Type</TableHead>
              <TableHead>Applied Date</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                  </div>
                  <p className="mt-2 text-muted-foreground">
                    Loading applications...
                  </p>
                </TableCell>
              </TableRow>
            ) : filteredApplications && filteredApplications.length > 0 ? (
              filteredApplications.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell>{leave.staff.name}</TableCell>
                  <TableCell>{leave.type}</TableCell>
                  <TableCell>
                    {format(new Date(leave.created_at), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell>
                    {format(new Date(leave.startDate), "dd MMM yyyy")} -
                    {format(new Date(leave.endDate), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell>{leave.days}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusColors[leave.status]}
                    >
                      {leave.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(leave)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  <p className="text-muted-foreground">
                    No leave applications found
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selectedLeave && (
        <AdminLeaveDetailsDialog
          leave={selectedLeave}
          open={viewDetailsOpen}
          onOpenChange={setViewDetailsOpen}
        />
      )}
    </div>
  );
}
