import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  exportTPStaffToCSV,
  exportSiteStaffToCSV,
} from "@/utils/export-utils-hr";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";

interface StaffToolbarProps {
  selectedStaff: any[];
  allStaff: any[];
  onAddStaff: () => void;
  organizationName?: string | null;
  staffType?: "tp" | "site";
}

export function StaffToolbar({
  selectedStaff,
  allStaff,
  onAddStaff,
  organizationName = "Your Organization",
  staffType = "tp",
}: StaffToolbarProps) {
  const handleExportSelected = () => {
    if (staffType === "tp") {
      exportTPStaffToCSV(
        selectedStaff,
        `${organizationName?.toLowerCase().replace(/\s+/g, "-")}-selected-staff`
      );
    } else {
      exportSiteStaffToCSV(
        selectedStaff,
        `${organizationName
          ?.toLowerCase()
          .replace(/\s+/g, "-")}-selected-site-staff`
      );
    }
  };

  const handleExportAll = () => {
    if (staffType === "tp") {
      exportTPStaffToCSV(
        allStaff,
        `${organizationName?.toLowerCase().replace(/\s+/g, "-")}-all-staff`
      );
    } else {
      exportSiteStaffToCSV(
        allStaff,
        `${organizationName?.toLowerCase().replace(/\s+/g, "-")}-all-site-staff`
      );
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-3 sm:space-y-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {staffType === "tp" ? "Staff Management" : "Site Staff Management"}
        </h1>
        <p className="text-muted-foreground">
          {staffType === "tp"
            ? `Manage staff for ${organizationName}`
            : `Manage site staff for ${organizationName}`}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={handleExportAll}
              disabled={allStaff.length === 0}
            >
              Export All Staff
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleExportSelected}
              disabled={selectedStaff.length === 0}
            >
              Export Selected ({selectedStaff.length})
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button onClick={onAddStaff}>Add Staff</Button>
        {window.location.pathname !== "/hr/site-staff" && (
          <Button onClick={() => (window.location.href = "/hr/site-staff")}>
            Manage Site Staff
          </Button>
        )}
      </div>
    </div>
  );
}
