import { useState } from "react";
import { LeaveBalanceCards } from "./LeaveBalanceCards";
import { LeaveApplicationTable } from "./LeaveApplicationTable";
import { LeaveApplicationDialog } from "./LeaveApplicationDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function StaffLeaveManagement() {
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Leave Management
          </h1>
          <p className="text-muted-foreground">
            View your leave balance and manage leave applications
          </p>
        </div>
        <Button onClick={() => setOpenDialog(true)} className="mt-4 sm:mt-0">
          <Plus className="h-4 w-4 mr-2" />
          Apply Leave
        </Button>
      </div>

      <LeaveBalanceCards />

      <LeaveApplicationTable />

      <LeaveApplicationDialog open={openDialog} onOpenChange={setOpenDialog} />
    </div>
  );
}
