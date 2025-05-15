import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ClaimViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  claim: any; // Replace with a proper type if available
}

const ClaimViewDialog: React.FC<ClaimViewDialogProps> = ({ isOpen, onClose, claim }) => {
  if (!claim) return null;

  const renderAttachments = (attachments: any[]) => {
    if (!attachments.length) {
      return <p className="text-muted-foreground">No attachments available</p>;
    }

    return (
      <ul className="list-disc pl-5">
        {attachments.map((attachment: any) => (
          <li key={attachment.id}>
            <a
              href={attachment.file_path[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              {attachment.claim_type_id.name}
            </a>
          </li>
        ))}
      </ul>
    );
  };

  const renderLogs = () => {
    if (!claim.logs.length) {
      return <p className="text-muted-foreground">No logs available</p>;
    }

    return (
      <div className="border rounded-md">
        <Table>
          <TableBody>
            {claim.logs.map((log: any) => (
              <TableRow key={log.id}>
                <TableCell className="w-1/4">
                  <div className="font-medium">
                    {log.created_at
                      ? new Date(log.created_at).toLocaleString()
                      : "N/A"}
                  </div>
                </TableCell>
                <TableCell className="w-2/4">
                  <div>{log.remark || "No remarks"}</div>
                </TableCell>
                <TableCell className="w-1/4 text-right">
                  <Badge variant="outline">{log.status_id.name}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Claim Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* General Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2">General Information</h3>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">TP Name</TableCell>
                  <TableCell>{claim.tp_dusp_id.name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Reference Number</TableCell>
                  <TableCell>{claim.ref_no}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Year</TableCell>
                  <TableCell>{claim.year}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Month</TableCell>
                  <TableCell>{claim.month}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Phase</TableCell>
                  <TableCell>{claim.phase_id.name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Claim Status</TableCell>
                  <TableCell>
                    {claim.claim_status ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Payment Status</TableCell>
                  <TableCell>
                    {claim.payment_status ? (
                      <Badge variant="success">Paid</Badge>
                    ) : (
                      <Badge variant="destructive">Unpaid</Badge>
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Supporting Documents Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Supporting Documents</h3>
            {claim.requests.map((request: any, index: number) => (
              <div key={request.id} className="mb-4">
                <h4 className="font-medium">
                  Request {index + 1}: {request.category_id.name}
                </h4>
                {renderAttachments(request.attachments)}
              </div>
            ))}
          </div>

          {/* Logs Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Logs</h3>
            {renderLogs()}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClaimViewDialog;