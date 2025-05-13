import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FileText, Download } from "lucide-react";

interface LeaveDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leave: {
    id: string;
    type: string;
    startDate: string;
    endDate: string;
    days: number;
    status: string;
    reason: string;
    attachmentUrl?: string;
    created_at: string;
  };
}

export function LeaveDetailsDialog({
  open,
  onOpenChange,
  leave,
}: LeaveDetailsProps) {
  const statusColors: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Approved: "bg-green-100 text-green-800 border-green-200",
    Rejected: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Leave Application Details</DialogTitle>
          <DialogDescription>
            Review the details of this leave application
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-sm text-muted-foreground">
              Application ID
            </h3>
            <span className="font-medium">{leave.id}</span>
          </div>

          <div className="flex justify-between items-center">
            <h3 className="font-medium text-sm text-muted-foreground">
              Applied Date
            </h3>
            <span className="font-medium">
              {format(new Date(leave.created_at), "PP")}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <h3 className="font-medium text-sm text-muted-foreground">
              Leave Type
            </h3>
            <span className="font-medium">{leave.type}</span>
          </div>

          <div className="flex justify-between items-center">
            <h3 className="font-medium text-sm text-muted-foreground">
              Period
            </h3>
            <span className="font-medium">
              {format(new Date(leave.startDate), "PP")} -{" "}
              {format(new Date(leave.endDate), "PP")}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <h3 className="font-medium text-sm text-muted-foreground">Days</h3>
            <span className="font-medium">
              {leave.days} {leave.days === 1 ? "day" : "days"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <h3 className="font-medium text-sm text-muted-foreground">
              Status
            </h3>
            <Badge variant="outline" className={statusColors[leave.status]}>
              {leave.status}
            </Badge>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground">
              Reason
            </h3>
            <Card className="p-3">
              <p>{leave.reason}</p>
            </Card>
          </div>

          {leave.attachmentUrl && (
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-muted-foreground">
                Attachment
              </h3>
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <span className="flex-1 truncate">Attachment Document</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(leave.attachmentUrl, "_blank")}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
