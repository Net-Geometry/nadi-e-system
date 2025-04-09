
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

interface UserHeaderProps {
  onCreateUser: () => void;
}

export const UserHeader = ({ onCreateUser }: UserHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">User Management</h1>
      <Button onClick={onCreateUser} className="bg-[#6E41E2] hover:bg-[#5a33c9]">
        <UserPlus className="mr-2 h-4 w-4" />
        Add User
      </Button>
    </div>
  );
};
