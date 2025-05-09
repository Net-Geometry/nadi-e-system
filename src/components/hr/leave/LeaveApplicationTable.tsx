import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
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
import { LeaveDetailsDialog } from "./LeaveDetailsDialog";

type LeaveApplication = {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: "Pending" | "Approved" | "Rejected";
  reason: string;
  attachmentUrl?: string;
  created_at: string;
};

export function LeaveApplicationTable() {
  const { user } = useAuth();
  const [selectedLeave, setSelectedLeave] = useState<LeaveApplication | null>(
    null
  );
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);

  const { data: leaveApplications, isLoading } = useQuery({
    queryKey: ["leave-applications", user?.id],
    queryFn: async () => {
      // In a real app, this would fetch from the database
      // For now, returning mock data
      return [
        {
          id: "1",
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
          type: "Medical",
          startDate: "2025-04-10",
          endDate: "2025-04-11",
          days: 2,
          status: "Approved",
          reason: "Doctor's appointment",
          attachmentUrl: "/medical-certificate.pdf",
          created_at: "2025-04-05T10:15:00Z",
        },
        {
          id: "3",
          type: "Emergency",
          startDate: "2025-03-20",
          endDate: "2025-03-20",
          days: 1,
          status: "Rejected",
          reason: "Family emergency",
          attachmentUrl: "/emergency-doc.pdf",
          created_at: "2025-03-19T14:45:00Z",
        },
      ] as LeaveApplication[];
    },
  });

  const handleViewDetails = (leave: LeaveApplication) => {
    setSelectedLeave(leave);
    setViewDetailsOpen(true);
  };

  const statusColors: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Approved: "bg-green-100 text-green-800 border-green-200",
    Rejected: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Applied Date</TableHead>
            <TableHead>Leave Type</TableHead>
            <TableHead>Period</TableHead>
            <TableHead>Days</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                </div>
                <p className="mt-2 text-muted-foreground">
                  Loading applications...
                </p>
              </TableCell>
            </TableRow>
          ) : leaveApplications && leaveApplications.length > 0 ? (
            leaveApplications.map((leave) => (
              <TableRow key={leave.id}>
                <TableCell>
                  {format(new Date(leave.created_at), "dd MMM yyyy")}
                </TableCell>
                <TableCell>{leave.type}</TableCell>
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
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6">
                <p className="text-muted-foreground">
                  No leave applications found
                </p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {selectedLeave && (
        <LeaveDetailsDialog
          leave={selectedLeave}
          open={viewDetailsOpen}
          onOpenChange={setViewDetailsOpen}
        />
      )}
    </div>
  );
}
