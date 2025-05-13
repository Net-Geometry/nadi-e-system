import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Eye } from "lucide-react";
import StaffPageDetailDialog from "./StaffPageDetailDialog";

interface StaffPageProps {
  staffData: any[];
  loading: boolean;
  error: any;
}

const StaffPage: React.FC<StaffPageProps> = ({
  staffData,
  loading,
  error,
}) => {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewData, setViewData] = useState<any>(null);

  const handleView = (staff: any) => {
    setViewData(staff);
    setIsViewDialogOpen(true);
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Staff Information</h2>
<pre>{JSON.stringify(staffData, null, 2)}</pre>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px] text-center">No.</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Contract Type</TableHead>
              <TableHead>Phase</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffData.length > 0 ? (
              staffData.map((staff, index) => (
                <TableRow key={staff.id}>
                  <TableCell className="text-center">{index + 1}</TableCell>
                  <TableCell>{staff.position_id?.name ?? "N/A"}</TableCell>
                  <TableCell>{staff.fullname ?? "N/A"}</TableCell>
                  <TableCell>
                    {staff.contract?.duration
                      ? `${Math.round(staff.contract.duration / 30.44)} month(s)`
                      : "N/A"}
                  </TableCell>
                  <TableCell>{staff.contract?.contract_type?.name ?? "N/A"}</TableCell>
                  <TableCell>{staff.contract?.phase_id?.name ?? "N/A"}</TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleView(staff)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>View</TooltipContent>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500">
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Staff Detail Dialog */}
      <StaffPageDetailDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        viewData={viewData}
      />
    </div>
  );
};

export default StaffPage;