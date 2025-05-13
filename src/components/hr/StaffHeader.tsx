import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

interface StaffHeaderProps {
  organizationName: string | null;
  onAddStaff: () => void;
}

export const StaffHeader = ({
  organizationName,
  onAddStaff,
}: StaffHeaderProps) => {
  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold">Staff Management</h1>
        <Button onClick={onAddStaff}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Staff
        </Button>
        <Button onClick={() => (window.location.href = "/hr/site-staff")}>
          Go to Site Staff
        </Button>
      </div>

      {organizationName && (
        <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
          <p className="text-blue-800">
            Managing staff for organization: <strong>{organizationName}</strong>
          </p>
        </div>
      )}
    </>
  );
};
