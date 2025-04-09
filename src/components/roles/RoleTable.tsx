
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Shield, Users, Pencil, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { TableRowNumber } from "@/components/ui/TableRowNumber";
import { PaginationComponent } from "@/components/ui/PaginationComponent";

interface Role {
  id: string;
  name: string;
  description: string;
  created_at: string;
  users_count: number;
}

interface RoleTableProps {
  roles: Role[];
  onEdit: (role: Role) => void;
}

type SortDirection = "asc" | "desc" | null;
type SortField = "name" | "description" | "users_count" | "created_at" | null;

export const RoleTable = ({ roles, onEdit }: RoleTableProps) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const pageSize = 20;
  
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortDirection === "asc" ? 
      <ArrowUp className="ml-2 h-4 w-4" /> : 
      <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const sortedRoles = () => {
    if (!sortField || !sortDirection) return roles;
    
    return [...roles].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "description":
          aValue = a.description;
          bValue = b.description;
          break;
        case "users_count":
          aValue = a.users_count;
          bValue = b.users_count;
          break;
        case "created_at":
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          return 0;
      }
      
      let compareResult;
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        compareResult = aValue - bValue;
      } else {
        compareResult = String(aValue).localeCompare(String(bValue));
      }
        
      return sortDirection === "asc" ? compareResult : -compareResult;
    });
  };

  const sorted = sortedRoles();
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginatedRoles = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-muted/50">
            <TableHead className="w-[60px] text-center">No.</TableHead>
            <TableHead className="w-[250px]">
              <Button 
                variant="ghost" 
                onClick={() => handleSort("name")}
                className="p-0 hover:bg-transparent font-medium flex items-center"
              >
                Role Name{renderSortIcon("name")}
              </Button>
            </TableHead>
            <TableHead className="max-w-[400px]">
              <Button 
                variant="ghost" 
                onClick={() => handleSort("description")}
                className="p-0 hover:bg-transparent font-medium flex items-center"
              >
                Description{renderSortIcon("description")}
              </Button>
            </TableHead>
            <TableHead className="w-[100px]">
              <Button 
                variant="ghost" 
                onClick={() => handleSort("users_count")}
                className="p-0 hover:bg-transparent font-medium flex items-center"
              >
                Users{renderSortIcon("users_count")}
              </Button>
            </TableHead>
            <TableHead className="w-[150px]">
              <Button 
                variant="ghost" 
                onClick={() => handleSort("created_at")}
                className="p-0 hover:bg-transparent font-medium flex items-center"
              >
                Created At{renderSortIcon("created_at")}
              </Button>
            </TableHead>
            <TableHead className="w-[200px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedRoles.map((role, index) => (
            <TableRow key={role.id} className="hover:bg-muted/50">
              <TableRowNumber index={(currentPage - 1) * pageSize + index} />
              <TableCell className="font-medium">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span>{role.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {role.description}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{role.users_count}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(role.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(role)}
                  className="hover:bg-muted"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/admin/roles/${role.id}`)}
                  className="hover:bg-muted"
                >
                  Permissions
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {roles.length > pageSize && (
        <div className="p-4 border-t">
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={roles.length}
          />
        </div>
      )}
    </div>
  );
};
