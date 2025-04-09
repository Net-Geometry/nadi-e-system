
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

type SortDirection = "asc" | "desc" | null;
type SortField = "name" | "email" | "phone" | "status" | "site" | "phase" | "state" | "created_at" | null;

interface UserTableHeaderProps {
  onSelectAll: (checked: boolean) => void;
  allSelected: boolean;
  showRowNumbers?: boolean;
  onSort: (field: SortField) => void;
  sortField: SortField;
  sortDirection: SortDirection;
}

export const UserTableHeader = ({ 
  onSelectAll, 
  allSelected,
  showRowNumbers = true,
  onSort,
  sortField,
  sortDirection
}: UserTableHeaderProps) => {
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortDirection === "asc" ? 
      <ArrowUp className="ml-2 h-4 w-4" /> : 
      <ArrowDown className="ml-2 h-4 w-4" />;
  };

  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[50px] pl-4">
          <Checkbox checked={allSelected} onCheckedChange={onSelectAll} />
        </TableHead>
        <TableHead className="w-[60px]">ID</TableHead>
        <TableHead>
          <Button 
            variant="ghost" 
            onClick={() => onSort("name")}
            className="p-0 hover:bg-transparent font-medium flex items-center"
          >
            Name{renderSortIcon("name")}
          </Button>
        </TableHead>
        <TableHead>
          <Button 
            variant="ghost" 
            onClick={() => onSort("email")}
            className="p-0 hover:bg-transparent font-medium flex items-center"
          >
            Email{renderSortIcon("email")}
          </Button>
        </TableHead>
        <TableHead>
          <Button 
            variant="ghost" 
            onClick={() => onSort("phone")}
            className="p-0 hover:bg-transparent font-medium flex items-center"
          >
            Phone{renderSortIcon("phone")}
          </Button>
        </TableHead>
        <TableHead>
          <Button 
            variant="ghost" 
            onClick={() => onSort("status")}
            className="p-0 hover:bg-transparent font-medium flex items-center"
          >
            Status{renderSortIcon("status")}
          </Button>
        </TableHead>
        <TableHead>
          <Button 
            variant="ghost" 
            onClick={() => onSort("site")}
            className="p-0 hover:bg-transparent font-medium flex items-center"
          >
            Site{renderSortIcon("site")}
          </Button>
        </TableHead>
        <TableHead>
          <Button 
            variant="ghost" 
            onClick={() => onSort("phase")}
            className="p-0 hover:bg-transparent font-medium flex items-center"
          >
            Phase{renderSortIcon("phase")}
          </Button>
        </TableHead>
        <TableHead>
          <Button 
            variant="ghost" 
            onClick={() => onSort("state")}
            className="p-0 hover:bg-transparent font-medium flex items-center"
          >
            State{renderSortIcon("state")}
          </Button>
        </TableHead>
        <TableHead className="text-right">
          <Button 
            variant="ghost" 
            onClick={() => onSort("created_at")}
            className="p-0 hover:bg-transparent font-medium flex items-center justify-end w-full"
          >
            Reg. Date{renderSortIcon("created_at")}
          </Button>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};
