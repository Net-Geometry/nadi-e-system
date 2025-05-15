import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface SiteStaffMember {
  id: string;
  name: string;
  email: string;
  userType: string;
  employDate: string;
  status: string;
  phone_number: string;
  ic_number: string;
  siteLocation?: string;
}

interface SiteStaffTableProps {
  isLoading: boolean;
  filteredStaff: SiteStaffMember[];
  formatDate: (dateString: string) => string;
  statusColors: Record<string, string>;
  onEdit: (staffId: string) => void;
  onDelete: (staffId: string) => void;
  onView: (staffId: string) => void;
  onToggleStatus: (staffId: string, currentStatus: string) => void;
  selectedStaff: string[];
  onSelectStaff: (staffId: string, isSelected: boolean) => void;
  onSelectAll: (isSelected: boolean) => void;
}

export const SiteStaffTable = ({
  isLoading,
  filteredStaff,
  formatDate,
  statusColors,
  onEdit,
  onDelete,
  onView,
  onToggleStatus,
  selectedStaff,
  onSelectStaff,
  onSelectAll,
}: SiteStaffTableProps) => {
  const allSelected =
    filteredStaff.length > 0 && selectedStaff.length === filteredStaff.length;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked) => onSelectAll(!!checked)}
                aria-label="Select all staff"
              />
            </TableHead>
            <TableHead>Staff Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Employ Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Site Location</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
                <p className="mt-2 text-muted-foreground">
                  Loading staff data...
                </p>
              </TableCell>
            </TableRow>
          ) : filteredStaff.length > 0 ? (
            filteredStaff.map((staff) => (
              <TableRow key={staff.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedStaff.includes(staff.id)}
                    onCheckedChange={(checked) =>
                      onSelectStaff(staff.id, !!checked)
                    }
                    aria-label={`Select ${staff.name}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{staff.name}</TableCell>
                <TableCell>{staff.email || "-"}</TableCell>
                <TableCell>
                  {staff.userType?.replace(/staff/gi, "").replace(/_/g, " ") ||
                    "Unknown"}
                </TableCell>
                <TableCell>
                  {staff.employDate ? formatDate(staff.employDate) : "-"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={statusColors[staff.status]}
                  >
                    {staff.status}
                  </Badge>
                </TableCell>
                <TableCell>{staff.phone_number || "-"}</TableCell>
                <TableCell>{staff.siteLocation || "-"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(staff.id)}
                      title="View Profile"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(staff.id)}
                      title="Edit Staff"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onToggleStatus(staff.id, staff.status)}
                      title={
                        staff.status === "Active"
                          ? "Set Inactive"
                          : "Set Active"
                      }
                    >
                      {staff.status === "Active" ? (
                        <ToggleRight className="h-4 w-4" />
                      ) : (
                        <ToggleLeft className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(staff.id)}
                      title="Delete Staff"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={9}
                className="text-center py-4 text-muted-foreground"
              >
                No staff members found matching your criteria
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
