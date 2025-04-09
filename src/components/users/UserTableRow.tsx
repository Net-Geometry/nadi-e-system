
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreVertical, UserCog, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Profile } from "@/types/auth";

interface UserTableRowProps {
  user: Profile;
  isSelected: boolean;
  onSelect: (userId: string, checked: boolean) => void;
  onEdit: (user: Profile) => void;
  onDelete: (userId: string) => void;
  rowIndex: number;
}

export const UserTableRow = ({
  user,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  rowIndex,
}: UserTableRowProps) => {
  // Simulating additional fields since the current Profile type doesn't have them
  const mockData = {
    phone: user.phone_number || `+1 (555) ${100 + rowIndex}-${1000 + rowIndex * 10}`,
    status: ['Active', 'Inactive', 'Pending'][rowIndex % 3],
    site: ['East Branch', 'South Branch', 'Main Center'][rowIndex % 3],
    phase: ['Onboarding', 'Senior', 'Active', 'Advanced'][rowIndex % 4],
    state: ['California', 'Florida', 'New York', 'Texas'][rowIndex % 4],
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200">{status}</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200">{status}</Badge>;
      case 'Inactive':
        return <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <TableRow key={user.id} className="hover:bg-gray-50">
      <TableCell className="pl-4">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(user.id, !!checked)}
        />
      </TableCell>
      <TableCell className="font-medium">{rowIndex + 1}</TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 bg-gray-100">
            <AvatarFallback className="text-gray-500">
              {user.full_name?.substring(0, 2) || 'U'}
            </AvatarFallback>
          </Avatar>
          <span>{user.full_name}</span>
        </div>
      </TableCell>
      <TableCell className="text-gray-600">{user.email}</TableCell>
      <TableCell className="text-gray-600">{mockData.phone}</TableCell>
      <TableCell>{getStatusBadge(mockData.status)}</TableCell>
      <TableCell className="text-gray-600">{mockData.site}</TableCell>
      <TableCell className="text-gray-600">{mockData.phase}</TableCell>
      <TableCell className="text-gray-600">{mockData.state}</TableCell>
      <TableCell className="text-right text-gray-600">
        {new Date(user.created_at).toLocaleDateString('en-US', { 
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })}
      </TableCell>
    </TableRow>
  );
};
