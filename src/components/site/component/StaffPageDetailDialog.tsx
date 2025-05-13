import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/date-utils";

interface StaffPageDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viewData: any | null;
}

const StaffPageDetailDialog: React.FC<StaffPageDetailDialogProps> = ({
  open,
  onOpenChange,
  viewData,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Staff Details</DialogTitle>
        </DialogHeader>

        {viewData ? (
          <div className="space-y-6">
            {/* Profile Image Section */}
            <div className="text-center">
              <img
                src={viewData?.file_path ?? ""}
                alt={viewData?.fullname ?? "Profile Image"}
                className="w-32 h-32 rounded-full border mx-auto"
              />
              <p className="mt-2 font-semibold">{viewData?.fullname ?? "N/A"}</p>
            </div>

            {/* Profile Info */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Profile</h3>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Full Name</TableCell>
                    <TableCell>{viewData?.fullname ?? "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">IC Number</TableCell>
                    <TableCell>{viewData?.ic_no ?? "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Mobile Number</TableCell>
                    <TableCell>{viewData?.mobile_no ?? "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Personal Email</TableCell>
                    <TableCell>{viewData?.personal_email ?? "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Place of Birth</TableCell>
                    <TableCell>{viewData?.place_of_birth ?? "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Marital Status</TableCell>
                    <TableCell>{viewData?.marital_status?.eng ?? "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Qualification</TableCell>
                    <TableCell>{viewData?.qualification ?? "N/A"}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Contract Info */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Contract</h3>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Contract Duration</TableCell>
                    <TableCell>
                      {viewData?.contract?.duration
                        ? `${Math.round(viewData.contract.duration / 30.44)} month(s)`
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Contract Period</TableCell>
                    <TableCell>
                      <div>From: {formatDate(viewData?.contract?.contract_start)}</div>
                      <div>To: {formatDate(viewData?.contract?.contract_end)}</div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Contract Type</TableCell>
                    <TableCell>{viewData?.contract?.contract_type?.name ?? "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Phase</TableCell>
                    <TableCell>{viewData?.contract?.phase_id?.name ?? "N/A"}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center">No data found</div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StaffPageDetailDialog;